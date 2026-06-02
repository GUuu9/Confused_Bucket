/**
 * 웹 암호화(Web Crypto API)를 사용하는 Repository
 */
export class CryptoRepository {
  
  // AES-GCM-256 암호화
  async encryptAES(data: string, key: CryptoKey, iv: Uint8Array): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    return window.crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv },
      key,
      encoder.encode(data)
    );
  }

  // RSA-OAEP 암호화
  async encryptRSA(data: string, publicKey: CryptoKey): Promise<ArrayBuffer> {
    const encoder = new TextEncoder();
    return window.crypto.subtle.encrypt(
      { name: 'RSA-OAEP' },
      publicKey,
      encoder.encode(data)
    );
  }
}
