
var Module = (function() {
  var _scriptDir = import.meta.url;
  return (
function(Module) {
  Module = Module || {};

// Copyright 2010 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// The Module object: Our interface to the outside world. We import
// and export values on it. There are various ways Module can be used:
// 1. Not defined. We create it here
// 2. A function parameter, function(Module) { ..generated code.. }
// 3. pre-run appended it, var Module = {}; ..generated code..
// 4. External script tag defines var Module.
// We need to check if Module already exists (e.g. case 3 above).
// Substitution will be replaced with actual code on later stage of the build,
// this way Closure Compiler will not mangle it (e.g. case 4. above).
// Note that if you want to run closure, and also to use Module
// after the generated code, you will need to define   var Module = {};
// before the code. Then that object will be used in the code, and you
// can continue to use Module afterwards as well.
var Module = typeof Module !== 'undefined' ? Module : {};

// --pre-jses are emitted after the Module integration code, so that they can
// refer to Module (if they choose; they can also define Module)
// {{PRE_JSES}}

// Sometimes an existing Module object exists with properties
// meant to overwrite the default module functionality. Here
// we collect those properties and reapply _after_ we configure
// the current environment's defaults to avoid having to be so
// defensive during initialization.
var moduleOverrides = {};
var key;
for (key in Module) {
  if (Module.hasOwnProperty(key)) {
    moduleOverrides[key] = Module[key];
  }
}

var arguments_ = [];
var thisProgram = './this.program';
var quit_ = function(status, toThrow) {
  throw toThrow;
};

// Determine the runtime environment we are in. You can customize this by
// setting the ENVIRONMENT setting at compile time (see settings.js).

var ENVIRONMENT_IS_WEB = false;
var ENVIRONMENT_IS_WORKER = false;
var ENVIRONMENT_IS_NODE = false;
var ENVIRONMENT_HAS_NODE = false;
var ENVIRONMENT_IS_SHELL = false;
ENVIRONMENT_IS_WEB = typeof window === 'object';
ENVIRONMENT_IS_WORKER = typeof importScripts === 'function';
// A web environment like Electron.js can have Node enabled, so we must
// distinguish between Node-enabled environments and Node environments per se.
// This will allow the former to do things like mount NODEFS.
// Extended check using process.versions fixes issue #8816.
// (Also makes redundant the original check that 'require' is a function.)
ENVIRONMENT_HAS_NODE = typeof process === 'object' && typeof process.versions === 'object' && typeof process.versions.node === 'string';
ENVIRONMENT_IS_NODE = ENVIRONMENT_HAS_NODE && !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_WORKER;
ENVIRONMENT_IS_SHELL = !ENVIRONMENT_IS_WEB && !ENVIRONMENT_IS_NODE && !ENVIRONMENT_IS_WORKER;




// `/` should be present at the end if `scriptDirectory` is not empty
var scriptDirectory = '';
function locateFile(path) {
  if (Module['locateFile']) {
    return Module['locateFile'](path, scriptDirectory);
  }
  return scriptDirectory + path;
}

// Hooks that are implemented differently in different runtime environments.
var read_,
    readAsync,
    readBinary,
    setWindowTitle;

if (ENVIRONMENT_IS_NODE) {
  scriptDirectory = __dirname + '/';

  // Expose functionality in the same simple way that the shells work
  // Note that we pollute the global namespace here, otherwise we break in node
  var nodeFS;
  var nodePath;

  read_ = function shell_read(filename, binary) {
    var ret;
    ret = tryParseAsDataURI(filename);
    if (!ret) {
      if (!nodeFS) nodeFS = require('fs');
      if (!nodePath) nodePath = require('path');
      filename = nodePath['normalize'](filename);
      ret = nodeFS['readFileSync'](filename);
    }
    return binary ? ret : ret.toString();
  };

  readBinary = function readBinary(filename) {
    var ret = read_(filename, true);
    if (!ret.buffer) {
      ret = new Uint8Array(ret);
    }
    assert(ret.buffer);
    return ret;
  };

  if (process['argv'].length > 1) {
    thisProgram = process['argv'][1].replace(/\\/g, '/');
  }

  arguments_ = process['argv'].slice(2);

  // MODULARIZE will export the module in the proper place outside, we don't need to export here

  process['on']('uncaughtException', function(ex) {
    // suppress ExitStatus exceptions from showing an error
    if (!(ex instanceof ExitStatus)) {
      throw ex;
    }
  });

  process['on']('unhandledRejection', abort);

  quit_ = function(status) {
    process['exit'](status);
  };

  Module['inspect'] = function () { return '[Emscripten Module object]'; };
} else
if (ENVIRONMENT_IS_SHELL) {


  if (typeof read != 'undefined') {
    read_ = function shell_read(f) {
      var data = tryParseAsDataURI(f);
      if (data) {
        return intArrayToString(data);
      }
      return read(f);
    };
  }

  readBinary = function readBinary(f) {
    var data;
    data = tryParseAsDataURI(f);
    if (data) {
      return data;
    }
    if (typeof readbuffer === 'function') {
      return new Uint8Array(readbuffer(f));
    }
    data = read(f, 'binary');
    assert(typeof data === 'object');
    return data;
  };

  if (typeof scriptArgs != 'undefined') {
    arguments_ = scriptArgs;
  } else if (typeof arguments != 'undefined') {
    arguments_ = arguments;
  }

  if (typeof quit === 'function') {
    quit_ = function(status) {
      quit(status);
    };
  }

  if (typeof print !== 'undefined') {
    // Prefer to use print/printErr where they exist, as they usually work better.
    if (typeof console === 'undefined') console = {};
    console.log = print;
    console.warn = console.error = typeof printErr !== 'undefined' ? printErr : print;
  }
} else
if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
  if (ENVIRONMENT_IS_WORKER) { // Check worker, not web, since window could be polyfilled
    scriptDirectory = self.location.href;
  } else if (document.currentScript) { // web
    scriptDirectory = document.currentScript.src;
  }
  // When MODULARIZE (and not _INSTANCE), this JS may be executed later, after document.currentScript
  // is gone, so we saved it, and we use it here instead of any other info.
  if (_scriptDir) {
    scriptDirectory = _scriptDir;
  }
  // blob urls look like blob:http://site.com/etc/etc and we cannot infer anything from them.
  // otherwise, slice off the final part of the url to find the script directory.
  // if scriptDirectory does not contain a slash, lastIndexOf will return -1,
  // and scriptDirectory will correctly be replaced with an empty string.
  if (scriptDirectory.indexOf('blob:') !== 0) {
    scriptDirectory = scriptDirectory.substr(0, scriptDirectory.lastIndexOf('/')+1);
  } else {
    scriptDirectory = '';
  }


  read_ = function shell_read(url) {
    try {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, false);
      xhr.send(null);
      return xhr.responseText;
    } catch (err) {
      var data = tryParseAsDataURI(url);
      if (data) {
        return intArrayToString(data);
      }
      throw err;
    }
  };

  if (ENVIRONMENT_IS_WORKER) {
    readBinary = function readBinary(url) {
      try {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, false);
        xhr.responseType = 'arraybuffer';
        xhr.send(null);
        return new Uint8Array(xhr.response);
      } catch (err) {
        var data = tryParseAsDataURI(url);
        if (data) {
          return data;
        }
        throw err;
      }
    };
  }

  readAsync = function readAsync(url, onload, onerror) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function xhr_onload() {
      if (xhr.status == 200 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
        onload(xhr.response);
        return;
      }
      var data = tryParseAsDataURI(url);
      if (data) {
        onload(data.buffer);
        return;
      }
      onerror();
    };
    xhr.onerror = onerror;
    xhr.send(null);
  };

  setWindowTitle = function(title) { document.title = title };
} else
{
}

// Set up the out() and err() hooks, which are how we can print to stdout or
// stderr, respectively.
var out = Module['print'] || console.log.bind(console);
var err = Module['printErr'] || console.warn.bind(console);

// Merge back in the overrides
for (key in moduleOverrides) {
  if (moduleOverrides.hasOwnProperty(key)) {
    Module[key] = moduleOverrides[key];
  }
}
// Free the object hierarchy contained in the overrides, this lets the GC
// reclaim data used e.g. in memoryInitializerRequest, which is a large typed array.
moduleOverrides = null;

// Emit code to handle expected values on the Module object. This applies Module.x
// to the proper local x. This has two benefits: first, we only emit it if it is
// expected to arrive, and second, by using a local everywhere else that can be
// minified.
if (Module['arguments']) arguments_ = Module['arguments'];
if (Module['thisProgram']) thisProgram = Module['thisProgram'];
if (Module['quit']) quit_ = Module['quit'];

// perform assertions in shell.js after we set up out() and err(), as otherwise if an assertion fails it cannot print the message

// TODO remove when SDL2 is fixed (also see above)



// Copyright 2017 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// {{PREAMBLE_ADDITIONS}}

var STACK_ALIGN = 16;


function dynamicAlloc(size) {
  var ret = HEAP32[DYNAMICTOP_PTR>>2];
  var end = (ret + size + 15) & -16;
  if (end > _emscripten_get_heap_size()) {
    abort();
  }
  HEAP32[DYNAMICTOP_PTR>>2] = end;
  return ret;
}

function alignMemory(size, factor) {
  if (!factor) factor = STACK_ALIGN; // stack alignment (16-byte) by default
  return Math.ceil(size / factor) * factor;
}

function getNativeTypeSize(type) {
  switch (type) {
    case 'i1': case 'i8': return 1;
    case 'i16': return 2;
    case 'i32': return 4;
    case 'i64': return 8;
    case 'float': return 4;
    case 'double': return 8;
    default: {
      if (type[type.length-1] === '*') {
        return 4; // A pointer
      } else if (type[0] === 'i') {
        var bits = parseInt(type.substr(1));
        assert(bits % 8 === 0, 'getNativeTypeSize invalid bits ' + bits + ', type ' + type);
        return bits / 8;
      } else {
        return 0;
      }
    }
  }
}

function warnOnce(text) {
  if (!warnOnce.shown) warnOnce.shown = {};
  if (!warnOnce.shown[text]) {
    warnOnce.shown[text] = 1;
    err(text);
  }
}

var asm2wasmImports = { // special asm2wasm imports
    "f64-rem": function(x, y) {
        return x % y;
    },
    "debugger": function() {
    }
};




// Wraps a JS function as a wasm function with a given signature.
// In the future, we may get a WebAssembly.Function constructor. Until then,
// we create a wasm module that takes the JS function as an import with a given
// signature, and re-exports that as a wasm function.
function convertJsFunctionToWasm(func, sig) {

  // The module is static, with the exception of the type section, which is
  // generated based on the signature passed in.
  var typeSection = [
    0x01, // id: section,
    0x00, // length: 0 (placeholder)
    0x01, // count: 1
    0x60, // form: func
  ];
  var sigRet = sig.slice(0, 1);
  var sigParam = sig.slice(1);
  var typeCodes = {
    'i': 0x7f, // i32
    'j': 0x7e, // i64
    'f': 0x7d, // f32
    'd': 0x7c, // f64
  };

  // Parameters, length + signatures
  typeSection.push(sigParam.length);
  for (var i = 0; i < sigParam.length; ++i) {
    typeSection.push(typeCodes[sigParam[i]]);
  }

  // Return values, length + signatures
  // With no multi-return in MVP, either 0 (void) or 1 (anything else)
  if (sigRet == 'v') {
    typeSection.push(0x00);
  } else {
    typeSection = typeSection.concat([0x01, typeCodes[sigRet]]);
  }

  // Write the overall length of the type section back into the section header
  // (excepting the 2 bytes for the section id and length)
  typeSection[1] = typeSection.length - 2;

  // Rest of the module is static
  var bytes = new Uint8Array([
    0x00, 0x61, 0x73, 0x6d, // magic ("\0asm")
    0x01, 0x00, 0x00, 0x00, // version: 1
  ].concat(typeSection, [
    0x02, 0x07, // import section
      // (import "e" "f" (func 0 (type 0)))
      0x01, 0x01, 0x65, 0x01, 0x66, 0x00, 0x00,
    0x07, 0x05, // export section
      // (export "f" (func 0 (type 0)))
      0x01, 0x01, 0x66, 0x00, 0x00,
  ]));

   // We can compile this wasm module synchronously because it is very small.
  // This accepts an import (at "e.f"), that it reroutes to an export (at "f")
  var module = new WebAssembly.Module(bytes);
  var instance = new WebAssembly.Instance(module, {
    e: {
      f: func
    }
  });
  var wrappedFunc = instance.exports.f;
  return wrappedFunc;
}

// Add a wasm function to the table.
function addFunctionWasm(func, sig) {
  var table = wasmTable;
  var ret = table.length;

  // Grow the table
  try {
    table.grow(1);
  } catch (err) {
    if (!err instanceof RangeError) {
      throw err;
    }
    throw 'Unable to grow wasm table. Use a higher value for RESERVED_FUNCTION_POINTERS or set ALLOW_TABLE_GROWTH.';
  }

  // Insert new element
  try {
    // Attempting to call this with JS function will cause of table.set() to fail
    table.set(ret, func);
  } catch (err) {
    if (!err instanceof TypeError) {
      throw err;
    }
    assert(typeof sig !== 'undefined', 'Missing signature argument to addFunction');
    var wrapped = convertJsFunctionToWasm(func, sig);
    table.set(ret, wrapped);
  }

  return ret;
}

function removeFunctionWasm(index) {
  // TODO(sbc): Look into implementing this to allow re-using of table slots
}

// 'sig' parameter is required for the llvm backend but only when func is not
// already a WebAssembly function.
function addFunction(func, sig) {

  return addFunctionWasm(func, sig);
}

function removeFunction(index) {
  removeFunctionWasm(index);
}

var funcWrappers = {};

function getFuncWrapper(func, sig) {
  if (!func) return; // on null pointer, return undefined
  assert(sig);
  if (!funcWrappers[sig]) {
    funcWrappers[sig] = {};
  }
  var sigCache = funcWrappers[sig];
  if (!sigCache[func]) {
    // optimize away arguments usage in common cases
    if (sig.length === 1) {
      sigCache[func] = function dynCall_wrapper() {
        return dynCall(sig, func);
      };
    } else if (sig.length === 2) {
      sigCache[func] = function dynCall_wrapper(arg) {
        return dynCall(sig, func, [arg]);
      };
    } else {
      // general case
      sigCache[func] = function dynCall_wrapper() {
        return dynCall(sig, func, Array.prototype.slice.call(arguments));
      };
    }
  }
  return sigCache[func];
}


function makeBigInt(low, high, unsigned) {
  return unsigned ? ((+((low>>>0)))+((+((high>>>0)))*4294967296.0)) : ((+((low>>>0)))+((+((high|0)))*4294967296.0));
}

function dynCall(sig, ptr, args) {
  if (args && args.length) {
    return Module['dynCall_' + sig].apply(null, [ptr].concat(args));
  } else {
    return Module['dynCall_' + sig].call(null, ptr);
  }
}

var tempRet0 = 0;

var setTempRet0 = function(value) {
  tempRet0 = value;
};

var getTempRet0 = function() {
  return tempRet0;
};


var Runtime = {
};

// The address globals begin at. Very low in memory, for code size and optimization opportunities.
// Above 0 is static memory, starting with globals.
// Then the stack.
// Then 'dynamic' memory for sbrk.
var GLOBAL_BASE = 1024;




// === Preamble library stuff ===

// Documentation for the public APIs defined in this file must be updated in:
//    site/source/docs/api_reference/preamble.js.rst
// A prebuilt local version of the documentation is available at:
//    site/build/text/docs/api_reference/preamble.js.txt
// You can also build docs locally as HTML or other formats in site/
// An online HTML version (which may be of a different version of Emscripten)
//    is up at http://kripken.github.io/emscripten-site/docs/api_reference/preamble.js.html


var wasmBinary;if (Module['wasmBinary']) wasmBinary = Module['wasmBinary'];
var noExitRuntime;if (Module['noExitRuntime']) noExitRuntime = Module['noExitRuntime'];


if (typeof WebAssembly !== 'object') {
  err('no native wasm support detected');
}


// In MINIMAL_RUNTIME, setValue() and getValue() are only available when building with safe heap enabled, for heap safety checking.
// In traditional runtime, setValue() and getValue() are always available (although their use is highly discouraged due to perf penalties)

/** @type {function(number, number, string, boolean=)} */
function setValue(ptr, value, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': HEAP8[((ptr)>>0)]=value; break;
      case 'i8': HEAP8[((ptr)>>0)]=value; break;
      case 'i16': HEAP16[((ptr)>>1)]=value; break;
      case 'i32': HEAP32[((ptr)>>2)]=value; break;
      case 'i64': (tempI64 = [value>>>0,(tempDouble=value,(+(Math_abs(tempDouble))) >= 1.0 ? (tempDouble > 0.0 ? ((Math_min((+(Math_floor((tempDouble)/4294967296.0))), 4294967295.0))|0)>>>0 : (~~((+(Math_ceil((tempDouble - +(((~~(tempDouble)))>>>0))/4294967296.0)))))>>>0) : 0)],HEAP32[((ptr)>>2)]=tempI64[0],HEAP32[(((ptr)+(4))>>2)]=tempI64[1]); break;
      case 'float': HEAPF32[((ptr)>>2)]=value; break;
      case 'double': HEAPF64[((ptr)>>3)]=value; break;
      default: abort('invalid type for setValue: ' + type);
    }
}

/** @type {function(number, string, boolean=)} */
function getValue(ptr, type, noSafe) {
  type = type || 'i8';
  if (type.charAt(type.length-1) === '*') type = 'i32'; // pointers are 32-bit
    switch(type) {
      case 'i1': return HEAP8[((ptr)>>0)];
      case 'i8': return HEAP8[((ptr)>>0)];
      case 'i16': return HEAP16[((ptr)>>1)];
      case 'i32': return HEAP32[((ptr)>>2)];
      case 'i64': return HEAP32[((ptr)>>2)];
      case 'float': return HEAPF32[((ptr)>>2)];
      case 'double': return HEAPF64[((ptr)>>3)];
      default: abort('invalid type for getValue: ' + type);
    }
  return null;
}





// Wasm globals

var wasmMemory;

// In fastcomp asm.js, we don't need a wasm Table at all.
// In the wasm backend, we polyfill the WebAssembly object,
// so this creates a (non-native-wasm) table for us.
var wasmTable = new WebAssembly.Table({
  'initial': 102,
  'maximum': 102 + 0,
  'element': 'anyfunc'
});


//========================================
// Runtime essentials
//========================================

// whether we are quitting the application. no code should run after this.
// set in exit() and abort()
var ABORT = false;

// set by exit() and abort().  Passed to 'onExit' handler.
// NOTE: This is also used as the process return code code in shell environments
// but only when noExitRuntime is false.
var EXITSTATUS = 0;

/** @type {function(*, string=)} */
function assert(condition, text) {
  if (!condition) {
    abort('Assertion failed: ' + text);
  }
}

// Returns the C function with a specified identifier (for C++, you need to do manual name mangling)
function getCFunc(ident) {
  var func = Module['_' + ident]; // closure exported function
  assert(func, 'Cannot call unknown function ' + ident + ', make sure it is exported');
  return func;
}

// C calling interface.
function ccall(ident, returnType, argTypes, args, opts) {
  // For fast lookup of conversion functions
  var toC = {
    'string': function(str) {
      var ret = 0;
      if (str !== null && str !== undefined && str !== 0) { // null string
        // at most 4 bytes per UTF-8 code point, +1 for the trailing '\0'
        var len = (str.length << 2) + 1;
        ret = stackAlloc(len);
        stringToUTF8(str, ret, len);
      }
      return ret;
    },
    'array': function(arr) {
      var ret = stackAlloc(arr.length);
      writeArrayToMemory(arr, ret);
      return ret;
    }
  };

  function convertReturnValue(ret) {
    if (returnType === 'string') return UTF8ToString(ret);
    if (returnType === 'boolean') return Boolean(ret);
    return ret;
  }

  var func = getCFunc(ident);
  var cArgs = [];
  var stack = 0;
  if (args) {
    for (var i = 0; i < args.length; i++) {
      var converter = toC[argTypes[i]];
      if (converter) {
        if (stack === 0) stack = stackSave();
        cArgs[i] = converter(args[i]);
      } else {
        cArgs[i] = args[i];
      }
    }
  }
  var ret = func.apply(null, cArgs);

  ret = convertReturnValue(ret);
  if (stack !== 0) stackRestore(stack);
  return ret;
}

function cwrap(ident, returnType, argTypes, opts) {
  argTypes = argTypes || [];
  // When the function takes numbers and returns a number, we can just return
  // the original function
  var numericArgs = argTypes.every(function(type){ return type === 'number'});
  var numericRet = returnType !== 'string';
  if (numericRet && numericArgs && !opts) {
    return getCFunc(ident);
  }
  return function() {
    return ccall(ident, returnType, argTypes, arguments, opts);
  }
}

var ALLOC_NORMAL = 0; // Tries to use _malloc()
var ALLOC_STACK = 1; // Lives for the duration of the current function call
var ALLOC_DYNAMIC = 2; // Cannot be freed except through sbrk
var ALLOC_NONE = 3; // Do not allocate

// allocate(): This is for internal use. You can use it yourself as well, but the interface
//             is a little tricky (see docs right below). The reason is that it is optimized
//             for multiple syntaxes to save space in generated code. So you should
//             normally not use allocate(), and instead allocate memory using _malloc(),
//             initialize it with setValue(), and so forth.
// @slab: An array of data, or a number. If a number, then the size of the block to allocate,
//        in *bytes* (note that this is sometimes confusing: the next parameter does not
//        affect this!)
// @types: Either an array of types, one for each byte (or 0 if no type at that position),
//         or a single type which is used for the entire block. This only matters if there
//         is initial data - if @slab is a number, then this does not matter at all and is
//         ignored.
// @allocator: How to allocate memory, see ALLOC_*
/** @type {function((TypedArray|Array<number>|number), string, number, number=)} */
function allocate(slab, types, allocator, ptr) {
  var zeroinit, size;
  if (typeof slab === 'number') {
    zeroinit = true;
    size = slab;
  } else {
    zeroinit = false;
    size = slab.length;
  }

  var singleType = typeof types === 'string' ? types : null;

  var ret;
  if (allocator == ALLOC_NONE) {
    ret = ptr;
  } else {
    ret = [_malloc,
    stackAlloc,
    dynamicAlloc][allocator](Math.max(size, singleType ? 1 : types.length));
  }

  if (zeroinit) {
    var stop;
    ptr = ret;
    assert((ret & 3) == 0);
    stop = ret + (size & ~3);
    for (; ptr < stop; ptr += 4) {
      HEAP32[((ptr)>>2)]=0;
    }
    stop = ret + size;
    while (ptr < stop) {
      HEAP8[((ptr++)>>0)]=0;
    }
    return ret;
  }

  if (singleType === 'i8') {
    if (slab.subarray || slab.slice) {
      HEAPU8.set(/** @type {!Uint8Array} */ (slab), ret);
    } else {
      HEAPU8.set(new Uint8Array(slab), ret);
    }
    return ret;
  }

  var i = 0, type, typeSize, previousType;
  while (i < size) {
    var curr = slab[i];

    type = singleType || types[i];
    if (type === 0) {
      i++;
      continue;
    }

    if (type == 'i64') type = 'i32'; // special case: we have one i32 here, and one i32 later

    setValue(ret+i, curr, type);

    // no need to look up size unless type changes, so cache it
    if (previousType !== type) {
      typeSize = getNativeTypeSize(type);
      previousType = type;
    }
    i += typeSize;
  }

  return ret;
}

// Allocate memory during any stage of startup - static memory early on, dynamic memory later, malloc when ready
function getMemory(size) {
  if (!runtimeInitialized) return dynamicAlloc(size);
  return _malloc(size);
}




/** @type {function(number, number=)} */
function Pointer_stringify(ptr, length) {
  abort("this function has been removed - you should use UTF8ToString(ptr, maxBytesToRead) instead!");
}

// Given a pointer 'ptr' to a null-terminated ASCII-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

function AsciiToString(ptr) {
  var str = '';
  while (1) {
    var ch = HEAPU8[((ptr++)>>0)];
    if (!ch) return str;
    str += String.fromCharCode(ch);
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in ASCII form. The copy will require at most str.length+1 bytes of space in the HEAP.

function stringToAscii(str, outPtr) {
  return writeAsciiToMemory(str, outPtr, false);
}


// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the given array that contains uint8 values, returns
// a copy of that string as a Javascript String object.

var UTF8Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf8') : undefined;

/**
 * @param {number} idx
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ArrayToString(u8Array, idx, maxBytesToRead) {
  var endIdx = idx + maxBytesToRead;
  var endPtr = idx;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  // (As a tiny code save trick, compare endPtr against endIdx using a negation, so that undefined means Infinity)
  while (u8Array[endPtr] && !(endPtr >= endIdx)) ++endPtr;

  if (endPtr - idx > 16 && u8Array.subarray && UTF8Decoder) {
    return UTF8Decoder.decode(u8Array.subarray(idx, endPtr));
  } else {
    var str = '';
    // If building with TextDecoder, we have already computed the string length above, so test loop end condition against that
    while (idx < endPtr) {
      // For UTF8 byte structure, see:
      // http://en.wikipedia.org/wiki/UTF-8#Description
      // https://www.ietf.org/rfc/rfc2279.txt
      // https://tools.ietf.org/html/rfc3629
      var u0 = u8Array[idx++];
      if (!(u0 & 0x80)) { str += String.fromCharCode(u0); continue; }
      var u1 = u8Array[idx++] & 63;
      if ((u0 & 0xE0) == 0xC0) { str += String.fromCharCode(((u0 & 31) << 6) | u1); continue; }
      var u2 = u8Array[idx++] & 63;
      if ((u0 & 0xF0) == 0xE0) {
        u0 = ((u0 & 15) << 12) | (u1 << 6) | u2;
      } else {
        u0 = ((u0 & 7) << 18) | (u1 << 12) | (u2 << 6) | (u8Array[idx++] & 63);
      }

      if (u0 < 0x10000) {
        str += String.fromCharCode(u0);
      } else {
        var ch = u0 - 0x10000;
        str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
      }
    }
  }
  return str;
}

// Given a pointer 'ptr' to a null-terminated UTF8-encoded string in the emscripten HEAP, returns a
// copy of that string as a Javascript String object.
// maxBytesToRead: an optional length that specifies the maximum number of bytes to read. You can omit
//                 this parameter to scan the string until the first \0 byte. If maxBytesToRead is
//                 passed, and the string at [ptr, ptr+maxBytesToReadr[ contains a null byte in the
//                 middle, then the string will cut short at that byte index (i.e. maxBytesToRead will
//                 not produce a string of exact length [ptr, ptr+maxBytesToRead[)
//                 N.B. mixing frequent uses of UTF8ToString() with and without maxBytesToRead may
//                 throw JS JIT optimizations off, so it is worth to consider consistently using one
//                 style or the other.
/**
 * @param {number} ptr
 * @param {number=} maxBytesToRead
 * @return {string}
 */
function UTF8ToString(ptr, maxBytesToRead) {
  return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : '';
}

// Copies the given Javascript String object 'str' to the given byte array at address 'outIdx',
// encoded in UTF8 form and null-terminated. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outU8Array: the array to copy to. Each index in this array is assumed to be one 8-byte element.
//   outIdx: The starting offset in the array to begin the copying.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array.
//                    This count should include the null terminator,
//                    i.e. if maxBytesToWrite=1, only the null terminator will be written and nothing else.
//                    maxBytesToWrite=0 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8Array(str, outU8Array, outIdx, maxBytesToWrite) {
  if (!(maxBytesToWrite > 0)) // Parameter maxBytesToWrite is not optional. Negative values, 0, null, undefined and false each don't write out any bytes.
    return 0;

  var startIdx = outIdx;
  var endIdx = outIdx + maxBytesToWrite - 1; // -1 for string null terminator.
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    // For UTF8 byte structure, see http://en.wikipedia.org/wiki/UTF-8#Description and https://www.ietf.org/rfc/rfc2279.txt and https://tools.ietf.org/html/rfc3629
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) {
      var u1 = str.charCodeAt(++i);
      u = 0x10000 + ((u & 0x3FF) << 10) | (u1 & 0x3FF);
    }
    if (u <= 0x7F) {
      if (outIdx >= endIdx) break;
      outU8Array[outIdx++] = u;
    } else if (u <= 0x7FF) {
      if (outIdx + 1 >= endIdx) break;
      outU8Array[outIdx++] = 0xC0 | (u >> 6);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else if (u <= 0xFFFF) {
      if (outIdx + 2 >= endIdx) break;
      outU8Array[outIdx++] = 0xE0 | (u >> 12);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    } else {
      if (outIdx + 3 >= endIdx) break;
      outU8Array[outIdx++] = 0xF0 | (u >> 18);
      outU8Array[outIdx++] = 0x80 | ((u >> 12) & 63);
      outU8Array[outIdx++] = 0x80 | ((u >> 6) & 63);
      outU8Array[outIdx++] = 0x80 | (u & 63);
    }
  }
  // Null-terminate the pointer to the buffer.
  outU8Array[outIdx] = 0;
  return outIdx - startIdx;
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF8 form. The copy will require at most str.length*4+1 bytes of space in the HEAP.
// Use the function lengthBytesUTF8 to compute the exact number of bytes (excluding null terminator) that this function will write.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF8(str, outPtr, maxBytesToWrite) {
  return stringToUTF8Array(str, HEAPU8,outPtr, maxBytesToWrite);
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF8 byte array, EXCLUDING the null terminator byte.
function lengthBytesUTF8(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! So decode UTF16->UTF32->UTF8.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var u = str.charCodeAt(i); // possibly a lead surrogate
    if (u >= 0xD800 && u <= 0xDFFF) u = 0x10000 + ((u & 0x3FF) << 10) | (str.charCodeAt(++i) & 0x3FF);
    if (u <= 0x7F) ++len;
    else if (u <= 0x7FF) len += 2;
    else if (u <= 0xFFFF) len += 3;
    else len += 4;
  }
  return len;
}


// Given a pointer 'ptr' to a null-terminated UTF16LE-encoded string in the emscripten HEAP, returns
// a copy of that string as a Javascript String object.

var UTF16Decoder = typeof TextDecoder !== 'undefined' ? new TextDecoder('utf-16le') : undefined;
function UTF16ToString(ptr) {
  var endPtr = ptr;
  // TextDecoder needs to know the byte length in advance, it doesn't stop on null terminator by itself.
  // Also, use the length info to avoid running tiny strings through TextDecoder, since .subarray() allocates garbage.
  var idx = endPtr >> 1;
  while (HEAP16[idx]) ++idx;
  endPtr = idx << 1;

  if (endPtr - ptr > 32 && UTF16Decoder) {
    return UTF16Decoder.decode(HEAPU8.subarray(ptr, endPtr));
  } else {
    var i = 0;

    var str = '';
    while (1) {
      var codeUnit = HEAP16[(((ptr)+(i*2))>>1)];
      if (codeUnit == 0) return str;
      ++i;
      // fromCharCode constructs a character from a UTF-16 code unit, so we can pass the UTF16 string right through.
      str += String.fromCharCode(codeUnit);
    }
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF16 form. The copy will require at most str.length*4+2 bytes of space in the HEAP.
// Use the function lengthBytesUTF16() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=2, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<2 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF16(str, outPtr, maxBytesToWrite) {
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 2) return 0;
  maxBytesToWrite -= 2; // Null terminator.
  var startPtr = outPtr;
  var numCharsToWrite = (maxBytesToWrite < str.length*2) ? (maxBytesToWrite / 2) : str.length;
  for (var i = 0; i < numCharsToWrite; ++i) {
    // charCodeAt returns a UTF-16 encoded code unit, so it can be directly written to the HEAP.
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    HEAP16[((outPtr)>>1)]=codeUnit;
    outPtr += 2;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP16[((outPtr)>>1)]=0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF16(str) {
  return str.length*2;
}

function UTF32ToString(ptr) {
  var i = 0;

  var str = '';
  while (1) {
    var utf32 = HEAP32[(((ptr)+(i*4))>>2)];
    if (utf32 == 0)
      return str;
    ++i;
    // Gotcha: fromCharCode constructs a character from a UTF-16 encoded code (pair), not from a Unicode code point! So encode the code point to UTF-16 for constructing.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    if (utf32 >= 0x10000) {
      var ch = utf32 - 0x10000;
      str += String.fromCharCode(0xD800 | (ch >> 10), 0xDC00 | (ch & 0x3FF));
    } else {
      str += String.fromCharCode(utf32);
    }
  }
}

// Copies the given Javascript String object 'str' to the emscripten HEAP at address 'outPtr',
// null-terminated and encoded in UTF32 form. The copy will require at most str.length*4+4 bytes of space in the HEAP.
// Use the function lengthBytesUTF32() to compute the exact number of bytes (excluding null terminator) that this function will write.
// Parameters:
//   str: the Javascript string to copy.
//   outPtr: Byte address in Emscripten HEAP where to write the string to.
//   maxBytesToWrite: The maximum number of bytes this function can write to the array. This count should include the null
//                    terminator, i.e. if maxBytesToWrite=4, only the null terminator will be written and nothing else.
//                    maxBytesToWrite<4 does not write any bytes to the output, not even the null terminator.
// Returns the number of bytes written, EXCLUDING the null terminator.

function stringToUTF32(str, outPtr, maxBytesToWrite) {
  // Backwards compatibility: if max bytes is not specified, assume unsafe unbounded write is allowed.
  if (maxBytesToWrite === undefined) {
    maxBytesToWrite = 0x7FFFFFFF;
  }
  if (maxBytesToWrite < 4) return 0;
  var startPtr = outPtr;
  var endPtr = startPtr + maxBytesToWrite - 4;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i); // possibly a lead surrogate
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) {
      var trailSurrogate = str.charCodeAt(++i);
      codeUnit = 0x10000 + ((codeUnit & 0x3FF) << 10) | (trailSurrogate & 0x3FF);
    }
    HEAP32[((outPtr)>>2)]=codeUnit;
    outPtr += 4;
    if (outPtr + 4 > endPtr) break;
  }
  // Null-terminate the pointer to the HEAP.
  HEAP32[((outPtr)>>2)]=0;
  return outPtr - startPtr;
}

// Returns the number of bytes the given Javascript string takes if encoded as a UTF16 byte array, EXCLUDING the null terminator byte.

function lengthBytesUTF32(str) {
  var len = 0;
  for (var i = 0; i < str.length; ++i) {
    // Gotcha: charCodeAt returns a 16-bit word that is a UTF-16 encoded code unit, not a Unicode code point of the character! We must decode the string to UTF-32 to the heap.
    // See http://unicode.org/faq/utf_bom.html#utf16-3
    var codeUnit = str.charCodeAt(i);
    if (codeUnit >= 0xD800 && codeUnit <= 0xDFFF) ++i; // possibly a lead surrogate, so skip over the tail surrogate.
    len += 4;
  }

  return len;
}

// Allocate heap space for a JS string, and write it there.
// It is the responsibility of the caller to free() that memory.
function allocateUTF8(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = _malloc(size);
  if (ret) stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Allocate stack space for a JS string, and write it there.
function allocateUTF8OnStack(str) {
  var size = lengthBytesUTF8(str) + 1;
  var ret = stackAlloc(size);
  stringToUTF8Array(str, HEAP8, ret, size);
  return ret;
}

// Deprecated: This function should not be called because it is unsafe and does not provide
// a maximum length limit of how many bytes it is allowed to write. Prefer calling the
// function stringToUTF8Array() instead, which takes in a maximum length that can be used
// to be secure from out of bounds writes.
/** @deprecated */
function writeStringToMemory(string, buffer, dontAddNull) {
  warnOnce('writeStringToMemory is deprecated and should not be called! Use stringToUTF8() instead!');

  var /** @type {number} */ lastChar, /** @type {number} */ end;
  if (dontAddNull) {
    // stringToUTF8Array always appends null. If we don't want to do that, remember the
    // character that existed at the location where the null will be placed, and restore
    // that after the write (below).
    end = buffer + lengthBytesUTF8(string);
    lastChar = HEAP8[end];
  }
  stringToUTF8(string, buffer, Infinity);
  if (dontAddNull) HEAP8[end] = lastChar; // Restore the value under the null character.
}

function writeArrayToMemory(array, buffer) {
  HEAP8.set(array, buffer);
}

function writeAsciiToMemory(str, buffer, dontAddNull) {
  for (var i = 0; i < str.length; ++i) {
    HEAP8[((buffer++)>>0)]=str.charCodeAt(i);
  }
  // Null-terminate the pointer to the HEAP.
  if (!dontAddNull) HEAP8[((buffer)>>0)]=0;
}




// Memory management

var PAGE_SIZE = 16384;
var WASM_PAGE_SIZE = 65536;
var ASMJS_PAGE_SIZE = 16777216;

function alignUp(x, multiple) {
  if (x % multiple > 0) {
    x += multiple - (x % multiple);
  }
  return x;
}

var HEAP,
/** @type {ArrayBuffer} */
  buffer,
/** @type {Int8Array} */
  HEAP8,
/** @type {Uint8Array} */
  HEAPU8,
/** @type {Int16Array} */
  HEAP16,
/** @type {Uint16Array} */
  HEAPU16,
/** @type {Int32Array} */
  HEAP32,
/** @type {Uint32Array} */
  HEAPU32,
/** @type {Float32Array} */
  HEAPF32,
/** @type {Float64Array} */
  HEAPF64;

function updateGlobalBufferAndViews(buf) {
  buffer = buf;
  Module['HEAP8'] = HEAP8 = new Int8Array(buf);
  Module['HEAP16'] = HEAP16 = new Int16Array(buf);
  Module['HEAP32'] = HEAP32 = new Int32Array(buf);
  Module['HEAPU8'] = HEAPU8 = new Uint8Array(buf);
  Module['HEAPU16'] = HEAPU16 = new Uint16Array(buf);
  Module['HEAPU32'] = HEAPU32 = new Uint32Array(buf);
  Module['HEAPF32'] = HEAPF32 = new Float32Array(buf);
  Module['HEAPF64'] = HEAPF64 = new Float64Array(buf);
}

var STATIC_BASE = 1024,
    STACK_BASE = 5256048,
    STACKTOP = STACK_BASE,
    STACK_MAX = 13168,
    DYNAMIC_BASE = 5256048,
    DYNAMICTOP_PTR = 13008;




var TOTAL_STACK = 5242880;

var INITIAL_TOTAL_MEMORY = Module['TOTAL_MEMORY'] || 16777216;







// In standalone mode, the wasm creates the memory, and the user can't provide it.
// In non-standalone/normal mode, we create the memory here.

// Create the main memory. (Note: this isn't used in STANDALONE_WASM mode since the wasm
// memory is created in the wasm, not in JS.)

  if (Module['wasmMemory']) {
    wasmMemory = Module['wasmMemory'];
  } else
  {
    wasmMemory = new WebAssembly.Memory({
      'initial': INITIAL_TOTAL_MEMORY / WASM_PAGE_SIZE
    });
  }


if (wasmMemory) {
  buffer = wasmMemory.buffer;
}

// If the user provides an incorrect length, just use that length instead rather than providing the user to
// specifically provide the memory length with Module['TOTAL_MEMORY'].
INITIAL_TOTAL_MEMORY = buffer.byteLength;
updateGlobalBufferAndViews(buffer);

HEAP32[DYNAMICTOP_PTR>>2] = DYNAMIC_BASE;










function callRuntimeCallbacks(callbacks) {
  while(callbacks.length > 0) {
    var callback = callbacks.shift();
    if (typeof callback == 'function') {
      callback();
      continue;
    }
    var func = callback.func;
    if (typeof func === 'number') {
      if (callback.arg === undefined) {
        Module['dynCall_v'](func);
      } else {
        Module['dynCall_vi'](func, callback.arg);
      }
    } else {
      func(callback.arg === undefined ? null : callback.arg);
    }
  }
}

var __ATPRERUN__  = []; // functions called before the runtime is initialized
var __ATINIT__    = []; // functions called during startup
var __ATMAIN__    = []; // functions called when main() is to be run
var __ATEXIT__    = []; // functions called during shutdown
var __ATPOSTRUN__ = []; // functions called after the main() is called

var runtimeInitialized = false;
var runtimeExited = false;


function preRun() {

  if (Module['preRun']) {
    if (typeof Module['preRun'] == 'function') Module['preRun'] = [Module['preRun']];
    while (Module['preRun'].length) {
      addOnPreRun(Module['preRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPRERUN__);
}

function initRuntime() {
  runtimeInitialized = true;
  
  callRuntimeCallbacks(__ATINIT__);
}

function preMain() {
  
  callRuntimeCallbacks(__ATMAIN__);
}

function exitRuntime() {
  runtimeExited = true;
}

function postRun() {

  if (Module['postRun']) {
    if (typeof Module['postRun'] == 'function') Module['postRun'] = [Module['postRun']];
    while (Module['postRun'].length) {
      addOnPostRun(Module['postRun'].shift());
    }
  }

  callRuntimeCallbacks(__ATPOSTRUN__);
}

function addOnPreRun(cb) {
  __ATPRERUN__.unshift(cb);
}

function addOnInit(cb) {
  __ATINIT__.unshift(cb);
}

function addOnPreMain(cb) {
  __ATMAIN__.unshift(cb);
}

function addOnExit(cb) {
}

function addOnPostRun(cb) {
  __ATPOSTRUN__.unshift(cb);
}

function unSign(value, bits, ignore) {
  if (value >= 0) {
    return value;
  }
  return bits <= 32 ? 2*Math.abs(1 << (bits-1)) + value // Need some trickery, since if bits == 32, we are right at the limit of the bits JS uses in bitshifts
                    : Math.pow(2, bits)         + value;
}
function reSign(value, bits, ignore) {
  if (value <= 0) {
    return value;
  }
  var half = bits <= 32 ? Math.abs(1 << (bits-1)) // abs is needed if bits == 32
                        : Math.pow(2, bits-1);
  if (value >= half && (bits <= 32 || value > half)) { // for huge values, we can hit the precision limit and always get true here. so don't do that
                                                       // but, in general there is no perfect solution here. With 64-bit ints, we get rounding and errors
                                                       // TODO: In i64 mode 1, resign the two parts separately and safely
    value = -2*half + value; // Cannot bitshift half, as it may be at the limit of the bits JS uses in bitshifts
  }
  return value;
}



var Math_abs = Math.abs;
var Math_cos = Math.cos;
var Math_sin = Math.sin;
var Math_tan = Math.tan;
var Math_acos = Math.acos;
var Math_asin = Math.asin;
var Math_atan = Math.atan;
var Math_atan2 = Math.atan2;
var Math_exp = Math.exp;
var Math_log = Math.log;
var Math_sqrt = Math.sqrt;
var Math_ceil = Math.ceil;
var Math_floor = Math.floor;
var Math_pow = Math.pow;
var Math_imul = Math.imul;
var Math_fround = Math.fround;
var Math_round = Math.round;
var Math_min = Math.min;
var Math_max = Math.max;
var Math_clz32 = Math.clz32;
var Math_trunc = Math.trunc;



// A counter of dependencies for calling run(). If we need to
// do asynchronous work before running, increment this and
// decrement it. Incrementing must happen in a place like
// Module.preRun (used by emcc to add file preloading).
// Note that you can add dependencies in preRun, even though
// it happens right before run - run will be postponed until
// the dependencies are met.
var runDependencies = 0;
var runDependencyWatcher = null;
var dependenciesFulfilled = null; // overridden to take different actions when all run dependencies are fulfilled

function getUniqueRunDependency(id) {
  return id;
}

function addRunDependency(id) {
  runDependencies++;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

}

function removeRunDependency(id) {
  runDependencies--;

  if (Module['monitorRunDependencies']) {
    Module['monitorRunDependencies'](runDependencies);
  }

  if (runDependencies == 0) {
    if (runDependencyWatcher !== null) {
      clearInterval(runDependencyWatcher);
      runDependencyWatcher = null;
    }
    if (dependenciesFulfilled) {
      var callback = dependenciesFulfilled;
      dependenciesFulfilled = null;
      callback(); // can add another dependenciesFulfilled
    }
  }
}

Module["preloadedImages"] = {}; // maps url to image data
Module["preloadedAudios"] = {}; // maps url to audio data


function abort(what) {
  if (Module['onAbort']) {
    Module['onAbort'](what);
  }

  what += '';
  out(what);
  err(what);

  ABORT = true;
  EXITSTATUS = 1;

  throw 'abort(' + what + '). Build with -s ASSERTIONS=1 for more info.';
}


var memoryInitializer = null;







// Copyright 2017 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

// Prefix of data URIs emitted by SINGLE_FILE and related options.
var dataURIPrefix = 'data:application/octet-stream;base64,';

// Indicates whether filename is a base64 data URI.
function isDataURI(filename) {
  return String.prototype.startsWith ?
      filename.startsWith(dataURIPrefix) :
      filename.indexOf(dataURIPrefix) === 0;
}




var wasmBinaryFile = 'data:application/octet-stream;base64,AGFzbQEAAAABpQIpYAABf2ABfwF/YAJ/fwF/YAJ/fQBgAn9/AGAFf39/f38AYAF/AX1gA39/fwBgA39/fQBgA39/fwF/YAd/f319fX19AGAAAGAEf39/fwBgBn9/f39/fwBgDX9/f39/f39/f39/f38AYAh/f39/f39/fwBgAX8AYAJ/fQF9YAJ9fQF9YAJ9fwF8YAF9AX1gA399fwF9YAJ/fwF8YAR/f39/AX9gBX9/f39/AX9gAn9/AX1gBH9/f30AYAh/f399fX19fQBgBH9/f30Bf2ABfAF9YAF8AXxgAn1/AX9gAnx8AXxgAn1/AX1gAnx/AXxgBn9/f39/fwF/YAN/f38BfWAFf39/f30AYAl/f39/fX19fX0AYAV/f39/fQF/YAd/f39/f39/AAKtBBQDZW52Fl9lbWJpbmRfcmVnaXN0ZXJfY2xhc3MADgNlbnYiX2VtYmluZF9yZWdpc3Rlcl9jbGFzc19jb25zdHJ1Y3RvcgANA2Vudh9fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzX2Z1bmN0aW9uAA8DZW52GF9fY3hhX2FsbG9jYXRlX2V4Y2VwdGlvbgABA2VudgtfX2N4YV90aHJvdwAHA2Vudg1fZW12YWxfaW5jcmVmABADZW52DV9lbXZhbF9kZWNyZWYAEANlbnYRX2VtdmFsX3Rha2VfdmFsdWUAAgNlbnYVX2VtYmluZF9yZWdpc3Rlcl92b2lkAAQDZW52FV9lbWJpbmRfcmVnaXN0ZXJfYm9vbAAFA2VudhtfZW1iaW5kX3JlZ2lzdGVyX3N0ZF9zdHJpbmcABANlbnYcX2VtYmluZF9yZWdpc3Rlcl9zdGRfd3N0cmluZwAHA2VudhZfZW1iaW5kX3JlZ2lzdGVyX2VtdmFsAAQDZW52GF9lbWJpbmRfcmVnaXN0ZXJfaW50ZWdlcgAFA2VudhZfZW1iaW5kX3JlZ2lzdGVyX2Zsb2F0AAcDZW52HF9lbWJpbmRfcmVnaXN0ZXJfbWVtb3J5X3ZpZXcABwNlbnYWZW1zY3JpcHRlbl9yZXNpemVfaGVhcAABA2VudhVlbXNjcmlwdGVuX21lbWNweV9iaWcACQNlbnYGbWVtb3J5AgCAAgNlbnYFdGFibGUBcABmA7kGtwYACwIEARESEwIBAgMDAwMDCwELAAAAAAABAAAQABAB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ABCCASAAEIIBIAAQgwFBA3RqIAAQggEgABAbQQN0aiAAEIIBIAAQgwFBA3RqEIQBCyIAIAAoAgAEQCAAEIUBIAAQaSAAKAIAIAAQhgEQhwELIAALCQAgACABOAIICwkAQcHhABByGguQAQEDfyMAQSBrIgEkABAkECUhAhAlIQMQcxB0EHUQJRApQRMQKyACECsgA0HwCxAsQRQQAEEVEHlBFhB7IAFBADYCHCABQRc2AhggASABKQMYNwMQQfsLIAFBEGoQfEGGDEEYEH0gAUEANgIcIAFBGTYCGCABIAEpAxg3AwhBmAwgAUEIahB+IAFBIGokACAACwUAELgBCwUAELkBCwUAELoBCwcAIAAQtgELDwAgAARAIAAQtwEQkQULCwkAQRgQkAUQWAstAQF/IwBBEGsiASQAEHMgAUEIahA6IAFBCGoQuwEQKUEaIAAQASABQRBqJAALFwBBGBCQBSAAED0oAgAgARA9KAIAEFsLLQEBfyMAQRBrIgEkABBzIAFBCGoQRSABQQhqEL0BEEdBGyAAEAEgAUEQaiQACzwBAX8jAEEQayICJAAgAiABKQIANwMIEHMgACACEMABIAIQwQEQwgFBHCACQQhqEElBABACIAJBEGokAAs/AQF/IwBBEGsiAiQAIAIgATYCDBBzIAAgAkEIahA/IAJBCGoQygEQywFBHSACQQxqEM0BQQAQAiACQRBqJAALOgEBfyMAQRBrIgIkACACIAEpAgA3AwgQcyAAIAIQRSACENABEExBHiACQQhqEElBABACIAJBEGokAAsUACAAIAEQPRCAARogABCBARogAAsQACABED0aIABBADYCACAACwkAIAAQPRogAAsJACAAKAIAED0LBwAgABCGAQsDAAELDAAgACAAKAIAEIkBCxMAIAAQiAEoAgAgACgCAGtBA3ULCwAgACABIAIQigELCQAgAEEIahBDCzABAX8gACgCBCECA0AgASACRkUEQCAAEGkgAkF4aiICED0QiwEMAQsLIAAgATYCBAsOACABIAJBA3RBBBCOAQsJACAAIAEQjAELCQAgACABEI0BCwMAAQsLACAAIAEgAhCPAQsJACAAIAEQkAELBwAgABCRAQsHACAAEJEFCw0AIAAgASACED0QlwELXQECfyMAQRBrIgIkACACIAE2AgwgABCYASIDIAFPBEAgABCDASIAIANBAXZJBEAgAiAAQQF0NgIIIAJBCGogAkEMahCZASgCACEDCyACQRBqJAAgAw8LIAAQlwUAC28BAn8jAEEQayIFJABBACEEIAVBADYCDCAAQQxqIAVBDGogAxCaARogAQRAIAAQmwEgARCcASEECyAAIAQ2AgAgACAEIAJBA3RqIgI2AgggACACNgIEIAAQnQEgBCABQQN0ajYCACAFQRBqJAAgAAtZAQJ/IAAQbiAAEGkgACgCACAAQQRqIgIoAgAgAUEEaiIDEJ4BIAAgAxCfASACIAFBCGoQnwEgABBnIAEQnQEQnwEgASABKAIENgIAIAAgABAbEKABIAAQawsjACAAEKEBIAAoAgAEQCAAEJsBIAAoAgAgABCiARCHAQsgAAsOACABIAIQPSkCADcCAAs9AQF/IwBBEGsiASQAIAEgABCjARCkATYCDCABEKUBNgIIIAFBDGogAUEIahCmASgCACEAIAFBEGokACAACwkAIAAgARCnAQsbACAAIAEQPRCAARogAEEEaiACED0QrQEaIAALCgAgAEEMahCvAQsLACAAIAFBABCuAQsJACAAQQxqEEMLKAAgAyADKAIAIAIgAWsiAmsiADYCACACQQFOBEAgACABIAIQrAYaCws7AQF/IwBBEGsiAiQAIAIgABA9KAIANgIMIAAgARA9KAIANgIAIAEgAkEMahA9KAIANgIAIAJBEGokAAszACAAIAAQggEgABCCASAAEIMBQQN0aiAAEIIBIAAQgwFBA3RqIAAQggEgAUEDdGoQhAELDAAgACAAKAIEELMBCxMAIAAQtAEoAgAgACgCAGtBA3ULCQAgAEEIahBDCwcAIAAQqQELBQAQqgELCQAgACABEKgBCykBAn8jAEEQayICJAAgAkEIaiAAIAEQqwEhAyACQRBqJAAgASAAIAMbCykBAn8jAEEQayICJAAgAkEIaiABIAAQqwEhAyACQRBqJAAgASAAIAMbCwcAIAAQrAELCABB/////wcLDQAgASgCACACKAIASQsIAEH/////AQsNACAAIAEQPTYCACAACx4AIAAQrAEgAUkEQEGhDBCwAQALIAFBA3RBBBCxAQsJACAAQQRqEBYLGgEBf0EIEAMiASAAELIBGiABQcQuQR8QBAALBwAgABCQBQsUACAAIAEQlgUaIABBpC42AgAg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EGogA0EIakEAEP8BQQBHOgAkIAEgASgCHEEBajYCHCAFEIACGiADQUBrJAALHwAgABCBAhogAQRAIAAgARCCAiAAIAEgAhCDAgsgAAtPAQF/IwBBEGsiAyQAIAAQPRogAEIANwIAIANBADYCDCAAQQhqIANBDGoQhAIaIAEEQCAAIAEQhQIgACABIAItAAAQhgILIANBEGokACAACwsAIAAgASACEIcCCzwBAX8gACgCBCECIAEEQCAAKAIAIgEgASgCACACcjYCACAADwsgACgCACIBIAEoAgAgAkF/c3E2AgAgAAsTACAAKAIEIAAoAgAoAgBxQQBHCwsAIAAgAUEAEIsCCw4AIAAgASABKAIEEIsCC00BAn8jAEEQayIDJAAgACABEIgCBEADQCADQQhqIAAQiQIgA0EIahD8ASEEIAAQigIaIAIgBGohAiAAIAEQiAINAAsLIANBEGokACACCyUAIAAoAgAEQCAAEIwCIAAoAgAgABCNAigCABCOAgsgABBrIAALNwEBfyMAQRBrIgEkACAAED0aIABCADcCACABQQA2AgwgAEEIaiABQQxqENECGiABQRBqJAAgAAtEAQF/IAAQ0gIgAUkEQCAAEJcFAAsgACAAENMCIAEQ1AIiAjYCACAAIAI2AgQgABDVAiACIAFBAnRqNgIAIABBABDWAgtYAQR/IwBBEGsiAyQAIAAQ0wIhBQNAIANBCGogAEEBEGghBiAFIABBBGoiBCgCABA9IAIQ1wIgBCAEKAIAQQRqNgIAIAYQayABQX9qIgENAAsgA0EQaiQACxQAIAAgARA9EOECGiAAEIEBGiAAC0ABAX8gABDiAiABSQRAIAAQlwUACyABEOMCIQEgABCMAiABEOQCIQIgAEEANgIEIAAgAjYCACAAEI0CIAE2AgALeQEEfyMAQRBrIgMkACAAIAAoAgQiBCABaiIFNgIEAkAgBARAIAVBf2ogBEF/anNBIEkNAQsgACgCACIGIAYgBUF/akEDdkH8////AXFqIAVBIUkbQQA2AgALIANBCGogACAEEIsCIANBCGogASACEOUCIANBEGokAAsiACAAIAEoAgAgAkEDdkH8////AXFqQQEgAkEfcXQQ7gIaCwwAIAAgARDvAkEBcwsVACAAIAEoAgBBASABKAIEdBDuAhoLNAEBfyAAKAIEIgFBH0cEQCAAIAFBAWo2AgQgAA8LIABBADYCBCAAIAAoAgBBBGo2AgAgAAsfACAAIAEoAgAgAkEDdkH8////AXFqIAJBH3EQ7gIaCwkAIABBCGoQQwsJACAAQQhqEEMLCwAgACABIAIQqAILDwAgABCQAiAAEJECGiAACzYAIAAgABCCASAAEIIBIAAQ3AJBAnRqIAAQggEgABDeAUECdGogABCCASAAENwCQQJ0ahCEAQsjACAAKAIABEAgABDYAiAAENMCIAAoAgAgABDZAhCOAgsgAAtgAQF9IABBDGogARD1ASgCACIBIAAoAhgQXSIDIAIqAgCUQwAkdEmVEB0gASADIAIqAgSUQwAkdEmVEB4gASADIAIqAgyUQwAkdEmVECAgASACKgIIEB8gASACKgIQECELCgBBwuEAEJQCGgvWAQEDfyMAQTBrIgEkABAkECUhAhAlIQMQlQIQlgIQlwIQJRApQSAQKyACECsgA0GUDhAsQSEQAEEiEJsCQSMQnQIgAUEANgIsIAFBJDYCKCABIAEpAyg3AyBBmg4gAUEgahCeAiABQQA2AiwgAUElNgIoIAEgASkDKDcDGEGlDiABQRhqEJ8CIAFBADYCLCABQSY2AiggASABKQMoNwMQQbEOIAFBEGoQoAIgAUEANgIsIAFBJzYCKCABIAEpAyg3AwhBug4gAUEIahChAiABQTBqJAAgAAsFABDyAgsFABDzAgsFABD0AgsHACAAEPACCw8AIAAEQCAAEPECEJEFCwsKAEEoEJAFEPMBCy4BAX8jAEEQayIBJAAQlQIgAUEIahA6IAFBCGoQ9QIQKUEoIAAQASABQRBqJAALGABBKBCQBSAAED0oAgAgARA9KAIAENMBCy4BAX8jAEEQayIBJAAQlQIgAUEIahBFIAFBCGoQ9wIQR0EpIAAQASABQRBqJAALOwEBfyMAQRBrIgIkACACIAEpAgA3AwgQlQIgACACEEUgAhD6AhBHQSogAkEIahBJQQAQAiACQRBqJAALPQEBfyMAQRBrIgIkACACIAEpAgA3AwgQlQIgACACEIEDIAIQggMQgwNBKyACQQhqEElBABACIAJBEGokAAs9AQF/IwBBEGsiAiQAIAIgASkCADcDCBCVAiAAIAIQgQMgAhCGAxCHA0EsIAJBCGoQSUEAEAIgAkEQaiQACzsBAX8jAEEQayICJAAgAiABKQIANwMIEJUCIAAgAhBFIAIQigMQUUEtIAJBCGoQSUEAEAIgAkEQaiQACxQAIAAgARA9EIABGiAAEIEBGiAACxQAIAAgARA9EIABGiAAEIEBGiAACwwAIAAgACgCABCnAgsTACAAEKYCKAIAIAAoAgBrQQJ1CwkAIABBCGoQQwsxAQF/IAAoAgQhAgNAIAEgAkZFBEAgABDdASACQXxqIgIQPRCpAgwBCwsgACABNgIECw4AIAEgAkECdEEEEI4BCwkAIAAgARCMAQsMACAAIAAoAgAQrQILEwAgABCsAigCACAAKAIAa0ECdQsJACAAQQhqEEMLMQEBfyAAKAIEIQIDQCABIAJGRQRAIAAQ4wEgAkF8aiICED0QrgIMAQsLIAAgATYCBAsJACAAIAEQjAELGwAgACABED0QgAEaIABBBGogAhA9EK0BGiAACwoAIABBDGoQrwELCwAgACABQQAQtgILCQAgAEEMahBDCzMAIAAgABCCASAAEIIBIAAQ3AFBAnRqIAAQggEgABDcAUECdGogABCCASABQQJ0ahCEAQsMACAAIAAoAgQQuAILEwAgABC5AigCACAAKAIAa0ECdQseACAAELcCIAFJBEBBww4QsAEACyABQQJ0QQQQsQELCABB/////wMLCQAgACABELoCCwkAIABBDGoQQws0AQJ/A0AgACgCCCABRkUEQCAAELACIQIgACAAKAIIQXxqIgM2AgggAiADED0QqQIMAQsLCxsAIAAgARA9EIABGiAAQQRqIAIQPRCtARogAAsKACAAQQxqEK8BCwsAIAAgAUEAELYCCwkAIABBDGoQQwszACAAIAAQggEgABCCASAAEOIBQQJ0aiAAEIIBIAAQ4gFBAnRqIAAQggEgAUECdGoQhAELDAAgACAAKAIEEMICCxMAIAAQwwIoAgAgACgCAGtBAnULCQAgACABEMQCCwkAIABBDGoQQws0AQJ/A0AgACgCCCABRkUEQCAAELwCIQIgACAAKAIIQXxqIgM2AgggAiADED0QrgIMAQsLCw0AIAAgASACED0QxwILXQECfyMAQRBrIgIkACACIAE2AgwgABDIAiIDIAFPBEAgABDcASIAIANBAXZJBEAgAiAAQQF0NgIIIAJBCGogAkEMahCZASgCACEDCyACQRBqJAAgAw8LIAAQlwUACw4A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AgAhAiAAEEMgATYCACACBEAgABCcBCACEKgECwsNACABKAIAIAIoAgBICx4AIAAQnQQgAUkEQEGoEhCwAQALIAFBKGxBBBCxAQsbACAAIAEQPRDhAhogAEEEaiACED0QngQaIAALFQAgACABIAIQPSADED0gBBA9EJ8ECwkAIABBBGoQPQsHAEHmzJkzCxAAIAAgARA9KQIANwIAIAALHQAgAhA9GiADED0oAgAhAyAEED0aIAEgAxCgBBoLKwEBfyMAQRBrIgIkACACIAE2AgggACACQQhqIAIQoQQhACACQRBqJAAgAAssACABEKIEED0oAgAhASAAQgA3AgQgACABNgIAIABCADcCDCAAQQA2AhQgAAsGACAAEBYLBwAgACgCCAsNACAAKAIIKAIAIABGC1gBAn8gACAAKAIEIgEoAgAiAjYCBCACBEAgAiAAEKcECyABIAAoAgg2AggCfyAAEKQEBEAgACgCCAwBCyAAEKMEQQRqCyABNgIAIAEgADYCACAAIAEQpwQLWAECfyAAIAAoAgAiASgCBCICNgIAIAIEQCACIAAQpwQLIAEgACgCCDYCCAJ/IAAQpAQEQCAAKAIIDAELIAAQowRBBGoLIAE2AgAgASAANgIEIAAgARCnBAsJACAAIAE2AggLKwAgAC0ABARAIAAoAgAgAUEQahDeAxCMAQsgAQRAIAAoAgAgAUEBEOUDCwsOACAAIAEQPRCtARogAAucAQEDfyAAENsDIQMgABCwBCEFAkAgAwRAAkADQCAAELEEIAIgA0EQaiIEEI8EBEAgAygCAEUNBCADED0hBSADKAIAIQMMAQsgABCxBCAEIAIQkARFDQEgA0EEaiEEIAMoAgQEQCAEED0hBSAEKAIAIQMMAQsLIAEgAzYCACAEDwsgASADNgIAIAUPCyAAEOoDIQMLIAEgAzYCACADC1cBAX8jAEEQayIFJAAgARDdAyIBIAAgAUEBELIEIAVBCGogAUEAEJIEELMEIgEQrARBEGoQ3gMgAhA9IAMQPSAEED0QtAQgARC1BEEBOgAEIAVBEGokAAsJACAAEEMoAgALWwAgAyABNgIIIANCADcCACACIAM2AgAgABA9KAIAKAIABEAgABA9KAIAKAIAIQMgABA9IAM2AgALIAAQ6gMoAgAgAigCABCWBCAAEI0CIgAgACgCAEEBajYC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IABEAAAAAAAAEACiIQAgAUGGaCABQYZoShtB/A9qIQELIAAgAUH/B2qtQjSGv6ILgwQBA38gAkGAwABPBEAgACABIAIQERogAA8LIAAgAmohAwJAIAAgAXNBA3FFBEACQCACQQFIBEAgACECDAELIABBA3FFBEAgACECDAELIAAhAgNAIAIgAS0AADoAACABQQFqIQEgAkEBaiICIANPDQEgAkEDcQ0ACwsCQCADQXxxIgRBwABJDQAgAiAEQUBqIgVLDQADQCACIAEoAgA2AgAgAiABKAIENgIEIAIgASgCCDYCCCACIAEoAgw2AgwgAiABKAIQNgIQIAIgASgCFDYCFCACIAEoAhg2AhggAiABKAIcNgIcIAIgASgCIDYCICACIAEoAiQ2AiQgAiABKAIoNgIoIAIgASgCLDYCLCACIAEoAjA2AjAgAiABKAI0NgI0IAIgASgCODYCOCACIAEoAjw2AjwgAUFAayEBIAJBQGsiAiAFTQ0ACwsgAiAETw0BA0AgAiABKAIANgIAIAFBBGohASACQQRqIgIgBEkNAAsMAQsgA0EESQRAIAAhAgwBCyADQXxqIgQgAEkEQCAAIQIMAQsgACECA0AgAiABLQAAOgAAIAIgAS0AAToAASACIAEtAAI6AAIgAiABLQADOgADIAFBBGohASACQQRqIgIgBE0NAAsLIAIgA0kEQANAIAIgAS0AADoAACABQQFqIQEgAkEBaiICIANHDQALCyAAC/MCAgJ/AX4CQCACRQ0AIAAgAmoiA0F/aiABOgAAIAAgAToAACACQQNJDQAgA0F+aiABOgAAIAAgAToAASADQX1qIAE6AAAgACABOgACIAJBB0kNACADQXxqIAE6AAAgACABOgADIAJBCUkNACAAQQAgAGtBA3EiBGoiAyABQf8BcUGBgoQIbCIBNgIAIAMgAiAEa0F8cSIEaiICQXxqIAE2AgAgBEEJSQ0AIAMgATYCCCADIAE2AgQgAkF4aiABNgIAIAJBdGogATYCACAEQRlJDQAgAyABNgIYIAMgATYCFCADIAE2AhAgAyABNgIMIAJBcGogATYCACACQWxqIAE2AgAgAkFoaiABNgIAIAJBZGogATYCACAEIANBBHFBGHIiBGsiAkEgSQ0AIAGtIgVCIIYgBYQhBSADIARqIQEDQCABIAU3AxggASAFNwMQIAEgBTcDCCABIAU3AwAgAUEgaiEBIAJBYGoiAkEfSw0ACwsgAAsfAEHA5QAoAgBFBEBBxOUAIAE2AgBBwOUAIAA2AgALCwgAELAGQQBKCwQAECULBAAjAAsQACMAIABrQXBxIgAkACAACwYAIAAkAAsGACAAQAALCQAgASAAEQEACwkAIAEgABEQAAsHACAAEQAACwsAIAEgAiAAEQIACwsAIAEgAiAAEQMACwsAIAEgAiAAEQQACw0AIAEgAiADIAARCQALDQAgASACIAMgABEIAAsNACABIAIgAyAAEQcACxEAIAEgAiADIAQgBSAAEQUACwkAIAEgABEGAAsRACABIAIgAyAEIAUgABEYAAsLACABIAIgABEZAAsPACABIAIgAyAEIAARDAALDwAgASACIAMgBCAAERoACxUAIAEgAiADIAQgBSAGIAcgABEKAAsPACABIAIgAyAEIAARFwALFwAgASACIAMgBCAFIAYgByAIIAARGwALDwAgASACIAMgBCAAERwACxMAIAEgAiADIAQgBSAGIAARDQALC6FZCgBBgAgL4ghBRFNSTW9kdWxhdG9yAG1vZHVsYXRlQW1wAHNldFhBAHNldFhEAHNldFlTAHNldFhSAHNldFlBAHNldFN0YWdlAGdldFN0YWdlADEzQURTUk1vZHVsYXRvcgAAAOQZAABKBAAAUDEzQURTUk1vZHVsYXRvcgAAAADEGgAAZAQAAAAAAABcBAAAUEsxM0FEU1JNb2R1bGF0b3IAAADEGgAAiAQAAAEAAABcBAAAaWkAdgB2aQB4BAAAeAQAAEwZAABpaWkABBkAAHgEAAB0BQAATlN0M19fMjZ2ZWN0b3JJNVBvaW50TlNfOWFsbG9jYXRvcklTMV9FRUVFAE5TdDNfXzIxM19fdmVjdG9yX2Jhc2VJNVBvaW50TlNfOWFsbG9jYXRvcklTMV9FRUVFAE5TdDNfXzIyMF9fdmVjdG9yX2Jhc2VfY29tbW9uSUxiMUVFRQAA5BkAAC4FAABoGgAA+wQAAAAAAAABAAAAVAUAAAAAAABoGgAA0AQAAAAAAAABAAAAXAUAAAAAAABpaWlpAAAAAOwYAAB4BAAAfBkAAHZpaWYAAAAA7BgAAHgEAADYBQAATjEzQURTUk1vZHVsYXRvcjEzRW52ZWxvcGVTdGFnZUUAAAAAmBkAALQFAAB2aWlpAAAAANgFAAB4BAAAT3NjaWxsYXRvcgBuZXh0U2FtcGxlAGZyZXF1ZW5jeUNvbnN0YW50AHNldExldmVsAGFsbG9jYXRvcjxUPjo6YWxsb2NhdGUoc2l6ZV90IG4pICduJyBleGNlZWRzIG1heGltdW0gc3VwcG9ydGVkIHNpemUAMTBPc2NpbGxhdG9yAAAA5BkAAGUGAABQMTBPc2NpbGxhdG9yAAAAxBoAAHwGAAAAAAAAdAYAAFBLMTBPc2NpbGxhdG9yAADEGgAAnAYAAAEAAAB0BgAAjAYAAIwGAADYBgAATBkAADhXYXZlRm9ybQAAAJgZAADMBgAAdAUAAIwGAABMGQAATBkAAEwZAABpaWlpaWkAAHwZAABMGQAAZmlpAOwYAACMBgAAfBkAAFZvaWNlAG5leHRTYW1wbGUAc2V0RW52ZWxvcGUAc2V0TGV2ZWwAc2V0U3RhZ2UAYWxsb2NhdG9yPFQ+OjphbGxvY2F0ZShzaXplX3QgbikgJ24nIGV4Y2VlZHMgbWF4aW11bSBzdXBwb3J0ZWQgc2l6ZQA1Vm9pY2UAAADkGQAAhwcAAFA1Vm9pY2UAxBoAAJgHAAAAAAAAkAcAAFBLNVZvaWNlAAAAAMQaAACwBwAAAQAAAJAHAACgBwAAoAcAAEwZAABMGQAAUAgAAKAHAABMGQAATlN0M19fMjZ2ZWN0b3JJZk5TXzlhbGxvY2F0b3JJZkVFRUUATlN0M19fMjEzX192ZWN0b3JfYmFzZUlmTlNfOWFsbG9jYXRvcklmRUVFRQBoGgAADAgAAAAAAAABAAAAVAUAAAAAAABoGgAA6AcAAAAAAAABAAAAOAgAQfAQCzHsGAAAoAcAAEwZAACUCAAAMTRFbnZlbG9wZVByZXNldAAAAADkGQAAgAgAAHZpaWlpAEGwEQuWAuwYAACgBwAATBkAAHwZAAB2aWlpZgAAAOwYAACgBwAA2AUAAFZvaWNlTWFuYWdlcgBvbk5vdGVPbgBvbk5vdGVPZmYAbmV4dFNhbXBsZQB1cGRhdGVMZXZlbAB1cGRhdGVFbnZlbG9wZQB2ZWN0b3I8ZmxvYXQ+AGFsbG9jYXRvcjxUPjo6YWxsb2NhdGUoc2l6ZV90IG4pICduJyBleGNlZWRzIG1heGltdW0gc3VwcG9ydGVkIHNpemUAADEy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dW5zaWduZWQgaW50AGxvbmcAdW5zaWduZWQgbG9uZwBmbG9hdABkb3VibGUAc3RkOjpzdHJpbmcAc3RkOjpiYXNpY19zdHJpbmc8dW5zaWduZWQgY2hhcj4Ac3RkOjp3c3RyaW5nAGVtc2NyaXB0ZW46OnZhbABlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxjaGFyPgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxzaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgY2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2hvcnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGludD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8bG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dW5zaWduZWQgbG9uZz4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50OF90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxpbnQxNl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MzJfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDMyX3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGZsb2F0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxkb3VibGU+AE5TdDNfXzIxMmJhc2ljX3N0cmluZ0ljTlNfMTFjaGFyX3RyYWl0c0ljRUVOU185YWxsb2NhdG9ySWNFRUVFAE5TdDNfXzIyMV9fYmFzaWNfc3RyaW5nX2NvbW1vbklMYjFFRUUAAAAA5BkAAA8eAABoGgAA0B0AAAAAAAABAAAAOB4AAAAAAABOU3QzX18yMTJiYXNpY19zdHJpbmdJaE5TXzExY2hhcl90cmFpdHNJaEVFTlNfOWFsbG9jYXRvckloRUVFRQAAaBoAAFge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';
if (!isDataURI(wasmBinaryFile)) {
  wasmBinaryFile = locateFile(wasmBinaryFile);
}

function getBinary() {
  try {
    if (wasmBinary) {
      return new Uint8Array(wasmBinary);
    }

    var binary = tryParseAsDataURI(wasmBinaryFile);
    if (binary) {
      return binary;
    }
    if (readBinary) {
      return readBinary(wasmBinaryFile);
    } else {
      throw "sync fetching of the wasm failed: you can preload it to Module['wasmBinary'] manually, or emcc.py will do that for you when generating HTML (but not JS)";
    }
  }
  catch (err) {
    abort(err);
  }
}

function getBinaryPromise() {
  // if we don't have the binary yet, and have the Fetch api, use that
  // in some environments, like Electron's render process, Fetch api may be present, but have a different context than expected, let's only use it on the Web
  if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) && typeof fetch === 'function') {
    return fetch(wasmBinaryFile, { credentials: 'same-origin' }).then(function(response) {
      if (!response['ok']) {
        throw "failed to load wasm binary file at '" + wasmBinaryFile + "'";
      }
      return response['arrayBuffer']();
    }).catch(function () {
      return getBinary();
    });
  }
  // Otherwise, getBinary should be able to get it synchronously
  return new Promise(function(resolve, reject) {
    resolve(getBinary());
  });
}



// Create the wasm instance.
// Receives the wasm imports, returns the exports.
function createWasm() {
  // prepare imports
  var info = {
    'env': asmLibraryArg,
    'wasi_unstable': asmLibraryArg
  };
  // Load the wasm module and create an instance of using native support in the JS engine.
  // handle a generated wasm instance, receiving its exports and
  // performing other necessary setup
  function receiveInstance(instance, module) {
    var exports = instance.exports;
    Module['asm'] = exports;
    removeRunDependency('wasm-instantiate');
  }
   // we can't run yet (except in a pthread, where we have a custom sync instantiator)
  addRunDependency('wasm-instantiate');


  function receiveInstantiatedSource(output) {
    // 'output' is a WebAssemblyInstantiatedSource object which has both the module and instance.
    // receiveInstance() will swap in the exports (to Module.asm) so they can be called
      // TODO: Due to Closure regression https://github.com/google/closure-compiler/issues/3193, the above line no longer optimizes out down to the following line.
      // When the regression is fixed, can restore the above USE_PTHREADS-enabled path.
    receiveInstance(output['instance']);
  }


  function instantiateArrayBuffer(receiver) {
    return getBinaryPromise().then(function(binary) {
      return WebAssembly.instantiate(binary, info);
    }).then(receiver, function(reason) {
      err('failed to asynchronously prepare wasm: ' + reason);
      abort(reason);
    });
  }

  // Prefer streaming instantiation if available.
  function instantiateSync() {
    var instance;
    var module;
    var binary;
    try {
      binary = getBinary();
      module = new WebAssembly.Module(binary);
      instance = new WebAssembly.Instance(module, info);
    } catch (e) {
      var str = e.toString();
      err('failed to compile wasm module: ' + str);
      if (str.indexOf('imported Memory') >= 0 ||
          str.indexOf('memory import') >= 0) {
        err('Memory size incompatibility issues may be due to changing TOTAL_MEMORY at runtime to something too large. Use ALLOW_MEMORY_GROWTH to allow any size memory (and also make sure not to set TOTAL_MEMORY at runtime to something smaller than it was at compile time).');
      }
      throw e;
    }
    receiveInstance(instance, module);
  }
  // User shell pages can write their own Module.instantiateWasm = function(imports, successCallback) callback
  // to manually instantiate the Wasm module themselves. This allows pages to run the instantiation parallel
  // to any other async startup actions they are performing.
  if (Module['instantiateWasm']) {
    try {
      var exports = Module['instantiateWasm'](info, receiveInstance);
      return exports;
    } catch(e) {
      err('Module.instantiateWasm callback failed with error: ' + e);
      return false;
    }
  }

  instantiateSync();
  return Module['asm']; // exports were assigned here
}


// Globals used by JS i64 conversions
var tempDouble;
var tempI64;

// === Body ===

var ASM_CONSTS = [];




// STATICTOP = STATIC_BASE + 12144;
/* global initializers */  __ATINIT__.push({ func: function() { ___wasm_call_ctors() } });



/* no memory initializer */
// {{PRE_LIBRARY}}


  function demangle(func) {
      return func;
    }

  function demangleAll(text) {
      var regex =
        /\b_Z[\w\d_]+/g;
      return text.replace(regex,
        function(x) {
          var y = demangle(x);
          return x === y ? x : (y + ' [' + x + ']');
        });
    }

  function jsStackTrace() {
      var err = new Error();
      if (!err.stack) {
        // IE10+ special cases: It does have callstack info, but it is only populated if an Error object is thrown,
        // so try that as a special-case.
        try {
          throw new Error(0);
        } catch(e) {
          err = e;
        }
        if (!err.stack) {
          return '(no stack trace available)';
        }
      }
      return err.stack.toString();
    }

  function stackTrace() {
      var js = jsStackTrace();
      if (Module['extraStackTrace']) js += '\n' + Module['extraStackTrace']();
      return demangleAll(js);
    }

  function ___cxa_allocate_exception(size) {
      return _malloc(size);
    }

  
  var ___exception_infos={};
  
  var ___exception_last=0;function ___cxa_throw(ptr, type, destructor) {
      ___exception_infos[ptr] = {
        ptr: ptr,
        adjusted: [ptr],
        type: type,
        destructor: destructor,
        refcount: 0,
        caught: false,
        rethrown: false
      };
      ___exception_last = ptr;
      if (!("uncaught_exception" in __ZSt18uncaught_exceptionv)) {
        __ZSt18uncaught_exceptionv.uncaught_exceptions = 1;
      } else {
        __ZSt18uncaught_exceptionv.uncaught_exceptions++;
      }
      throw ptr;
    }

  
  function getShiftFromSize(size) {
      switch (size) {
          case 1: return 0;
          case 2: return 1;
          case 4: return 2;
          case 8: return 3;
          default:
              throw new TypeError('Unknown type size: ' + size);
      }
    }
  
  
  
  function embind_init_charCodes() {
      var codes = new Array(256);
      for (var i = 0; i < 256; ++i) {
          codes[i] = String.fromCharCode(i);
      }
      embind_charCodes = codes;
    }var embind_charCodes=undefined;function readLatin1String(ptr) {
      var ret = "";
      var c = ptr;
      while (HEAPU8[c]) {
          ret += embind_charCodes[HEAPU8[c++]];
      }
      return ret;
    }
  
  
  var awaitingDependencies={};
  
  var registeredTypes={};
  
  var typeDependencies={};
  
  
  
  
  
  
  var char_0=48;
  
  var char_9=57;function makeLegalFunctionName(name) {
      if (undefined === name) {
          return '_unknown';
      }
      name = name.replace(/[^a-zA-Z0-9_]/g, '$');
      var f = name.charCodeAt(0);
      if (f >= char_0 && f <= char_9) {
          return '_' + name;
      } else {
          return name;
      }
    }function createNamedFunction(name, body) {
      name = makeLegalFunctionName(name);
      /*jshint evil:true*/
      return new Function(
          "body",
          "return function " + name + "() {\n" +
          "    \"use strict\";" +
          "    return body.apply(this, arguments);\n" +
          "};\n"
      )(body);
    }function extendError(baseErrorType, errorName) {
      var errorClass = createNamedFunction(errorName, function(message) {
          this.name = errorName;
          this.message = message;
  
          var stack = (new Error(message)).stack;
          if (stack !== undefined) {
              this.stack = this.toString() + '\n' +
                  stack.replace(/^Error(:[^\n]*)?\n/, '');
          }
      });
      errorClass.prototype = Object.create(baseErrorType.prototype);
      errorClass.prototype.constructor = errorClass;
      errorClass.prototype.toString = function() {
          if (this.message === undefined) {
              return this.name;
          } else {
              return this.name + ': ' + this.message;
          }
      };
  
      return errorClass;
    }var BindingError=undefined;function throwBindingError(message) {
      throw new BindingError(message);
    }
  
  
  
  var InternalError=undefined;function throwInternalError(message) {
      throw new InternalError(message);
    }function whenDependentTypesAreResolved(myTypes, dependentTypes, getTypeConverters) {
      myTypes.forEach(function(type) {
          typeDependencies[type] = dependentTypes;
      });
  
      function onComplete(typeConverters) {
          var myTypeConverters = getTypeConverters(typeConverters);
          if (myTypeConverters.length !== myTypes.length) {
              throwInternalError('Mismatched type converter count');
          }
          for (var i = 0; i < myTypes.length; ++i) {
              registerType(myTypes[i], myTypeConverters[i]);
          }
      }
  
      var typeConverters = new Array(dependentTypes.length);
      var unregisteredTypes = [];
      var registered = 0;
      dependentTypes.forEach(function(dt, i) {
          if (registeredTypes.hasOwnProperty(dt)) {
              typeConverters[i] = registeredTypes[dt];
          } else {
              unregisteredTypes.push(dt);
              if (!awaitingDependencies.hasOwnProperty(dt)) {
                  awaitingDependencies[dt] = [];
              }
              awaitingDependencies[dt].push(function() {
                  typeConverters[i] = registeredTypes[dt];
                  ++registered;
                  if (registered === unregisteredTypes.length) {
                      onComplete(typeConverters);
                  }
              });
          }
      });
      if (0 === unregisteredTypes.length) {
          onComplete(typeConverters);
      }
    }function registerType(rawType, registeredInstance, options) {
      options = options || {};
  
      if (!('argPackAdvance' in registeredInstance)) {
          throw new TypeError('registerType registeredInstance requires argPackAdvance');
      }
  
      var name = registeredInstance.name;
      if (!rawType) {
          throwBindingError('type "' + name + '" must have a positive integer typeid pointer');
      }
      if (registeredTypes.hasOwnProperty(rawType)) {
          if (options.ignoreDuplicateRegistrations) {
              return;
          } else {
              throwBindingError("Cannot register type '" + name + "' twice");
          }
      }
  
      registeredTypes[rawType] = registeredInstance;
      delete typeDependencies[rawType];
  
      if (awaitingDependencies.hasOwnProperty(rawType)) {
          var callbacks = awaitingDependencies[rawType];
          delete awaitingDependencies[rawType];
          callbacks.forEach(function(cb) {
              cb();
          });
      }
    }function __embind_register_bool(rawType, name, size, trueValue, falseValue) {
      var shift = getShiftFromSize(size);
  
      name = readLatin1String(name);
      registerType(rawType, {
          name: name,
          'fromWireType': function(wt) {
              // ambiguous emscripten ABI: sometimes return values are
              // true or false, and sometimes integers (0 or 1)
              return !!wt;
          },
          'toWireType': function(destructors, o) {
              return o ? trueValue : falseValue;
          },
          'argPackAdvance': 8,
          'readValueFromPointer': function(pointer) {
              // TODO: if heap is fixed (like in asm.js) this could be executed outside
              var heap;
              if (size === 1) {
                  heap = HEAP8;
              } else if (size === 2) {
                  heap = HEAP16;
              } else if (size === 4) {
                  heap = HEAP32;
              } else {
                  throw new TypeError("Unknown boolean type size: " + name);
              }
              return this['fromWireType'](heap[pointer >> shift]);
          },
          destructorFunction: null, // This type does not need a destructor
      });
    }

  
  
  
  function ClassHandle_isAliasOf(other) {
      if (!(this instanceof ClassHandle)) {
          return false;
      }
      if (!(other instanceof ClassHandle)) {
          return false;
      }
  
      var leftClass = this.$$.ptrType.registeredClass;
      var left = this.$$.ptr;
      var rightClass = other.$$.ptrType.registeredClass;
      var right = other.$$.ptr;
  
      while (leftClass.baseClass) {
          left = leftClass.upcast(left);
          leftClass = leftClass.baseClass;
      }
  
      while (rightClass.baseClass) {
          right = rightClass.upcast(right);
          rightClass = rightClass.baseClass;
      }
  
      return leftClass === rightClass && left === right;
    }
  
  
  function shallowCopyInternalPointer(o) {
      return {
          count: o.count,
          deleteScheduled: o.deleteScheduled,
          preservePointerOnDelete: o.preservePointerOnDelete,
          ptr: o.ptr,
          ptrType: o.ptrType,
          smartPtr: o.smartPtr,
          smartPtrType: o.smartPtrType,
      };
    }
  
  function throwInstanceAlreadyDeleted(obj) {
      function getInstanceTypeName(handle) {
        return handle.$$.ptrType.registeredClass.name;
      }
      throwBindingError(getInstanceTypeName(obj) + ' instance already deleted');
    }
  
  
  var finalizationGroup=false;
  
  function detachFinalizer(handle) {}
  
  
  function runDestructor($$) {
      if ($$.smartPtr) {
          $$.smartPtrType.rawDestructor($$.smartPtr);
      } else {
          $$.ptrType.registeredClass.rawDestructor($$.ptr);
      }
    }function releaseClassHandle($$) {
      $$.count.value -= 1;
      var toDelete = 0 === $$.count.value;
      if (toDelete) {
          runDestructor($$);
      }
    }function attachFinalizer(handle) {
      if ('undefined' === typeof FinalizationGroup) {
          attachFinalizer = function (handle) { return handle; };
          return handle;
      }
      // If the running environment has a FinalizationGroup (see
      // https://github.com/tc39/proposal-weakrefs), then attach finalizers
      // for class handles.  We check for the presence of FinalizationGroup
      // at run-time, not build-time.
      finalizationGroup = new FinalizationGroup(function (iter) {
          for (var result = iter.next(); !result.done; result = iter.next()) {
              var $$ = result.value;
              if (!$$.ptr) {
                  console.warn('object already deleted: ' + $$.ptr);
              } else {
                  releaseClassHandle($$);
              }
          }
      });
      attachFinalizer = function(handle) {
          finalizationGroup.register(handle, handle.$$, handle.$$);
          return handle;
      };
      detachFinalizer = function(handle) {
          finalizationGroup.unregister(handle.$$);
      };
      return attachFinalizer(handle);
    }function ClassHandle_clone() {
      if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
      }
  
      if (this.$$.preservePointerOnDelete) {
          this.$$.count.value += 1;
          return this;
      } else {
          var clone = attachFinalizer(Object.create(Object.getPrototypeOf(this), {
              $$: {
                  value: shallowCopyInternalPointer(this.$$),
              }
          }));
  
          clone.$$.count.value += 1;
          clone.$$.deleteScheduled = false;
          return clone;
      }
    }
  
  function ClassHandle_delete() {
      if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
      }
  
      if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
          throwBindingError('Object already scheduled for deletion');
      }
  
      detachFinalizer(this);
      releaseClassHandle(this.$$);
  
      if (!this.$$.preservePointerOnDelete) {
          this.$$.smartPtr = undefined;
          this.$$.ptr = undefined;
      }
    }
  
  function ClassHandle_isDeleted() {
      return !this.$$.ptr;
    }
  
  
  var delayFunction=undefined;
  
  var deletionQueue=[];
  
  function flushPendingDeletes() {
      while (deletionQueue.length) {
          var obj = deletionQueue.pop();
          obj.$$.deleteScheduled = false;
          obj['delete']();
      }
    }function ClassHandle_deleteLater() {
      if (!this.$$.ptr) {
          throwInstanceAlreadyDeleted(this);
      }
      if (this.$$.deleteScheduled && !this.$$.preservePointerOnDelete) {
          throwBindingError('Object already scheduled for deletion');
      }
      deletionQueue.push(this);
      if (deletionQueue.length === 1 && delayFunction) {
          delayFunction(flushPendingDeletes);
      }
      this.$$.deleteScheduled = true;
      return this;
    }function init_ClassHandle() {
      ClassHandle.prototype['isAliasOf'] = ClassHandle_isAliasOf;
      ClassHandle.prototype['clone'] = ClassHandle_clone;
      ClassHandle.prototype['delete'] = ClassHandle_delete;
      ClassHandle.prototype['isDeleted'] = ClassHandle_isDeleted;
      ClassHandle.prototype['deleteLater'] = ClassHandle_deleteLater;
    }function ClassHandle() {
    }
  
  var registeredPointers={};
  
  
  function ensureOverloadTable(proto, methodName, humanName) {
      if (undefined === proto[methodName].overloadTable) {
          var prevFunc = proto[methodName];
          // Inject an overload resolver function that routes to the appropriate overload based on the number of arguments.
          proto[methodName] = function() {
              // TODO This check can be removed in -O3 level "unsafe" optimizations.
              if (!proto[methodName].overloadTable.hasOwnProperty(arguments.length)) {
                  throwBindingError("Function '" + humanName + "' called with an invalid number of arguments (" + arguments.length + ") - expects one of (" + proto[methodName].overloadTable + ")!");
              }
              return proto[methodName].overloadTable[arguments.length].apply(this, arguments);
          };
          // Move the previous function into the overload table.
          proto[methodName].overloadTable = [];
          proto[methodName].overloadTable[prevFunc.argCount] = prevFunc;
      }
    }function exposePublicSymbol(name, value, numArguments) {
      if (Module.hasOwnProperty(name)) {
          if (undefined === numArguments || (undefined !== Module[name].overloadTable && undefined !== Module[name].overloadTable[numArguments])) {
              throwBindingError("Cannot register public name '" + name + "' twice");
          }
  
          // We are exposing a function with the same name as an existing function. Create an overload table and a function selector
          // that routes between the two.
          ensureOverloadTable(Module, name, name);
          if (Module.hasOwnProperty(numArguments)) {
              throwBindingError("Cannot register multiple overloads of a function with the same number of arguments (" + numArguments + ")!");
          }
          // Add the new function into the overload table.
          Module[name].overloadTable[numArguments] = value;
      }
      else {
          Module[name] = value;
          if (undefined !== numArguments) {
              Module[name].numArguments = numArguments;
          }
      }
    }
  
  function RegisteredClass(
      name,
      constructor,
      instancePrototype,
      rawDestructor,
      baseClass,
      getActualType,
      upcast,
      downcast
    ) {
      this.name = name;
      this.constructor = constructor;
      this.instancePrototype = instancePrototype;
      this.rawDestructor = rawDestructor;
      this.baseClass = baseClass;
      this.getActualType = getActualType;
      this.upcast = upcast;
      this.downcast = downcast;
      this.pureVirtualFunctions = [];
    }
  
  
  
  function upcastPointer(ptr, ptrClass, desiredClass) {
      while (ptrClass !== desiredClass) {
          if (!ptrClass.upcast) {
              throwBindingError("Expected null or instance of " + desiredClass.name + ", got an instance of " + ptrClass.name);
          }
          ptr = ptrClass.upcast(ptr);
          ptrClass = ptrClass.baseClass;
      }
      return ptr;
    }function constNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
          if (this.isReference) {
              throwBindingError('null is not a valid ' + this.name);
          }
          return 0;
      }
  
      if (!handle.$$) {
          throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
      }
      if (!handle.$$.ptr) {
          throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr;
    }
  
  function genericPointerToWireType(destructors, handle) {
      var ptr;
      if (handle === null) {
          if (this.isReference) {
              throwBindingError('null is not a valid ' + this.name);
          }
  
          if (this.isSmartPointer) {
              ptr = this.rawConstructor();
              if (destructors !== null) {
                  destructors.push(this.rawDestructor, ptr);
              }
              return ptr;
          } else {
              return 0;
          }
      }
  
      if (!handle.$$) {
          throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
      }
      if (!handle.$$.ptr) {
          throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
      }
      if (!this.isConst && handle.$$.ptrType.isConst) {
          throwBindingError('Cannot convert argument of type ' + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + ' to parameter type ' + this.name);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
  
      if (this.isSmartPointer) {
          // TODO: this is not strictly true
          // We could support BY_EMVAL conversions from raw pointers to smart pointers
          // because the smart pointer can hold a reference to the handle
          if (undefined === handle.$$.smartPtr) {
              throwBindingError('Passing raw pointer to smart pointer is illegal');
          }
  
          switch (this.sharingPolicy) {
              case 0: // NONE
                  // no upcasting
                  if (handle.$$.smartPtrType === this) {
                      ptr = handle.$$.smartPtr;
                  } else {
                      throwBindingError('Cannot convert argument of type ' + (handle.$$.smartPtrType ? handle.$$.smartPtrType.name : handle.$$.ptrType.name) + ' to parameter type ' + this.name);
                  }
                  break;
  
              case 1: // INTRUSIVE
                  ptr = handle.$$.smartPtr;
                  break;
  
              case 2: // BY_EMVAL
                  if (handle.$$.smartPtrType === this) {
                      ptr = handle.$$.smartPtr;
                  } else {
                      var clonedHandle = handle['clone']();
                      ptr = this.rawShare(
                          ptr,
                          __emval_register(function() {
                              clonedHandle['delete']();
                          })
                      );
                      if (destructors !== null) {
                          destructors.push(this.rawDestructor, ptr);
                      }
                  }
                  break;
  
              default:
                  throwBindingError('Unsupporting sharing policy');
          }
      }
      return ptr;
    }
  
  function nonConstNoSmartPtrRawPointerToWireType(destructors, handle) {
      if (handle === null) {
          if (this.isReference) {
              throwBindingError('null is not a valid ' + this.name);
          }
          return 0;
      }
  
      if (!handle.$$) {
          throwBindingError('Cannot pass "' + _embind_repr(handle) + '" as a ' + this.name);
      }
      if (!handle.$$.ptr) {
          throwBindingError('Cannot pass deleted object as a pointer of type ' + this.name);
      }
      if (handle.$$.ptrType.isConst) {
          throwBindingError('Cannot convert argument of type ' + handle.$$.ptrType.name + ' to parameter type ' + this.name);
      }
      var handleClass = handle.$$.ptrType.registeredClass;
      var ptr = upcastPointer(handle.$$.ptr, handleClass, this.registeredClass);
      return ptr;
    }
  
  
  function simpleReadValueFromPointer(pointer) {
      return this['fromWireType'](HEAPU32[pointer >> 2]);
    }
  
  function RegisteredPointer_getPointee(ptr) {
      if (this.rawGetPointee) {
          ptr = this.rawGetPointee(ptr);
      }
      return ptr;
    }
  
  function RegisteredPointer_destructor(ptr) {
      if (this.rawDestructor) {
          this.rawDestructor(ptr);
      }
    }
  
  function RegisteredPointer_deleteObject(handle) {
      if (handle !== null) {
          handle['delete']();
      }
    }
  
  
  function downcastPointer(ptr, ptrClass, desiredClass) {
      if (ptrClass === desiredClass) {
          return ptr;
      }
      if (undefined === desiredClass.baseClass) {
          return null; // no conversion
      }
  
      var rv = downcastPointer(ptr, ptrClass, desiredClass.baseClass);
      if (rv === null) {
          return null;
      }
      return desiredClass.downcast(rv);
    }
  
  
  
  
  function getInheritedInstanceCount() {
      return Object.keys(registeredInstances).length;
    }
  
  function getLiveInheritedInstances() {
      var rv = [];
      for (var k in registeredInstances) {
          if (registeredInstances.hasOwnProperty(k)) {
              rv.push(registeredInstances[k]);
          }
      }
      return rv;
    }
  
  function setDelayFunction(fn) {
      delayFunction = fn;
      if (deletionQueue.length && delayFunction) {
          delayFunction(flushPendingDeletes);
      }
    }function init_embind() {
      Module['getInheritedInstanceCount'] = getInheritedInstanceCount;
      Module['getLiveInheritedInstances'] = getLiveInheritedInstances;
      Module['flushPendingDeletes'] = flushPendingDeletes;
      Module['setDelayFunction'] = setDelayFunction;
    }var registeredInstances={};
  
  function getBasestPointer(class_, ptr) {
      if (ptr === undefined) {
          throwBindingError('ptr should not be undefined');
      }
      while (class_.baseClass) {
          ptr = class_.upcast(ptr);
          class_ = class_.baseClass;
      }
      return ptr;
    }function getInheritedInstance(class_, ptr) {
      ptr = getBasestPointer(class_, ptr);
      return registeredInstances[ptr];
    }
  
  function makeClassHandle(prototype, record) {
      if (!record.ptrType || !record.ptr) {
          throwInternalError('makeClassHandle requires ptr and ptrType');
      }
      var hasSmartPtrType = !!record.smartPtrType;
      var hasSmartPtr = !!record.smartPtr;
      if (hasSmartPtrType !== hasSmartPtr) {
          throwInternalError('Both smartPtrType and smartPtr must be specified');
      }
      record.count = { value: 1 };
      return attachFinalizer(Object.create(prototype, {
          $$: {
              value: record,
          },
      }));
    }function RegisteredPointer_fromWireType(ptr) {
      // ptr is a raw pointer (or a raw smartpointer)
  
      // rawPointer is a maybe-null raw pointer
      var rawPointer = this.getPointee(ptr);
      if (!rawPointer) {
          this.destructor(ptr);
          return null;
      }
  
      var registeredInstance = getInheritedInstance(this.registeredClass, rawPointer);
      if (undefined !== registeredInstance) {
          // JS object has been neutered, time to repopulate it
          if (0 === registeredInstance.$$.count.value) {
              registeredInstance.$$.ptr = rawPointer;
              registeredInstance.$$.smartPtr = ptr;
              return registeredInstance['clone']();
          } else {
              // else, just increment reference count on existing object
              // it already has a reference to the smart pointer
              var rv = registeredInstance['clone']();
              this.destructor(ptr);
              return rv;
          }
      }
  
      function makeDefaultHandle() {
          if (this.isSmartPointer) {
              return makeClassHandle(this.registeredClass.instancePrototype, {
                  ptrType: this.pointeeType,
                  ptr: rawPointer,
                  smartPtrType: this,
                  smartPtr: ptr,
              });
          } else {
              return makeClassHandle(this.registeredClass.instancePrototype, {
                  ptrType: this,
                  ptr: ptr,
              });
          }
      }
  
      var actualType = this.registeredClass.getActualType(rawPointer);
      var registeredPointerRecord = registeredPointers[actualType];
      if (!registeredPointerRecord) {
          return makeDefaultHandle.call(this);
      }
  
      var toType;
      if (this.isConst) {
          toType = registeredPointerRecord.constPointerType;
      } else {
          toType = registeredPointerRecord.pointerType;
      }
      var dp = downcastPointer(
          rawPointer,
          this.registeredClass,
          toType.registeredClass);
      if (dp === null) {
          return makeDefaultHandle.call(this);
      }
      if (this.isSmartPointer) {
          return makeClassHandle(toType.registeredClass.instancePrototype, {
              ptrType: toType,
              ptr: dp,
              smartPtrType: this,
              smartPtr: ptr,
          });
      } else {
          return makeClassHandle(toType.registeredClass.instancePrototype, {
              ptrType: toType,
              ptr: dp,
          });
      }
    }function init_RegisteredPointer() {
      RegisteredPointer.prototype.getPointee = RegisteredPointer_getPointee;
      RegisteredPointer.prototype.destructor = RegisteredPointer_destructor;
      RegisteredPointer.prototype['argPackAdvance'] = 8;
      RegisteredPointer.prototype['readValueFromPointer'] = simpleReadValueFromPointer;
      RegisteredPointer.prototype['deleteObject'] = RegisteredPointer_deleteObject;
      RegisteredPointer.prototype['fromWireType'] = RegisteredPointer_fromWireType;
    }function RegisteredPointer(
      name,
      registeredClass,
      isReference,
      isConst,
  
      // smart pointer properties
      isSmartPointer,
      pointeeType,
      sharingPolicy,
      rawGetPointee,
      rawConstructor,
      rawShare,
      rawDestructor
    ) {
      this.name = name;
      this.registeredClass = registeredClass;
      this.isReference = isReference;
      this.isConst = isConst;
  
      // smart pointer properties
      this.isSmartPointer = isSmartPointer;
      this.pointeeType = pointeeType;
      this.sharingPolicy = sharingPolicy;
      this.rawGetPointee = rawGetPointee;
      this.rawConstructor = rawConstructor;
      this.rawShare = rawShare;
      this.rawDestructor = rawDestructor;
  
      if (!isSmartPointer && registeredClass.baseClass === undefined) {
          if (isConst) {
              this['toWireType'] = constNoSmartPtrRawPointerToWireType;
              this.destructorFunction = null;
          } else {
              this['toWireType'] = nonConstNoSmartPtrRawPointerToWireType;
              this.destructorFunction = null;
          }
      } else {
          this['toWireType'] = genericPointerToWireType;
          // Here we must leave this.destructorFunction undefined, since whether genericPointerToWireType returns
          // a pointer that needs to be freed up is runtime-dependent, and cannot be evaluated at registration time.
          // TODO: Create an alternative mechanism that allows removing the use of var destructors = []; array in
          //       craftInvokerFunction altogether.
      }
    }
  
  function replacePublicSymbol(name, value, numArguments) {
      if (!Module.hasOwnProperty(name)) {
          throwInternalError('Replacing nonexistant public symbol');
      }
      // If there's an overload table for this symbol, replace the symbol in the overload table instead.
      if (undefined !== Module[name].overloadTable && undefined !== numArguments) {
          Module[name].overloadTable[numArguments] = value;
      }
      else {
          Module[name] = value;
          Module[name].argCount = numArguments;
      }
    }
  
  function embind__requireFunction(signature, rawFunction) {
      signature = readLatin1String(signature);
  
      function makeDynCaller(dynCall) {
          var args = [];
          for (var i = 1; i < signature.length; ++i) {
              args.push('a' + i);
          }
  
          var name = 'dynCall_' + signature + '_' + rawFunction;
          var body = 'return function ' + name + '(' + args.join(', ') + ') {\n';
          body    += '    return dynCall(rawFunction' + (args.length ? ', ' : '') + args.join(', ') + ');\n';
          body    += '};\n';
  
          return (new Function('dynCall', 'rawFunction', body))(dynCall, rawFunction);
      }
  
      var fp;
      if (Module['FUNCTION_TABLE_' + signature] !== undefined) {
          fp = Module['FUNCTION_TABLE_' + signature][rawFunction];
      } else if (typeof FUNCTION_TABLE !== "undefined") {
          fp = FUNCTION_TABLE[rawFunction];
      } else {
          // asm.js does not give direct access to the function tables,
          // and thus we must go through the dynCall interface which allows
          // calling into a signature's function table by pointer value.
          //
          // https://github.com/dherman/asm.js/issues/83
          //
          // This has three main penalties:
          // - dynCall is another function call in the path from JavaScript to C++.
          // - JITs may not predict through the function table indirection at runtime.
          var dc = Module['dynCall_' + signature];
          if (dc === undefined) {
              // We will always enter this branch if the signature
              // contains 'f' and PRECISE_F32 is not enabled.
              //
              // Try again, replacing 'f' with 'd'.
              dc = Module['dynCall_' + signature.replace(/f/g, 'd')];
              if (dc === undefined) {
                  throwBindingError("No dynCall invoker for signature: " + signature);
              }
          }
          fp = makeDynCaller(dc);
      }
  
      if (typeof fp !== "function") {
          throwBindingError("unknown function pointer with signature " + signature + ": " + rawFunction);
      }
      return fp;
    }
  
  
  var UnboundTypeError=undefined;
  
  function getTypeName(type) {
      var ptr = ___getTypeName(type);
      var rv = readLatin1String(ptr);
      _free(ptr);
      return rv;
    }function throwUnboundTypeError(message, types) {
      var unboundTypes = [];
      var seen = {};
      function visit(type) {
          if (seen[type]) {
              return;
          }
          if (registeredTypes[type]) {
              return;
          }
          if (typeDependencies[type]) {
              typeDependencies[type].forEach(visit);
              return;
          }
          unboundTypes.push(type);
          seen[type] = true;
      }
      types.forEach(visit);
  
      throw new UnboundTypeError(message + ': ' + unboundTypes.map(getTypeName).join([', ']));
    }function __embind_register_class(
      rawType,
      rawPointerType,
      rawConstPointerType,
      baseClassRawType,
      getActualTypeSignature,
      getActualType,
      upcastSignature,
      upcast,
      downcastSignature,
      downcast,
      name,
      destructorSignature,
      rawDestructor
    ) {
      name = readLatin1String(name);
      getActualType = embind__requireFunction(getActualTypeSignature, getActualType);
      if (upcast) {
          upcast = embind__requireFunction(upcastSignature, upcast);
      }
      if (downcast) {
          downcast = embind__requireFunction(downcastSignature, downcast);
      }
      rawDestructor = embind__requireFunction(destructorSignature, rawDestructor);
      var legalFunctionName = makeLegalFunctionName(name);
  
      exposePublicSymbol(legalFunctionName, function() {
          // this code cannot run if baseClassRawType is zero
          throwUnboundTypeError('Cannot construct ' + name + ' due to unbound types', [baseClassRawType]);
      });
  
      whenDependentTypesAreResolved(
          [rawType, rawPointerType, rawConstPointerType],
          baseClassRawType ? [baseClassRawType] : [],
          function(base) {
              base = base[0];
  
              var baseClass;
              var basePrototype;
              if (baseClassRawType) {
                  baseClass = base.registeredClass;
                  basePrototype = baseClass.instancePrototype;
              } else {
                  basePrototype = ClassHandle.prototype;
              }
  
              var constructor = createNamedFunction(legalFunctionName, function() {
                  if (Object.getPrototypeOf(this) !== instancePrototype) {
                      throw new BindingError("Use 'new' to construct " + name);
                  }
                  if (undefined === registeredClass.constructor_body) {
                      throw new BindingError(name + " has no accessible constructor");
                  }
                  var body = registeredClass.constructor_body[arguments.length];
                  if (undefined === body) {
                      throw new BindingError("Tried to invoke ctor of " + name + " with invalid number of parameters (" + arguments.length + ") - expected (" + Object.keys(registeredClass.constructor_body).toString() + ") parameters instead!");
                  }
                  return body.apply(this, arguments);
              });
  
              var instancePrototype = Object.create(basePrototype, {
                  constructor: { value: constructor },
              });
  
              constructor.prototype = instancePrototype;
  
              var registeredClass = new RegisteredClass(
                  name,
                  constructor,
                  instancePrototype,
                  rawDestructor,
                  baseClass,
                  getActualType,
                  upcast,
                  downcast);
  
              var referenceConverter = new RegisteredPointer(
                  name,
                  registeredClass,
                  true,
                  false,
                  false);
  
              var pointerConverter = new RegisteredPointer(
                  name + '*',
                  registeredClass,
                  false,
                  false,
                  false);
  
              var constPointerConverter = new RegisteredPointer(
                  name + ' const*',
                  registeredClass,
                  false,
                  true,
                  false);
  
              registeredPointers[rawType] = {
                  pointerType: pointerConverter,
                  constPointerType: constPointerConverter
              };
  
              replacePublicSymbol(legalFunctionName, constructor);
  
              return [referenceConverter, pointerConverter, constPointerConverter];
          }
      );
    }

  
  function heap32VectorToArray(count, firstElement) {
      var array = [];
      for (var i = 0; i < count; i++) {
          array.push(HEAP32[(firstElement >> 2) + i]);
      }
      return array;
    }
  
  function runDestructors(destructors) {
      while (destructors.length) {
          var ptr = destructors.pop();
          var del = destructors.pop();
          del(ptr);
      }
    }function __embind_register_class_constructor(
      rawClassType,
      argCount,
      rawArgTypesAddr,
      invokerSignature,
      invoker,
      rawConstructor
    ) {
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      invoker = embind__requireFunction(invokerSignature, invoker);
  
      whenDependentTypesAreResolved([], [rawClassType], function(classType) {
          classType = classType[0];
          var humanName = 'constructor ' + classType.name;
  
          if (undefined === classType.registeredClass.constructor_body) {
              classType.registeredClass.constructor_body = [];
          }
          if (undefined !== classType.registeredClass.constructor_body[argCount - 1]) {
              throw new BindingError("Cannot register multiple constructors with identical number of parameters (" + (argCount-1) + ") for class '" + classType.name + "'! Overload resolution is currently only performed using the parameter count, not actual type info!");
          }
          classType.registeredClass.constructor_body[argCount - 1] = function unboundTypeHandler() {
              throwUnboundTypeError('Cannot construct ' + classType.name + ' due to unbound types', rawArgTypes);
          };
  
          whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
              classType.registeredClass.constructor_body[argCount - 1] = function constructor_body() {
                  if (arguments.length !== argCount - 1) {
                      throwBindingError(humanName + ' called with ' + arguments.length + ' arguments, expected ' + (argCount-1));
                  }
                  var destructors = [];
                  var args = new Array(argCount);
                  args[0] = rawConstructor;
                  for (var i = 1; i < argCount; ++i) {
                      args[i] = argTypes[i]['toWireType'](destructors, arguments[i - 1]);
                  }
  
                  var ptr = invoker.apply(null, args);
                  runDestructors(destructors);
  
                  return argTypes[0]['fromWireType'](ptr);
              };
              return [];
          });
          return [];
      });
    }

  
  
  function new_(constructor, argumentList) {
      if (!(constructor instanceof Function)) {
          throw new TypeError('new_ called with constructor type ' + typeof(constructor) + " which is not a function");
      }
  
      /*
       * Previously, the following line was just:
  
       function dummy() {};
  
       * Unfortunately, Chrome was preserving 'dummy' as the object's name, even though at creation, the 'dummy' has the
       * correct constructor name.  Thus, objects created with IMVU.new would show up in the debugger as 'dummy', which
       * isn't very helpful.  Using IMVU.createNamedFunction addresses the issue.  Doublely-unfortunately, there's no way
       * to write a test for this behavior.  -NRD 2013.02.22
       */
      var dummy = createNamedFunction(constructor.name || 'unknownFunctionName', function(){});
      dummy.prototype = constructor.prototype;
      var obj = new dummy;
  
      var r = constructor.apply(obj, argumentList);
      return (r instanceof Object) ? r : obj;
    }function craftInvokerFunction(humanName, argTypes, classType, cppInvokerFunc, cppTargetFunc) {
      // humanName: a human-readable string name for the function to be generated.
      // argTypes: An array that contains the embind type objects for all types in the function signature.
      //    argTypes[0] is the type object for the function return value.
      //    argTypes[1] is the type object for function this object/class type, or null if not crafting an invoker for a class method.
      //    argTypes[2...] are the actual function parameters.
      // classType: The embind type object for the class to be bound, or null if this is not a method of a class.
      // cppInvokerFunc: JS Function object to the C++-side function that interops into C++ code.
      // cppTargetFunc: Function pointer (an integer to FUNCTION_TABLE) to the target C++ function the cppInvokerFunc will end up calling.
      var argCount = argTypes.length;
  
      if (argCount < 2) {
          throwBindingError("argTypes array size mismatch! Must at least get return value and 'this' types!");
      }
  
      var isClassMethodFunc = (argTypes[1] !== null && classType !== null);
  
      // Free functions with signature "void function()" do not need an invoker that marshalls between wire types.
  // TODO: This omits argument count check - enable only at -O3 or similar.
  //    if (ENABLE_UNSAFE_OPTS && argCount == 2 && argTypes[0].name == "void" && !isClassMethodFunc) {
  //       return FUNCTION_TABLE[fn];
  //    }
  
  
      // Determine if we need to use a dynamic stack to store the destructors for the function parameters.
      // TODO: Remove this completely once all function invokers are being dynamically generated.
      var needsDestructorStack = false;
  
      for(var i = 1; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here.
          if (argTypes[i] !== null && argTypes[i].destructorFunction === undefined) { // The type does not define a destructor function - must use dynamic stack
              needsDestructorStack = true;
              break;
          }
      }
  
      var returns = (argTypes[0].name !== "void");
  
      var argsList = "";
      var argsListWired = "";
      for(var i = 0; i < argCount - 2; ++i) {
          argsList += (i!==0?", ":"")+"arg"+i;
          argsListWired += (i!==0?", ":"")+"arg"+i+"Wired";
      }
  
      var invokerFnBody =
          "return function "+makeLegalFunctionName(humanName)+"("+argsList+") {\n" +
          "if (arguments.length !== "+(argCount - 2)+") {\n" +
              "throwBindingError('function "+humanName+" called with ' + arguments.length + ' arguments, expected "+(argCount - 2)+" args!');\n" +
          "}\n";
  
  
      if (needsDestructorStack) {
          invokerFnBody +=
              "var destructors = [];\n";
      }
  
      var dtorStack = needsDestructorStack ? "destructors" : "null";
      var args1 = ["throwBindingError", "invoker", "fn", "runDestructors", "retType", "classParam"];
      var args2 = [throwBindingError, cppInvokerFunc, cppTargetFunc, runDestructors, argTypes[0], argTypes[1]];
  
  
      if (isClassMethodFunc) {
          invokerFnBody += "var thisWired = classParam.toWireType("+dtorStack+", this);\n";
      }
  
      for(var i = 0; i < argCount - 2; ++i) {
          invokerFnBody += "var arg"+i+"Wired = argType"+i+".toWireType("+dtorStack+", arg"+i+"); // "+argTypes[i+2].name+"\n";
          args1.push("argType"+i);
          args2.push(argTypes[i+2]);
      }
  
      if (isClassMethodFunc) {
          argsListWired = "thisWired" + (argsListWired.length > 0 ? ", " : "") + argsListWired;
      }
  
      invokerFnBody +=
          (returns?"var rv = ":"") + "invoker(fn"+(argsListWired.length>0?", ":"")+argsListWired+");\n";
  
      if (needsDestructorStack) {
          invokerFnBody += "runDestructors(destructors);\n";
      } else {
          for(var i = isClassMethodFunc?1:2; i < argTypes.length; ++i) { // Skip return value at index 0 - it's not deleted here. Also skip class type if not a method.
              var paramName = (i === 1 ? "thisWired" : ("arg"+(i - 2)+"Wired"));
              if (argTypes[i].destructorFunction !== null) {
                  invokerFnBody += paramName+"_dtor("+paramName+"); // "+argTypes[i].name+"\n";
                  args1.push(paramName+"_dtor");
                  args2.push(argTypes[i].destructorFunction);
              }
          }
      }
  
      if (returns) {
          invokerFnBody += "var ret = retType.fromWireType(rv);\n" +
                           "return ret;\n";
      } else {
      }
      invokerFnBody += "}\n";
  
      args1.push(invokerFnBody);
  
      var invokerFunction = new_(Function, args1).apply(null, args2);
      return invokerFunction;
    }function __embind_register_class_function(
      rawClassType,
      methodName,
      argCount,
      rawArgTypesAddr, // [ReturnType, ThisType, Args...]
      invokerSignature,
      rawInvoker,
      context,
      isPureVirtual
    ) {
      var rawArgTypes = heap32VectorToArray(argCount, rawArgTypesAddr);
      methodName = readLatin1String(methodName);
      rawInvoker = embind__requireFunction(invokerSignature, rawInvoker);
  
      whenDependentTypesAreResolved([], [rawClassType], function(classType) {
          classType = classType[0];
          var humanName = classType.name + '.' + methodName;
  
          if (isPureVirtual) {
              classType.registeredClass.pureVirtualFunctions.push(methodName);
          }
  
          function unboundTypesHandler() {
              throwUnboundTypeError('Cannot call ' + humanName + ' due to unbound types', rawArgTypes);
          }
  
          var proto = classType.registeredClass.instancePrototype;
          var method = proto[methodName];
          if (undefined === method || (undefined === method.overloadTable && method.className !== classType.name && method.argCount === argCount - 2)) {
              // This is the first overload to be registered, OR we are replacing a function in the base class with a function in the derived class.
              unboundTypesHandler.argCount = argCount - 2;
              unboundTypesHandler.className = classType.name;
              proto[methodName] = unboundTypesHandler;
          } else {
              // There was an existing function with the same name registered. Set up a function overload routing table.
              ensureOverloadTable(proto, methodName, humanName);
              proto[methodName].overloadTable[argCount - 2] = unboundTypesHandler;
          }
  
          whenDependentTypesAreResolved([], rawArgTypes, function(argTypes) {
  
              var memberFunction = craftInvokerFunction(humanName, argTypes, classType, rawInvoker, context);
  
              // Replace the initial unbound-handler-stub function with the appropriate member function, now that all types
              // are resolved. If multiple overloads are registered for this function, the function goes into an overload table.
              if (undefined === proto[methodName].overloadTable) {
                  // Set argCount in case an overload is registered later
                  memberFunction.argCount = argCount - 2;
                  proto[methodName] = memberFunction;
              } else {
                  proto[methodName].overloadTable[argCount - 2] = memberFunction;
              }
  
              return [];
          });
          return [];
      });
    }

  
  
  var emval_free_list=[];
  
  var emval_handle_array=[{},{value:undefined},{value:null},{value:true},{value:false}];function __emval_decref(handle) {
      if (handle > 4 && 0 === --emval_handle_array[handle].refcount) {
          emval_handle_array[handle] = undefined;
          emval_free_list.push(handle);
      }
    }
  
  
  
  function count_emval_handles() {
      var count = 0;
      for (var i = 5; i < emval_handle_array.length; ++i) {
          if (emval_handle_array[i] !== undefined) {
              ++count;
          }
      }
      return count;
    }
  
  function get_first_emval() {
      for (var i = 5; i < emval_handle_array.length; ++i) {
          if (emval_handle_array[i] !== undefined) {
              return emval_handle_array[i];
          }
      }
      return null;
    }function init_emval() {
      Module['count_emval_handles'] = count_emval_handles;
      Module['get_first_emval'] = get_first_emval;
    }function __emval_register(value) {
  
      switch(value){
        case undefined :{ return 1; }
        case null :{ return 2; }
        case true :{ return 3; }
        case false :{ return 4; }
        default:{
          var handle = emval_free_list.length ?
              emval_free_list.pop() :
              emval_handle_array.length;
  
          emval_handle_array[handle] = {refcount: 1, value: value};
          return handle;
          }
        }
    }function __embind_register_emval(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {
          name: name,
          'fromWireType': function(handle) {
              var rv = emval_handle_array[handle].value;
              __emval_decref(handle);
              return rv;
          },
          'toWireType': function(destructors, value) {
              return __emval_register(value);
          },
          'argPackAdvance': 8,
          'readValueFromPointer': simpleReadValueFromPointer,
          destructorFunction: null, // This type does not need a destructor
  
          // TODO: do we need a deleteObject here?  write a test where
          // emval is passed into JS via an interface
      });
    }

  
  function _embind_repr(v) {
      if (v === null) {
          return 'null';
      }
      var t = typeof v;
      if (t === 'object' || t === 'array' || t === 'function') {
          return v.toString();
      } else {
          return '' + v;
      }
    }
  
  function floatReadValueFromPointer(name, shift) {
      switch (shift) {
          case 2: return function(pointer) {
              return this['fromWireType'](HEAPF32[pointer >> 2]);
          };
          case 3: return function(pointer) {
              return this['fromWireType'](HEAPF64[pointer >> 3]);
          };
          default:
              throw new TypeError("Unknown float type: " + name);
      }
    }function __embind_register_float(rawType, name, size) {
      var shift = getShiftFromSize(size);
      name = readLatin1String(name);
      registerType(rawType, {
          name: name,
          'fromWireType': function(value) {
              return value;
          },
          'toWireType': function(destructors, value) {
              // todo: Here we have an opportunity for -O3 level "unsafe" optimizations: we could
              // avoid the following if() and assume value is of proper type.
              if (typeof value !== "number" && typeof value !== "boolean") {
                  throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
              }
              return value;
          },
          'argPackAdvance': 8,
          'readValueFromPointer': floatReadValueFromPointer(name, shift),
          destructorFunction: null, // This type does not need a destructor
      });
    }

  
  function integerReadValueFromPointer(name, shift, signed) {
      // integers are quite common, so generate very specialized functions
      switch (shift) {
          case 0: return signed ?
              function readS8FromPointer(pointer) { return HEAP8[pointer]; } :
              function readU8FromPointer(pointer) { return HEAPU8[pointer]; };
          case 1: return signed ?
              function readS16FromPointer(pointer) { return HEAP16[pointer >> 1]; } :
              function readU16FromPointer(pointer) { return HEAPU16[pointer >> 1]; };
          case 2: return signed ?
              function readS32FromPointer(pointer) { return HEAP32[pointer >> 2]; } :
              function readU32FromPointer(pointer) { return HEAPU32[pointer >> 2]; };
          default:
              throw new TypeError("Unknown integer type: " + name);
      }
    }function __embind_register_integer(primitiveType, name, size, minRange, maxRange) {
      name = readLatin1String(name);
      if (maxRange === -1) { // LLVM doesn't have signed and unsigned 32-bit types, so u32 literals come out as 'i32 -1'. Always treat those as max u32.
          maxRange = 4294967295;
      }
  
      var shift = getShiftFromSize(size);
  
      var fromWireType = function(value) {
          return value;
      };
  
      if (minRange === 0) {
          var bitshift = 32 - 8*size;
          fromWireType = function(value) {
              return (value << bitshift) >>> bitshift;
          };
      }
  
      var isUnsignedType = (name.indexOf('unsigned') != -1);
  
      registerType(primitiveType, {
          name: name,
          'fromWireType': fromWireType,
          'toWireType': function(destructors, value) {
              // todo: Here we have an opportunity for -O3 level "unsafe" optimizations: we could
              // avoid the following two if()s and assume value is of proper type.
              if (typeof value !== "number" && typeof value !== "boolean") {
                  throw new TypeError('Cannot convert "' + _embind_repr(value) + '" to ' + this.name);
              }
              if (value < minRange || value > maxRange) {
                  throw new TypeError('Passing a number "' + _embind_repr(value) + '" from JS side to C/C++ side to an argument of type "' + name + '", which is outside the valid range [' + minRange + ', ' + maxRange + ']!');
              }
              return isUnsignedType ? (value >>> 0) : (value | 0);
          },
          'argPackAdvance': 8,
          'readValueFromPointer': integerReadValueFromPointer(name, shift, minRange !== 0),
          destructorFunction: null, // This type does not need a destructor
      });
    }

  function __embind_register_memory_view(rawType, dataTypeIndex, name) {
      var typeMapping = [
          Int8Array,
          Uint8Array,
          Int16Array,
          Uint16Array,
          Int32Array,
          Uint32Array,
          Float32Array,
          Float64Array,
      ];
  
      var TA = typeMapping[dataTypeIndex];
  
      function decodeMemoryView(handle) {
          handle = handle >> 2;
          var heap = HEAPU32;
          var size = heap[handle]; // in elements
          var data = heap[handle + 1]; // byte offset into emscripten heap
          return new TA(heap['buffer'], data, size);
      }
  
      name = readLatin1String(name);
      registerType(rawType, {
          name: name,
          'fromWireType': decodeMemoryView,
          'argPackAdvance': 8,
          'readValueFromPointer': decodeMemoryView,
      }, {
          ignoreDuplicateRegistrations: true,
      });
    }

  function __embind_register_std_string(rawType, name) {
      name = readLatin1String(name);
      var stdStringIsUTF8
      //process only std::string bindings with UTF8 support, in contrast to e.g. std::basic_string<unsigned char>
      = (name === "std::string");
  
      registerType(rawType, {
          name: name,
          'fromWireType': function(value) {
              var length = HEAPU32[value >> 2];
  
              var str;
              if(stdStringIsUTF8) {
                  //ensure null termination at one-past-end byte if not present yet
                  var endChar = HEAPU8[value + 4 + length];
                  var endCharSwap = 0;
                  if(endChar != 0)
                  {
                    endCharSwap = endChar;
                    HEAPU8[value + 4 + length] = 0;
                  }
  
                  var decodeStartPtr = value + 4;
                  //looping here to support possible embedded '0' bytes
                  for (var i = 0; i <= length; ++i) {
                    var currentBytePtr = value + 4 + i;
                    if(HEAPU8[currentBytePtr] == 0)
                    {
                      var stringSegment = UTF8ToString(decodeStartPtr);
                      if(str === undefined)
                        str = stringSegment;
                      else
                      {
                        str += String.fromCharCode(0);
                        str += stringSegment;
                      }
                      decodeStartPtr = currentBytePtr + 1;
                    }
                  }
  
                  if(endCharSwap != 0)
                    HEAPU8[value + 4 + length] = endCharSwap;
              } else {
                  var a = new Array(length);
                  for (var i = 0; i < length; ++i) {
                      a[i] = String.fromCharCode(HEAPU8[value + 4 + i]);
                  }
                  str = a.join('');
              }
  
              _free(value);
              
              return str;
          },
          'toWireType': function(destructors, value) {
              if (value instanceof ArrayBuffer) {
                  value = new Uint8Array(value);
              }
              
              var getLength;
              var valueIsOfTypeString = (typeof value === 'string');
  
              if (!(valueIsOfTypeString || value instanceof Uint8Array || value instanceof Uint8ClampedArray || value instanceof Int8Array)) {
                  throwBindingError('Cannot pass non-string to std::string');
              }
              if (stdStringIsUTF8 && valueIsOfTypeString) {
                  getLength = function() {return lengthBytesUTF8(value);};
              } else {
                  getLength = function() {return value.length;};
              }
              
              // assumes 4-byte alignment
              var length = getLength();
              var ptr = _malloc(4 + length + 1);
              HEAPU32[ptr >> 2] = length;
  
              if (stdStringIsUTF8 && valueIsOfTypeString) {
                  stringToUTF8(value, ptr + 4, length + 1);
              } else {
                  if(valueIsOfTypeString) {
                      for (var i = 0; i < length; ++i) {
                          var charCode = value.charCodeAt(i);
                          if (charCode > 255) {
                              _free(ptr);
                              throwBindingError('String has UTF-16 code units that do not fit in 8 bits');
                          }
                          HEAPU8[ptr + 4 + i] = charCode;
                      }
                  } else {
                      for (var i = 0; i < length; ++i) {
                          HEAPU8[ptr + 4 + i] = value[i];
                      }
                  }
              }
  
              if (destructors !== null) {
                  destructors.push(_free, ptr);
              }
              return ptr;
          },
          'argPackAdvance': 8,
          'readValueFromPointer': simpleReadValueFromPointer,
          destructorFunction: function(ptr) { _free(ptr); },
      });
    }

  function __embind_register_std_wstring(rawType, charSize, name) {
      // nb. do not cache HEAPU16 and HEAPU32, they may be destroyed by emscripten_resize_heap().
      name = readLatin1String(name);
      var getHeap, shift;
      if (charSize === 2) {
          getHeap = function() { return HEAPU16; };
          shift = 1;
      } else if (charSize === 4) {
          getHeap = function() { return HEAPU32; };
          shift = 2;
      }
      registerType(rawType, {
          name: name,
          'fromWireType': function(value) {
              var HEAP = getHeap();
              var length = HEAPU32[value >> 2];
              var a = new Array(length);
              var start = (value + 4) >> shift;
              for (var i = 0; i < length; ++i) {
                  a[i] = String.fromCharCode(HEAP[start + i]);
              }
              _free(value);
              return a.join('');
          },
          'toWireType': function(destructors, value) {
              // assumes 4-byte alignment
              var length = value.length;
              var ptr = _malloc(4 + length * charSize);
              var HEAP = getHeap();
              HEAPU32[ptr >> 2] = length;
              var start = (ptr + 4) >> shift;
              for (var i = 0; i < length; ++i) {
                  HEAP[start + i] = value.charCodeAt(i);
              }
              if (destructors !== null) {
                  destructors.push(_free, ptr);
              }
              return ptr;
          },
          'argPackAdvance': 8,
          'readValueFromPointer': simpleReadValueFromPointer,
          destructorFunction: function(ptr) { _free(ptr); },
      });
    }

  function __embind_register_void(rawType, name) {
      name = readLatin1String(name);
      registerType(rawType, {
          isVoid: true, // void return values can be optimized out sometimes
          name: name,
          'argPackAdvance': 0,
          'fromWireType': function() {
              return undefined;
          },
          'toWireType': function(destructors, o) {
              // TODO: assert if anything else is given?
              return undefined;
          },
      });
    }


  function __emval_incref(handle) {
      if (handle > 4) {
          emval_handle_array[handle].refcount += 1;
      }
    }

  
  function requireRegisteredType(rawType, humanName) {
      var impl = registeredTypes[rawType];
      if (undefined === impl) {
          throwBindingError(humanName + " has unknown type " + getTypeName(rawType));
      }
      return impl;
    }function __emval_take_value(type, argv) {
      type = requireRegisteredType(type, '_emval_take_value');
      var v = type['readValueFromPointer'](argv);
      return __emval_register(v);
    }

  function _emscripten_get_heap_size() {
      return HEAP8.length;
    }

  function _emscripten_get_sbrk_ptr() {
      return 13008;
    }

  function _emscripten_memcpy_big(dest, src, num) {
      HEAPU8.set(HEAPU8.subarray(src, src+num), dest);
    }

  
  function abortOnCannotGrowMemory(requestedSize) {
      abort('OOM');
    }
  
  function emscripten_realloc_buffer(size) {
      try {
        // round size grow request up to wasm page size (fixed 64KB per spec)
        wasmMemory.grow((size - buffer.byteLength + 65535) >> 16); // .grow() takes a delta compared to the previous size
        updateGlobalBufferAndViews(wasmMemory.buffer);
        return 1 /*success*/;
      } catch(e) {
      }
    }function _emscripten_resize_heap(requestedSize) {
      var oldSize = _emscripten_get_heap_size();
      // With pthreads, races can happen (another thread might increase the size in between), so return a failure, and let the caller retry.
  
  
      var PAGE_MULTIPLE = 65536;
      var LIMIT = 2147483648 - PAGE_MULTIPLE; // We can do one page short of 2GB as theoretical maximum.
  
      if (requestedSize > LIMIT) {
        return false;
      }
  
      var MIN_TOTAL_MEMORY = 16777216;
      var newSize = Math.max(oldSize, MIN_TOTAL_MEMORY); // So the loop below will not be infinite, and minimum asm.js memory size is 16MB.
  
      // TODO: see realloc_buffer - for PTHREADS we may want to decrease these jumps
      while (newSize < requestedSize) { // Keep incrementing the heap size as long as it's less than what is requested.
        if (newSize <= 536870912) {
          newSize = alignUp(2 * newSize, PAGE_MULTIPLE); // Simple heuristic: double until 1GB...
        } else {
          // ..., but after that, add smaller increments towards 2GB, which we cannot reach
          newSize = Math.min(alignUp((3 * newSize + 2147483648) / 4, PAGE_MULTIPLE), LIMIT);
        }
  
      }
  
  
  
      var replacement = emscripten_realloc_buffer(newSize);
      if (!replacement) {
        return false;
      }
  
  
  
      return true;
    }

  
  function _memcpy(dest, src, num) {
      dest = dest|0; src = src|0; num = num|0;
      var ret = 0;
      var aligned_dest_end = 0;
      var block_aligned_dest_end = 0;
      var dest_end = 0;
      // Test against a benchmarked cutoff limit for when HEAPU8.set() becomes faster to use.
      if ((num|0) >= 8192) {
        _emscripten_memcpy_big(dest|0, src|0, num|0)|0;
        return dest|0;
      }
  
      ret = dest|0;
      dest_end = (dest + num)|0;
      if ((dest&3) == (src&3)) {
        // The initial unaligned < 4-byte front.
        while (dest & 3) {
          if ((num|0) == 0) return ret|0;
          HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
          dest = (dest+1)|0;
          src = (src+1)|0;
          num = (num-1)|0;
        }
        aligned_dest_end = (dest_end & -4)|0;
        block_aligned_dest_end = (aligned_dest_end - 64)|0;
        while ((dest|0) <= (block_aligned_dest_end|0) ) {
          HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
          HEAP32[(((dest)+(4))>>2)]=((HEAP32[(((src)+(4))>>2)])|0);
          HEAP32[(((dest)+(8))>>2)]=((HEAP32[(((src)+(8))>>2)])|0);
          HEAP32[(((dest)+(12))>>2)]=((HEAP32[(((src)+(12))>>2)])|0);
          HEAP32[(((dest)+(16))>>2)]=((HEAP32[(((src)+(16))>>2)])|0);
          HEAP32[(((dest)+(20))>>2)]=((HEAP32[(((src)+(20))>>2)])|0);
          HEAP32[(((dest)+(24))>>2)]=((HEAP32[(((src)+(24))>>2)])|0);
          HEAP32[(((dest)+(28))>>2)]=((HEAP32[(((src)+(28))>>2)])|0);
          HEAP32[(((dest)+(32))>>2)]=((HEAP32[(((src)+(32))>>2)])|0);
          HEAP32[(((dest)+(36))>>2)]=((HEAP32[(((src)+(36))>>2)])|0);
          HEAP32[(((dest)+(40))>>2)]=((HEAP32[(((src)+(40))>>2)])|0);
          HEAP32[(((dest)+(44))>>2)]=((HEAP32[(((src)+(44))>>2)])|0);
          HEAP32[(((dest)+(48))>>2)]=((HEAP32[(((src)+(48))>>2)])|0);
          HEAP32[(((dest)+(52))>>2)]=((HEAP32[(((src)+(52))>>2)])|0);
          HEAP32[(((dest)+(56))>>2)]=((HEAP32[(((src)+(56))>>2)])|0);
          HEAP32[(((dest)+(60))>>2)]=((HEAP32[(((src)+(60))>>2)])|0);
          dest = (dest+64)|0;
          src = (src+64)|0;
        }
        while ((dest|0) < (aligned_dest_end|0) ) {
          HEAP32[((dest)>>2)]=((HEAP32[((src)>>2)])|0);
          dest = (dest+4)|0;
          src = (src+4)|0;
        }
      } else {
        // In the unaligned copy case, unroll a bit as well.
        aligned_dest_end = (dest_end - 4)|0;
        while ((dest|0) < (aligned_dest_end|0) ) {
          HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
          HEAP8[(((dest)+(1))>>0)]=((HEAP8[(((src)+(1))>>0)])|0);
          HEAP8[(((dest)+(2))>>0)]=((HEAP8[(((src)+(2))>>0)])|0);
          HEAP8[(((dest)+(3))>>0)]=((HEAP8[(((src)+(3))>>0)])|0);
          dest = (dest+4)|0;
          src = (src+4)|0;
        }
      }
      // The remaining unaligned < 4 byte tail.
      while ((dest|0) < (dest_end|0)) {
        HEAP8[((dest)>>0)]=((HEAP8[((src)>>0)])|0);
        dest = (dest+1)|0;
        src = (src+1)|0;
      }
      return ret|0;
    }

  function _memset(ptr, value, num) {
      ptr = ptr|0; value = value|0; num = num|0;
      var end = 0, aligned_end = 0, block_aligned_end = 0, value4 = 0;
      end = (ptr + num)|0;
  
      value = value & 0xff;
      if ((num|0) >= 67 /* 64 bytes for an unrolled loop + 3 bytes for unaligned head*/) {
        while ((ptr&3) != 0) {
          HEAP8[((ptr)>>0)]=value;
          ptr = (ptr+1)|0;
        }
  
        aligned_end = (end & -4)|0;
        value4 = value | (value << 8) | (value << 16) | (value << 24);
  
        block_aligned_end = (aligned_end - 64)|0;
  
        while((ptr|0) <= (block_aligned_end|0)) {
          HEAP32[((ptr)>>2)]=value4;
          HEAP32[(((ptr)+(4))>>2)]=value4;
          HEAP32[(((ptr)+(8))>>2)]=value4;
          HEAP32[(((ptr)+(12))>>2)]=value4;
          HEAP32[(((ptr)+(16))>>2)]=value4;
          HEAP32[(((ptr)+(20))>>2)]=value4;
          HEAP32[(((ptr)+(24))>>2)]=value4;
          HEAP32[(((ptr)+(28))>>2)]=value4;
          HEAP32[(((ptr)+(32))>>2)]=value4;
          HEAP32[(((ptr)+(36))>>2)]=value4;
          HEAP32[(((ptr)+(40))>>2)]=value4;
          HEAP32[(((ptr)+(44))>>2)]=value4;
          HEAP32[(((ptr)+(48))>>2)]=value4;
          HEAP32[(((ptr)+(52))>>2)]=value4;
          HEAP32[(((ptr)+(56))>>2)]=value4;
          HEAP32[(((ptr)+(60))>>2)]=value4;
          ptr = (ptr + 64)|0;
        }
  
        while ((ptr|0) < (aligned_end|0) ) {
          HEAP32[((ptr)>>2)]=value4;
          ptr = (ptr+4)|0;
        }
      }
      // The remaining bytes.
      while ((ptr|0) < (end|0)) {
        HEAP8[((ptr)>>0)]=value;
        ptr = (ptr+1)|0;
      }
      return (end-num)|0;
    }
embind_init_charCodes();
BindingError = Module['BindingError'] = extendError(Error, 'BindingError');;
InternalError = Module['InternalError'] = extendError(Error, 'InternalError');;
init_ClassHandle();
init_RegisteredPointer();
init_embind();;
UnboundTypeError = Module['UnboundTypeError'] = extendError(Error, 'UnboundTypeError');;
init_emval();;
var ASSERTIONS = false;

// Copyright 2017 The Emscripten Authors.  All rights reserved.
// Emscripten is available under two separate licenses, the MIT license and the
// University of Illinois/NCSA Open Source License.  Both these licenses can be
// found in the LICENSE file.

/** @type {function(string, boolean=, number=)} */
function intArrayFromString(stringy, dontAddNull, length) {
  var len = length > 0 ? length : lengthBytesUTF8(stringy)+1;
  var u8array = new Array(len);
  var numBytesWritten = stringToUTF8Array(stringy, u8array, 0, u8array.length);
  if (dontAddNull) u8array.length = numBytesWritten;
  return u8array;
}

function intArrayToString(array) {
  var ret = [];
  for (var i = 0; i < array.length; i++) {
    var chr = array[i];
    if (chr > 0xFF) {
      if (ASSERTIONS) {
        assert(false, 'Character code ' + chr + ' (' + String.fromCharCode(chr) + ')  at offset ' + i + ' not in 0x00-0xFF.');
      }
      chr &= 0xFF;
    }
    ret.push(String.fromCharCode(chr));
  }
  return ret.join('');
}


// Copied from https://github.com/strophe/strophejs/blob/e06d027/src/polyfills.js#L149

// This code was written by Tyler Akins and has been placed in the
// public domain.  It would be nice if you left this header intact.
// Base64 code from Tyler Akins -- http://rumkin.com

/**
 * Decodes a base64 string.
 * @param {String} input The string to decode.
 */
var decodeBase64 = typeof atob === 'function' ? atob : function (input) {
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  var output = '';
  var chr1, chr2, chr3;
  var enc1, enc2, enc3, enc4;
  var i = 0;
  // remove all characters that are not A-Z, a-z, 0-9, +, /, or =
  input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');
  do {
    enc1 = keyStr.indexOf(input.charAt(i++));
    enc2 = keyStr.indexOf(input.charAt(i++));
    enc3 = keyStr.indexOf(input.charAt(i++));
    enc4 = keyStr.indexOf(input.charAt(i++));

    chr1 = (enc1 << 2) | (enc2 >> 4);
    chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
    chr3 = ((enc3 & 3) << 6) | enc4;

    output = output + String.fromCharCode(chr1);

    if (enc3 !== 64) {
      output = output + String.fromCharCode(chr2);
    }
    if (enc4 !== 64) {
      output = output + String.fromCharCode(chr3);
    }
  } while (i < input.length);
  return output;
};

// Converts a string of base64 into a byte array.
// Throws error on invalid input.
function intArrayFromBase64(s) {
  if (typeof ENVIRONMENT_IS_NODE === 'boolean' && ENVIRONMENT_IS_NODE) {
    var buf;
    try {
      buf = Buffer.from(s, 'base64');
    } catch (_) {
      buf = new Buffer(s, 'base64');
    }
    return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
  }

  try {
    var decoded = decodeBase64(s);
    var bytes = new Uint8Array(decoded.length);
    for (var i = 0 ; i < decoded.length ; ++i) {
      bytes[i] = decoded.charCodeAt(i);
    }
    return bytes;
  } catch (_) {
    throw new Error('Converting base64 string to bytes failed.');
  }
}

// If filename is a base64 data URI, parses and returns data (Buffer on node,
// Uint8Array otherwise). If filename is not a base64 data URI, returns undefined.
function tryParseAsDataURI(filename) {
  if (!isDataURI(filename)) {
    return;
  }

  return intArrayFromBase64(filename.slice(dataURIPrefix.length));
}


// ASM_LIBRARY EXTERN PRIMITIVES: Int8Array,Int32Array

var asmGlobalArg = {};
var asmLibraryArg = { "__cxa_allocate_exception": ___cxa_allocate_exception, "__cxa_throw": ___cxa_throw, "_embind_register_bool": __embind_register_bool, "_embind_register_class": __embind_register_class, "_embind_register_class_constructor": __embind_register_class_constructor, "_embind_register_class_function": __embind_register_class_function, "_embind_register_emval": __embind_register_emval, "_embind_register_float": __embind_register_float, "_embind_register_integer": __embind_register_integer, "_embind_register_memory_view": __embind_register_memory_view, "_embind_register_std_string": __embind_register_std_string, "_embind_register_std_wstring": __embind_register_std_wstring, "_embind_register_void": __embind_register_void, "_emval_decref": __emval_decref, "_emval_incref": __emval_incref, "_emval_take_value": __emval_take_value, "emscripten_get_sbrk_ptr": _emscripten_get_sbrk_ptr, "emscripten_memcpy_big": _emscripten_memcpy_big, "emscripten_resize_heap": _emscripten_resize_heap, "memory": wasmMemory, "table": wasmTable };
var asm = createWasm();
var ___wasm_call_ctors = Module["___wasm_call_ctors"] = asm["__wasm_call_ctors"];
var ___errno_location = Module["___errno_location"] = asm["__errno_location"];
var _setThrew = Module["_setThrew"] = asm["setThrew"];
var __ZSt18uncaught_exceptionv = Module["__ZSt18uncaught_exceptionv"] = asm["_ZSt18uncaught_exceptionv"];
var _malloc = Module["_malloc"] = asm["malloc"];
var _free = Module["_free"] = asm["free"];
var ___getTypeName = Module["___getTypeName"] = asm["__getTypeName"];
var ___embind_register_native_and_builtin_types = Module["___embind_register_native_and_builtin_types"] = asm["__embind_register_native_and_builtin_types"];
var stackSave = Module["stackSave"] = asm["stackSave"];
var stackAlloc = Module["stackAlloc"] = asm["stackAlloc"];
var stackRestore = Module["stackRestore"] = asm["stackRestore"];
var __growWasmMemory = Module["__growWasmMemory"] = asm["__growWasmMemory"];
var dynCall_ii = Module["dynCall_ii"] = asm["dynCall_ii"];
var dynCall_vi = Module["dynCall_vi"] = asm["dynCall_vi"];
var dynCall_i = Module["dynCall_i"] = asm["dynCall_i"];
var dynCall_iii = Module["dynCall_iii"] = asm["dynCall_iii"];
var dynCall_vif = Module["dynCall_vif"] = asm["dynCall_vif"];
var dynCall_vii = Module["dynCall_vii"] = asm["dynCall_vii"];
var dynCall_iiii = Module["dynCall_iiii"] = asm["dynCall_iiii"];
var dynCall_viif = Module["dynCall_viif"] = asm["dynCall_viif"];
var dynCall_viii = Module["dynCall_viii"] = asm["dynCall_viii"];
var dynCall_viiiii = Module["dynCall_viiiii"] = asm["dynCall_viiiii"];
var dynCall_fi = Module["dynCall_fi"] = asm["dynCall_fi"];
var dynCall_iiiiii = Module["dynCall_iiiiii"] = asm["dynCall_iiiiii"];
var dynCall_fii = Module["dynCall_fii"] = asm["dynCall_fii"];
var dynCall_viiii = Module["dynCall_viiii"] = asm["dynCall_viiii"];
var dynCall_viiif = Module["dynCall_viiif"] = asm["dynCall_viiif"];
var dynCall_viifffff = Module["dynCall_viifffff"] = asm["dynCall_viifffff"];
var dynCall_iiiii = Module["dynCall_iiiii"] = asm["dynCall_iiiii"];
var dynCall_viiifffff = Module["dynCall_viiifffff"] = asm["dynCall_viiifffff"];
var dynCall_iiiif = Module["dynCall_iiiif"] = asm["dynCall_iiiif"];
var dynCall_viiiiii = Module["dynCall_viiiiii"] = asm["dynCall_viiiiii"];



// === Auto-generated postamble setup entry stuff ===

Module['asm'] = asm;
















































































var calledRun;

// Modularize mode returns a function, which can be called to
// create instances. The instances provide a then() method,
// must like a Promise, that receives a callback. The callback
// is called when the module is ready to run, with the module
// as a parameter. (Like a Promise, it also returns the module
// so you can use the output of .then(..)).
Module['then'] = function(func) {
  // We may already be ready to run code at this time. if
  // so, just queue a call to the callback.
  if (calledRun) {
    func(Module);
  } else {
    // we are not ready to call then() yet. we must call it
    // at the same time we would call onRuntimeInitialized.
    var old = Module['onRuntimeInitialized'];
    Module['onRuntimeInitialized'] = function() {
      if (old) old();
      func(Module);
    };
  }
  return Module;
};

/**
 * @constructor
 * @this {ExitStatus}
 */
function ExitStatus(status) {
  this.name = "ExitStatus";
  this.message = "Program terminated with exit(" + status + ")";
  this.status = status;
}

var calledMain = false;


dependenciesFulfilled = function runCaller() {
  // If run has never been called, and we should call run (INVOKE_RUN is true, and Module.noInitialRun is not false)
  if (!calledRun) run();
  if (!calledRun) dependenciesFulfilled = runCaller; // try this again later, after new deps are fulfilled
};





/** @type {function(Array=)} */
function run(args) {
  args = args || arguments_;

  if (runDependencies > 0) {
    return;
  }


  preRun();

  if (runDependencies > 0) return; // a preRun added a dependency, run will be called later

  function doRun() {
    // run may have just been called through dependencies being fulfilled just in this very frame,
    // or while the async setStatus time below was happening
    if (calledRun) return;
    calledRun = true;

    if (ABORT) return;

    initRuntime();

    preMain();

    if (Module['onRuntimeInitialized']) Module['onRuntimeInitialized']();


    postRun();
  }

  if (Module['setStatus']) {
    Module['setStatus']('Running...');
    setTimeout(function() {
      setTimeout(function() {
        Module['setStatus']('');
      }, 1);
      doRun();
    }, 1);
  } else
  {
    doRun();
  }
}
Module['run'] = run;


function exit(status, implicit) {

  // if this is just main exit-ing implicitly, and the status is 0, then we
  // don't need to do anything here and can just leave. if the status is
  // non-zero, though, then we need to report it.
  // (we may have warned about this earlier, if a situation justifies doing so)
  if (implicit && noExitRuntime && status === 0) {
    return;
  }

  if (noExitRuntime) {
  } else {

    ABORT = true;
    EXITSTATUS = status;

    exitRuntime();

    if (Module['onExit']) Module['onExit'](status);
  }

  quit_(status, new ExitStatus(status));
}

if (Module['preInit']) {
  if (typeof Module['preInit'] == 'function') Module['preInit'] = [Module['preInit']];
  while (Module['preInit'].length > 0) {
    Module['preInit'].pop()();
  }
}


  noExitRuntime = true;

run();





// {{MODULE_ADDITIONS}}





  return Module
}
);
})();
export default Module;