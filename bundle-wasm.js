
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
    STACK_BASE = 5256016,
    STACKTOP = STACK_BASE,
    STACK_MAX = 13136,
    DYNAMIC_BASE = 5256016,
    DYNAMICTOP_PTR = 12976;




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




var wasmBinaryFile = 'data:application/octet-stream;base64,AGFzbQEAAAABmAInYAABf2ABfwF/YAJ/fwF/YAJ/fQBgAn9/AGAFf39/f38AYAF/AX1gA39/fwBgA39/fQBgB39/fX19fX0AYAN/f38Bf2AAAGAEf39/fwBgBn9/f39/fwBgDX9/f39/f39/f39/f38AYAh/f39/f39/fwBgAX8AYAJ/fQF9YAJ9fQF9YAJ9fwF8YAF9AX1gBH9/f38Bf2AFf39/f38Bf2ACf38BfWAEf39/fQBgCH9/f319fX19AGAEf39/fQF/YAF8AX1gAXwBfGACfX8Bf2ACfHwBfGACfX8BfWACfH8BfGAGf39/f39/AX9gA39/fwF9YAV/f39/fQBgCX9/f399fX19fQBgBX9/f399AX9gB39/f39/f38AAq0EFANlbnYWX2VtYmluZF9yZWdpc3Rlcl9jbGFzcwAOA2VudiJfZW1iaW5kX3JlZ2lzdGVyX2NsYXNzX2NvbnN0cnVjdG9yAA0DZW52H19lbWJpbmRfcmVnaXN0ZXJfY2xhc3NfZnVuY3Rpb24ADwNlbnYYX19jeGFfYWxsb2NhdGVfZXhjZXB0aW9uAAEDZW52C19fY3hhX3Rocm93AAcDZW52DV9lbXZhbF9pbmNyZWYAEANlbnYNX2VtdmFsX2RlY3JlZgAQA2VudhFfZW12YWxfdGFrZV92YWx1ZQACA2VudhVfZW1iaW5kX3JlZ2lzdGVyX3ZvaWQABANlbnYVX2VtYmluZF9yZWdpc3Rlcl9ib29sAAUDZW52G19lbWJpbmRfcmVnaXN0ZXJfc3RkX3N0cmluZwAEA2VudhxfZW1iaW5kX3JlZ2lzdGVyX3N0ZF93c3RyaW5nAAcDZW52Fl9lbWJpbmRfcmVnaXN0ZXJfZW12YWwABANlbnYYX2VtYmluZF9yZWdpc3Rlcl9pbnRlZ2VyAAUDZW52Fl9lbWJpbmRfcmVnaXN0ZXJfZmxvYXQABwNlbnYcX2VtYmluZF9yZWdpc3Rlcl9tZW1vcnlfdmlldwAHA2VudhZlbXNjcmlwdGVuX3Jlc2l6ZV9oZWFwAAEDZW52FWVtc2NyaXB0ZW5fbWVtY3B5X2JpZwAKA2VudgZtZW1vcnkCAIACA2VudgV0YWJsZQFwAGYD7gXsBQALAgQBERITAgECAwMDAwMLAQsAAAAAAAEAABAAEAEQBAQEBAEAAAABAQEB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AUMAAAAAXg0BIABCADcCICAAQQA6AAggAEEAEBULQwAAAAAhAQsgAQ8LIAAgATgCJCADCwkAIAAgARDCBAsLACAAuyABtxC+BAtUAgF/An0gARAbBEBBACECA0AgASACEBwqAgAhAyABIAIQHCoCBCEEIAAgAxAXIQMgASACEBwgBCADlDgCBCACQQFqIgIgARAbSQ0ACwsgACgCAEULEAAgACgCBCAAKAIAa0EDdQsNACAAKAIAIAFBA3RqCwkAIAAgATgCDAsJACAAIAE4AhQLCQAgACABOAIYCwkAIAAgATgCHAsJACAAIAE4AhALCQBBoOEAECMaC9cCAQN/IwBB0ABrIgEkABAkECUhAhAlIQMQJhAnECgQJRApQQEQKyACECsgA0GACBAsQQIQAEEDEC9BBBAxIAFBADYCTCABQQU2AkggASABKQNINwNAQY4IIAFBQGsQMiABQQA2AkwgAUEGNgJIIAEgASkDSDcDOEGaCCABQThqEDMgAUEANgJMIAFBBzYCSCABIAEpA0g3AzBBoAggAUEwahAzIAFBADYCTCABQQg2AkggASABKQNINwMoQaYIIAFBKGoQMyABQQA2AkwgAUEJNgJIIAEgASkDSDcDIEGsCCABQSBqEDMgAUEANgJMIAFBCjYCSCABIAEpA0g3AxhBsgggAUEYahAzIAFBADYCTCABQQs2AkggASABKQNINwMQQbgIIAFBEGoQNCABQQA2AkwgAUEMNgJIIAEgASkDSDcDCEHBCCABQQhqEDUgAUHQAGokACAACwMAAQsEAEEACwQAEDcLBAAQOAsEABA5CwUAQawJCwYAIAAQNgsFAEGvCQsFAEGxCQsMACAABEAgABDEBAsLBwBBKBDDBAssAQF/IwBBEGsiASQAECYgAUEIahA6IAFBCGoQOxApQQ0gABABIAFBEGokAAsQAEEoEMMEIAAQPSgCABAUCywBAX8jAEEQayIBJAAQJiABQQhqED8gAUEIahBAEEFBDiAAEAEgAUEQaiQACzkBAX8jAEEQayICJAAgAiABKQIANwMIECYgACACEEUgAhBGEEdBDyACQQhqEElBABACIAJBEGokAAs5AQF/IwBBEGsiAiQAIAIgASkCADcDCBAmIAAgAhBFIAIQSxBMQRAgAkEIahBJQQAQAiACQRBqJAALOQEBfyMAQRBrIgIkACACIAEpAgA3AwgQJiAAIAIQRSACEFAQUUERIAJBCGoQSUEAEAIgAkEQaiQACzkBAX8jAEEQayICJAAgAiABKQIANwMIECYgACACED8gAhBUEEFBEiACQQhqEElBABACIAJBEGokAAsFAEHcCAsFAEHcCAsFAEH4CAsFAEGcCQsEAEEBCwQAED4LCQAgABEAABA9CwQAIAALBQBBtAkLBABBAgsEABBECwUAQcAJCy0BAX8jAEEQayICJAAgAiABEEM2AgwgAkEMaiAAEQEAED0hACACQRBqJAAgAAsGACAAED0LBQBBuAkLBABBAwsEABBKCwUAQYwLCz4BAX8gARA9IAAoAgQiA0EBdWohASAAKAIAIQAgA0EBcQRAIAEoAgAgAGooAgAhAAsgASACED0gABECABA9CxUBAX9BCBDDBCIBIAApAgA3AwAgAQsFAEHECQsEABBPCwUAQaALCzwBAX8gARA9IAAoAgQiA0EBdWohASAAKAIAIQAgA0EBcQRAIAEoAgAgAGooAgAhAAsgASACEE4gABEDAAsEACAACwUAQZQLCwQAEFMLBQBB4AsLPAEBfyABED0gACgCBCIDQQF1aiEBIAAoAgAhACADQQFxBEAgASgCACAAaigCACEACyABIAIQPSAAEQQACwUAQagLCwQAEFYLOQEBfyABED0gACgCBCICQQF1aiEBIAAoAgAhACABIAJBAXEEfyABKAIAIABqKAIABSAACxEBABA9CwUAQegLCwQAECILDAAgAEEMahBZGiAACwkAIAAQWhogAAs2AQF/IwBBEGsiASQAIAAQPRogAEIANwIAIAFBADYCDCAAQQhqIAFBDGoQeBogAUEQaiQAIAALJQAgAEEMahBZGiAAQYCAgPQDNgIIIAAgAjYCBCAAIAE2AgAgAAtzAgJ/An0jAEEQayIFJAAgABBZIQYgBEEBTgRAIAMgBGwhAyACEF0hB0EAIQADQCAFIAcgACADarKUIAEoAgSylSIIOAIIIAUgCBBeIAEqAgiUOAIMIAYgBUEIahBfIABBAWoiACAERw0ACwsgBUEQaiQACzEAIAC3RAAAAAAAQFHAoEQAAAAAAAAoQKMQ4AVEGC1EVPshGUCiRAAAAAAAgHtAorYLBwAgABC7BAtlAQN/IwBBEGsiAyQAAkAgAEEEaiICKAIAIAAQYCgCAEkEQCADQQhqIABBARBhIQQgABBiIAIoAgAQPSABED0QYyAEEGQgAiACKAIAQQhqNgIADAELIAAgARA9EGULIANBEGokAAsJACAAQQhqEEMLBAAgAAsJACAAQQhqEEMLDQAgACABIAIQPRCLAQsDAAELWwECfyMAQSBrIgMkACAAEGIiAiADQQhqIAAgABAbQQFqEIwBIAAQGyACEI0BIgIoAggQPSABED0QYyACIAIoAghBCGo2AgggACACEI4BIAIQjwEaIANBIGokAAsNACAAEGcgABBoGiAACy4AIAAgABB7IAAQeyAAEHxBA3RqIAAQeyAAEBtBA3RqIAAQeyAAEHxBA3RqEH0LIAAgACgCAARAIAAQfiAAEGIgACgCACAAEH8QgAELIAALCQAgACABOAIICwkAQaHhABBrGguQAQEDfyMAQSBrIgEkABAkECUhAhAlIQMQbBBtEG4QJRApQRMQKyACECsgA0HwCxAsQRQQAEEVEHJBFhB0IAFBADYCHCABQRc2AhggASABKQMYNwMQQfsLIAFBEGoQdUGGDEEYEHYgAUEANgIcIAFBGTYCGCABIAEpAxg3AwhBmAwgAUEIahB3IAFBIGokACAACwUAELEBCwUAELIBCwUAELMBCwcAIAAQrwELDwAgAARAIAAQsAEQxAQLCwkAQRgQwwQQWAstAQF/IwBBEGsiASQAEGwgAUEIahA6IAFBCGoQtAEQKUEaIAAQASABQRBqJAALFwBBGBDDBCAAED0oAgAgARA9KAIAEFsLLQEBfyMAQRBrIgEkABBsIAFBCGoQRSABQQhqELYBEEdBGyAAEAEgAUEQaiQACzwBAX8jAEEQayICJAAgAiABKQIANwMIEGwgACACELkBIAIQugEQuwFBHCACQQhqEElBABACIAJBEGokAAs/AQF/IwBBEGsiAiQAIAIgATYCDBBsIAAgAkEIahA/IAJBCGoQwwEQxAFBHSACQQxqEMYBQQAQAiACQRBqJAALOgEBfyMAQRBrIgIkACACIAEpAgA3AwgQbCAAIAIQRSACEMkBEExBHiACQQhqEElBABACIAJBEGokAAsSACAAIAEQPRB5GiAAEHoaIAALEAAgARA9GiAAQQA2AgAgAAsJACAAED0aIAALCQAgACgCABA9CwYAIAAQfwsDAAELDAAgACAAKAIAEIIBCxMAIAAQgQEoAgAgACgCAGtBA3ULCwAgACABIAIQgwELCQAgAEEIahBDCzABAX8gACgCBCECA0AgASACRkUEQCAAEGIgAkF4aiICED0QhAEMAQsLIAAgATYCBAsOACABIAJBA3RBBBCHAQsJACAAIAEQhQELCQAgACABEIYBCwMAAQsLACAAIAEgAhCIAQsJACAAIAEQiQELBwAgABCKAQsHACAAEMQECw0AIAAgASACED0QkAELXAECfyMAQRBrIgIkACACIAE2AgwgABCRASIDIAFPBEAgABB8IgAgA0EBdkkEQCACIABBAXQ2AgggAkEIaiACQQxqEJIBKAIAIQMLIAJBEGokACADDwsgABDKBAALbwECfyMAQRBrIgUkAEEAIQQgBUEANgIMIABBDGogBUEMaiADEJMBGiABBEAgABCUASABEJUBIQQLIAAgBDYCACAAIAQgAkEDdGoiAjYCCCAAIAI2AgQgABCWASAEIAFBA3RqNgIAIAVBEGokACAAC1kBAn8gABBnIAAQYiAAKAIAIABBBGoiAigCACABQQRqIgMQlwEgACADEJgBIAIgAUEIahCYASAAEGAgARCWARCYASABIAEoAgQ2AgAgACAAEBsQmQEgABBkCyMAIAAQmgEgACgCAARAIAAQlAEgACgCACAAEJsBEIABCyAACw4AIAEgAhA9KQIANwIACz0BAX8jAEEQayIBJAAgASAAEJwBEJ0BNgIMIAEQngE2AgggAUEMaiABQQhqEJ8BKAIAIQAgAUEQaiQAIAALCQAgACABEKABCxoAIAAgARA9EHkaIABBBGogAhA9EKYBGiAACwoAIABBDGoQqAELCwAgACABQQAQpwELCQAgAEEMahBDCygAIAMgAygCACACIAFrIgJrIgA2AgAgAkEBTgRAIAAgASACEOIFGgsLOwEBfyMAQRBrIgIkACACIAAQPSgCADYCDCAAIAEQPSgCADYCACABIAJBDGoQPSgCADYCACACQRBqJAALLAAgACAAEHsgABB7IAAQfEEDdGogABB7IAAQfEEDdGogABB7IAFBA3RqEH0LDAAgACAAKAIEEKwBCxMAIAAQrQEoAgAgACgCAGtBA3ULCQAgAEEIahBDCwcAIAAQogELBQAQowELCQAgACABEKEBCykBAn8jAEEQayICJAAgAkEIaiAAIAEQpAEhAyACQRBqJAAgASAAIAMbCykBAn8jAEEQayICJAAgAkEIaiABIAAQpAEhAyACQRBqJAAgASAAIAMbCwcAIAAQpQELCABB/////wcLDQAgASgCACACKAIASQsIAEH/////AQsNACAAIAEQPTYCACAACx4AIAAQpQEgAUkEQEGiDBCpAQALIAFBA3RBBBCqAQsJACAAQQRqEBYLGgEBf0EIEAMiASAAEKsBGiABQaQuQR8QBAALBwAgABDDBAsUACAAIAEQyQQaIABBhC42AgAgAAsJACAAIAEQrgELCQAgAEEMahBDCzQBAn8DQCAAKAIIIAFGRQRAIAAQlAEhAiAAIAAoAghBeGoiAzYCCCACIAMQPRCEAQwBCwsLBQBB9AwLDAAgAEEMahBmGiAACwUAQfQMCwUAQYwNCwUAQawNCwUAELUBCwUAQbwNCwUAELgBCzsBAX8jAEEQayIDJAAgAyABEEM2AgwgAyACEEM2AgggA0EMaiADQQhqIAARAgAQPSEAIANBEGokACAACwUAQcANCwQAQQULBQAQvgELBQBB5A0LZAECfyMAQRBrIgUkACABED0gACgCBCIGQQF1aiEBIAAoAgAhACAGQQFxBEAgASgCACAAaigCACEACyAFIAEgAhA9IAMQPSAEED0gABEFACAFEL0BIQAgBRBmGiAFQRBqJAAgAAsOAEEMEMMEIAAQPRC/AQsFAEHQDQtJAQJ/IAAgARBiED0QwAEhAiAAIAEoAgA2AgAgACABKAIENgIEIAEQYCgCACEDIAIQYCADNgIAIAEQYEEANgIAIAFCADcCACAACzsBAX8jAEEQayICJAAgABA9GiAAQgA3AgAgAkEANgIMIABBCGogAkEMaiABED0QwQEaIAJBEGokACAACxcAIAAgARA9EHkaIAAgAhA9EMIBGiAACwkAIAEQPRogAAsFABDIAQsFAEH0DQs3AgF/AX0jAEEQayICJAAgACgCACEAIAIgARA9IAARBgA4AgwgAkEMahDHASEDIAJBEGokACADCxUBAX9BBBDDBCIBIAAoAgA2AgAgAQsHACAAKgIACwUAQewNCwUAEMoBCwUAQfgNCwQAEGoLowEBBH8jAEEQayIDJAAgABDNASEFIABBDGoQzgEhBiAAIAI2AiAgAEEAOgAkIAUgAhDPASAGIAAoAiAQ0AEgACgCIEEBTgRAQQAh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QQA2AhwgAUE/NgIYIAEgASkDGDcDCEGkFCABQQhqEKMDIAFBADYCHCABQcAANgIYIAEgASkDGDcDAEGrFCABEKQDQbAUQcEAEKYDQbQUQcIAEKgDIAFBIGokAAsFABCZBAsFABCaBAsFABCbBAsHACAAEJgECw8AIAAEQCAAEPUBEMQECwsKAEEMEMMEEJwECy8BAX8jAEEQayIBJAAQmQMgAUEIahA6IAFBCGoQnQQQKUHDACAAEAEgAUEQaiQAC2UBA38jAEEQayIDJAACQCAAQQRqIgIoAgAgABC8AigCAEcEQCADQQhqIABBARBhIQQgABC6AiACKAIAED0gARC+AiAEEGQgAiACKAIAQQRqNgIADAELIAAgARCFBAsgA0EQaiQACzwBAX8jAEEQayICJAAgAiABKQIANwMIEJkDIAAgAhBFIAIQnwQQTEHEACACQQhqEElBABACIAJBEGokAAs2AQF/IAAQ1wEiAyABSQRAIAAgASADayACEIYEDwsgAyABSwRAIAAgACgCACABQQJ0ahCHBAsLPgEBfyMAQRBrIgIkACACIAEpAgA3AwgQmQMgACACENgCIAIQogQQ3gJBxQAgAkEIahBJQQAQAiACQRBqJAALPAEBfyMAQRBrIgIkACACIAEpAgA3AwgQmQMgACACED8gAhClBBBBQcYAIAJBCGoQSUEAEAIgAkEQaiQACyAAIAEQ1wEgAksEQCAAIAEgAhDuARCIBBoPCyAAEIkEC0ABAX8jAEEQayICJAAgAiABNgIMEJkDIAAgAkEIahBFIAJBCGoQqAQQR0HHACACQQxqEMYBQQAQAiACQRBqJAALFwAgAigCACECIAAgARDuASACNgIAQQELQgEBfyMAQRBrIgIkACACIAE2AgwQmQMgACACQQhqENgCIAJBCGoQsQQQsgRByAAgAkEMahDGAUEAEAIgAkEQaiQACwoAIAAQrgMoAgALNgAgAQRAIAAgASgCABCqAyAAIAEoAgQQqgMgABCrAyIAIAFBEGoQrAMQhQEgACABQQEQrQMLCwkAIABBBGoQQwsIACAAED0QPQsLACAAIAEgAhCvAwsLACAAQQRqEEMQQwsOACABIAJBKGxBBBCHAQsSACAAIAEQPRB5GiAAEHoaIAALDwAgABC0AxogABB6GiAACxgAIAAgARA9ELUDGiAAIAIQPRDCARogAAsLACAAQQRqEEMQQwsKACAAELYDGiAACxAAIAAgARA9KAIANgIAIAALCwAgAEEANgIAIAALDAAgACAAKAIAELoDCxMAIAAQuQMoAgAgACgCAGtBAnULCQAgAEEIahBDCzEBAX8gACgCBCECA0AgASACRkUEQCAAEOwCIAJBfGoiAhA9ELsDDAELCyAAIAE2AgQLCQAgACABEIUBCxoAIAAgARA9EHkaIABBBGogAhA9EKYBGiAACwoAIABBDGoQqAELCwAgACABQQAQwwMLCQAgAEEMahBDCy4AIAAgABB7IAAQeyAAEOsCQQJ0aiAAEHsgABDrAkECdGogABB7IAFBAnRqEH0LDAAgACAAKAIEEMQDCxMAIAAQxQMoAgAgACgCAGtBAnULHgAgABCeAiABSQRAQZYSEKkBAAsgAUECdEEEEKoBCwkAIAAgARDGAwsJACAAQQxqEEMLNAECfwNAIAAoAgggAUZFBEAgABC9AyECIAAgACgCCEF8aiIDNgIIIAIgAxA9ELsDDAELCwsNACAAIAEgAhA9EK4CC10BAn8jAEEQayICJAAgAiABNgIMIAAQyQMiAyABTwRAIAAQ6wIiACADQQF2SQRAIAIgAEEBdDYCCCACQQhqIAJBDGoQkgEoAgAhAwsgAkEQaiQAIAMPCyAAEMoEAAs9AQF/IwBBEGsiASQAIAEgABDKAxDLAzYCDCABEJ4BNgIIIAFBDGogAUEIahCfASgCACEAIAFBEGokACAACwkAIABBCGoQQwsHACAAELICC5wBAQN/IAAQqQMhAyAAENUDIQUCQCADBEACQANAIAAQ1gMgAiADQRBqIgQQ1wMEQCADKAIARQ0EIAMQPSEFIAMoAgAhAwwBCyAAENYDIAQgAhDYA0UNASADQQRqIQQgAygCBARAIAQQPSEFIAQoAgAhAwwBCwsgASADNgIAIAQPCyABIAM2AgAgBQ8LIAAQswMhAwsgASADNgIAIAMLVwEBfyMAQRBrIgUkACABEKsDIgEgACABQQEQ2QMgBUEIaiABQQAQ2gMQ2wMiARDOA0EQahCsAyACED0gAxA9IAQQPRDcAyABEN0DQQE6AAQgBUEQaiQACwkAIAAQQygCAAtbACADIAE2AgggA0IANwIAIAIgAzYCACAAED0oAgAoAgAEQCAAED0oAgAoAgAhAyAAED0gAzYCAAsgABCzAygCACACKAIAEN4DIAAQ3wMiACAAKAIAQQFqNgIACxgBAX8gABBDKAIAIQEgABBDQQA2AgAgAQsLACAAQQAQ4AMgAAsLACAAIAE2AgAgAAscACAAIAEQPSgCADYCACAAIAIQPS0AADoABCAACwwAIAAgARDyAxogAAsJACAAEK4DED0LCQAgAEEIahBDCw0AIAAgASACED0Q4QMLDQAgACABED0gAhDhAwsLACAAIAFBABDiAwsSACAAIAI6AAQgACABNgIAIAALLAEBfyMAQRBrIgMkACADIAE2AgwgACADQQxqIAIQPRDjAxogA0EQaiQAIAALFQAgACABIAIQPSADED0gBBA9EOQDCwcAIAAQ5QMLlwIBAn8gASAAIAFGIgI6AAwCQCACDQADQCABEOwDLQAMDQEgARDsAxDtAyECIAEQ7AMhAwJAAn8gAgRAAkAgAxDsAygCBCICRQ0AIAItAAwNACACQQxqIQIgARDsAyIBQQE6AAwgARDsAwwCCyABEO0DRQRAIAEQ7AMiARDuAwsgARDsAyIBQQE6AAwgARDsAyIBQQA6AAwgARDvAw8LIAMoAggoAgAiAkUNASACLQAMDQEgAkEMaiECIAEQ7AMiAUEBOgAMIAEQ7AMLIgEgACABRjoADCACQQE6AAAgACABRw0BDAILCyABEO0DBEAgARDsAyIBEO8DCyABEOwDIgFBAToADCABEOwDIgFBADoADCABEO4DCwsJACAAQQhqEEMLJQEBfyAAEEMoAgAhAiAAEEMgATYCACACBEAgABDlAyACEPEDCwsNACABKAIAIAIoAgBICx4AIAAQ5gMgAUkEQEGWEhCpAQALIAFBKGxBBBCqAQsbACAAIAEQPRC1AxogAEEEaiACED0Q5wMaIAALFQAgACABIAIQPSADED0gBBA9EOgDCwkAIABBBGoQPQsHAEHmzJkzCxAAIAAgARA9KQIANwIAIAALHQAgAhA9GiADED0oAgAhAyAEED0aIAEgAxDpAxoLKwEBfyMAQRBrIgIkACACIAE2AgggACACQQhqIAIQ6gMhACACQRBqJAAgAAssACABEOsDED0oAgAhASAAQgA3AgQgACABNgIAIABCADcCDCAAQQA2AhQgAAsGACAAEBYLBwAgACgCCAsNACAAKAIIKAIAIABGC1gBAn8gACAAKAIEIgEoAgAiAjYCBCACBEAgAiAAEPADCyABIAAoAgg2AggCfyAAEO0DBEAgACgCCAwBCyAAEOwDQQRqCyABNgIAIAEgADYCACAAIAEQ8AMLWAECfyAAIAAoAgAiASgCBCICNgIAIAIEQCACIAAQ8AMLIAEgACgCCDYCCAJ/IAAQ7QMEQCAAKAIIDAELIAAQ7ANBBGoLIAE2AgAgASAANgIEIAAgARDwAwsJACAAIAE2AggLKwAgAC0ABARAIAAoAgAgAUEQahCsAxCFAQsgAQRAIAAoAgAgAUEBEK0DCwsOACAAIAEQPRCmARogAAsFAEHsEgsWACAAQRRqEPMCGiAAQQhqEPUCGiAACwUAQewSCwUAQYQTCwUAQagTCwUAEPkDCwUAQbgTCwUAEPsDCwUAQcQTCwUAEP0DCwUAQdATCwUAEP8DCwUAQeATCwQAQQgLBQAQhAQLBQBBkBQLUAEBfyABED0gACgCBCIIQQF1aiEBIAAoAgAhACAIQQFxBEAgASgCACAAaigCACEACyABIAIQPSADEE4gBBBOIAUQTiAGEE4gBxBOIAARCQALBQBB8BMLXwECfyMAQSBrIgMkACAAELoCIgIgA0EIaiAAIAAQ1wFBAWoQigQgABDXASACEIsEIgIoAggQPSABED0QvgIgAiACKAIIQQRqNgIIIAAgAhCMBCACEI0EGiADQSBqJAALcgECfyMAQSBrIgQkAAJAIAAQvAIoAgAgACgCBGtBAnUgAU8EQCAAIAEgAhD0AQwBCyAAELoCIQMgBEEIaiAAIAAQ1wEgAWoQigQgABDXASADEIsEIgMgASACEJYEIAAgAxCMBCADEI0EGgsgBEEgaiQACyABAX8gACABEIYBIAAQ1wEhAiAAIAEQxgIgACACEJcECzIBAX8jAEEQayICJAAgAkEIaiABED0QrQQhASAAEK4EIAEQQxAHNgIAIAJBEGokACAACwoAIABBARDSAxoLXQECfyMAQRBrIgIkACACIAE2AgwgABC5AiIDIAFPBEAgABDDAiIAIANBAXZJBEAgAiAAQQF0NgIIIAJBCGogAkEMahCSASgCACEDCyACQRBqJAAgAw8LIAAQygQAC28BAn8jAEEQayIFJABBACEEIAVBADYCDCAAQQxqIAVBDGogAxCOBBogAQRAIAAQjwQgARC7AiEECyAAIAQ2AgAgACAEIAJBAnRqIgI2AgggACACNgIEIAAQkAQgBCABQQJ0ajYCACAFQRBqJAAgAAtdAQJ/IAAQ9gEgABC6AiAAKAIAIABBBGoiAigCACABQQRqIgMQlwEgACADEJgBIAIgAUEIahCYASAAELwCIAEQkAQQmAEgASABKAIENgIAIAAgABDXARC9AiAAEGQLIwAgABCRBCAAKAIABEAgABCPBCAAKAIAIAAQkgQQjAILIAALGgAgACABED0QeRogAEEEaiACED0QpgEaIAALCgAgAEEMahCoAQsJACAAQQxqEEMLDAAgACAAKAIEEJMECxMAIAAQlAQoAgAgACgCAGtBAnULCQAgACABEJUECwkAIABBDGoQQws0AQJ/A0AgACgCCCABRkUEQCAAEI8EIQIgACAAKAIIQXxqIgM2AgggAiADED0QxwIMAQsLCzIBAX8gABCPBCEDA0AgAyAAKAIIED0gAhC+AiAAIAAoAghBBGo2AgggAUF/aiIBDQALCy4AIAAgABB7IAAQeyAAEMMCQQJ0aiAAEHsgAUECdGogABB7IAAQ1wFBAnRqEH0LBQBBwBALBQBBwBALBQBB4BQLBQBBmBULCgAgABDyARogAAsFABCeBAsFAEGoFQsFABChBAtWAQJ/IwBBEGsiAyQAIAEQPSAAKAIEIgRBAXVqIQEgACgCACEAIARBAXEEQCABKAIAIABqKAIAIQALIAMgAhBOOAIMIAEgA0EMaiAAEQQAIANBEGokAAsFAEGsFQsFABCkBAteAQJ/IwBBEGsiBCQAIAEQPSAAKAIEIgVBAXVqIQEgACgCACEAIAVBAXEEQCABKAIAIABqKAIAIQALIAIQPSECIAQgAxBOOAIMIAEgAiAEQQxqIAARBwAgBEEQaiQACwUAQcAVCwUAEKcEC1cBAn8jAEEQayICJAAgARA9IAAoAgQiA0EBdWohASAAKAIAIQAgAiABIANBAXEEfyABKAIAIABqKAIABSAACxEBADYCDCACQQxqEBYhACACQRBqJAAgAAsFAEHQFQsFABCsBAtCAQF/IwBBEGsiAyQAIAAoAgAhACADQQhqIAEQPSACED0gABEHACADQQhqEKoEIQIgA0EIahCrBBogA0EQaiQAIAILDgAgACgCABAFIAAoAgALCwAgACgCABAGIAALBQBB2BULNwEBfyMA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AhQ2AhQgAiABKAIYNgIYIAIgASgCHDYCHCACIAEoAiA2AiAgAiABKAIkNgIkIAIgASgCKDYCKCACIAEoAiw2AiwgAiABKAIwNgIwIAIgASgCNDYCNCACIAEoAjg2AjggAiABKAI8NgI8IAFBQGshASACQUBrIgIgBU0NAAsLIAIgBE8NAQNAIAIgASgCADYCACABQQRqIQEgAkEEaiICIARJDQALDAELIANBBEkEQCAAIQIMAQsgA0F8aiIEIABJBEAgACECDAELIAAhAgNAIAIgAS0AADoAACACIAEtAAE6AAEgAiABLQACOgACIAIgAS0AAzoAAyABQQRqIQEgAkEEaiICIARNDQALCyACIANJBEADQCACIAEtAAA6AAAgAUEBaiEBIAJBAWoiAiADRw0ACwsgAAvzAgICfwF+AkAgAkUNACAAIAJqIgNBf2ogAToAACAAIAE6AAAgAkEDSQ0AIANBfmogAToAACAAIAE6AAEgA0F9aiABOgAAIAAgAToAAiACQQdJDQAgA0F8aiABOgAAIAAgAToAAyACQQlJDQAgAEEAIABrQQNxIgRqIgMgAUH/AXFBgYKECGwiATYCACADIAIgBGtBfHEiBGoiAkF8aiABNgIAIARBCUkNACADIAE2AgggAyABNgIEIAJBeGogATYCACACQXRqIAE2AgAgBEEZSQ0AIAMgATYCGCADIAE2AhQgAyABNgIQIAMgATYCDCACQXBqIAE2AgAgAkFsaiABNgIAIAJBaGogATYCACACQWRqIAE2AgAgBCADQQRxQRhyIgRrIgJBIEkNACABrSIFQiCGIAWEIQUgAyAEaiEBA0AgASAFNwMYIAEgBTcDECABIAU3AwggASAFNwMAIAFBIGohASACQWBqIgJBH0sNAAsLIAALHwBBoOUAKAIARQRAQaTlACABNgIAQaDlACAANgIACwsIABDmBUEASgsEABAlCwQAIwALEAAjACAAa0FwcSIAJAAgAAsGACAAJAALBgAgAEAACwkAIAEgABEBAAsJACABIAAREAALBwAgABEAAAsLACABIAIgABECAAsLACABIAIgABEDAAsLACABIAIgABEEAAsNACABIAIgAyAAEQoACw0AIAEgAiADIAARCAALDQAgASACIAMgABEHAAsRACABIAIgAyAEIAUgABEFAAsJACABIAARBgALEQAgASACIAMgBCAFIAARFgALCwAgASACIAARFwALDwAgASACIAMgBCAAEQwACw8AIAEgAiADIAQgABEYAAsVACABIAIgAyAEIAUgBiAHIAARCQALFwAgASACIAMgBCAFIAYgByAIIAARGQALDwAgASACIAMgBCAAERoACxMAIAEgAiADIAQgBSAGIAARDQALC4RZCQBBgAgL0ghBRFNSTW9kdWxhdG9yAG1vZHVsYXRlQW1wAHNldFhBAHNldFhEAHNldFlTAHNldFhSAHNldFlBAHNldFN0YWdlAGdldFN0YWdlADEzQURTUk1vZHVsYXRvcgAAAMQZAABKBAAAUDEzQURTUk1vZHVsYXRvcgAAAACkGgAAZAQAAAAAAABcBAAAUEsxM0FEU1JNb2R1bGF0b3IAAACkGgAAiAQAAAEAAABcBAAAaWkAdgB2aQB4BAAAeAQAACwZAABpaWkA5BgAAHgEAAB0BQAATlN0M19fMjZ2ZWN0b3JJNVBvaW50TlNfOWFsbG9jYXRvcklTMV9FRUVFAE5TdDNfXzIxM19fdmVjdG9yX2Jhc2VJNVBvaW50TlNfOWFsbG9jYXRvcklTMV9FRUVFAE5TdDNfXzIyMF9fdmVjdG9yX2Jhc2VfY29tbW9uSUxiMUVFRQAAxBkAAC4FAABIGgAA+wQAAAAAAAABAAAAVAUAAAAAAABIGgAA0AQAAAAAAAABAAAAXAUAAAAAAABpaWlpAAAAAMwYAAB4BAAAXBkAAHZpaWYAAAAAzBgAAHgEAADYBQAATjEzQURTUk1vZHVsYXRvcjEzRW52ZWxvcGVTdGFnZUUAAAAAeBkAALQFAAB2aWlpAAAAANgFAAB4BAAAT3NjaWxsYXRvcgBuZXh0U2FtcGxlAGZyZXF1ZW5jeUNvbnN0YW50AHNldFZvbHVtZQBhbGxvY2F0b3I8VD46OmFsbG9jYXRlKHNpemVfdCBuKSAnbicgZXhjZWVkcyBtYXhpbXVtIHN1cHBvcnRlZCBzaXplADEwT3NjaWxsYXRvcgAAxBkAAGYGAABQMTBPc2NpbGxhdG9yAAAApBoAAHwGAAAAAAAAdAYAAFBLMTBPc2NpbGxhdG9yAACkGgAAnAYAAAEAAAB0BgAAjAYAAIwGAAAsGQAALBkAAAAAAAB0BQAAjAYAACwZAAAsGQAALBkAAGlpaWlpaQAAXBkAACwZAABmaWkAzBgAAIwGAABcGQAAVm9pY2UAbmV4dFNhbXBsZQBzZXRFbnZlbG9wZQBzZXRWb2x1bWUAc2V0U3RhZ2UAYWxsb2NhdG9yPFQ+OjphbGxvY2F0ZShzaXplX3QgbikgJ24nIGV4Y2VlZHMgbWF4aW11bSBzdXBwb3J0ZWQgc2l6ZQA1Vm9pY2UAAMQZAAB4BwAAUDVWb2ljZQCkGgAAiAcAAAAAAACABwAAUEs1Vm9pY2UAAAAApBoAAKAHAAABAAAAgAcAAJAHAACQBwAALBkAACwZAABACAAAkAcAACwZAABOU3QzX18yNnZlY3RvcklmTlNfOWFsbG9jYXRvcklmRUVFRQBOU3QzX18yMTNfX3ZlY3Rvcl9iYXNlSWZOU185YWxsb2NhdG9ySWZFRUVFAEgaAAD8BwAAAAAAAAEAAABUBQAAAAAAAEgaAADYBwAAAAAAAAEAAAAoCABB4BALMcwYAACQBwAALBkAAIQIAAAxNEVudmVsb3BlUHJlc2V0AAAAAMQZAABwCAAAdmlpaWkAQaARC5YEzBgAAJAHAAAsGQAAXBkAAHZpaWlmAAAAzBgAAJAHAADYBQAAVm9pY2VNYW5hZ2VyAG9uTm90ZU9uAG9uTm90ZU9mZgBuZXh0U2FtcGxlAHNldFZvbHVtZQB1cGRhdGVFbnZlbG9wZQB2ZWN0b3I8ZmxvYXQ+AGFsbG9jYXRvcjxUPjo6YWxsb2NhdGUoc2l6ZV90IG4pICduJyBleGNlZWRzIG1heGltdW0gc3VwcG9ydGVkIHNpemUAADEyVm9pY2VNYW5hZ2VyAAAAxBkAAFsJAABQMTJWb2ljZU1hbmFnZXIApBoAAHQJAAAAAAAAbAkAAFBLMTJWb2ljZU1hbmFnZXIAAAAApBoAAJQJAAABAAAAbAkAAIQJAAAsGQAALBkAAMwYAACECQAALBkAAEAIAACECQAALBkAAAAAAADMGAAAhAkAACwZAABcGQAAzBgAAIQJAAAsGQAAXBkAAFwZAABcGQAAXBkAAFwZAAB2aWlpZmZmZmYAcHVzaF9iYWNrAHJlc2l6ZQBzaXplAGdldABzZXQAUE5TdDNfXzI2dmVjdG9ySWZOU185YWxsb2NhdG9ySWZFRUVFAAAAAKQaAAA4CgAAAAAAAEAIAABQS05TdDNfXzI2dmVjdG9ySWZOU185YWxsb2NhdG9ySWZFRUVFAAAApBoAAHAKAAABAAAAQAgAAGAKAADMGAAAYAoAAFwZAEHAFQtVzBgAAGAKAABQGQAAXBkAAFAZAACYCgAA+AoAAEAIAABQGQAATjEwZW1zY3JpcHRlbjN2YWxFAADEGQAA5AoAAOQYAABACAAAUBkAAFwZAABpaWlpZgBBoBYL1xUDAAAABAAAAAQAAAAGAAAAg/miAERObgD8KRUA0VcnAN009QBi28AAPJmVAEGQQwBjUf4Au96rALdhxQA6biQA0k1CAEkG4AAJ6i4AHJLRAOsd/gApsRwA6D6nAPU1ggBEuy4AnOmEALQmcABBfl8A1pE5AFODOQCc9DkAi1+EACj5vQD4HzsA3v+XAA+YBQARL+8AClqLAG0fbQDPfjYACcsnAEZPtwCeZj8ALepfALondQDl68cAPXvxAPc5BwCSUooA+2vqAB+xXwAIXY0AMANWAHv8RgDwq2sAILzPADb0mgDjqR0AXmGRAAgb5gCFmWUAoBRfAI1AaACA2P8AJ3NNAAYGMQDKVhUAyahzAHviYABrjMAAGcRHAM1nwwAJ6NwAWYMqAIt2xACmHJYARK/dABlX0QClPgUABQf/ADN+PwDCMugAmE/eALt9MgAmPcMAHmvvAJ/4XgA1HzoAf/LKAPGHHQB8kCEAaiR8ANVu+gAwLXcAFTtDALUUxgDDGZ0ArcTCACxNQQAMAF0Ahn1GAONxLQCbxpoAM2IAALTSfAC0p5cAN1XVANc+9gCjEBgATXb8AGSdKgBw16sAY3z4AHqwVwAXFecAwElWADvW2QCnhDgAJCPLANaKdwBaVCMAAB+5APEKGwAZzt8AnzH/AGYeagCZV2EArPtHAH5/2AAiZbcAMuiJAOa/YADvxM0AbDYJAF0/1AAW3tcAWDveAN6bkgDSIigAKIboAOJYTQDGyjIACOMWAOB9ywAXwFAA8x2nABjgWwAuEzQAgxJiAINIAQD1jlsArbB/AB7p8gBISkMAEGfTAKrd2ACuX0IAamHOAAoopADTmbQABqbyAFx3fwCjwoMAYTyIAIpzeACvjFoAb9e9AC2mYwD0v8sAjYHvACbBZwBVykUAytk2ACio0gDCYY0AEsl3AAQmFAASRpsAxFnEAMjFRABNspEAABfzANRDrQApSeUA/dUQAAC+/AAelMwAcM7uABM+9QDs8YAAs+fDAMf4KACTBZQAwXE+AC4JswALRfMAiBKcAKsgewAutZ8AR5LCAHsyLwAMVW0AcqeQAGvnHwAxy5YAeRZKAEF54gD034kA6JSXAOLmhACZMZcAiO1rAF9fNgC7/Q4ASJq0AGekbABxckIAjV0yAJ8VuAC85QkAjTElAPd0OQAwBRwADQwBAEsIaAAs7lgAR6qQAHTnAgC91iQA932mAG5IcgCfFu8AjpSmALSR9gDRU1EAzwryACCYMwD1S34AsmNoAN0+XwBAXQMAhYl/AFVSKQA3ZMAAbdgQADJIMgBbTHUATnHUAEVUbgALCcEAKvVpABRm1QAnB50AXQRQALQ72wDqdsUAh/kXAElrfQAdJ7oAlmkpAMbMrACtFFQAkOJqAIjZiQAsclAABKS+AHcHlADzMHAAAPwnAOpxqABmwkkAZOA9AJfdgwCjP5cAQ5T9AA2GjAAxQd4AkjmdAN1wjAAXt+cACN87ABU3KwBcgKAAWoCTABARkgAP6NgAbICvANv/SwA4kA8AWRh2AGKlFQBhy7sAx4m5ABBAvQDS8gQASXUnAOu29gDbIrsAChSqAIkmLwBkg3YACTszAA6UGgBROqoAHaPCAK/trgBcJhIAbcJNAC16nADAVpcAAz+DAAnw9gArQIwAbTGZADm0BwAMIBUA2MNbAPWSxADGrUsATsqlAKc3zQDmqTYAq5KUAN1CaAAZY94AdozvAGiLUgD82zcArqGrAN8VMQAArqEADPvaAGRNZgDtBbcAKWUwAFdWvwBH/zoAavm5AHW+8wAok98Aq4AwAGaM9gAEyxUA+iIGANnkHQA9s6QAVxuPADbNCQBOQukAE76kADMjtQDwqhoAT2WoANLBpQALPw8AW3jNACP5dgB7iwQAiRdyAMamUwBvbuIA7+sAAJtKWADE2rcAqma6AHbPzwDRAh0AsfEtAIyZwQDDrXcAhkjaAPddoADGgPQArPAvAN3smgA/XLwA0N5tAJDHHwAq27YAoyU6AACvmgCtU5MAtlcEACkttABLgH4A2genAHaqDgB7WaEAFhIqANy3LQD65f0Aidv+AIm+/QDkdmwABqn8AD6AcACFbhUA/Yf/ACg+BwBhZzMAKhiGAE296gCz568Aj21uAJVnOQAxv1sAhNdIADDfFgDHLUMAJWE1AMlwzgAwy7gAv2z9AKQAogAFbOQAWt2gACFvRwBiEtIAuVyEAHBhSQBrVuAAmVIBAFBVNwAe1bcAM/HEABNuXwBdMOQAhS6pAB2ywwChMjYACLekAOqx1AAW9yEAj2nkACf/dwAMA4AAjUAtAE/NoAAgpZkAs6LTAC9dCgC0+UIAEdrLAH2+0ACb28EAqxe9AMqigQAIalwALlUXACcAVQB/FPAA4QeGABQLZACWQY0Ah77eANr9KgBrJbYAe4k0AAXz/gC5v54AaGpPAEoqqABPxFoALfi8ANdamAD0x5UADU2NACA6pgCkV18AFD+xAIA4lQDMIAEAcd2GAMnetgC/YPUATWURAAEHawCMsKwAssDQAFFVSAAe+w4AlXLDAKMGOwDAQDUABtx7AOBFzABOKfoA1srIAOjzQQB8ZN4Am2TYANm+MQCkl8MAd1jUAGnjxQDw2hMAujo8AEYYRgBVdV8A0r31AG6SxgCsLl0ADkTtABw+QgBhxIcAKf3pAOfW8wAifMoAb5E1AAjgxQD/140AbmriALD9xgCTCMEAfF10AGutsgDNbp0APnJ7AMYRagD3z6kAKXPfALXJugC3AFEA4rINAHS6JADlfWAAdNiKAA0VLACBGAwAfmaUAAEpFgCfenYA/f2+AFZF7wDZfjYA7NkTAIu6uQDEl/wAMagnAPFuwwCUxTYA2KhWALSotQDPzA4AEoktAG9XNAAsVokAmc7jANYguQBrXqoAPiqcABFfzAD9C0oA4fT7AI47bQDihiwA6dSEAPy0qQDv7tEALjXJAC85YQA4IUQAG9nIAIH8CgD7SmoALxzYAFO0hABOmYwAVCLMACpV3ADAxtYACxmWABpwuABplWQAJlpgAD9S7gB/EQ8A9LURAPzL9QA0vC0ANLzuAOhdzADdXmAAZ46bAJIz7wDJF7gAYVibAOFXvABRg8YA2D4QAN1xSAAtHN0ArxihACEsRgBZ89cA2XqYAJ5UwABPhvoAVgb8AOV5rgCJIjYAOK0iAGeT3ABV6KoAgiY4AMrnmwBRDaQAmTOxAKnXDgBpBUgAZbLwAH+IpwCITJcA+dE2ACGSswB7gkoAmM8hAECf3ADcR1UA4XQ6AGfrQgD+nd8AXtRfAHtnpAC6rHoAVfaiACuIIwBBulUAWW4IACEqhgA5R4MAiePmAOWe1ABJ+0AA/1bpABwPygDFWYoAlPorANPBxQAPxc8A21quAEfFhgCFQ2IAIYY7ACx5lAAQYYcAKkx7AIAsGgBDvxIAiCaQAHg8iQCoxOQA5dt7AMQ6wgAm9OoA92eKAA2SvwBloysAPZOxAL18CwCkUdwAJ91jAGnh3QCalBkAqCmVAGjOKAAJ7bQARJ8gAE6YygBwgmMAfnwjAA+5MgCn9Y4AFFbnACHxCAC1nSoAb35NAKUZUQC1+asAgt/WAJbdYQAWNgIAxDqfAIOioQBy7W0AOY16AIK4qQBrMlwARidbAAA07QDSAHcA/PRVAAFZTQDgcYAAQYMsC01A+yH5PwAAAAAtRHQ+AAAAgJhG+DwAAABgUcx4OwAAAICDG/A5AAAAQCAlejgAAACAIoLjNgAAAAAd82k1AAAAAAAA8D8AAAAAAAD4PwBB2CwLCAbQz0Pr/Uw+AEHrLAu9JEADuOI/AACAPwAAwD8AAAAA3M/RNQAAAAAAwBU/dmVjdG9yAHN0ZDo6ZXhjZXB0aW9uAAAAAAAAAMQWAABJAAAASgAAAEsAAABTdDlleGNlcHRpb24AAAAAxBkAALQWAAAAAAAA8BYAAB8AAABMAAAATQAAAFN0MTFsb2dpY19lcnJvcgDsGQAA4BYAAMQWAAAAAAAAJBcAAB8AAABOAAAATQAAAFN0MTJsZW5ndGhfZXJyb3IAAAAA7BkAABAXAADwFgAAU3Q5dHlwZV9pbmZvAAAAAMQZAAAwFwAATjEwX19jeHhhYml2MTE2X19zaGltX3R5cGVfaW5mb0UAAAAA7BkAAEgXAABAFwAATjEwX19jeHhhYml2MTE3X19jbGFzc190eXBlX2luZm9FAAAA7BkAAHgXAABsFwAATjEwX19jeHhhYml2MTE3X19wYmFzZV90eXBlX2luZm9FAAAA7BkAAKgXAABsFwAATjEwX19jeHhhYml2MTE5X19wb2ludGVyX3R5cGVfaW5mb0UA7BkAANgXAADMFwAATjEwX19jeHhhYml2MTIwX19mdW5jdGlvbl90eXBlX2luZm9FAAAAAOwZAAAIGAAAbBcAAE4xMF9fY3h4YWJpdjEyOV9fcG9pbnRlcl90b19tZW1iZXJfdHlwZV9pbmZvRQAAAOwZAAA8GAAAzBcAAAAAAAC8GAAATwAAAFAAAABRAAAAUgAAAFMAAABOMTBfX2N4eGFiaXYxMjNfX2Z1bmRhbWVudGFsX3R5cGVfaW5mb0UA7BkAAJQYAABsFwAAdgAAAIAYAADIGAAARG4AAIAYAADUGAAAYgAAAIAYAADgGAAAYwAAAIAYAADsGAAAaAAAAIAYAAD4GAAAYQAAAIAYAAAEGQAAcwAAAIAYAAAQGQAAdAAAAIAYAAAcGQAAaQAAAIAYAAAoGQAAagAAAIAYAAA0GQAAbAAAAIAYAABAGQAAbQAAAIAYAABMGQAAZgAAAIAYAABYGQAAZAAAAIAYAABkGQAAAAAAALAZAABPAAAAVAAAAFEAAABSAAAAVQAAAE4xMF9fY3h4YWJpdjExNl9fZW51bV90eXBlX2luZm9FAAAAAOwZAACMGQAAbBcAAAAAAACcFwAATwAAAFYAAABRAAAAUgAAAFcAAABYAAAAWQAAAFoAAAAAAAAANBoAAE8AAABbAAAAUQAAAFIAAABXAAAAXAAAAF0AAABeAAAATjEwX19jeHhhYml2MTIwX19zaV9jbGFzc190eXBlX2luZm9FAAAAAOwZAAAMGgAAnBcAAAAAAACQGgAATwAAAF8AAABRAAAAUgAAAFcAAABgAAAAYQAAAGIAAABOMTBfX2N4eGFiaXYxMjFfX3ZtaV9jbGFzc190eXBlX2luZm9FAAAA7BkAAGgaAACcFwAAAAAAAPwXAABPAAAAYwAAAFEAAABSAAAAZAAAAHZvaWQAYm9vbABjaGFyAHNpZ25lZCBjaGFyAHVuc2lnbmVkIGNoYXIAc2hvcnQAdW5zaWduZWQgc2hvcnQAaW50AHVuc2lnbmVkIGludABsb25nAHVuc2lnbmVkIGxvbmcAZmxvYXQAZG91YmxlAHN0ZDo6c3RyaW5nAHN0ZDo6YmFzaWNfc3RyaW5nPHVuc2lnbmVkIGNoYXI+AHN0ZDo6d3N0cmluZwBlbXNjcmlwdGVuOjp2YWwAZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8Y2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2lnbmVkIGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBzaG9ydD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGxvbmc+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGxvbmc+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDMyX3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxmbG9hdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZG91YmxlPgBOU3QzX18yMTJiYXNpY19zdHJpbmdJY05TXzExY2hhcl90cmFpdHNJY0VFTlNfOWFsbG9jYXRvckljRUVFRQBOU3QzX18yMjFfX2Jhc2ljX3N0cmluZ19jb21tb25JTGIxRUVFAAAAAMQZAADvHQAASBoAALAdAAAAAAAAAQAAABgeAAAAAAAATlN0M19fMjEyYmFzaWNfc3RyaW5nSWhOU18xMWNoYXJfdHJhaXRzSWhFRU5TXzlhbGxvY2F0b3JJaEVFRUUAAEgaAAA4HgAAAAAAAAEAAAAYHgAAAAAAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0l3TlNfMTFjaGFyX3RyYWl0c0l3RUVOU185YWxsb2NhdG9ySXdFRUVFAABIGgAAkB4AAAAAAAABAAAAGB4AAAAAAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ljRUUAAMQZAADoHgAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJYUVFAADEGQAAEB8AAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWhFRQAAxBkAADgfAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lzRUUAAMQZAABgHwAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJdEVFAADE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';
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




// STATICTOP = STATIC_BASE + 12112;
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
      return 12976;
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