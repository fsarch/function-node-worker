#!/usr/bin/env node

/**
 * Demo script showing the FileReader API in action
 * This demonstrates the FileReader working in a Node.js VM context
 * similar to how it works in the function execution environment
 */

import { FileReader } from '../dist/services/function-executer/file-reader/file-reader.js';
import * as vm from 'node:vm';

async function runDemo() {
  console.log('🚀 FileReader API Demo');
  console.log('========================\n');

  // Create a VM context similar to the function execution context
  const context = {
    FileReader,
    Blob,
    console,
    Buffer,
    TextDecoder,
    setTimeout,
    Promise
  };

  vm.createContext(context);

  // Demo 1: Reading text from a blob
  console.log('📖 Demo 1: Reading text from a blob');
  const demo1Code = `
    (async () => {
      const blob = new Blob(['Hello, FileReader API!'], { type: 'text/plain' });
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onloadstart = () => console.log('  ⏳ Reading started...');
        reader.onload = () => {
          console.log('  ✅ Reading completed!');
          console.log('  📄 Result:', reader.result);
          resolve(reader.result);
        };
        reader.readAsText(blob);
      });
    })()
  `;

  const result1 = await vm.runInContext(demo1Code, context);
  console.log('');

  // Demo 2: Reading as data URL
  console.log('🔗 Demo 2: Reading as data URL');
  const demo2Code = `
    (async () => {
      const blob = new Blob(['Hello, World!'], { type: 'text/plain' });
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onload = () => {
          console.log('  ✅ Data URL created!');
          console.log('  🔗 Result:', reader.result);
          resolve(reader.result);
        };
        reader.readAsDataURL(blob);
      });
    })()
  `;

  const result2 = await vm.runInContext(demo2Code, context);
  console.log('');

  // Demo 3: Reading as ArrayBuffer
  console.log('🔢 Demo 3: Reading as ArrayBuffer');
  const demo3Code = `
    (async () => {
      const blob = new Blob(['Hello, ArrayBuffer!'], { type: 'text/plain' });
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onload = () => {
          console.log('  ✅ ArrayBuffer created!');
          console.log('  📊 ArrayBuffer size:', reader.result.byteLength, 'bytes');
          
          // Convert back to text to show it worked
          const decoder = new TextDecoder();
          const text = decoder.decode(reader.result);
          console.log('  📄 Decoded text:', text);
          resolve(text);
        };
        reader.readAsArrayBuffer(blob);
      });
    })()
  `;

  const result3 = await vm.runInContext(demo3Code, context);
  console.log('');

  // Demo 4: Error handling and abort
  console.log('⚠️  Demo 4: Abort operation');
  const demo4Code = `
    (async () => {
      const blob = new Blob(['This will be aborted'], { type: 'text/plain' });
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onabort = () => {
          console.log('  ⚠️  Reading aborted!');
          console.log('  💥 Error:', reader.error?.message);
          resolve('aborted');
        };
        
        reader.onload = () => {
          console.log('  ✅ This should not be reached');
          resolve('completed');
        };
        
        reader.readAsText(blob);
        reader.abort(); // Abort immediately
      });
    })()
  `;

  const result4 = await vm.runInContext(demo4Code, context);
  console.log('');

  // Demo 5: Multiple event handlers
  console.log('🎯 Demo 5: Multiple event handlers');
  const demo5Code = `
    (async () => {
      const blob = new Blob(['Event handler demo!'], { type: 'text/plain' });
      const reader = new FileReader();
      
      return new Promise((resolve) => {
        reader.onloadstart = () => console.log('  🚀 loadstart event fired');
        reader.onprogress = (event) => console.log('  📊 progress event fired:', event.loaded, '/', event.total);
        reader.onload = () => {
          console.log('  ✅ load event fired');
          resolve(reader.result);
        };
        reader.onloadend = () => console.log('  🏁 loadend event fired');
        
        reader.readAsText(blob);
      });
    })()
  `;

  const result5 = await vm.runInContext(demo5Code, context);
  console.log('');

  console.log('✨ Demo completed! FileReader API is working perfectly in the VM context.');
  console.log('📋 Summary:');
  console.log('  - Text reading: ✅');
  console.log('  - Data URL creation: ✅');
  console.log('  - ArrayBuffer reading: ✅');
  console.log('  - Abort functionality: ✅');
  console.log('  - Event handling: ✅');
}

// Run the demo
runDemo().catch(console.error);