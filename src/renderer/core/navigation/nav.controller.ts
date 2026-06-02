import { Navigator } from './navigator.js';
import { StockView } from '../../features/stock/stock.view.js';

/**
 * NavController
 * UI 네비게이션 이벤트 처리를 담당합니다.
 */
export class NavController {
  constructor(
    private readonly navigator: Navigator,
    private readonly views: { 
      stockView: StockView;
    },
  ) {}

  public init() {
    // 초기 화면으로 StockView 설정
    this.navigator.navigate(this.views.stockView);

    document.addEventListener('click', (event) => {
      const target = (event.target as HTMLElement).closest('.card') as HTMLElement || event.target as HTMLElement;
      if (!target) return;

      switch (target.id) {
        case 'nav-stock': this.navigator.navigate(this.views.stockView); break;
        case 'nav-back': 
          this.navigator.showDashboard(); 
          break;
      }
    });
  }
}
