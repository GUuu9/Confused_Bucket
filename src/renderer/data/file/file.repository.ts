/**
 * 브라우저 환경에서 JSON 파일을 관리하는 Repository
 */
export class FileRepository {
  /**
   * JSON 데이터를 파일로 저장(다운로드)합니다.
   * @param data 저장할 데이터 (ArrayBuffer 또는 문자열)
   * @param filename 저장할 파일명
   */
  exportJson(data: ArrayBuffer | string, filename: string): void {
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    
    // 정리
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * 사용자가 파일을 선택하여 JSON 데이터를 읽어옵니다.
   * @returns 파일의 내용을 담은 Promise<T>
   */
  async importJson<T>(): Promise<T> {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json, .gz';
      
      input.onchange = (event) => {
        const file = (event.target as HTMLInputElement).files?.[0];
        if (!file) {
          reject(new Error('파일이 선택되지 않았습니다.'));
          return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const content = e.target?.result as string;
            resolve(JSON.parse(content) as T);
          } catch (error) {
            reject(new Error('JSON 파싱 실패'));
          }
        };
        reader.onerror = () => reject(new Error('파일 읽기 실패'));
        reader.readAsText(file);
      };
      
      input.click();
    });
  }
}
