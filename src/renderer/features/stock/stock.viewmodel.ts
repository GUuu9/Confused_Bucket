import { HttpRepository } from '../../data/network/http.repository.js';
import { FileRepository } from '../../data/file/file.repository.js';
import { CryptoRepository } from '../../data/security/crypto.repository.js';
import { CompressRepository } from '../../data/security/compress.repository.js';
import { StorageRepository } from '../../data/storage/storage.repository.js';

export interface StockData {
  name: string;
  purchasePrice: number;
  quantity: number;
  currentPrice: number;
  buyLine: number;
  sellLine: number;
}

export class StockViewModel {
  constructor(
    private readonly http: HttpRepository,
    private readonly file: FileRepository,
    private readonly crypto: CryptoRepository,
    private readonly compress: CompressRepository,
    private readonly storage: StorageRepository
  ) {}

  // 데이터 영속성
  public savePortfolio(data: StockData[]) {
    this.storage.save(data);
  }

  public loadPortfolio(): StockData[] {
    return this.storage.load();
  }

  // 데이터 연산: 평단가 계산
  public calculateAveragePrice(oldP: number, oldQ: number, addP: number, addQ: number): { price: number, qty: number } {
    const newTotalQty = oldQ + addQ;
    const newAvgPrice = ((oldP * oldQ) + (addP * addQ)) / newTotalQty;
    return { price: Math.round(newAvgPrice), qty: newTotalQty };
  }

  // 데이터 연산: 포트폴리오 정렬
  public sortPortfolio(data: StockData[], key: keyof StockData | 'totalInvested' | 'percent', order: 'asc' | 'desc'): StockData[] {
    return [...data].sort((a, b) => {
      let valA: any = a[key as keyof StockData];
      let valB: any = b[key as keyof StockData];

      if (key === 'totalInvested') {
        valA = a.purchasePrice * a.quantity;
        valB = b.purchasePrice * b.quantity;
      } else if (key === 'percent') {
        valA = a.purchasePrice > 0 ? ((a.currentPrice - a.purchasePrice) / a.purchasePrice) : 0;
        valB = b.purchasePrice > 0 ? ((b.currentPrice - b.purchasePrice) / b.purchasePrice) : 0;
      }

      if (typeof valA === 'string') {
        return order === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
      }
      return order === 'asc' ? valA - valB : valB - valA;
    });
  }

  // 데이터 연산: 수익률 및 수익금 계산
  public calculatePerformance(price: number, qty: number, current: number) {
    const diff = current - price;
    const percent = price > 0 ? (diff / price) * 100 : 0;
    const profit = diff * qty;
    return { percent, profit };
  }

  // 파일 I/O
  public async exportPortfolio(data: StockData[]) {
    await this.file.exportJson(JSON.stringify(data), 'portfolio.json');
  }

  public async importPortfolio(): Promise<StockData[]> {
    return await this.file.importJson<StockData[]>();
  }
}
