import { StockViewModel } from './stock.viewmodel.js';
import { container } from '../../core/di/container.renderer.js';

export class StockView {
  private binder: StockBinder;

  constructor(private readonly viewModel: StockViewModel) {
    this.binder = new StockBinder(this, this.viewModel);
  }

  public render(containerId: string): void {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div class="stock-view">
        <header class="stock-header">
          <h3>My Portfolio</h3>
          <div class="header-actions">
            <button id="reset-btn" class="danger-btn">Reset</button>
            <button id="import-btn" class="secondary-btn">Import</button>
            <button id="export-btn" class="primary-btn">Export</button>
          </div>
        </header>
        
        <div id="portfolio-summary" class="portfolio-summary">
          <div>Invested: <span id="total-invested-sum">0</span></div>
          <div>Current: <span id="total-current-sum">0</span></div>
          <div>Profit/Loss: <span id="total-pl-sum">0</span> (<span id="total-pl-percent">0%</span>)</div>
        </div>

        <section class="portfolio-list">
          <div class="list-header" id="toggle-list-btn">
            <h4>Portfolio List</h4>
            <i data-lucide="minimize-2"></i>
          </div>
          <div id="portfolio-content">
            <table id="portfolio-table">
              <thead>
                <tr>
                  <th data-sort="name" style="cursor:pointer">Name <span class="sort-icon"></span></th>
                  <th data-sort="totalInvested" style="cursor:pointer">Total Invested <span class="sort-icon"></span></th>
                  <th data-sort="currentPrice" style="cursor:pointer">Current Price <span class="sort-icon"></span></th>
                  <th data-sort="percent" style="cursor:pointer">Profit <span class="sort-icon"></span></th>
                </tr>
              </thead>
              <tbody id="portfolio-tbody"></tbody>
            </table>
          </div>
        </section>

        <div id="stock-grid" class="stock-grid">
          <div id="add-card" class="stock-card add-card">
            <button id="add-row-btn" class="add-btn">+</button>
            <span>Add New Stock</span>
          </div>
        </div>
      </div>
      <!-- Edit Modal -->
      <div id="edit-modal" class="modal" style="display:none;">
        <div class="modal-content">
          <h3 id="modal-title">Add More</h3>
          <input type="number" id="modal-price" placeholder="Price" />
          <input type="number" id="modal-qty" placeholder="Qty" />
          <button id="modal-confirm">확인</button>
          <button id="modal-close">취소</button>
        </div>
      </div>
    `;

    this.binder.bind();
    this.binder.addRow();
  }

  public get elements() {
    return {
      get grid() { return document.getElementById('stock-grid') as HTMLElement; },
      get addCard() { return document.getElementById('add-card') as HTMLElement; },
      get addRowBtn() { return document.getElementById('add-row-btn') as HTMLButtonElement; },
      get exportBtn() { return document.getElementById('export-btn') as HTMLButtonElement; },
      get importBtn() { return document.getElementById('import-btn') as HTMLButtonElement; },
      get resetBtn() { return document.getElementById('reset-btn') as HTMLButtonElement; },
      get totalInvestedSum() { return document.getElementById('total-invested-sum') as HTMLElement; },
      get totalCurrentSum() { return document.getElementById('total-current-sum') as HTMLElement; },
      get totalPlSum() { return document.getElementById('total-pl-sum') as HTMLElement; },
      get totalPlPercent() { return document.getElementById('total-pl-percent') as HTMLElement; },
      // 모달 요소
      get modal() { return document.getElementById('edit-modal') as HTMLElement; },
      get modalTitle() { return document.getElementById('modal-title') as HTMLElement; },
      get modalPrice() { return document.getElementById('modal-price') as HTMLInputElement; },
      get modalQty() { return document.getElementById('modal-qty') as HTMLInputElement; },
      get modalConfirm() { return document.getElementById('modal-confirm') as HTMLButtonElement; },
      get modalClose() { return document.getElementById('modal-close') as HTMLButtonElement; },
      // 리스트 요소
      get portfolioContent() { return document.getElementById('portfolio-content') as HTMLElement; },
      get toggleListBtn() { return document.getElementById('toggle-list-btn') as HTMLElement; },
      get portfolioTbody() { return document.getElementById('portfolio-tbody') as HTMLElement; },
      get tableHeaders() { return document.querySelectorAll('#portfolio-table th'); }
    };
  }
}

export class StockBinder {
  private currentEditCard: HTMLElement | null = null;
  private sortConfig: { key: string | null, order: 'asc' | 'desc' } = { key: null, order: 'desc' };

  constructor(
    private readonly view: StockView,
    private readonly viewModel: StockViewModel
  ) {}

  public bind() {
    const { addCard, exportBtn, importBtn, resetBtn, modalClose, modalConfirm, toggleListBtn, portfolioContent } = this.view.elements;
    
    addCard.addEventListener('click', () => this.addRow());
    
    // 리스트 토글
    toggleListBtn.addEventListener('click', () => {
        const isHidden = portfolioContent.style.display === 'none';
        portfolioContent.style.display = isHidden ? 'block' : 'none';
        toggleListBtn.querySelector('i')!.setAttribute('data-lucide', isHidden ? 'minimize-2' : 'maximize-2');
        if ((window as any).lucide) (window as any).lucide.createIcons();
    });

    // 로드
    const savedData = this.viewModel.loadPortfolio();
    savedData.forEach(item => this.addRow(item));
    this.calculateSummary();

    exportBtn.addEventListener('click', () => {
      this.viewModel.exportPortfolio(this.gatherData());
    });

    importBtn.addEventListener('click', async () => {
      const data = await this.viewModel.importPortfolio();
      this.view.elements.grid.querySelectorAll('.stock-card:not(#add-card)').forEach(c => c.remove());
      data.forEach(item => this.addRow(item));
      this.calculateSummary();
      this.save();
    });

    resetBtn.addEventListener('click', () => {
        if(confirm('모든 데이터를 초기화하시겠습니까?')) {
            this.view.elements.grid.querySelectorAll('.stock-card:not(#add-card)').forEach(c => c.remove());
            this.viewModel.savePortfolio([]);
            this.calculateSummary();
        }
    });

    // 테이블 정렬 이벤트
    this.view.elements.tableHeaders.forEach(th => {
        th.addEventListener('click', () => {
            const key = th.getAttribute('data-sort') as any;
            
            // 정렬 토글 로직
            if (this.sortConfig.key === key) {
                this.sortConfig.order = this.sortConfig.order === 'asc' ? 'desc' : 'asc';
            } else {
                this.sortConfig.key = key;
                this.sortConfig.order = 'desc';
            }
            
            this.renderList(this.sortConfig.key, this.sortConfig.order);
        });
    });

    modalClose.addEventListener('click', () => {
      this.view.elements.modal.style.display = 'none';
      this.currentEditCard = null;
    });

    modalConfirm.addEventListener('click', () => {
      if (!this.currentEditCard) return;
      const addP = parseFloat(this.view.elements.modalPrice.value || '0');
      const addQ = parseFloat(this.view.elements.modalQty.value || '0');

      if (addQ > 0) {
        const pPrice = this.currentEditCard.querySelector('.purchasePrice') as HTMLInputElement;
        const qty = this.currentEditCard.querySelector('.quantity') as HTMLInputElement;
        
        const oldP = parseFloat(pPrice.value || '0');
        const oldQ = parseFloat(qty.value || '0');

        const res = this.viewModel.calculateAveragePrice(oldP, oldQ, addP, addQ);
        
        pPrice.value = res.price.toString();
        qty.value = res.qty.toString();
        
        pPrice.dispatchEvent(new Event('input'));
        
        this.view.elements.modal.style.display = 'none';
        this.currentEditCard = null;
      }
    });
    
    this.renderList();
  }

  public renderList(sortKey?: any, order: 'asc' | 'desc' = 'desc') {
    const data = this.gatherData();
    const sortedData = sortKey ? this.viewModel.sortPortfolio(data, sortKey, order) : data;
    
    // 헤더 아이콘 업데이트
    this.view.elements.tableHeaders.forEach(th => {
        const span = th.querySelector('.sort-icon') as HTMLElement;
        if (th.getAttribute('data-sort') === sortKey) {
            span.innerText = order === 'asc' ? ' ▲' : ' ▼';
        } else {
            span.innerText = '';
        }
    });

    const tbody = this.view.elements.portfolioTbody;
    tbody.innerHTML = '';
    
    sortedData.forEach((item, index) => {
        const perf = this.viewModel.calculatePerformance(item.purchasePrice, item.quantity, item.currentPrice);
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.name}</td>
            <td>
                ${(item.purchasePrice * item.quantity).toLocaleString()}
                <div class="table-price-info">단가: ${item.purchasePrice.toLocaleString()} / 수량: ${item.quantity}</div>
            </td>
            <td><input type="number" class="table-current" data-id="${index}" value="${item.currentPrice}" /></td>
            <td style="color: ${perf.profit >= 0 ? '#ef4444' : '#3b82f6'}">
                ${perf.percent.toFixed(2)}%<br>${perf.profit.toLocaleString()}
            </td>
        `;
        
        tr.querySelector('.table-current')?.addEventListener('input', (e) => {
            const val = (e.target as HTMLInputElement).value;
            const card = this.view.elements.grid.querySelectorAll('.stock-card:not(#add-card)')[index] as HTMLElement;
            if(card) {
                const cardInput = card.querySelector('.currentPrice') as HTMLInputElement;
                cardInput.value = val;
                cardInput.dispatchEvent(new Event('input'));
            }
        });
        
        tbody.appendChild(tr);
    });
  }

  private gatherData() {
      const cards = this.view.elements.grid.querySelectorAll('.stock-card:not(#add-card)');
      const data: any[] = [];
      cards.forEach(card => {
        const name = (card.querySelector('.name') as HTMLInputElement).value;
        const pPrice = parseFloat((card.querySelector('.purchasePrice') as HTMLInputElement).value || '0');
        const qty = parseFloat((card.querySelector('.quantity') as HTMLInputElement).value || '0');
        
        if (name && pPrice > 0 && qty > 0) {
            data.push({
              name: name,
              purchasePrice: pPrice,
              quantity: qty,
              currentPrice: parseFloat((card.querySelector('.currentPrice') as HTMLInputElement).value || '0'),
              buyLine: parseFloat((card.querySelector('.buyLine') as HTMLInputElement).value || '0'),
              sellLine: parseFloat((card.querySelector('.sellLine') as HTMLInputElement).value || '0'),
            });
        }
      });
      return data;
  }

  private save() {
      this.viewModel.savePortfolio(this.gatherData());
  }

  public calculateSummary() {
    const cards = this.view.elements.grid.querySelectorAll('.stock-card:not(#add-card)');
    let totalInvested = 0;
    let totalCurrent = 0;

    cards.forEach(card => {
      const pPrice = parseFloat((card.querySelector('.purchasePrice') as HTMLInputElement).value || '0');
      const qty = parseFloat((card.querySelector('.quantity') as HTMLInputElement).value || '0');
      const cPrice = parseFloat((card.querySelector('.currentPrice') as HTMLInputElement).value || '0');
      
      if (pPrice > 0 && qty > 0) {
          totalInvested += pPrice * qty;
          totalCurrent += cPrice * qty;
      }
    });

    const pl = totalCurrent - totalInvested;
    const { percent, profit } = this.viewModel.calculatePerformance(totalInvested, 1, totalCurrent);
    
    const { totalInvestedSum, totalCurrentSum, totalPlSum, totalPlPercent } = this.view.elements;
    
    totalInvestedSum.innerText = totalInvested.toLocaleString();
    totalCurrentSum.innerText = totalCurrent.toLocaleString();
    
    const color = pl >= 0 ? '#ef4444' : '#3b82f6';
    
    totalCurrentSum.style.color = color;
    totalPlSum.innerText = `${pl >= 0 ? '+' : ''}${pl.toLocaleString()}`;
    totalPlSum.style.color = color;
    totalPlPercent.innerText = `${percent >= 0 ? '+' : ''}${percent.toFixed(2)}%`;
    totalPlPercent.style.color = color;

    this.save();
    this.renderList();
  }

  public addRow(data?: any) {
    const card = document.createElement('div');
    card.className = 'stock-card';
    card.innerHTML = `
      <div class="card-actions">
        <button class="edit-btn"><i data-lucide="edit"></i></button>
        <button class="remove-btn"><i data-lucide="square-x"></i></button>
      </div>
      <input type="text" class="name" placeholder="Stock Name" value="${data?.name || ''}" />
      <div class="grid-inputs">
        <label>Purchase Price <input type="number" class="purchasePrice" placeholder="0" value="${data?.purchasePrice || ''}" /></label>
        <label>Quantity <input type="number" class="quantity" placeholder="0" value="${data?.quantity || ''}" /></label>
        <label class="full">Current Price <input type="number" class="currentPrice" placeholder="0" value="${data?.currentPrice || ''}" /></label>
        <label>Buy Line <input type="number" class="buyLine" placeholder="0" value="${data?.buyLine || ''}" /></label>
        <label>Sell Line <input type="number" class="sellLine" placeholder="0" value="${data?.sellLine || ''}" /></label>
      </div>
      <div class="total-invested">Total: <span class="totalInvested">0</span></div>
      <div class="performance">0.00% (+0)</div>
    `;
    this.view.elements.grid.insertBefore(card, this.view.elements.addCard);

    if ((window as any).lucide) (window as any).lucide.createIcons();

    card.querySelector('.edit-btn')?.addEventListener('click', () => {
      this.currentEditCard = card;
      const stockName = (card.querySelector('.name') as HTMLInputElement).value || 'Unnamed Stock';
      this.view.elements.modalTitle.innerText = `Add More - ${stockName}`;
      this.view.elements.modal.style.display = 'flex';
    });

    card.querySelector('.remove-btn')?.addEventListener('click', () => {
      if (confirm('정말로 이 주식 카드를 삭제하시겠습니까?')) {
        card.remove();
        this.calculateSummary();
      }
    });

    const inputs = card.querySelectorAll('input');
    const pPrice = card.querySelector('.purchasePrice') as HTMLInputElement;
    const qty = card.querySelector('.quantity') as HTMLInputElement;
    const cPrice = card.querySelector('.currentPrice') as HTMLInputElement;
    const total = card.querySelector('.totalInvested') as HTMLElement;
    const perf = card.querySelector('.performance') as HTMLElement;

    const calculate = () => {
      const p = parseFloat(pPrice.value || '0');
      const q = parseFloat(qty.value || '0');
      const c = parseFloat(cPrice.value || '0');
      
      total.innerText = (p * q).toLocaleString();
      
      const perfData = this.viewModel.calculatePerformance(p, q, c);
      
      if (p > 0 && c > 0) {
        perf.innerText = `${perfData.percent >= 0 ? '+' : ''}${perfData.percent.toFixed(2)}% (${perfData.profit >= 0 ? '+' : ''}${perfData.profit.toLocaleString()})`;
        perf.style.color = perfData.profit >= 0 ? '#ef4444' : '#3b82f6';
      } else {
        perf.innerText = '0.00% (+0)';
        perf.style.color = 'var(--text-dim)';
      }
      this.calculateSummary();
    };

    inputs.forEach(el => el.addEventListener('input', calculate));
    calculate(); // 초기 계산
  }
}
