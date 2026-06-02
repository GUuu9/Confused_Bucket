/**
 * 브라우저 localStorage를 사용하는 데이터 영속성 Repository
 */
export class StorageRepository {
  private readonly KEY = 'stock_portfolio_data';

  save(data: any[]): void {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  }

  load(): any[] {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : [];
  }
}
