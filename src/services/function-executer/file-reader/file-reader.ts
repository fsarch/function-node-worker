/**
 * FileReader API implementation for function execution context
 * Compatible with browser FileReader API
 */
export class FileReader {
  // ReadyState constants
  static readonly EMPTY = 0;
  static readonly LOADING = 1;
  static readonly DONE = 2;

  // Instance properties
  public readonly EMPTY = FileReader.EMPTY;
  public readonly LOADING = FileReader.LOADING;
  public readonly DONE = FileReader.DONE;

  public readyState: number = FileReader.EMPTY;
  public result: string | ArrayBuffer | null = null;
  public error: Error | null = null;

  // Event handlers
  public onload: ((event: Event) => void) | null = null;
  public onerror: ((event: ErrorEvent) => void) | null = null;
  public onprogress: ((event: ProgressEvent) => void) | null = null;
  public onabort: ((event: Event) => void) | null = null;
  public onloadstart: ((event: Event) => void) | null = null;
  public onloadend: ((event: Event) => void) | null = null;

  private aborted: boolean = false;

  constructor() {
    // Initialize as empty
    this.readyState = FileReader.EMPTY;
    this.result = null;
    this.error = null;
  }

  /**
   * Reads the contents of the specified Blob or File as text
   */
  public readAsText(blob: Blob, encoding: string = 'utf-8'): void {
    this.startReading(async () => {
      const text = await blob.text();
      return text;
    });
  }

  /**
   * Reads the contents of the specified Blob or File as an ArrayBuffer
   */
  public readAsArrayBuffer(blob: Blob): void {
    this.startReading(async () => {
      const arrayBuffer = await blob.arrayBuffer();
      return arrayBuffer;
    });
  }

  /**
   * Reads the contents of the specified Blob or File as a data URL
   */
  public readAsDataURL(blob: Blob): void {
    this.startReading(async () => {
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const base64 = buffer.toString('base64');
      return `data:${blob.type || 'application/octet-stream'};base64,${base64}`;
    });
  }

  /**
   * Reads the contents of the specified Blob or File as a binary string
   */
  public readAsBinaryString(blob: Blob): void {
    this.startReading(async () => {
      const arrayBuffer = await blob.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer.toString('binary');
    });
  }

  /**
   * Aborts the read operation
   */
  public abort(): void {
    if (this.readyState === FileReader.LOADING) {
      this.aborted = true;
      this.readyState = FileReader.DONE;
      this.error = new Error('The operation was aborted');
      this.fireEvent('abort');
      this.fireEvent('loadend');
    }
  }

  /**
   * Internal method to start the reading process
   */
  private startReading(readOperation: () => Promise<string | ArrayBuffer>): void {
    if (this.readyState === FileReader.LOADING) {
      throw new Error('The FileReader is already reading');
    }

    this.readyState = FileReader.LOADING;
    this.result = null;
    this.error = null;
    this.aborted = false;

    this.fireEvent('loadstart');

    // Use setTimeout to make it asynchronous
    setTimeout(async () => {
      try {
        if (this.aborted) {
          return;
        }

        const result = await readOperation();
        
        if (this.aborted) {
          return;
        }

        this.result = result;
        this.readyState = FileReader.DONE;
        this.fireEvent('progress', { loaded: 1, total: 1 });
        this.fireEvent('load');
        this.fireEvent('loadend');
      } catch (error) {
        if (this.aborted) {
          return;
        }

        this.error = error instanceof Error ? error : new Error(String(error));
        this.readyState = FileReader.DONE;
        this.fireEvent('error');
        this.fireEvent('loadend');
      }
    }, 0);
  }

  /**
   * Internal method to fire events
   */
  private fireEvent(type: string, eventData?: any): void {
    const event = this.createEvent(type, eventData);
    
    switch (type) {
      case 'load':
        if (this.onload) {
          this.onload(event);
        }
        break;
      case 'error':
        if (this.onerror) {
          this.onerror(event as ErrorEvent);
        }
        break;
      case 'progress':
        if (this.onprogress) {
          this.onprogress(event as ProgressEvent);
        }
        break;
      case 'abort':
        if (this.onabort) {
          this.onabort(event);
        }
        break;
      case 'loadstart':
        if (this.onloadstart) {
          this.onloadstart(event);
        }
        break;
      case 'loadend':
        if (this.onloadend) {
          this.onloadend(event);
        }
        break;
    }
  }

  /**
   * Creates an event object
   */
  private createEvent(type: string, data?: any): Event {
    if (type === 'error') {
      return {
        type,
        target: this,
        error: this.error,
        timeStamp: Date.now(),
      } as ErrorEvent;
    }
    
    if (type === 'progress') {
      return {
        type,
        target: this,
        loaded: data?.loaded || 0,
        total: data?.total || 0,
        lengthComputable: true,
        timeStamp: Date.now(),
      } as ProgressEvent;
    }

    return {
      type,
      target: this,
      timeStamp: Date.now(),
    } as Event;
  }
}

// Type definitions for better TypeScript support
export interface ErrorEvent extends Event {
  error: Error | null;
}

export interface ProgressEvent extends Event {
  loaded: number;
  total: number;
  lengthComputable: boolean;
}

export interface Event {
  type: string;
  target: FileReader;
  timeStamp: number;
}