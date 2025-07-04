import { FileReader } from './file-reader';
import * as vm from 'node:vm';

describe('FileReader Integration with VM Context', () => {
  it('should work in VM context like the function executor', async () => {
    const context = {
      FileReader,
      Blob,
      console: {
        log: jest.fn()
      }
    };

    vm.createContext(context);

    const code = `
      async function testFileReader() {
        const blob = new Blob(['Hello, World!'], { type: 'text/plain' });
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
          reader.onload = (event) => {
            resolve({
              success: true,
              result: reader.result,
              readyState: reader.readyState
            });
          };
          
          reader.onerror = (event) => {
            reject(new Error('FileReader error'));
          };
          
          reader.readAsText(blob);
        });
      }
      
      testFileReader();
    `;

    const result = await vm.runInContext(code, context);
    
    expect(result.success).toBe(true);
    expect(result.result).toBe('Hello, World!');
    expect(result.readyState).toBe(2); // FileReader.DONE
  });

  it('should work with readAsDataURL in VM context', async () => {
    const context = {
      FileReader,
      Blob,
      Buffer: Buffer
    };

    vm.createContext(context);

    const code = `
      async function testFileReaderDataURL() {
        const blob = new Blob(['Hello'], { type: 'text/plain' });
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
          reader.onload = (event) => {
            resolve({
              success: true,
              result: reader.result,
              isDataURL: reader.result.startsWith('data:text/plain;base64,')
            });
          };
          
          reader.onerror = (event) => {
            reject(new Error('FileReader error'));
          };
          
          reader.readAsDataURL(blob);
        });
      }
      
      testFileReaderDataURL();
    `;

    const result = await vm.runInContext(code, context);
    
    expect(result.success).toBe(true);
    expect(result.isDataURL).toBe(true);
    expect(typeof result.result).toBe('string');
  });

  it('should work with readAsArrayBuffer in VM context', async () => {
    const context = {
      FileReader,
      Blob,
      TextDecoder: TextDecoder,
      ArrayBuffer: ArrayBuffer
    };

    vm.createContext(context);

    const code = `
      async function testFileReaderArrayBuffer() {
        const blob = new Blob(['Hello'], { type: 'text/plain' });
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
          reader.onload = (event) => {
            const decoder = new TextDecoder();
            const text = decoder.decode(reader.result);
            resolve({
              success: true,
              result: text,
              isArrayBuffer: reader.result instanceof ArrayBuffer,
              resultType: typeof reader.result,
              resultConstructor: reader.result?.constructor?.name
            });
          };
          
          reader.onerror = (event) => {
            reject(new Error('FileReader error'));
          };
          
          reader.readAsArrayBuffer(blob);
        });
      }
      
      testFileReaderArrayBuffer();
    `;

    const result = await vm.runInContext(code, context);
    
    expect(result.success).toBe(true);
    expect(result.result).toBe('Hello');
    expect(result.isArrayBuffer).toBe(true);
  });

  it('should handle abort operation in VM context', async () => {
    const context = {
      FileReader,
      Blob
    };

    vm.createContext(context);

    const code = `
      async function testFileReaderAbort() {
        const blob = new Blob(['Hello'], { type: 'text/plain' });
        const reader = new FileReader();
        
        return new Promise((resolve, reject) => {
          reader.onabort = (event) => {
            resolve({
              success: true,
              aborted: true,
              readyState: reader.readyState,
              hasError: reader.error !== null
            });
          };
          
          reader.onerror = (event) => {
            reject(new Error('FileReader error'));
          };
          
          reader.readAsText(blob);
          reader.abort();
        });
      }
      
      testFileReaderAbort();
    `;

    const result = await vm.runInContext(code, context);
    
    expect(result.success).toBe(true);
    expect(result.aborted).toBe(true);
    expect(result.readyState).toBe(2); // FileReader.DONE
    expect(result.hasError).toBe(true);
  });

  it('should handle FileReader constants in VM context', async () => {
    const context = {
      FileReader
    };

    vm.createContext(context);

    const code = `
      const reader = new FileReader();
      ({
        staticConstants: {
          EMPTY: FileReader.EMPTY,
          LOADING: FileReader.LOADING,
          DONE: FileReader.DONE
        },
        instanceConstants: {
          EMPTY: reader.EMPTY,
          LOADING: reader.LOADING,
          DONE: reader.DONE
        },
        initialState: reader.readyState
      });
    `;

    const result = vm.runInContext(code, context);
    
    expect(result.staticConstants).toEqual({ EMPTY: 0, LOADING: 1, DONE: 2 });
    expect(result.instanceConstants).toEqual({ EMPTY: 0, LOADING: 1, DONE: 2 });
    expect(result.initialState).toBe(0);
  });
});