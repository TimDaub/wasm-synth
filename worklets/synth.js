
var Module = (function() {
  var _scriptDir = typeof document !== 'undefined' && document.currentScript ? document.currentScript.src : undefined;
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
  'initial': 116,
  'maximum': 116 + 0,
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
    STACK_BASE = 5256272,
    STACKTOP = STACK_BASE,
    STACK_MAX = 13392,
    DYNAMIC_BASE = 5256272,
    DYNAMICTOP_PTR = 13232;




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




var wasmBinaryFile = 'data:application/octet-stream;base64,AGFzbQEAAAABpQIpYAABf2ABfwF/YAJ/fwF/YAJ/fQBgAn9/AGAFf39/f38AYAF/AX1gA39/fwBgA39/fQBgA39/fwF/YAd/f319fX19AGAAAGAEf39/fwBgBn9/f39/fwBgDX9/f39/f39/f39/f38AYAh/f39/f39/fwBgAX8AYAJ/fQF9YAJ9fQF9YAJ9fwF8YAF9AX1gA399fwF9YAJ/fwF8YAR/f39/AX9gBX9/f39/AX9gAn9/AX1gBH9/f30AYAh/f399fX19fQBgBH9/f30Bf2ABfAF9YAF8AXxgAn1/AX9gAnx8AXxgAn1/AX1gAnx/AXxgBn9/f39/fwF/YAN/f38BfWAFf39/f30AYAl/f39/fX19fX0AYAV/f39/fQF/YAd/f39/f39/AAKtBBQDZW52Fl9lbWJpbmRfcmVnaXN0ZXJfY2xhc3MADgNlbnYiX2VtYmluZF9yZWdpc3Rlcl9jbGFzc19jb25zdHJ1Y3RvcgANA2Vudh9fZW1iaW5kX3JlZ2lzdGVyX2NsYXNzX2Z1bmN0aW9uAA8DZW52GF9fY3hhX2FsbG9jYXRlX2V4Y2VwdGlvbgABA2VudgtfX2N4YV90aHJvdwAHA2Vudg1fZW12YWxfaW5jcmVmABADZW52DV9lbXZhbF9kZWNyZWYAEANlbnYRX2VtdmFsX3Rha2VfdmFsdWUAAgNlbnYVX2VtYmluZF9yZWdpc3Rlcl92b2lkAAQDZW52FV9lbWJpbmRfcmVnaXN0ZXJfYm9vbAAFA2VudhtfZW1iaW5kX3JlZ2lzdGVyX3N0ZF9zdHJpbmcABANlbnYcX2VtYmluZF9yZWdpc3Rlcl9zdGRfd3N0cmluZwAHA2VudhZfZW1iaW5kX3JlZ2lzdGVyX2VtdmFsAAQDZW52GF9lbWJpbmRfcmVnaXN0ZXJfaW50ZWdlcgAFA2VudhZfZW1iaW5kX3JlZ2lzdGVyX2Zsb2F0AAcDZW52HF9lbWJpbmRfcmVnaXN0ZXJfbWVtb3J5X3ZpZXcABwNlbnYWZW1zY3JpcHRlbl9yZXNpemVfaGVhcAABA2VudhVlbXNjcmlwdGVuX21lbWNweV9iaWcACQNlbnYGbWVtb3J5AgCAAgNlbnYFdGFibGUBcAB0A9QG0gYACwIEARESEwIBAgMDAwMDCwELAAAAAAABAAAQABAB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ASICKAIIED0gARA9EGsgAiACKAIIQQhqNgIIIAAgAhCaASACEJsBGiADQSBqJAALDQAgABBvIAAQcBogAAs1ACAAIAAQhwEgABCHASAAEIgBQQN0aiAAEIcBIAAQG0EDdGogABCHASAAEIgBQQN0ahCJAQsiACAAKAIABEAgABCKASAAEGogACgCACAAEIsBEIwBCyAACwkAIAAgATYCCAsHACAALQAACwkAQaHjABB0Ggv3AQEDfyMAQTBrIgEkABAkECUhAhAlIQMQdRB2EHcQJRApQRMQKyACECsgA0HwCxAsQRQQAEEVEHtBFhB9IAFBADYCLCABQRc2AiggASABKQMoNwMgQfsLIAFBIGoQfkGGDEEYEH8gAUEANgIsIAFBGTYCKCABIAEpAyg3AxhBmAwgAUEYahCAASABQQA2AiwgAUEaNgIoIAEgASkDKDcDEEGhDCABQRBqEIEBIAFBADYCLCABQRs2AiggASABKQMoNwMIQa0MIAFBCGoQggEgAUEANgIsIAFBHDYCKCABIAEpAyg3AwBBtwwgARCDASABQTBqJAAgAAsFABC9AQsFABC+AQsFABC/AQsHACAAELsBCw8AIAAEQCAAELwBEKwFCwsJAEEcEKsFEFgLLQEBfyMAQRBrIgEkABB1IAFBCGoQOiABQQhqEMABEClBHSAAEAEgAUEQaiQACxcAQRwQqwUgABA9KAIAIAEQPSgCABBbCy0BAX8jAEEQayIBJAAQdSABQQhqEEUgAUEIahDCARBHQR4gABABIAFBEGokAAs8AQF/IwBBEGsiAiQAIAIgASkCADcDCBB1IAAgAhDFASACEMYBEMcBQR8gAkEIahBJQQAQAiACQRBqJAALPwEBfyMAQRBrIgIkACACIAE2AgwQdSAAIAJBCGoQPyACQQhqEM8BENABQSAgAkEMahDSAUEAEAIgAkEQaiQACzoBAX8jAEEQayICJAAgAiABKQIANwMIEHUgACACEEUgAhDVARBMQSEgAkEIahBJQQAQAiACQRBqJAALOgEBfyMAQRBrIgIkACACIAEpAgA3AwgQdSAAIAIQRSACENcBEFFBIiACQQhqEElBABACIAJBEGokAAs6AQF/IwBBEGsiAiQAIAIgASkCADcDCBB1IAAgAhBFIAIQ2QEQUUEjIAJBCGoQSUEAEAIgAkEQaiQACzoBAX8jAEEQayICJAAgAiABKQIANwMIEHUgACACED8gAhDbARBBQSQgAkEIahBJQQAQAiACQRBqJAALFAAgACABED0QhQEaIAAQhgEaIAALEAAgARA9GiAAQQA2AgAgAAsJACAAED0aIAALCQAgACgCABA9CwcAIAAQiwELAwABCwwAIAAgACgCABCOAQsTACAAEI0BKAIAIAAoAgBrQQN1CwsAIAAgASACEI8BCwkAIABBCGoQQwswAQF/IAAoAgQhAgNAIAEgAkZFBEAgABBqIAJBeGoiAhA9EJABDAELCyAAIAE2AgQLDgAgASACQQN0QQQQkwELCQAgACABEJEBCwkAIAAgARCSAQsDAAELCwAgACABIAIQlAELCQAgACABEJUBCwcAIAAQlgELBwAgABCsBQsNACAAIAEgAhA9EJwBC10BAn8jAEEQayICJAAgAiABNgIMIAAQnQEiAyABTwRAIAAQiAEiACADQQF2SQRAIAIgAEEBdDYCCCACQQhqIAJBDGoQngEoAgAhAwsgAkEQaiQAIAMPCyAAELIFAAtvAQJ/IwBBEGsiBSQAQQAhBCAFQQA2AgwgAEEMaiAFQQxqIAMQnwEaIAEEQCAAEKABIAEQoQEhBAsgACAENgIAIAAgBCACQQN0aiICNgIIIAAgAjYCBCAAEKIBIAQgAUEDdGo2AgAgBUEQaiQAIAALWQECfyAAEG8gABBqIAAoAgAgAEEEaiICKAIAIAFBBGoiAxCjASAAIAMQpAEgAiABQQhqEKQBIAAQaCABEKIBEKQBIAEgASgCBDYCACAAIAAQGxClASAAEGwLIwAgABCmASAAKAIABEAgABCgASAAKAIAIAAQpwEQjAELIAALDgAgASACED0pAgA3AgALPQEBfyMAQRBrIgEkACABIAAQqAEQqQE2AgwgARCqATYCCCABQQxqIAFBCGoQqwEoAgAhACABQRBqJAAgAAsJACAAIAEQrAELGwAgACABED0QhQEaIABBBGogAhA9ELIBGiAACwoAIABBDGoQtAELCwAgACABQQAQswELCQAgAEEMahBDCygAIAMgAygCACACIAFrIgJrIgA2AgAgAkEBTgRAIAAgASACEMcGGgsLOwEBfyMAQRBrIgIkACACIAAQPSgCADYCDCAAIAEQPSgCADYCACABIAJBDGoQPSgCADYCACACQRBqJAALMwAgACAAEIcBIAAQhwEgABCIAUEDdGogABCHASAAEIgBQQN0aiAAEIcBIAFBA3RqEIkBCwwAIAAgACgCBBC4AQsTACAAELkBKAIAIAAoAgBrQQN1CwkAIABBCGoQQwsHACAAEK4BCwUAEK8BCwkAIAAgARCtAQspAQJ/IwBBEGsiAiQAIAJBCGogACABELABIQMgAkEQaiQAIAEgACADGwspAQJ/IwBBEGsiAiQAIAJBCGogASAAELABIQMgAkEQaiQAIAEgACADGwsHACAAELEBCwgAQf////8HCw0AIAEoAgAgAigCAEkLCABB/////wELDQAgACABED02AgAgAAseACAAELEBIAFJBEBBwQwQtQEACyABQQN0QQQQtgELCQAgAEEEahAWCxoBAX9BCBADIgEgABC3ARogAUGkMEElEAQACwcAIAAQqwULFAAgACABELEFGiAAQYQwNgIAIAALCQAgACABELoBCwkAIABBDGoQQws0AQJ/A0AgACgCCCABRkUEQCAAEKABIQIgACAAKAIIQXhqIgM2AgggAiADED0QkAEMAQsLCwUAQZQNCwwAIABBEGoQbhogAAsFAEGUDQsFAEGsDQsFAEHMDQsFABDBAQsFAEHcDQsFABDEAQs7AQF/IwBBEGsiAyQAIAMgARBDNgIMIAMgAhBDNgIIIANBDGogA0EIaiAAEQIAED0hACADQRBqJAAgAAsFAEHgDQsEAEEFCwUAEMoBCwUAQaQOC2QBAn8jAEEQayIFJAAgARA9IAAoAgQiBkEBdWohASAAKAIAIQAgBkEBcQRAIAEoAgAgAGooAgAhAAsgBSABIAIQPSADED0gBBA9IAARBQAgBRDJASEAIAUQbhogBUEQaiQAIAALDgBBDBCrBSAAED0QywELBQBBkA4LSQECfyAAIAEQahA9EMwBIQIgACABKAIANgIAIAAgASgCBDYCBCABEGgoAgAhAyACEGggAzYCACABEGhBADYCACABQgA3AgAgAAs7AQF/IwBBEGsiAiQAIAAQPRogAEIANwIAIAJBADYCDCAAQQhqIAJBDGogARA9EM0BGiACQRBqJAAgAAsYACAAIAEQPRCFARogACACED0QzgEaIAALCQAgARA9GiAACwUAENQBCwUAQbQOCzcCAX8BfSMAQRBrIgIkACAAKAIAIQAgAiABED0gABEGADgCDCACQQxqENMBIQMgAkEQaiQAIAMLFQEBf0EEEKsFIgEgACgCADYCACABCwcAIAAqAgALBQBBrA4LBQAQ1gELBQBBuA4LBQAQ2AELBQBBxA4LBQAQ2gELBQBB0A4LBQAQ3AELBQBB3A4LBAAQcwujAQEEfyMAQRBrIgMkACAAEN8BIQUgAEEMahDgASEGIAAgAjYCICAAQQA6ACQgBSACEOEBIAYgACgCIBDiASAAKAIgQQFOBEBBACECA0BBHBCrBSIEQQAgARBbGiADIAQ2AgwgBSADQQxqEOMBQSgQqwUiBCABEBQaIAMgBDYCCCAGIANBCGoQ5AEgAkEBaiICIAAoAiBIDQALCyADQRBqJAAgAAsKACAAEOUBGiAACwoAIAAQ5gEaIAALRAECfyMAQSBrIgIkACAAEOcBIAFJBEAgABDoASEDIAAgAkEIaiABIAAQ6QEgAxDqASIBEOsBIAEQ7AEaCyACQSBqJAALRAECfyMAQSBrIgIkACAAEO0BIAFJBEAgABDuASEDIAAgAkEIaiABIAAQ6QEgAxDvASIBEPABIAEQ8QEaCyACQSBqJAALaQEDfyMAQRBrIgMkAAJAIABBBGoiAigCACAAEPIBKAIASQRAIANBCGogAEEBEGkhBCAAEOgBIAIoAgAQPSABED0Q8wEgBBBsIAIgAigCAEEEajYCAAwBCyAAIAEQPRD0AQsgA0EQaiQAC2kBA38jAEEQayIDJAACQCAAQQRqIgIoAgAgABD1ASgCAEkEQCADQQhqIABBARBpIQQgABDuASACKAIAED0gARA9EPYBIAQQbCACIAIoAgBBBGo2AgAMAQsgACABED0Q9wELIANBEGokAAs3AQF/IwBBEGsiASQAIAAQPRogAEIANwIAIAFBADYCDCAAQQhqIAFBDGoQsQIaIAFBEGokACAACzcBAX8jAEEQayIBJAAgABA9GiAAQgA3AgAgAUEANgIMIABBCGogAUEMahCyAhogAUEQaiQAIAALBwAgABC0AgsJACAAQQhqEEMLEAAgACgCBCAAKAIAa0ECdQtvAQJ/IwBBEGsiBSQAQQAhBCAFQQA2AgwgAEEMaiAFQQxqIAMQvgIaIAEEQCAAEL8CIAEQwAIhBAsgACAENgIAIAAgBCACQQJ0aiICNgIIIAAgAjYCBCAAEMECIAQgAUECdGo2AgAgBUEQaiQAIAALXQECfyAAEPwBIAAQ6AEgACgCACAAQQRqIgIoAgAgAUEEaiIDEKMBIAAgAxCkASACIAFBCGoQpAEgABDyASABEMECEKQBIAEgASgCBDYCACAAIAAQ6QEQwgIgABBsCyMAIAAQwwIgACgCAARAIAAQvwIgACgCACAAEMQCEJkCCyAACwcAIAAQugILCQAgAEEIahBDC28BAn8jAEEQayIFJABBACEEIAVBADYCDCAAQQxqIAVBDGogAxDKAhogAQRAIAAQywIgARDMAiEECyAAIAQ2AgAgACAEIAJBAnRqIgI2AgggACACNgIEIAAQzQIgBCABQQJ0ajYCACAFQRBqJAAgAAtdAQJ/IAAQ+QEgABDuASAAKAIAIABBBGoiAigCACABQQRqIgMQowEgACADEKQBIAIgAUEIahCkASAAEPUBIAEQzQIQpAEgASABKAIENgIAIAAgABDpARDOAiAAEGwLIwAgABDPAiAAKAIABEAgABDLAiAAKAIAIAAQ0AIQmQILIAALCQAgAEEIahBDCw0AIAAgASACED0Q1AILXwECfyMAQSBrIgMkACAAEOgBIgIgA0EIaiAAIAAQ6QFBAWoQ1QIgABDpASACEOoBIgIoAggQPSABED0Q8wEgAiACKAIIQQRqNgIIIAAgAhDrASACEOwBGiADQSBqJAALCQAgAEEIahBDCw0AIAAgASACED0Q2wILXwECfyMAQSBrIgMkACAAEO4BIgIgA0EIaiAAIAAQ6QFBAWoQ3AIgABDpASACEO8BIgIoAggQPSABED0Q9gEgAiACKAIIQQRqNgIIIAAgAhDwASACEPEBGiADQSBqJAALDwAgABD5ASAAEPoBGiAACzYAIAAgABCHASAAEIcBIAAQ7QFBAnRqIAAQhwEgABDpAUECdGogABCHASAAEO0BQQJ0ahCJAQsjACAAKAIABEAgABC5AiAAEO4BIAAoAgAgABC6AhCZAgsgAAsPACAAEPwBIAAQ/QEaIAALNgAgACAAEIcBIAAQhwEgABDnAUECdGogABCHASAAEOkBQQJ0aiAAEIcBIAAQ5wFBAnRqEIkBCyMAIAAoAgAEQCAAELMCIAAQ6AEgACgCACAAELQCEJkCCyAACxoAIAAQ3wEaIABBDGoQ4AEaIABBADoAJCAACxAAIAAgARCAAigCACACEB0LDQAgACgCACABQQJ0ags6AQJ/IAAoAiBBAU4EQCAAQQxqIQNBACECA0AgAyACEIACKAIAIAEQFSACQQFqIgIgACgCIEgNAAsLC+4CAgd/AX0jAEFAaiIDJAAgA0EANgIwIAAgAiADQTBqEIMCIQcgASgCICEAIANBADoAICADQTBqIAAgA0EgahCEAiEFIAEoAiBBAU4EQCABQQxqIQggAkEBSCEJQQAhBANAIAEgBBCAAigCACIAEHIEQCAIIAQQgAIoAgAhBiADQSBqIAAgASgCGCABKAIcIAIQXSAGEBYhACADQRhqIAUgBBCFAiADQRhqIABBAEcQhgIaIANBGGogBSAEEIUCAkAgA0EYahCHAkUNACAGIANBIGoQGhpBACEAIAkNAANAIANBIGogABAcKgIEIQogByAAEIACIgYgCiAGKgIAkjgCACAAQQFqIgAgAkcNAAsLIANBIGoQbhoLIARBAWoiBCABKAIgSA0ACwsgA0EQaiAFEIgCIANBCGogBRCJAiABIANBEGogA0EIakEAEIoCQQBHOgAkIAEgASgCHEEBajYCHCAFEIsCGiADQUBrJAALHwAgABCMAhogAQRAIAAgARCNAiAAIAEgAhCOAgsgAAtPAQF/IwBBEGsiAyQAIAAQPRogAEIANwIAIANBADYCDCAAQQhqIANBDGoQjwIaIAEEQCAAIAEQkAIgACABIAItAAAQkQILIANBEGokACAACwsAIAAgASACEJICCzwBAX8gACgCBCECIAEEQCAAKAIAIgEgASgCACACcjYCACAADwsgACgCACIBIAEoAgAgAkF/c3E2AgAgAAsTACAAKAIEIAAoAgAoAgBxQQBHCwsAIAAgAUEAEJYCCw4AIAAgASABKAIEEJYCC00BAn8jAEEQayIDJAAgACABEJMCBEADQCADQQhqIAAQlAIgA0EIahCHAiEEIAAQlQIaIAIgBGohAiAAIAEQkwINAAsLIANBEGokACACCyUAIAAoAgAEQCAAEJcCIAAoAgAgABCYAigCABCZAgsgABBsIAALNwEBfyMAQRBrIgEkACAAED0aIABCADcCACABQQA2AgwgAEEIaiABQQxqEOACGiABQRBqJAAgAAtEAQF/IAAQ4QIgAUkEQCAAELIFAAsgACAAEOICIAEQ4wIiAjYCACAAIAI2AgQgABDkAiACIAFB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7gEgAkF8aiICED0QvQIMAQsLIAAgATYCBAsJACAAIAEQkQELGwAgACABED0QhQEaIABBBGogAhA9ELIBGiAACwoAIABBDGoQtAELCwAgACABQQAQxQILCQAgAEEMahBDCzMAIAAgABCHASAAEIcBIAAQ5wFBAnRqIAAQhwEgABDnAUECdGogABCHASABQQJ0ahCJAQsMACAAIAAoAgQQxwILEwAgABDIAigCACAAKAIAa0ECdQseACAAEMYCIAFJBEBBsA8QtQEACyABQQJ0QQQQtgELCABB/////wMLCQAgACABEMkCCwkAIABBDGoQQws0AQJ/A0AgACgCCCABRkUEQCAAEL8CIQIgACAAKAIIQXxqIgM2AgggAiADED0QuAIMAQsLCxsAIAAgARA9EIUBGiAAQQRqIAIQPRCyARogAAsKACAAQQxqELQBCwsAIAAgAUEAEMUCCwkAIABBDGoQQwszACAAIAAQhwEgABCHASAAEO0BQQJ0aiAAEIcBIAAQ7QFBAnRqIAAQhwEgAUECdGoQiQELDAAgACAAKAIEENECCxMAIAAQ0gIoAgAgACgCAGtBAnULCQAgACABENMCCwkAIABBDGoQQws0AQJ/A0AgACgCCCABRkUEQCAAEMsCIQIgACAAKAIIQXxqIgM2AgggAiADED0QvQIMAQsLCw0AIAAgASACED0Q1gILXQECfyMAQRBrIgIkACACIAE2AgwgABDXAiIDIAFPBEAgABDnASIAIANBAXZJBEAgAiAAQQF0NgIIIAJBCGogAkEMahCeASgCACEDCyACQRBqJAAgAw8LIAAQsgUACw4AIAEgAhA9KAIANgIACz0BAX8jAEEQayIBJAAgASAAENgCENkCNgIMIAEQqgE2AgggAUEMaiABQQhqEKsBKAIAIQAgAUEQaiQAIAALCQAgAEEIahBDCwcAIAAQ2gILBwAgABDGAgsNACAAIAEgAhA9ENYCC10BAn8jAEEQayICJAAgAiABNgIMIAAQ3QIiAyABTwRAIAAQ7QEiACADQQF2SQRAIAIgAEEBdDYCCCACQQhqIAJBDGoQngEoAgAhAwsgAkEQaiQAIAMPCyAAELIFAAs9AQF/IwBBEGsiASQAIAEgABDeAhDfAjYCDCABEKoBNgIIIAFBDGogAUEIahCrASgCACEAIAFBEGokACAACwkAIABBCGoQQwsHACAAENoCCxQAIAAgARA9EIUBGiAAEIYBGiAACz0BAX8jAEEQayIBJAAgASAAEOkCEOoCNgIMIAEQqgE2AgggAUEMaiABQQhqEKsBKAIAIQAgAUEQaiQAIAALCQAgAEEIahBDCwsAIAAgAUEAEMUCCwkAIABBCGoQQwszACAAIAAQhwEgABCHASAAEOsCQQJ0aiAAEIcBIAAQ6wJBAnRqIAAQhwEgAUECdGoQiQELDQAgACABIAIQPRDtAgsMACAAIAAoAgAQ7gILEwAgABDsAigCACAAKAIAa0ECdQsJACAAQQhqEEMLBwAgABDaAgsHACAAEOgCCwkAIABBCGoQQwsNACAAIAEgAhA9ENYCCzEBAX8gACgCBCECA0AgASACRkUEQCAAEOICIAJBfGoiAhA9EO8CDAELCyAAIAE2AgQLCQAgACABEJEBCxAAIAAgARA9KAIANgIAIAALJwEBfyAAEPUCEPYCIQAQ9wIiAUEGdiAATQRAIAFBAXYPCyAAEPgCCw0AIABBf2pBBXZBAWoLCwAgACABQQAQxQILPgEBfyMAQRBrIgMkAAJAIAFFDQAgAgRAIANBCGogABD6AiABEPsCDAELIAMgABD6AiABEPwCCyADQRBqJAALCQAgAEEIahBDCwcAIAAQ2gILBQAQ+QILBwAgAEEFdAsEAEF/CxgAIAAgASgCADYCACAAIAEoAgQ2AgQgAAvWAQECfyMAQRBrIgIkACACIAE2AgwgACgCBCIBBEAgAkEgIAFrNgIIIAJBCGogAkEMahCrASEDIAAoAgAiASABKAIAQX8gACgCBHRBfyACKAIIIAMoAgAiA2t2cXI2AgAgAiACKAIMIANrNgIMIAAgAUEEajYCAAsgAigCDCEBIAAoAgAQPUH/ASABQQV2QQJ0IgMQyAYaIAIgAigCDCABQWBxayIBNgIMIAEEQCAAIAAoAgAgA2oiAzYCACADIAMoAgBBf0EgIAFrdnI2AgALIAJBEGokAAvbAQECfyMAQRBrIgIkACACIAE2AgwgACgCBCIBBEAgAkEgIAFrNgIIIAJBCGogAkEMahCrASEDIAAoAgAiASABKAIAQX8gACgCBHRBfyACKAIIIAMoAgAiA2t2cUF/c3E2AgAgAiACKAIMIANrNgIMIAAgAUEEajYCAAsgAigCDCEBIAAoAgAQPUEAIAFBBXZBAnQiAxDIBhogAiACKAIMIAFBYHFrIgE2AgwgAQRAIAAgACgCACADaiIDNgIAIAMgAygCAEF/QSAgAWt2QX9zcTYCAAsgAkEQaiQACxIAIAAgAjYCBCAAIAE2AgAgAAsZACAAKAIAIAEoAgBGIAAoAgQgASgCBEZxCwUAQfwPCxMAIABBDGoQ+AEaIAAQ+wEaIAALBQBB/A8LBQBBjBALBQBBqBALBQAQhQMLBQBBuBALBQAQiAMLOwEBfyMAQRBrIgMkACADIAEQQzYCDCADIAIQQzYCCCADQQxqIANBCGogABECABA9IQAgA0EQaiQAIAALBQBBvBALBQAQjAMLXQECfyMAQRBrIgMkACABED0gACgCBCIEQQF1aiEBIAAoAgAhACAEQQFxBEAgASgCACAAaigCACEACyADIAEgAhA9IAARBwAgAxCLAyEAIAMQmgIaIANBEGokACAACw4AQQwQqwUgABA9EI0DCwUAQcgQC00BAn8gACABEOICED0QjgMhAiAAIAEoAgA2AgAgACABKAIENgIEIAEQ5AIoAgAhAyACEOQCIAM2AgAgARDkAkEANgIAIAFCADcCACAACzsBAX8jAEEQayICJAAgABA9GiAAQgA3AgAgAkEANgIMIABBCGogAkEMaiABED0QjwMaIAJBEGokACAACxgAIAAgARA9EIUBGiAAIAIQPRDOARogAAsEAEEECwUAEJQDCwUAQYwSC3cBAn8jAEEgayIEJAAgARA9IAAoAgQiBUEBdWohASAAKAIAIQAgBUEBcQRAIAEoAgAgAGooAgAhAAsgAhA9IQUgBCADED0iAigCEDYCGCAEIAIpAgg3AxAgBCACKQIANwMIIAEgBSAEQQhqIAARBwAgBEEgaiQACwUAQeARCwUAEJgDCwUAQbASC0ABAX8gARA9IAAoAgQiBEEBdWohASAAKAIAIQAgBEEBcQRAIAEoAgAgAGooAgAhAAsgASACED0gAxBOIAARCAALBQBBoBILBQAQmgMLBQBBuBILBQAQnQMLQAEBfyABED0gACgCBCIEQQF1aiEBIAAoAgAhACAEQQFxBEAgASgCACAAaigCACEACyABIAIQPSADED0gABEHAAsFAEHQEgsFABCfAwsFAEHgEgsFABCgAguSAQECfyMAQRBrIgQkACAAQQxqEKIDIQUgAEEYahCjAxogAEEkahCkAxogACADNgIIIAAgAjYCACAAIAE2AgQgBSACEKUDIAAoAgBBAU4EQEEAIQIDQEEoEKsFIgMgASAAKAIIEN4BGiAEIAM2AgwgBSAEQQxqEKYDIAJBAWoiAiAAKAIASA0ACwsgBEEQaiQAIAALCgAgABCnAxogAAsjAQF/IwBBEGsiASQAIAAgAUEIahA9EKgDGiABQRBqJAAgAAsjAQF/IwBBEGsiASQAIAAgAUEIahA9EKkDGiABQRBqJAAgAAtEAQJ/IwBBIGsiAiQAIAAQqgMgAUkEQCAAEKsDIQMgACACQQhqIAEgABDpASADEKwDIgEQrQMgARCuAxoLIAJBIGokAAtpAQN/IwBBEGsiAyQAAkAgAEEEaiICKAIAIAAQrwMoAgBJBEAgA0EIaiAAQQEQaSEEIAAQqwMgAigCABA9IAEQPRCwAyAEEGwgAiACKAIAQQRqNgIADAELIAAgARA9ELEDCyADQRBqJAALNwEBfyMAQRBrIgEkACAAED0aIABCADcCACABQQA2AgwgAEEIaiABQQxqEP8DGiABQRBqJAAgAAtGAQF/IwBBEGsiAiQAIABBBGoQgAQaIAJBADYCDCAAQQhqIAJBDGogARCBBBogABCCBCEBIAAQPSABNgIAIAJBEGokACAAC0YBAX8jAEEQayICJAAgAEEEahCFBBogAkEANgIMIABBCGogAkEMaiABEIYEGiAAEIIEIQEgABA9IAE2AgAgAkEQaiQAIAALBwAgABCIBAsJACAAQQhqEEMLbwECfyMAQRBrIgUkAEEAIQQgBUEANgIMIABBDGogBUEMaiADEIwEGiABBEAgABCNBCABEI4EIQQLIAAgBDYCACAAIAQgAkECdGoiAjYCCCAAIAI2AgQgABCPBCAEIAFBAnRqNgIAIAVBEGokACAAC10BAn8gABC3AyAAEKsDIAAoAgAgAEEEaiICKAIAIAFBBGoiAxCjASAAIAMQpAEgAiABQQhqEKQBIAAQrwMgARCPBBCkASABIAEoAgQ2AgAgACAAEOkBEJAEIAAQbAsjACAAEJEEIAAoAgAEQCAAEI0EIAAoAgAgABCSBBCZAgsgAAsJACAAQQhqEEMLDQAgACABIAIQPRCXBAtfAQJ/IwBBIGsiAyQAIAAQqwMiAiADQQhqIAAgABDpAUEBahCYBCAAEOkBIAIQrAMiAigCCBA9IAEQPRCwAyACIAIoAghBBGo2AgggACACEK0DIAIQrgMaIANBIGokAAsKACAAELMDGiAACw4AIAAgABDzAxD0AyAACwoAIAAQtQMaIAALDgAgACAAEPoDEPsDIAALDwAgABC3AyAAELgDGiAACzYAIAAgABCHASAAEIcBIAAQqgNBAnRqIAAQhwEgABDpAUECdGogABCHASAAEKoDQQJ0ahCJAQsjACAAKAIABEAgABCHBCAAEKsDIAAoAgAgABCIBBCZAgsgAAtVAQF/IwBBEGsiByQAIAcgATYCDCAAQRhqIAdBDGoQugMiASAGOAIQIAEgBTgCDCABIAQ4AgggASADOAIEIAEgAjgCACAAIAcoAgwQuwMgB0EQaiQAC0sBAX8jAEEgayICJAAgAiABELwDNgIQEL0DIAJBGGogACABQagUIAJBEGogAkEIahC+AyACQRhqEL8DED0hASACQSBqJAAgAUEEagu9AQEEfyMAQTBrIgIkACACIAE2AiwgAiAAQQxqIgMQwAM2AiggAiADEMEDNgIgIAJBKGogAkEgahDCAwRAIABBGGohBANAIAJBKGoQFigCACIBLQAkBEAgAigCLCEFIAIgBCACQSxqELoDIgAoAhA2AhggAiAAKQIINwMQIAIgACkCADcDCCABIAUgAkEIahCdAgsgAkEoahDDAxogAiADEMEDNgIgIAJBKGogAkEgahDCAw0ACwsgAkEwaiQACycBAX8jAEEQayIBJAAgAUEIaiAAED0QpAQoAgAhACABQRBqJAAgAAscAQF/IwBBEGsiACQAIABBCGoQPRogAEEQaiQAC40BAQJ/IwBBIGsiBiQAIAEgBkEcaiACEJwEIgcoAgAhAiAGQQA6ABsgAkUEQCAGQQhqIAEgAxA9IAQQPSAFED0QnQQgASAGKAIcIAcgBkEIahCeBBCfBCAGQQhqEKAEIQIgBkEBOgAbIAZBCGoQoQQaCyAAIAZBCGogAhCiBCAGQRtqEKMEGiAGQSBqJAALCwAgABAWQRBqEEMLDAAgACAAKAIAEMQDCwwAIAAgACgCBBDEAwsMACAAIAEQxQNBAXMLEQAgACAAKAIAQQRqNgIAIAALIwAjAEEQayIAJAAgAEEIaiABEKIEKAIAIQEgAEEQaiQAIAELCwAgABAWIAEQFkYLLAEBf0EAIQEgACgCCEEASgRAA0AgACABELsDIAFBAWoiASAAKAIISA0ACwsLLwEBfyAAEMgDIgJBAToAJCACQQA2AhwgAiABNgIYIAAQxgMgABDJAyACQQEQgQILhAEBA38jAEEQayIBJAAgASAAQQxqIgMQwAM2AgggASADEMEDNgIAAkAgAUEIaiABEMIDBEADQCAAIAFBCGoQFigCACICIAItACQiAhshACACQQFHDQIgAUEIahDDAxogASADEMEDNgIAIAFBCGogARDCAw0ACwtBACEACyABQRBqJAAgAAssAQF/QQAhASAAKAIIQQBKBEADQCAAIAEQygMgAUEBaiIBIAAoAghIDQALCwuTAQECfyMAQRBrIgIkACACIAE2AgwgAiAAQQxqIgEQwAM2AgggAiABEMEDNgIAIAJBCGogAhDCAwRAIABBJGohAwNAIAJBCGoQFigCACIALQAkBEAgACACKAIMIAMgAkEMahDOAyoCABD/AQsgAkEIahDDAxogAiABEMEDNgIAIAJBCGogAhDCAw0ACwsgAkEQaiQAC4IBAQJ/IwBBEGsiAiQAIAIgAEEMaiIDEMADNgIIIAIgAxDBAzYCACACQQhqIAIQwgMEQANAAkAgAkEIahAWKAIAIgAoAhggAUcNACAALQAkRQ0AIABBBBCBAgsgAkEIahDDAxogAiADEMEDNgIAIAJBCGogAhDCAw0ACwsgAkEQaiQAC+sBAgN/AX0jAEEgayIDJAAgA0EANgIIIAAgAiADQQhqEIMCIQUgAyABQQxqIgQQwAM2AhggAyAEEMEDNgIIIANBGGogA0EIahDCAwRAA0AgA0EYahAWKAIAIgEtACQEQCADQQhqIAEgAhCCAkEAIQEgAkEASgRAA0AgA0EIaiABEIACKgIAIQYgBSABEIACIgAgBrtEmpmZmZmZuT+iIAAqAgC7oLY4AgAgAUEBaiIBIAJHDQALCyADQQhqEJoCGgsgA0EYahDDAxogAyAEEMEDNgIIIANBGGogA0EIahDCAw0ACwsgA0EgaiQACzcBAX8jAEEQayIDJAAgAyABNgIMIABBJGogA0EMahDOAyACOAIAIAAgAygCDBDKAyADQRBqJAALSwEBfyMAQSBrIgIkACACIAEQvAM2AhAQvQMgAkEYaiAAIAFBqBQgAkEQaiACQQhqEM8DIAJBGGoQ0AMQPSEBIAJBIGokACABQQRqC40BAQJ/IwBBIGsiBiQAIAEgBkEcaiACEMEEIgcoAgAhAiAGQQA6ABsgAkUEQCAGQQhqIAEgAxA9IAQQPSAFED0QwgQgASAGKAIcIAcgBkEIahDDBBDEBCAGQQhqEMUEIQIgBkEBOgAbIAZBCGoQxgQaCyAAIAZBCGogAhCiBCAGQRtqEKMEGiAGQSBqJAALCwAgABAWQRBqEEMLbQEBfyMAQRBrIgMkACADIABBDGoiABDAAzYCCCADIAAQwQM2AgAgA0EIaiADEMIDBEADQCADQQhqEBYoAgAgASACEJ4CIANBCGoQwwMaIAMgABDBAzYCACADQQhqIAMQwgMNAAsLIANBEGokAAttAQF/IwBBEGsiAyQAIAMgAEEMaiIAEMADNgIIIAMgABDBAzYCACADQQhqIAMQwgMEQANAIANBCGoQFigCACABIAIQnwIgA0EIahDDAxogAyAAEMEDNgIAIANBCGogAxDCAw0ACwsgA0EQaiQACwoAQaPjABDUAxoLvwIBA38jAEFAaiIBJAAQJBAlIQIQJSEDENUDENYDENcDECUQKUE4ECsgAhArIANB8BIQLEE5EABBOhDbAyABQQA2AjwgAUE7NgI4IAEgASkDODcDMEH9EiABQTBqENwDIAFBADYCPCABQTw2AjggASABKQM4NwMoQYYTIAFBKGoQ3AMgAUEANgI8IAFBPTYCOCABIAEpAzg3AyBBkBMgAUEgahDdAyABQQA2AjwgAUE+NgI4IAEgASkDODcDGEGbEyABQRhqEN4DIAFBADYCPCABQT82AjggASABKQM4NwMQQacTIAFBEGoQ3wMgAUEANgI8IAFBwAA2AjggASABKQM4NwMIQbYTIAFBCGoQ4AMgAUEANgI8IAFBwQA2AjggASABKQM4NwMAQcUTIAEQ4QNB1hMQ4gMgAUFAayQAIAALBQAQ2AQLBQAQ2QQLBQAQ2gQLBwAgABDWBAsPACAABEAgABDXBBCsBQsLHwBBMBCrBSAAED0oAgAgARA9KAIAIAIQPSgCABChAwsxAQF/IwBBEGsiASQAENUDIAFBCGoQkAMgAUEIahDbBBDcBEHCACAAEAEgAUEQaiQACzwBAX8jAEEQayICJAAgAiABKQIANwMIENUDIAAgAhBFIAIQ3wQQUUHDACACQQhqEElBABACIAJBEGokAAs8AQF/IwBBEGsiAiQAIAIgASkCADcDCBDVAyAAIAIQRSACEOEEEEdBxAAgAkEIahBJQQAQAiACQRBqJAALPgEBfyMAQRBrIgIkACACIAEpAgA3AwgQ1QMgACACEJADIAIQ4wQQlgNBxQAgAkEIahBJQQAQAiACQRBqJAALPgEBfyMAQRBrIgIkACACIAEpAgA3AwgQ1QMgACACEOUEIAIQ5gQQ5wRBxgAgAkEIahBJQQAQAiACQRBqJAALPgEBfyMAQRBrIgIkACACIAEpAgA3AwgQ1QMgACACEJADIAIQ6gQQkgNBxwAgAkEIahBJQQAQAiACQRBqJAALPgEBfyMAQRBrIgIkACACIAEpAgA3AwgQ1QMgACACEJADIAIQ7AQQkgNByAAgAkEIahBJQQAQAiACQRBqJAALwAEBA38jAEEgayIBJAAQJBAlIQIQJSEDEOMDEOQDEOUDECUQKUHJABArIAIQKyADIAAQLEHKABAAQcsAEOkDIAFBADYCHCABQcwANgIYIAEgASkDGDcDEEGgFiABQRBqEOsDIAFBADYCHCABQc0ANgIYIAEgASkDGDcDCEGqFiABQQhqEO0DIAFBADYCHCABQc4ANgIYIAEgASkDGDcDAEGxFiABEO4DQbYWQc8AEPADQboWQdAAEPIDIAFBIGokAAsFABCCBQsFABCDBQsFABCEBQsHACAAEIEFCw8AIAAEQCAAEJoCEKwFCwsKAEEMEKsFEIUFCy8BAX8jAEEQayIBJAAQ4wMgAUEIahA6IAFBCGoQhgUQKUHRACAAEAEgAUEQaiQAC2UBA38jAEEQayIDJAACQCAAQQRqIgIoAgAgABDkAigCAEcEQCADQQhqIABBARBpIQQgABDiAiACKAIAED0gARDmAiAEEGwgAiACKAIAQQRqNgIADAELIAAgARDuBAsgA0EQaiQACzwBAX8jAEEQayICJAAgAiABKQIANwMIEOMDIAAgAhBFIAIQiAUQTEHSACACQQhqEElBABACIAJBEGokAAs2AQF/IAAQ6QEiAyABSQRAIAAgASADayACEO8EDwsgAyABSwRAIAAgACgCACABQQJ0ahDwBAsLPgEBfyMAQRBrIgIkACACIAEpAgA3AwgQ4wMgACACEJADIAIQiwUQlgNB0wAgAkEIahBJQQAQAiACQRBqJAALPAEBfyMAQRBrIgIkACACIAEpAgA3AwgQ4wMgACACED8gAhCOBRBBQdQAIAJBCGoQSUEAEAIgAkEQaiQACyAAIAEQ6QEgAksEQCAAIAEgAhCAAhDxBBoPCyAAEPIEC0ABAX8jAEEQayICJAAgAiABNgIMEOMDIAAgAkEIahBFIAJBCGoQkQUQR0HVACACQQxqENIBQQAQAiACQRBqJAALFwAgAigCACECIAAgARCAAiACNgIAQQELQgEBfyMAQRBrIgIkACACIAE2AgwQ4wMgACACQQhqEJADIAJBCGoQmgUQmwVB1gAgAkEMahDSAUEAEAIgAkEQaiQACwoAIAAQ+AMoAgALNgAgAQRAIAAgASgCABD0AyAAIAEoAgQQ9AMgABD1AyIAIAFBEGoQ9gMQkQEgACABQQEQ9wMLCwkAIABBBGoQQwsIACAAED0QPQsLACAAIAEgAhD5AwsLACAAQQRqEEMQQwsOACABIAJBGGxBBBCTAQsKACAAEPgDKAIACzYAIAEEQCAAIAEoAgAQ+wMgACABKAIEEPsDIAAQ/AMiACABQRBqEPYDEJEBIAAgAUEBEP0DCwsJACAAQQRqEEMLCwAgACABIAIQ/gMLDgAgASACQShsQQQQkwELFAAgACABED0QhQEaIAAQhgEaIAALEAAgABCDBBogABCGARogAAsYACAAIAEQPRDwAhogACACED0QzgEaIAALCwAgAEEEahBDEEMLCgAgABCEBBogAAsLACAAQQA2AgAgAAsQACAAEIMEGiAAEIYBGiAACxgAIAAgARA9EPACGiAAIAIQPRDOARogAAsMACAAIAAoAgAQigQLEwAgABCJBCgCACAAKAIAa0ECdQsJACAAQQhqEEMLMQEBfyAAKAIEIQIDQCABIAJGRQRAIAAQqwMgAkF8aiICED0QiwQMAQsLIAAgATYCBAsJACAAIAEQkQELGwAgACABED0QhQEaIABBBGogAhA9ELIBGiAACwoAIABBDGoQtAELCwAgACABQQAQkwQLCQAgAEEMahBDCzMAIAAgABCHASAAEIcBIAAQqgNBAnRqIAAQhwEgABCqA0ECdGogABCHASABQQJ0ahCJAQsMACAAIAAoAgQQlAQLEwAgABCVBCgCACAAKAIAa0ECdQseACAAEMYCIAFJBEBB5BMQtQEACyABQQJ0QQQQtgELCQAgACABEJYECwkAIABBDGoQQws0AQJ/A0AgACgCCCABRkUEQCAAEI0EIQIgACAAKAIIQXxqIgM2AgggAiADED0QiwQMAQsLCw0AIAAgASACED0Q1gILXQECfyMAQRBrIgIkACACIAE2AgwgABCZBCIDIAFPBEAgABCqAyIAIANBAXZJBEAgAiAAQQF0NgIIIAJBCGogAkEMahCeASgCACEDCyACQRBqJAAgAw8LIAAQsgUACz0BAX8jAEEQayIBJAAgASAAEJoEEJsENgIMIAEQqgE2AgggAUEMaiABQQhqEKsBKAIAIQAgAUEQaiQAIAALCQAgAEEIahBDCwcAIAAQ2gILnAEBA38gABD6AyEDIAAQpQQhBQJAIAMEQAJAA0AgABCmBCACIANBEGoiBBCnBARAIAMoAgBFDQQgAxA9IQUgAygCACEDDAELIAAQpgQgBCACEKgERQ0BIANBBGohBCADKAIEBEAgBBA9IQUgBCgCACEDDAELCyABIAM2AgAgBA8LIAEgAzYCACAFDwsgABCCBCEDCyABIAM2AgAgAwtXAQF/IwBBEGsiBSQAIAEQ/AMiASAAIAFBARCpBCAFQQhqIAFBABCqBBCrBCIBEJ4EQRBqEPYDIAIQPSADED0gBBA9EKwEIAEQrQRBAToABCAFQRBqJAALCQAgABBDKAIAC1sAIAMgATYCCCADQgA3AgAgAiADNgIAIAAQPSgCACgCAARAIAAQPSgCACgCACEDIAAQPSADNgIACyAAEIIEKAIAIAIoAgAQrgQgABCYAiIAIAAoAgBBAWo2AgALGAEBfyAAEEMoAgAhASAAEENBADYCACABCwsAIABBABCvBCAACwsAIAAgATYCACAACxwAIAAgARA9KAIANgIAIAAgAhA9LQAAOgAEIAALDAAgACABEMAEGiAACwkAIAAQ+AMQPQsJACAAQQhqEEMLDQAgACABIAIQPRCwBAsNACAAIAEQPSACELAECwsAIAAgAUEAELEECxIAIAAgAjoABCAAIAE2AgAgAAssAQF/IwBBEGsiAyQAIAMgATYCDCAAIANBDGogAhA9ELIEGiADQRBqJAAgAAsVACAAIAEgAhA9IAMQPSAEED0QswQLBwAgABC0BAuXAgECfyABIAAgAUYiAjoADAJAIAINAANAIAEQuwQtAAwNASABELsEELwEIQIgARC7BCEDAkACfyACBEACQCADELsEKAIEIgJFDQAgAi0ADA0AIAJBDGohAiABELsEIgFBAToADCABELsEDAILIAEQvARFBEAgARC7BCIBEL0ECyABELsEIgFBAToADCABELsEIgFBADoADCABEL4EDwsgAygCCCgCACICRQ0BIAItAAwNASACQQxqIQIgARC7BCIBQQE6AAwgARC7BAsiASAAIAFGOgAMIAJBAToAACAAIAFHDQEMAgsLIAEQvAQEQCABELsEIgEQvgQLIAEQuwQiAUEBOgAMIAEQuwQiAUEAOgAMIAEQvQQLCyUBAX8gABBDKAIAIQIgABBDIAE2AgAgAgRAIAAQtAQgAhC/BAsLDQAgASgCACACKAIASAseACAAELUEIAFJBEBB5BMQtQEACyABQShsQQQQtgELGwAgACABED0Q8AIaIABBBGogAhA9ELYEGiAACxUAIAAgASACED0gAxA9IAQQPRC3BAsJACAAQQRqED0LBwBB5syZMwsQACAAIAEQPSkCADcCACAACx0AIAIQPRogAxA9KAIAIQMgBBA9GiABIAMQuAQaCysBAX8jAEEQayICJAAgAiABNgIIIAAgAkEIaiACELkEIQAgAkEQaiQAIAALLAAgARC6BBA9KAIAIQEgAEIANwIEIAAgATYCACAAQgA3AgwgAEEANgIUIAALBgAgABAWCwcAIAAoAggLDQAgACgCCCgCACAARgtWAQJ/IAAgACgCBCIBKAIAIgI2AgQgAgRAIAIgABBxCyABIAAoAgg2AggCfyAAELwEBEAgACgCCAwBCyAAELsEQQRqCyABNgIAIAEgADYCACAAIAEQcQtWAQJ/IAAgACgCACIBKAIEIgI2AgAgAgRAIAIgABBxCyABIAAoAgg2AggCfyAAELwEBEAgACgCCAwBCyAAELsEQQRqCyABNgIAIAEgADYCBCAAIAEQcQsrACAALQAEBEAgACgCACABQRBqEPYDEJEBCyABBEAgACgCACABQQEQ/QMLCw4AIAAgARA9ELIBGiAAC5wBAQN/IAAQ8wMhAyAAEMcEIQUCQCADBEACQANAIAAQyAQgAiADQRBqIgQQpwQEQCADKAIARQ0EIAMQPSEFIAMoAgAhAwwBCyAAEMgEIAQgAhCoBEUNASADQQRqIQQgAygCBARAIAQQPSEFIAQoAgAhAwwBCwsg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BHRB8B9xIgJBoMMAaisDACIFIAUgACAERAAAAAAAALjCoKEgAkEIckGgwwBqKwMAoSIAoiAAIAAgACAARHRchwOA2FU/okQABPeIq7KDP6CiRKagBNcIa6w/oKJEdcWC/72/zj+gokTvOfr+Qi7mP6CioCABQYB+cUGAAm0QxgYLrgEBAX8CQCABQYAITgRAIABEAAAAAAAA4H+iIQAgAUGBeGoiAkGACEgEQCACIQEMAgsgAEQAAAAAAADgf6IhACABQf0XIAFB/RdIG0GCcGohAQwBCyABQYF4Sg0AIABEAAAAAAAAEACiIQAgAUH+B2oiAkGBeEoEQCACIQEMAQsgAEQAAAAAAAAQAKIhACABQYZoIAFBhmhKG0H8D2ohAQsgACABQf8Haq1CNIa/oguDBAEDfyACQYDAAE8EQCAAIAEgAhARGiAADwsgACACaiEDAkAgACABc0EDcUUEQAJAIAJBAUgEQCAAIQIMAQsgAEEDcUUEQCAAIQIMAQsgACECA0AgAiABLQAAOgAAIAFBAWohASACQQFqIgIgA08NASACQQNxDQALCwJAIANBfHEiBEHAAEkNACACIARBQGoiBUsNAANAIAIgASgCADYCACACIAEoAgQ2AgQgAiABKAIINgIIIAIgASgCDDYCDCACIAEoAhA2AhAgAiABKAIUNgIUIAIgASgCGDYCGCACIAEoAhw2AhwgAiABKAIgNgIgIAIgASgCJDYCJCACIAEoAig2AiggAiABKAIsNgIsIAIgASgCMDYCMCACIAEoAjQ2AjQgAiABKAI4NgI4IAIgASgCPDYCPCABQUBrIQEgAkFAayICIAVNDQALCyACIARPDQEDQCACIAEoAgA2AgAgAUEEaiEBIAJBBGoiAiAESQ0ACwwBCyADQQRJBEAgACECDAELIANBfGoiBCAASQRAIAAhAgwBCyAAIQIDQCACIAEtAAA6AAAgAiABLQABOgABIAIgAS0AAjoAAiACIAEtAAM6AAMgAUEEaiEBIAJBBGoiAiAETQ0ACwsgAiADSQRAA0AgAiABLQAAOgAAIAFBAWohASACQQFqIgIgA0cNAAsLIAAL8wICAn8BfgJAIAJFDQAgACACaiIDQX9qIAE6AAAgACABOgAAIAJBA0kNACADQX5qIAE6AAAgACABOgABIANBfWogAToAACAAIAE6AAIgAkEHSQ0AIANBfGogAToAACAAIAE6AAMgAkEJSQ0AIABBACAAa0EDcSIEaiIDIAFB/wFxQYGChAhsIgE2AgAgAyACIARrQXxxIgRqIgJBfGogATYCACAEQQlJDQAgAyABNgIIIAMgATYCBCACQXhqIAE2AgAgAkF0aiABNgIAIARBGUkNACADIAE2AhggAyABNgIUIAMgATYCECADIAE2AgwgAkFwaiABNgIAIAJBbGogATYCACACQWhqIAE2AgAgAkFkaiABNgIAIAQgA0EEcUEYciIEayICQSBJDQAgAa0iBUIghiAFhCEFIAMgBGohAQNAIAEgBTcDGCABIAU3AxAgASAFNwMIIAEgBTcDACABQSBqIQEgAkFgaiICQR9LDQALCyAACx8AQaDnACgCAEUEQEGk5wAgATYCAEGg5wAgADYCAAsLCAAQywZBAEoLBAAQJQsEACMACxAAIwAgAGtBcHEiACQAIAALBgAgACQACwYAIABAAAsJACABIAARAQALCQAgASAAERAACwcAIAARAAALCwAgASACIAARAgALCwAgASACIAARAwALCwAgASACIAARBAALDQAgASACIAMgABEJAAsNACABIAIgAyAAEQgACw0AIAEgAiADIAARBwALEQAgASACIAMgBCAFIAARBQALCQAgASAAEQYACxEAIAEgAiADIAQgBSAAERgACwsAIAEgAiAAERkACw8AIAEgAiADIAQgABEMAAsPACABIAIgAyAEIAARGgALFQAgASACIAMgBCAFIAYgByAAEQoACw8AIAEgAiADIAQgABEXAAsXACABIAIgAyAEIAUgBiAHIAggABEbAAsPACABIAIgAyAEIAARHAALEwAgASACIAMgBCAFIAYgABENAAsL9VoKAEGACAvOCUFEU1JNb2R1bGF0b3IAbW9kdWxhdGVBbXAAc2V0WEEAc2V0WEQAc2V0WVMAc2V0WFIAc2V0WUEAc2V0U3RhZ2UAZ2V0U3RhZ2UAMTNBRFNSTW9kdWxhdG9yAAAAxBoAAEoEAABQMTNBRFNSTW9kdWxhdG9yAAAAAKQbAABkBAAAAAAAAFwEAABQSzEzQURTUk1vZHVsYXRvcgAAAKQbAACIBAAAAQAAAFwEAABpaQB2AHZpAHgEAAB4BAAALBoAAGlpaQDkGQAAeAQAAHQFAABOU3QzX18yNnZlY3Rvckk1UG9pbnROU185YWxsb2NhdG9ySVMxX0VFRUUATlN0M19fMjEzX192ZWN0b3JfYmFzZUk1UG9pbnROU185YWxsb2NhdG9ySVMxX0VFRUUATlN0M19fMjIwX192ZWN0b3JfYmFzZV9jb21tb25JTGIxRUVFAADEGgAALgUAAEgbAAD7BAAAAAAAAAEAAABUBQAAAAAAAEgbAADQBAAAAAAAAAEAAABcBQAAAAAAAGlpaWkAAAAAzBkAAHgEAABcGgAAdmlpZgAAAADMGQAAeAQAANgFAABOMTNBRFNSTW9kdWxhdG9yMTNFbnZlbG9wZVN0YWdlRQAAAAB4GgAAtAUAAHZpaWkAAAAA2AUAAHgEAABPc2NpbGxhdG9yAG5leHRTYW1wbGUAZnJlcXVlbmN5Q29uc3RhbnQAc2V0TGV2ZWwAc2V0V2F2ZUZvcm0Ac2V0U3RhdHVzAGdldFN0YXR1cwBhbGxvY2F0b3I8VD46OmFsbG9jYXRlKHNpemVfdCBuKSAnbicgZXhjZWVkcyBtYXhpbXVtIHN1cHBvcnRlZCBzaXplADEwT3NjaWxsYXRvcgAAAMQaAACFBgAAUDEwT3NjaWxsYXRvcgAAAKQbAACcBgAAAAAAAJQGAABQSzEwT3NjaWxsYXRvcgAApBsAALwGAAABAAAAlAYAAKwGAACsBgAABAcAACwaAABOMTBPc2NpbGxhdG9yOFdhdmVGb3JtRQB4GgAA7AYAAAAAAAB0BQAArAYAACwaAAAsGgAALBoAAGlpaWlpaQAAXBoAACwaAABmaWkAzBkAAKwGAABcGgAAzBkAAKwGAAAEBwAAzBkAAKwGAADkGQAA5BkAAKwGAABWb2ljZQBuZXh0U2FtcGxlAHNldEVudmVsb3BlAHNldExldmVsAHNldFN0YWdlAHNldFdhdmVGb3JtAGVuYWJsZU9zY2lsbGF0b3IAYWxsb2NhdG9yPFQ+OjphbGxvY2F0ZShzaXplX3QgbikgJ24nIGV4Y2VlZHMgbWF4aW11bSBzdXBwb3J0ZWQgc2l6ZQA1Vm9pY2UAAMQaAAD0BwAAUDVWb2ljZQCkGwAABAgAAAAAAAD8BwAAUEs1Vm9pY2UAAAAApBsAABwIAAABAAAA/AcAAAwIAAAMCAAALBoAACwaAAC8CAAADAgAACwaAABOU3QzX18yNnZlY3RvcklmTlNfOWFsbG9jYXRvcklmRUVFRQBOU3QzX18yMTNfX3ZlY3Rvcl9iYXNlSWZOU185YWxsb2NhdG9ySWZFRUVFAEgbAAB4CAAAAAAAAAEAAABUBQAAAAAAAEgbAABUCAAAAAAAAAEAAACkCABB4BELMcwZAAAMCAAALBoAAAQJAAAxNEVudmVsb3BlUHJlc2V0AAAAAMQaAADwCAAAdmlpaWkAQaASCyLMGQAADAgAACwaAABcGgAAdmlpaWYAAADMGQAADAgAANgFAEHQEguyAswZAAAMCAAALBoAAAQHAADMGQAADAgAACwaAADkGQAAVm9pY2VNYW5hZ2VyAG9uTm90ZU9uAG9uTm90ZU9mZgBuZXh0U2FtcGxlAHVwZGF0ZUxldmVsAHVwZGF0ZUVudmVsb3BlAHVwZGF0ZVdhdmVGb3JtAGVuYWJsZU9zY2lsbGF0b3IAdmVjdG9yPGZsb2F0PgBhbGxvY2F0b3I8VD46OmFsbG9jYXRlKHNpemVfdCBuKSAnbicgZXhjZWVkcyBtYXhpbXVtIHN1cHBvcnRlZCBzaXplAAAxMlZvaWNlTWFuYWdlcgDEGgAAKQoAAFAxMlZvaWNlTWFuYWdlcgCkGwAAQAoAAAAAAAA4CgAAUEsxMlZvaWNlTWFuYWdlcgAAAACkGwAAYAoAAAEAAAA4CgBBkBULhQNQCgAALBoAACwaAAAsGgAAaWlpaWkAAADMGQAAUAoAACwaAAC8CAAAUAoAACwaAADMGQAAUAoAACwaAABcGgAAzBkAAFAKAAAsGgAAXBoAAFwaAABcGgAAXBoAAFwaAAB2aWlpZmZmZmYAAAAAAAAAzBkAAFAKAAAsGgAALBoAAMwZAABQCgAALBoAAOQZAABwdXNoX2JhY2sAcmVzaXplAHNpemUAZ2V0AHNldABQTlN0M19fMjZ2ZWN0b3JJZk5TXzlhbGxvY2F0b3JJZkVFRUUAAKQbAAA+CwAAAAAAALwIAABQS05TdDNfXzI2dmVjdG9ySWZOU185YWxsb2NhdG9ySWZFRUVFAAAApBsAAHQLAAABAAAAvAgAAGQLAADMGQAAZAsAAFwaAAAAAAAAzBkAAGQLAABQGgAAXBoAAFAaAACcCwAA+AsAALwIAABQGgAATjEwZW1zY3JpcHRlbjN2YWxFAADEGgAA5AsAAOQZAAC8CAAAUBoAAFwaAABpaWlpZgBBoBgL1xUDAAAABAAAAAQAAAAGAAAAg/miAERObgD8KRUA0VcnAN009QBi28AAPJmVAEGQQwBjUf4Au96rALdhxQA6biQA0k1CAEkG4AAJ6i4AHJLRAOsd/gApsRwA6D6nAPU1ggBEuy4AnOmEALQmcABBfl8A1pE5AFODOQCc9DkAi1+EACj5vQD4HzsA3v+XAA+YBQARL+8AClqLAG0fbQDPfjYACcsnAEZPtwCeZj8ALepfALondQDl68cAPXvxAPc5BwCSUooA+2vqAB+xXwAIXY0AMANWAHv8RgDwq2sAILzPADb0mgDjqR0AXmGRAAgb5gCFmWUAoBRfAI1AaACA2P8AJ3NNAAYGMQDKVhUAyahzAHviYABrjMAAGcRHAM1nwwAJ6NwAWYMqAIt2xACmHJYARK/dABlX0QClPgUABQf/ADN+PwDCMugAmE/eALt9MgAmPcMAHmvvAJ/4XgA1HzoAf/LKAPGHHQB8kCEAaiR8ANVu+gAwLXcAFTtDALUUxgDDGZ0ArcTCACxNQQAMAF0Ahn1GAONxLQCbxpoAM2IAALTSfAC0p5cAN1XVANc+9gCjEBgATXb8AGSdKgBw16sAY3z4AHqwVwAXFecAwElWADvW2QCnhDgAJCPLANaKdwBaVCMAAB+5APEKGwAZzt8AnzH/AGYeagCZV2EArPtHAH5/2AAiZbcAMuiJAOa/YADvxM0AbDYJAF0/1AAW3tcAWDveAN6bkgDSIigAKIboAOJYTQDGyjIACOMWAOB9ywAXwFAA8x2nABjgWwAuEzQAgxJiAINIAQD1jlsArbB/AB7p8gBISkMAEGfTAKrd2ACuX0IAamHOAAoopADTmbQABqbyAFx3fwCjwoMAYTyIAIpzeACvjFoAb9e9AC2mYwD0v8sAjYHvACbBZwBVykUAytk2ACio0gDCYY0AEsl3AAQmFAASRpsAxFnEAMjFRABNspEAABfzANRDrQApSeUA/dUQAAC+/AAelMwAcM7uABM+9QDs8YAAs+fDAMf4KACTBZQAwXE+AC4JswALRfMAiBKcAKsgewAutZ8AR5LCAHsyLwAMVW0AcqeQAGvnHwAxy5YAeRZKAEF54gD034kA6JSXAOLmhACZMZcAiO1rAF9fNgC7/Q4ASJq0AGekbABxckIAjV0yAJ8VuAC85QkAjTElAPd0OQAwBRwADQwBAEsIaAAs7lgAR6qQAHTnAgC91iQA932mAG5IcgCfFu8AjpSmALSR9gDRU1EAzwryACCYMwD1S34AsmNoAN0+XwBAXQMAhYl/AFVSKQA3ZMAAbdgQADJIMgBbTHUATnHUAEVUbgALCcEAKvVpABRm1QAnB50AXQRQALQ72wDqdsUAh/kXAElrfQAdJ7oAlmkpAMbMrACtFFQAkOJqAIjZiQAsclAABKS+AHcHlADzMHAAAPwnAOpxqABmwkkAZOA9AJfdgwCjP5cAQ5T9AA2GjAAxQd4AkjmdAN1wjAAXt+cACN87ABU3KwBcgKAAWoCTABARkgAP6NgAbICvANv/SwA4kA8AWRh2AGKlFQBhy7sAx4m5ABBAvQDS8gQASXUnAOu29gDbIrsAChSqAIkmLwBkg3YACTszAA6UGgBROqoAHaPCAK/trgBcJhIAbcJNAC16nADAVpcAAz+DAAnw9gArQIwAbTGZADm0BwAMIBUA2MNbAPWSxADGrUsATsqlAKc3zQDmqTYAq5KUAN1CaAAZY94AdozvAGiLUgD82zcArqGrAN8VMQAArqEADPvaAGRNZgDtBbcAKWUwAFdWvwBH/zoAavm5AHW+8wAok98Aq4AwAGaM9gAEyxUA+iIGANnkHQA9s6QAVxuPADbNCQBOQukAE76kADMjtQDwqhoAT2WoANLBpQALPw8AW3jNACP5dgB7iwQAiRdyAMamUwBvbuIA7+sAAJtKWADE2rcAqma6AHbPzwDRAh0AsfEtAIyZwQDDrXcAhkjaAPddoADGgPQArPAvAN3smgA/XLwA0N5tAJDHHwAq27YAoyU6AACvmgCtU5MAtlcEACkttABLgH4A2genAHaqDgB7WaEAFhIqANy3LQD65f0Aidv+AIm+/QDkdmwABqn8AD6AcACFbhUA/Yf/ACg+BwBhZzMAKhiGAE296gCz568Aj21uAJVnOQAxv1sAhNdIADDfFgDHLUMAJWE1AMlwzgAwy7gAv2z9AKQAogAFbOQAWt2gACFvRwBiEtIAuVyEAHBhSQBrVuAAmVIBAFBVNwAe1bcAM/HEABNuXwBdMOQAhS6pAB2ywwChMjYACLekAOqx1AAW9yEAj2nkACf/dwAMA4AAjUAtAE/NoAAgpZkAs6LTAC9dCgC0+UIAEdrLAH2+0ACb28EAqxe9AMqigQAIalwALlUXACcAVQB/FPAA4QeGABQLZACWQY0Ah77eANr9KgBrJbYAe4k0AAXz/gC5v54AaGpPAEoqqABPxFoALfi8ANdamAD0x5UADU2NACA6pgCkV18AFD+xAIA4lQDMIAEAcd2GAMnetgC/YPUATWURAAEHawCMsKwAssDQAFFVSAAe+w4AlXLDAKMGOwDAQDUABtx7AOBFzABOKfoA1srIAOjzQQB8ZN4Am2TYANm+MQCkl8MAd1jUAGnjxQDw2hMAujo8AEYYRgBVdV8A0r31AG6SxgCsLl0ADkTtABw+QgBhxIcAKf3pAOfW8wAifMoAb5E1AAjgxQD/140AbmriALD9xgCTCMEAfF10AGutsgDNbp0APnJ7AMYRagD3z6kAKXPfALXJugC3AFEA4rINAHS6JADlfWAAdNiKAA0VLACBGAwAfmaUAAEpFgCfenYA/f2+AFZF7wDZfjYA7NkTAIu6uQDEl/wAMagnAPFuwwCUxTYA2KhWALSotQDPzA4AEoktAG9XNAAsVokAmc7jANYguQBrXqoAPiqcABFfzAD9C0oA4fT7AI47bQDihiwA6dSEAPy0qQDv7tEALjXJAC85YQA4IUQAG9nIAIH8CgD7SmoALxzYAFO0hABOmYwAVCLMACpV3ADAxtYACxmWABpwuABplWQAJlpgAD9S7gB/EQ8A9LURAPzL9QA0vC0ANLzuAOhdzADdXmAAZ46bAJIz7wDJF7gAYVibAOFXvABRg8YA2D4QAN1xSAAtHN0ArxihACEsRgBZ89cA2XqYAJ5UwABPhvoAVgb8AOV5rgCJIjYAOK0iAGeT3ABV6KoAgiY4AMrnmwBRDaQAmTOxAKnXDgBpBUgAZbLwAH+IpwCITJcA+dE2ACGSswB7gkoAmM8hAECf3ADcR1UA4XQ6AGfrQgD+nd8AXtRfAHtnpAC6rHoAVfaiACuIIwBBulUAWW4IACEqhgA5R4MAiePmAOWe1ABJ+0AA/1bpABwPygDFWYoAlPorANPBxQAPxc8A21quAEfFhgCFQ2IAIYY7ACx5lAAQYYcAKkx7AIAsGgBDvxIAiCaQAHg8iQCoxOQA5dt7AMQ6wgAm9OoA92eKAA2SvwBloysAPZOxAL18CwCkUdwAJ91jAGnh3QCalBkAqCmVAGjOKAAJ7bQARJ8gAE6YygBwgmMAfnwjAA+5MgCn9Y4AFFbnACHxCAC1nSoAb35NAKUZUQC1+asAgt/WAJbdYQAWNgIAxDqfAIOioQBy7W0AOY16AIK4qQBrMlwARidbAAA07QDSAHcA/PRVAAFZTQDgcYAAQYMuC01A+yH5PwAAAAAtRHQ+AAAAgJhG+DwAAABgUcx4OwAAAICDG/A5AAAAQCAlejgAAACAIoLjNgAAAAAd82k1AAAAAAAA8D8AAAAAAAD4PwBB2C4LCAbQz0Pr/Uw+AEHrLgu9JEADuOI/AACAPwAAwD8AAAAA3M/RNQAAAAAAwBU/dmVjdG9yAHN0ZDo6ZXhjZXB0aW9uAAAAAAAAAMQXAABXAAAAWAAAAFkAAABTdDlleGNlcHRpb24AAAAAxBoAALQXAAAAAAAA8BcAACUAAABaAAAAWwAAAFN0MTFsb2dpY19lcnJvcgDsGgAA4BcAAMQXAAAAAAAAJBgAACUAAABcAAAAWwAAAFN0MTJsZW5ndGhfZXJyb3IAAAAA7BoAABAYAADwFwAAU3Q5dHlwZV9pbmZvAAAAAMQaAAAwGAAATjEwX19jeHhhYml2MTE2X19zaGltX3R5cGVfaW5mb0UAAAAA7BoAAEgYAABAGAAATjEwX19jeHhhYml2MTE3X19jbGFzc190eXBlX2luZm9FAAAA7BoAAHgYAABsGAAATjEwX19jeHhhYml2MTE3X19wYmFzZV90eXBlX2luZm9FAAAA7BoAAKgYAABsGAAATjEwX19jeHhhYml2MTE5X19wb2ludGVyX3R5cGVfaW5mb0UA7BoAANgYAADMGAAATjEwX19jeHhhYml2MTIwX19mdW5jdGlvbl90eXBlX2luZm9FAAAAAOwaAAAIGQAAbBgAAE4xMF9fY3h4YWJpdjEyOV9fcG9pbnRlcl90b19tZW1iZXJfdHlwZV9pbmZvRQAAAOwaAAA8GQAAzBgAAAAAAAC8GQAAXQAAAF4AAABfAAAAYAAAAGEAAABOMTBfX2N4eGFiaXYxMjNfX2Z1bmRhbWVudGFsX3R5cGVfaW5mb0UA7BoAAJQZAABsGAAAdgAAAIAZAADIGQAARG4AAIAZAADUGQAAYgAAAIAZAADgGQAAYwAAAIAZAADsGQAAaAAAAIAZAAD4GQAAYQAAAIAZAAAEGgAAcwAAAIAZAAAQGgAAdAAAAIAZAAAcGgAAaQAAAIAZAAAoGgAAagAAAIAZAAA0GgAAbAAAAIAZAABAGgAAbQAAAIAZAABMGgAAZgAAAIAZAABYGgAAZAAAAIAZAABkGgAAAAAAALAaAABdAAAAYgAAAF8AAABgAAAAYwAAAE4xMF9fY3h4YWJpdjExNl9fZW51bV90eXBlX2luZm9FAAAAAOwaAACMGgAAbBgAAAAAAACcGAAAXQAAAGQAAABfAAAAYAAAAGUAAABmAAAAZwAAAGgAAAAAAAAANBsAAF0AAABpAAAAXwAAAGAAAABlAAAAagAAAGsAAABsAAAATjEwX19jeHhhYml2MTIwX19zaV9jbGFzc190eXBlX2luZm9FAAAAAOwaAAAMGwAAnBgAAAAAAACQGwAAXQAAAG0AAABfAAAAYAAAAGUAAABuAAAAbwAAAHAAAABOMTBfX2N4eGFiaXYxMjFfX3ZtaV9jbGFzc190eXBlX2luZm9FAAAA7BoAAGgbAACcGAAAAAAAAPwYAABdAAAAcQAAAF8AAABgAAAAcgAAAHZvaWQAYm9vbABjaGFyAHNpZ25lZCBjaGFyAHVuc2lnbmVkIGNoYXIAc2hvcnQAdW5zaWduZWQgc2hvcnQAaW50AHVuc2lnbmVkIGludABsb25nAHVuc2lnbmVkIGxvbmcAZmxvYXQAZG91YmxlAHN0ZDo6c3RyaW5nAHN0ZDo6YmFzaWNfc3RyaW5nPHVuc2lnbmVkIGNoYXI+AHN0ZDo6d3N0cmluZwBlbXNjcmlwdGVuOjp2YWwAZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8Y2hhcj4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8c2lnbmVkIGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGNoYXI+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHNob3J0PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBzaG9ydD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzx1bnNpZ25lZCBpbnQ+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGxvbmc+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVuc2lnbmVkIGxvbmc+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDhfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8aW50MTZfdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8dWludDE2X3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PGludDMyX3Q+AGVtc2NyaXB0ZW46Om1lbW9yeV92aWV3PHVpbnQzMl90PgBlbXNjcmlwdGVuOjptZW1vcnlfdmlldzxmbG9hdD4AZW1zY3JpcHRlbjo6bWVtb3J5X3ZpZXc8ZG91YmxlPgBOU3QzX18yMTJiYXNpY19zdHJpbmdJY05TXzExY2hhcl90cmFpdHNJY0VFTlNfOWFsbG9jYXRvckljRUVFRQBOU3QzX18yMjFfX2Jhc2ljX3N0cmluZ19jb21tb25JTGIxRUVFAAAAAMQaAADvHgAASBsAALAeAAAAAAAAAQAAABgfAAAAAAAATlN0M19fMjEyYmFzaWNfc3RyaW5nSWhOU18xMWNoYXJfdHJhaXRzSWhFRU5TXzlhbGxvY2F0b3JJaEVFRUUAAEgbAAA4HwAAAAAAAAEAAAAYHwAAAAAAAE5TdDNfXzIxMmJhc2ljX3N0cmluZ0l3TlNfMTFjaGFyX3RyYWl0c0l3RUVOU185YWxsb2NhdG9ySXdFRUVFAABIGwAAkB8AAAAAAAABAAAAGB8AAAAAAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0ljRUUAAMQaAADoHwAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJYUVFAADEGgAAECAAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWhFRQAAxBoAADggAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lzRUUAAMQaAABgIAAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJdEVFAADEGgAAiCAAAE4xMGVtc2NyaXB0ZW4xMW1lbW9yeV92aWV3SWlFRQAAxBoAALAgAABOMTBlbXNjcmlwdGVuMTFtZW1vcnlfdmlld0lqRUUAAMQaAADYIAAATjEwZW1zY3JpcHRlbjExbWVtb3J5X3ZpZXdJbEVFAADEGgAAACEAAE4xMGVt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';
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




// STATICTOP = STATIC_BASE + 12368;
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
      return 13232;
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
if (typeof exports === 'object' && typeof module === 'object')
      module.exports = Module;
    else if (typeof define === 'function' && define['amd'])
      define([], function() { return Module; });
    else if (typeof exports === 'object')
      exports["Module"] = Module;
    //@format

class SynthWorklet extends AudioWorkletProcessor {
  constructor() {
    super();
    this.kernel = Module();
    const numOfVoices = 64;
    const numOfOscillators = 4;
    this.voiceManager = new this.kernel.VoiceManager(
      sampleRate,
      numOfVoices,
      numOfOscillators
    );

    this.port.onmessage = this.handleEvents.bind(this);
    console.log("Worklet launched successfully");
  }

  handleEvents({ data }) {
    if (data.name === "NoteOn") {
      this.voiceManager.onNoteOn(data.key);
    } else if (data.name === "NoteOff") {
      this.voiceManager.onNoteOff(data.key);
    } else if (data.name === "Envelope") {
      const { index, xa, xd, ys, xr, ya } = data.values;
      this.voiceManager.updateEnvelope(index, xa, xd, ys, xr, ya);
    } else if (data.name === "Level") {
      const { index, value } = data.values;
      this.voiceManager.updateLevel(index, value);
    } else if (data.name === "WaveForm") {
      const { index, value } = data.values;
      this.voiceManager.updateWaveForm(index, value);
    } else if (data.name === "Enable") {
      const { index, value } = data.values;
      this.voiceManager.enableOscillator(index, value);
    }
  }

  process(inputs, outputs, parameters) {
    // NOTE: We only use a single channel to generate our sounds, will be up-mixed to stereo.
    const outputChannel = outputs[0][0];
    const sample = this.voiceManager.nextSample(outputChannel.length);
    for (let i = 0; i < sample.size(); i++) {
      outputChannel[i] = sample.get(i);
    }
    return true;
  }
}

registerProcessor("SynthWorklet", SynthWorklet);
