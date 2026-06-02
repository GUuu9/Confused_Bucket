/**
 * 브라우저 CompressionStreams API를 사용하는 압축 Repository
 */
export class CompressRepository {
  
  async compress(data: string): Promise<ArrayBuffer> {
    const stream = new Blob([data]).stream();
    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    
    const response = new Response(compressedStream);
    return await response.arrayBuffer();
  }

  async decompress(buffer: ArrayBuffer): Promise<string> {
    const stream = new Blob([buffer]).stream();
    const decompressedStream = stream.pipeThrough(new DecompressionStream('gzip'));
    
    const response = new Response(decompressedStream);
    const blob = await response.blob();
    return await blob.text();
  }
}
