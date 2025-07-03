import { FileReader } from './file-reader';

describe('FileReader', () => {
  let fileReader: FileReader;
  let testBlob: Blob;

  beforeEach(() => {
    fileReader = new FileReader();
    testBlob = new Blob(['Hello, World!'], { type: 'text/plain' });
  });

  afterEach(() => {
    if (fileReader.readyState === FileReader.LOADING) {
      fileReader.abort();
    }
  });

  describe('Constants', () => {
    it('should have correct static constants', () => {
      expect(FileReader.EMPTY).toBe(0);
      expect(FileReader.LOADING).toBe(1);
      expect(FileReader.DONE).toBe(2);
    });

    it('should have correct instance constants', () => {
      expect(fileReader.EMPTY).toBe(0);
      expect(fileReader.LOADING).toBe(1);
      expect(fileReader.DONE).toBe(2);
    });
  });

  describe('Initial State', () => {
    it('should have initial state as EMPTY', () => {
      expect(fileReader.readyState).toBe(FileReader.EMPTY);
    });

    it('should have null result initially', () => {
      expect(fileReader.result).toBeNull();
    });

    it('should have null error initially', () => {
      expect(fileReader.error).toBeNull();
    });

    it('should have null event handlers initially', () => {
      expect(fileReader.onload).toBeNull();
      expect(fileReader.onerror).toBeNull();
      expect(fileReader.onprogress).toBeNull();
      expect(fileReader.onabort).toBeNull();
      expect(fileReader.onloadstart).toBeNull();
      expect(fileReader.onloadend).toBeNull();
    });
  });

  describe('readAsText', () => {
    it('should read text from blob', (done) => {
      fileReader.onload = (event) => {
        expect(fileReader.result).toBe('Hello, World!');
        expect(fileReader.readyState).toBe(FileReader.DONE);
        done();
      };

      fileReader.readAsText(testBlob);
      expect(fileReader.readyState).toBe(FileReader.LOADING);
    });

    it('should fire loadstart event', (done) => {
      fileReader.onloadstart = (event) => {
        expect(event.type).toBe('loadstart');
        expect(event.target).toBe(fileReader);
        done();
      };

      fileReader.readAsText(testBlob);
    });

    it('should fire loadend event after load', (done) => {
      let loadFired = false;
      fileReader.onload = () => {
        loadFired = true;
      };

      fileReader.onloadend = (event) => {
        expect(loadFired).toBe(true);
        expect(event.type).toBe('loadend');
        done();
      };

      fileReader.readAsText(testBlob);
    });

    it('should throw error when already loading', () => {
      fileReader.readAsText(testBlob);
      expect(() => fileReader.readAsText(testBlob)).toThrow('The FileReader is already reading');
    });
  });

  describe('readAsArrayBuffer', () => {
    it('should read ArrayBuffer from blob', (done) => {
      fileReader.onload = (event) => {
        expect(fileReader.result).toBeInstanceOf(ArrayBuffer);
        const result = fileReader.result as ArrayBuffer;
        const text = new TextDecoder().decode(result);
        expect(text).toBe('Hello, World!');
        expect(fileReader.readyState).toBe(FileReader.DONE);
        done();
      };

      fileReader.readAsArrayBuffer(testBlob);
      expect(fileReader.readyState).toBe(FileReader.LOADING);
    });
  });

  describe('readAsDataURL', () => {
    it('should read data URL from blob', (done) => {
      fileReader.onload = (event) => {
        expect(typeof fileReader.result).toBe('string');
        const result = fileReader.result as string;
        expect(result).toMatch(/^data:text\/plain;base64,/);
        
        // Decode the base64 part to verify content
        const base64Data = result.split(',')[1];
        const decodedText = Buffer.from(base64Data, 'base64').toString('utf-8');
        expect(decodedText).toBe('Hello, World!');
        
        expect(fileReader.readyState).toBe(FileReader.DONE);
        done();
      };

      fileReader.readAsDataURL(testBlob);
    });

    it('should use default content type for blobs without type', (done) => {
      const blobWithoutType = new Blob(['test']);
      
      fileReader.onload = (event) => {
        const result = fileReader.result as string;
        expect(result).toMatch(/^data:application\/octet-stream;base64,/);
        done();
      };

      fileReader.readAsDataURL(blobWithoutType);
    });
  });

  describe('readAsBinaryString', () => {
    it('should read binary string from blob', (done) => {
      fileReader.onload = (event) => {
        expect(typeof fileReader.result).toBe('string');
        const result = fileReader.result as string;
        // Binary string should be readable as text for this test data
        expect(result).toBe('Hello, World!');
        expect(fileReader.readyState).toBe(FileReader.DONE);
        done();
      };

      fileReader.readAsBinaryString(testBlob);
    });
  });

  describe('abort', () => {
    it('should abort loading operation', (done) => {
      fileReader.onabort = (event) => {
        expect(event.type).toBe('abort');
        expect(fileReader.readyState).toBe(FileReader.DONE);
        expect(fileReader.error).toBeInstanceOf(Error);
        expect(fileReader.error?.message).toBe('The operation was aborted');
        done();
      };

      fileReader.readAsText(testBlob);
      fileReader.abort();
    });

    it('should fire loadend after abort', (done) => {
      let abortFired = false;
      fileReader.onabort = () => {
        abortFired = true;
      };

      fileReader.onloadend = (event) => {
        expect(abortFired).toBe(true);
        expect(event.type).toBe('loadend');
        done();
      };

      fileReader.readAsText(testBlob);
      fileReader.abort();
    });

    it('should not abort when not loading', () => {
      expect(() => fileReader.abort()).not.toThrow();
      expect(fileReader.readyState).toBe(FileReader.EMPTY);
    });
  });

  describe('Error handling', () => {
    it('should handle errors in read operation', (done) => {
      // Create a blob that will cause an error
      const errorBlob = {
        text: () => Promise.reject(new Error('Test error')),
        type: 'text/plain'
      } as Blob;

      fileReader.onerror = (event) => {
        expect(fileReader.readyState).toBe(FileReader.DONE);
        expect(fileReader.error).toBeInstanceOf(Error);
        expect(fileReader.error?.message).toBe('Test error');
        done();
      };

      fileReader.readAsText(errorBlob);
    });

    it('should fire loadend after error', (done) => {
      const errorBlob = {
        text: () => Promise.reject(new Error('Test error')),
        type: 'text/plain'
      } as Blob;

      let errorFired = false;
      fileReader.onerror = () => {
        errorFired = true;
      };

      fileReader.onloadend = (event) => {
        expect(errorFired).toBe(true);
        expect(event.type).toBe('loadend');
        done();
      };

      fileReader.readAsText(errorBlob);
    });
  });

  describe('Progress events', () => {
    it('should fire progress event on successful read', (done) => {
      let progressFired = false;
      fileReader.onprogress = (event) => {
        expect(event.type).toBe('progress');
        expect(event.loaded).toBe(1);
        expect(event.total).toBe(1);
        expect(event.lengthComputable).toBe(true);
        progressFired = true;
      };

      fileReader.onload = () => {
        expect(progressFired).toBe(true);
        done();
      };

      fileReader.readAsText(testBlob);
    });
  });

  describe('Event object structure', () => {
    it('should create proper event objects', (done) => {
      fileReader.onload = (event) => {
        expect(event.type).toBe('load');
        expect(event.target).toBe(fileReader);
        expect(typeof event.timeStamp).toBe('number');
        done();
      };

      fileReader.readAsText(testBlob);
    });
  });
});