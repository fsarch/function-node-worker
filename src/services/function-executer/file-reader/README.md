# FileReader API Implementation

This document describes the FileReader API implementation for the function execution context, which provides browser-compatible file reading capabilities.

## Overview

The FileReader API allows functions to read the contents of Blob and File objects asynchronously. It provides the same interface as the browser's FileReader API, making it familiar to developers who have worked with client-side file handling.

## Features

- **Full Browser Compatibility**: Implements the complete FileReader API specification
- **Asynchronous Operations**: All read operations are asynchronous with proper event handling
- **Multiple Read Formats**: Supports reading as text, ArrayBuffer, data URL, and binary string
- **Event-Driven**: Comprehensive event system with onload, onerror, onprogress, etc.
- **Error Handling**: Proper error handling with detailed error information
- **Abort Support**: Ability to abort ongoing read operations

## API Reference

### Constructor

```javascript
const reader = new FileReader();
```

### Constants

- `FileReader.EMPTY` (0): The reader is empty and no read operation has been started
- `FileReader.LOADING` (1): A read operation is in progress
- `FileReader.DONE` (2): The read operation has completed

### Properties

- `readyState`: Current state of the reader (EMPTY, LOADING, or DONE)
- `result`: The result of the read operation (null until completed)
- `error`: Error information if the read operation failed

### Methods

#### `readAsText(blob, encoding?)`
Reads the contents of the specified Blob as text.

```javascript
reader.readAsText(blob, 'utf-8'); // encoding is optional, defaults to 'utf-8'
```

#### `readAsArrayBuffer(blob)`
Reads the contents of the specified Blob as an ArrayBuffer.

```javascript
reader.readAsArrayBuffer(blob);
```

#### `readAsDataURL(blob)`
Reads the contents of the specified Blob as a data URL.

```javascript
reader.readAsDataURL(blob);
```

#### `readAsBinaryString(blob)`
Reads the contents of the specified Blob as a binary string.

```javascript
reader.readAsBinaryString(blob);
```

#### `abort()`
Aborts the read operation if it's currently in progress.

```javascript
reader.abort();
```

### Event Handlers

- `onload`: Fired when the read operation completes successfully
- `onerror`: Fired when an error occurs during the read operation
- `onprogress`: Fired periodically during the read operation (simplified implementation)
- `onabort`: Fired when the read operation is aborted
- `onloadstart`: Fired when the read operation starts
- `onloadend`: Fired when the read operation ends (success, error, or abort)

## Usage Examples

### Reading Text from a Blob

```javascript
export async function run() {
  const blob = new Blob(['Hello, World!'], { type: 'text/plain' });
  const reader = new FileReader();
  
  return new Promise((resolve, reject) => {
    reader.onload = (event) => {
      resolve(reader.result); // "Hello, World!"
    };
    
    reader.onerror = (event) => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(blob);
  });
}
```

### Reading as Data URL

```javascript
export async function run() {
  const blob = new Blob(['Hello'], { type: 'text/plain' });
  const reader = new FileReader();
  
  return new Promise((resolve, reject) => {
    reader.onload = (event) => {
      resolve(reader.result); // "data:text/plain;base64,SGVsbG8="
    };
    
    reader.onerror = (event) => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(blob);
  });
}
```

### Reading as ArrayBuffer

```javascript
export async function run() {
  const blob = new Blob(['Hello'], { type: 'text/plain' });
  const reader = new FileReader();
  
  return new Promise((resolve, reject) => {
    reader.onload = (event) => {
      const buffer = reader.result; // ArrayBuffer
      const text = new TextDecoder().decode(buffer);
      resolve(text); // "Hello"
    };
    
    reader.onerror = (event) => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsArrayBuffer(blob);
  });
}
```

### Using Multiple Event Handlers

```javascript
export async function run() {
  const blob = new Blob(['Hello, World!'], { type: 'text/plain' });
  const reader = new FileReader();
  
  return new Promise((resolve, reject) => {
    reader.onloadstart = (event) => {
      console.log('Reading started');
    };
    
    reader.onprogress = (event) => {
      console.log('Reading progress:', event.loaded, '/', event.total);
    };
    
    reader.onload = (event) => {
      console.log('Reading completed');
      resolve(reader.result);
    };
    
    reader.onerror = (event) => {
      console.log('Reading failed');
      reject(new Error('Failed to read file'));
    };
    
    reader.onloadend = (event) => {
      console.log('Reading ended');
    };
    
    reader.readAsText(blob);
  });
}
```

### Aborting a Read Operation

```javascript
export async function run() {
  const blob = new Blob(['Hello, World!'], { type: 'text/plain' });
  const reader = new FileReader();
  
  return new Promise((resolve, reject) => {
    reader.onabort = (event) => {
      resolve('Read operation was aborted');
    };
    
    reader.onerror = (event) => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(blob);
    
    // Abort the operation immediately
    reader.abort();
  });
}
```

### Error Handling

```javascript
export async function run() {
  // This example shows how to handle errors
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
      resolve({
        success: false,
        error: reader.error?.message || 'Unknown error',
        readyState: reader.readyState
      });
    };
    
    reader.readAsText(blob);
  });
}
```

## Implementation Details

- The FileReader implementation is fully compatible with the browser FileReader API
- All read operations are asynchronous and use the Node.js event loop
- The implementation works with Node.js Blob objects that are already available in the execution context
- Error handling follows the same patterns as the browser implementation
- Progress events are simplified but maintain API compatibility

## Testing

The implementation includes comprehensive tests covering:
- All read methods (readAsText, readAsArrayBuffer, readAsDataURL, readAsBinaryString)
- Event handling for all event types
- Error conditions and error handling
- Abort functionality
- Integration with VM context (same as function execution environment)

Run the tests with:
```bash
npm test src/services/function-executer/file-reader/
```