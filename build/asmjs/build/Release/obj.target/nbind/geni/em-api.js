!function(e){function t(e){Object.defineProperty(this,e,{enumerable:!0,get:function(){return this[v][e]}})}function r(e){if("undefined"!=typeof System&&System.isModule?System.isModule(e):"[object Module]"===Object.prototype.toString.call(e))return e;var t={default:e,__useDefault:e};if(e&&e.__esModule)for(var r in e)Object.hasOwnProperty.call(e,r)&&(t[r]=e[r]);return new o(t)}function o(e){Object.defineProperty(this,v,{value:e}),Object.keys(e).forEach(t,this)}function n(e){return"@node/"===e.substr(0,6)?c(e,r(m(e.substr(6))),{}):p[e]}function u(e){var t=n(e);if(!t)throw new Error('Module "'+e+'" expected, but not contained in build.');if(t.module)return t.module;var r=t.linkRecord;return i(t,r),a(t,r,[]),t.module}function i(e,t){if(!t.depLoads){t.declare&&d(e,t),t.depLoads=[];for(var r=0;r<t.deps.length;r++){var o=n(t.deps[r]);t.depLoads.push(o),o.linkRecord&&i(o,o.linkRecord);var u=t.setters&&t.setters[r];u&&(u(o.module||o.linkRecord.moduleObj),o.importerSetters.push(u))}return e}}function d(t,r){var o=r.moduleObj,n=t.importerSetters,u=!1,i=r.declare.call(e,function(e,t){if(!u){if("object"==typeof e)for(var r in e)"__useDefault"!==r&&(o[r]=e[r]);else o[e]=t;u=!0;for(var i=0;i<n.length;i++)n[i](o);return u=!1,t}},{id:t.key});"function"!=typeof i?(r.setters=i.setters,r.execute=i.execute):(r.setters=[],r.execute=i)}function l(e,t,r){return p[e]={key:e,module:void 0,importerSetters:[],linkRecord:{deps:t,depLoads:void 0,declare:r,setters:void 0,execute:void 0,moduleObj:{}}}}function f(e,t,r,o){var n={};return p[e]={key:e,module:void 0,importerSetters:[],linkRecord:{deps:t,depLoads:void 0,declare:void 0,execute:o,executingRequire:r,moduleObj:{default:n,__useDefault:n},setters:void 0}}}function s(e,t,r){return function(o){for(var n=0;n<e.length;n++)if(e[n]===o){var u,i=t[n],d=i.linkRecord;return u=d?-1===r.indexOf(i)?a(i,d,r):d.moduleObj:i.module,"__useDefault"in u?u.__useDefault:u}}}function a(t,r,n){if(n.push(t),t.module)return t.module;var u;if(r.setters){for(var i=0;i<r.deps.length;i++){var d=r.depLoads[i],l=d.linkRecord;l&&-1===n.indexOf(d)&&(u=a(d,l,l.setters?n:[]))}r.execute.call(y)}else{var f={id:t.key},c=r.moduleObj;Object.defineProperty(f,"exports",{configurable:!0,set:function(e){c.default=c.__useDefault=e},get:function(){return c.__useDefault}});var p=s(r.deps,r.depLoads,n);if(!r.executingRequire)for(var i=0;i<r.deps.length;i++)p(r.deps[i]);var v=r.execute.call(e,p,c.__useDefault,f);void 0!==v?c.default=c.__useDefault=v:f.exports!==c.__useDefault&&(c.default=c.__useDefault=f.exports);var m=c.__useDefault;if(m&&m.__esModule)for(var b in m)Object.hasOwnProperty.call(m,b)&&(c[b]=m[b])}var f=t.module=new o(r.moduleObj);if(!r.setters)for(var i=0;i<t.importerSetters.length;i++)t.importerSetters[i](f);return f}function c(e,t){return p[e]={key:e,module:t,importerSetters:[],linkRecord:void 0}}var p={},v="undefined"!=typeof Symbol?Symbol():"@@baseObject";o.prototype=Object.create(null),"undefined"!=typeof Symbol&&Symbol.toStringTag&&(o.prototype[Symbol.toStringTag]="Module");var m="undefined"!=typeof System&&System._nodeRequire||"undefined"!=typeof require&&"undefined"!=typeof require.resolve&&"undefined"!=typeof process&&process.platform&&require,y={};return Object.freeze&&Object.freeze(y),function(e,t,n,i){return function(d){d(function(d){var s={_nodeRequire:m,register:l,registerDynamic:f,registry:{get:function(e){return p[e].module},set:c},newModule:function(e){return new o(e)}};c("@empty",new o({}));for(var a=0;a<t.length;a++)c(t[a],r(arguments[a],{}));i(s);var v=u(e[0]);if(e.length>1)for(var a=1;a<e.length;a++)u(e[a]);return n?v.__useDefault:(v instanceof o&&Object.defineProperty(v,"__esModule",{value:!0}),v)})}}}("undefined"!=typeof self?self:"undefined"!=typeof global?global:this)

(["a"], [], true, function($__System) {
var require = this.require, exports = this.exports, module = this.module;
$__System.registerDynamic("b", ["e", "c", "d"], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
    // Released under the MIT license, see LICENSE.
    var __extends = exports && exports.__extends || function () {
        var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
            d.__proto__ = b;
        } || function (d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    }();
    var __decorate = exports && exports.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var emscripten_library_decorator_1 = $__require("e");
    var BindingType_1 = $__require("c");
    var Wrapper_1 = $__require("d");
    // Let decorators run eval in current scope to read function source code.
    emscripten_library_decorator_1.setEvil(function (code) {
        return eval(code);
    });
    var _nbind;
    (function (_nbind) {
        _nbind.BindType = BindingType_1._nbind.BindType;
        _nbind.Wrapper = Wrapper_1._nbind.Wrapper;
    })(_nbind = exports._nbind || (exports._nbind = {}));
    (function (_nbind) {
        _nbind.ptrMarker = {};
        // Base class for all bound C++ classes (not their instances),
        // also inheriting from a generic type definition.
        var BindClass = function (_super) {
            __extends(BindClass, _super);
            function BindClass(spec) {
                var _this = _super.call(this, spec) || this;
                _this.wireRead = function (arg) {
                    return _nbind.popValue(arg, _this.ptrType);
                };
                _this.wireWrite = function (arg) {
                    return pushPointer(arg, _this.ptrType, true);
                };
                /** Number of super classes left to initialize. */
                _this.pendingSuperCount = 0;
                _this.ready = false;
                _this.methodTbl = {};
                if (spec.paramList) {
                    _this.classType = spec.paramList[0].classType;
                    _this.proto = _this.classType.proto;
                } else _this.classType = _this;
                return _this;
            }
            BindClass.prototype.makeBound = function (policyTbl) {
                var Bound = _nbind.makeBound(policyTbl, this);
                this.proto = Bound;
                this.ptrType.proto = Bound;
                return Bound;
            };
            BindClass.prototype.addMethod = function (spec) {
                var overloadList = this.methodTbl[spec.name] || [];
                overloadList.push(spec);
                this.methodTbl[spec.name] = overloadList;
            };
            BindClass.prototype.registerMethods = function (src, staticOnly) {
                var setter;
                for (var _i = 0, _a = Object.keys(src.methodTbl); _i < _a.length; _i++) {
                    var name = _a[_i];
                    var overloadList = src.methodTbl[name];
                    for (var _b = 0, overloadList_1 = overloadList; _b < overloadList_1.length; _b++) {
                        var spec = overloadList_1[_b];
                        var target = void 0;
                        var caller = void 0;
                        target = this.proto.prototype;
                        if (staticOnly && spec.signatureType != 1 /* func */) continue;
                        switch (spec.signatureType) {
                            case 1 /* func */:
                                target = this.proto;
                            // tslint:disable-next-line:no-switch-case-fall-through
                            case 5 /* construct */:
                                caller = _nbind.makeCaller(spec);
                                _nbind.addMethod(target, spec.name, caller, spec.typeList.length - 1);
                                break;
                            case 4 /* setter */:
                                setter = _nbind.makeMethodCaller(src.ptrType, spec);
                                break;
                            case 3 /* getter */:
                                Object.defineProperty(target, spec.name, {
                                    configurable: true,
                                    enumerable: false,
                                    get: _nbind.makeMethodCaller(src.ptrType, spec),
                                    set: setter
                                });
                                break;
                            case 2 /* method */:
                                caller = _nbind.makeMethodCaller(src.ptrType, spec);
                                _nbind.addMethod(target, spec.name, caller, spec.typeList.length - 1);
                                break;
                            default:
                                break;
                        }
                    }
                }
            };
            BindClass.prototype.registerSuperMethods = function (src, firstSuper, visitTbl) {
                if (visitTbl[src.name]) return;
                visitTbl[src.name] = true;
                var superNum = 0;
                var nextFirst;
                for (var _i = 0, _a = src.superIdList || []; _i < _a.length; _i++) {
                    var superId = _a[_i];
                    var superClass = _nbind.getType(superId);
                    if (superNum++ < firstSuper || firstSuper < 0) {
                        nextFirst = -1;
                    } else {
                        nextFirst = 0;
                    }
                    this.registerSuperMethods(superClass, nextFirst, visitTbl);
                }
                this.registerMethods(src, firstSuper < 0);
            };
            BindClass.prototype.finish = function () {
                if (this.ready) return this;
                this.ready = true;
                this.superList = (this.superIdList || []).map(function (superId) {
                    return _nbind.getType(superId).finish();
                });
                var Bound = this.proto;
                if (this.superList.length) {
                    var Proto = function () {
                        this.constructor = Bound;
                    };
                    Proto.prototype = this.superList[0].proto.prototype;
                    Bound.prototype = new Proto();
                }
                if (Bound != Module) Bound.prototype.__nbindType = this;
                this.registerSuperMethods(this, 1, {});
                return this;
            };
            BindClass.prototype.upcastStep = function (dst, ptr) {
                if (dst == this) return ptr;
                for (var i = 0; i < this.superList.length; ++i) {
                    var superPtr = this.superList[i].upcastStep(dst, _nbind.callUpcast(this.upcastList[i], ptr));
                    if (superPtr) return superPtr;
                }
                return 0;
            };
            return BindClass;
        }(_nbind.BindType);
        BindClass.list = [];
        _nbind.BindClass = BindClass;
        function popPointer(ptr, type) {
            return ptr ? new type.proto(_nbind.ptrMarker, type.flags, ptr) : null;
        }
        _nbind.popPointer = popPointer;
        function pushPointer(obj, type, tryValue) {
            if (!(obj instanceof _nbind.Wrapper)) {
                if (tryValue) {
                    return _nbind.pushValue(obj);
                } else throw new Error('Type mismatch');
            }
            var ptr = obj.__nbindPtr;
            var objType = obj.__nbindType.classType;
            var classType = type.classType;
            if (obj instanceof type.proto) {
                // Fast path, requested type is in object's prototype chain.
                while (objType != classType) {
                    ptr = _nbind.callUpcast(objType.upcastList[0], ptr);
                    objType = objType.superList[0];
                }
            } else {
                ptr = objType.upcastStep(classType, ptr);
                if (!ptr) throw new Error('Type mismatch');
            }
            return ptr;
        }
        _nbind.pushPointer = pushPointer;
        function pushMutablePointer(obj, type) {
            var ptr = pushPointer(obj, type);
            if (obj.__nbindFlags & 1 /* isConst */) {
                    throw new Error('Passing a const value as a non-const argument');
                }
            return ptr;
        }
        var BindClassPtr = function (_super) {
            __extends(BindClassPtr, _super);
            function BindClassPtr(spec) {
                var _this = _super.call(this, spec) || this;
                _this.classType = spec.paramList[0].classType;
                _this.proto = _this.classType.proto;
                var isConst = spec.flags & 1 /* isConst */;
                var isValue = (_this.flags & 896 /* refMask */) == 256 /* isReference */ && spec.flags & 2 /* isValueObject */;
                var push = isConst ? pushPointer : pushMutablePointer;
                var pop = isValue ? _nbind.popValue : popPointer;
                _this.makeWireWrite = function (expr, policyTbl) {
                    return policyTbl['Nullable'] ?
                    // Handle null pointers.
                    function (arg) {
                        return arg ? push(arg, _this) : 0;
                    } : function (arg) {
                        return push(arg, _this);
                    };
                };
                _this.wireRead = function (arg) {
                    return pop(arg, _this);
                };
                _this.wireWrite = function (arg) {
                    return push(arg, _this);
                };
                return _this;
            }
            return BindClassPtr;
        }(_nbind.BindType);
        _nbind.BindClassPtr = BindClassPtr;
        function popShared(ptr, type) {
            var shared = HEAPU32[ptr / 4];
            var unsafe = HEAPU32[ptr / 4 + 1];
            return unsafe ? new type.proto(_nbind.ptrMarker, type.flags, unsafe, shared) : null;
        }
        _nbind.popShared = popShared;
        function pushShared(obj, type) {
            if (!(obj instanceof type.proto)) throw new Error('Type mismatch');
            return obj.__nbindShared;
        }
        function pushMutableShared(obj, type) {
            if (!(obj instanceof type.proto)) throw new Error('Type mismatch');
            if (obj.__nbindFlags & 1 /* isConst */) {
                    throw new Error('Passing a const value as a non-const argument');
                }
            return obj.__nbindShared;
        }
        var SharedClassPtr = function (_super) {
            __extends(SharedClassPtr, _super);
            function SharedClassPtr(spec) {
                var _this = _super.call(this, spec) || this;
                _this.readResources = [_nbind.resources.pool];
                _this.classType = spec.paramList[0].classType;
                _this.proto = _this.classType.proto;
                var isConst = spec.flags & 1 /* isConst */;
                var push = isConst ? pushShared : pushMutableShared;
                _this.wireRead = function (arg) {
                    return popShared(arg, _this);
                };
                _this.wireWrite = function (arg) {
                    return push(arg, _this);
                };
                return _this;
            }
            return SharedClassPtr;
        }(_nbind.BindType);
        _nbind.SharedClassPtr = SharedClassPtr;
        var _ = function () {
            function _() {}
            return _;
        }(); // tslint:disable-line:class-name
        _ = __decorate([emscripten_library_decorator_1.prepareNamespace('_nbind')], _);
        _nbind._ = _;
    })(_nbind = exports._nbind || (exports._nbind = {}));
});
$__System.registerDynamic("f", ["e", "c", "10"], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
    // Released under the MIT license, see LICENSE.
    var __extends = exports && exports.__extends || function () {
        var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
            d.__proto__ = b;
        } || function (d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    }();
    var __decorate = exports && exports.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    // This file handles type conversion of JavaScript callback functions
    // accessible from C++. See also Caller.ts
    var emscripten_library_decorator_1 = $__require("e");
    var BindingType_1 = $__require("c");
    var External_1 = $__require("10");
    // Let decorators run eval in current scope to read function source code.
    emscripten_library_decorator_1.setEvil(function (code) {
        return eval(code);
    });
    var _nbind;
    (function (_nbind) {
        _nbind.BindType = BindingType_1._nbind.BindType;
        _nbind.External = External_1._nbind.External;
    })(_nbind = exports._nbind || (exports._nbind = {}));
    (function (_nbind) {
        // List of invoker functions for all argument and return value combinations
        // seen so far.
        _nbind.callbackSignatureList = [];
        var CallbackType = function (_super) {
            __extends(CallbackType, _super);
            function CallbackType() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.wireWrite = function (func) {
                    if (typeof func != 'function') _nbind.throwError('Type mismatch');
                    return new _nbind.External(func).register();
                };
                return _this;
                // Optional type conversion code
                // makeWireWrite = (expr: string) => '_nbind.registerCallback(' + expr + ')';
            }
            return CallbackType;
        }(_nbind.BindType);
        _nbind.CallbackType = CallbackType;
        var _ = function () {
            function _() {}
            return _;
        }(); // tslint:disable-line:class-name
        _ = __decorate([emscripten_library_decorator_1.prepareNamespace('_nbind')], _);
        _nbind._ = _;
    })(_nbind = exports._nbind || (exports._nbind = {}));
    var nbind = function () {
        function nbind() {}
        nbind._nbind_register_callback_signature = function (typeListPtr, typeCount) {
            var typeList = _nbind.readTypeIdList(typeListPtr, typeCount);
            var num = _nbind.callbackSignatureList.length;
            _nbind.callbackSignatureList[num] = _nbind.makeJSCaller(typeList);
            return num;
        };
        return nbind;
    }();
    __decorate([emscripten_library_decorator_1.dep('_nbind')], nbind, "_nbind_register_callback_signature", null);
    nbind = __decorate([emscripten_library_decorator_1.exportLibrary], nbind);
});
$__System.registerDynamic("11", ["e", "c"], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
    // Released under the MIT license, see LICENSE.
    var __extends = exports && exports.__extends || function () {
        var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
            d.__proto__ = b;
        } || function (d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    }();
    var __decorate = exports && exports.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    // This file handles value objects, which are represented by equivalent C++ and
    // JavaScript classes, with toJS and fromJS methods calling each others'
    // constructors to marshal the class between languages and providing a similar
    // API in both.
    var emscripten_library_decorator_1 = $__require("e");
    var BindingType_1 = $__require("c");
    // Let decorators run eval in current scope to read function source code.
    emscripten_library_decorator_1.setEvil(function (code) {
        return eval(code);
    });
    var _defineHidden = emscripten_library_decorator_1.defineHidden;
    var _nbind;
    (function (_nbind) {
        _nbind.BindType = BindingType_1._nbind.BindType;
    })(_nbind = exports._nbind || (exports._nbind = {}));
    (function (_nbind) {
        /** Storage for value objects. Slot 0 is reserved to represent errors. */
        _nbind.valueList = [0];
        /** Value object storage slot free list head. */
        var firstFreeValue = 0;
        function pushValue(value) {
            var num = firstFreeValue;
            if (num) {
                firstFreeValue = _nbind.valueList[num];
            } else num = _nbind.valueList.length;
            _nbind.valueList[num] = value;
            return num * 2 + 1;
        }
        _nbind.pushValue = pushValue;
        function popValue(num, type) {
            if (!num) _nbind.throwError('Value type JavaScript class is missing or not registered');
            if (num & 1) {
                num >>= 1;
                var obj = _nbind.valueList[num];
                _nbind.valueList[num] = firstFreeValue;
                firstFreeValue = num;
                return obj;
            } else if (type) {
                return _nbind.popShared(num, type);
            } else throw new Error('Invalid value slot ' + num);
        }
        _nbind.popValue = popValue;
        // 2^64, first integer not representable with uint64_t.
        // Start of range used for other flags.
        var valueBase = 18446744073709551616.0;
        function push64(num) {
            if (typeof num == 'number') return num;
            return pushValue(num) * 4096 + valueBase;
        }
        function pop64(num) {
            if (num < valueBase) return num;
            return popValue((num - valueBase) / 4096);
        }
        // Special type that constructs a new object.
        var CreateValueType = function (_super) {
            __extends(CreateValueType, _super);
            function CreateValueType() {
                return _super !== null && _super.apply(this, arguments) || this;
            }
            CreateValueType.prototype.makeWireWrite = function (expr) {
                return '(_nbind.pushValue(new ' + expr + '))';
            };
            return CreateValueType;
        }(_nbind.BindType);
        _nbind.CreateValueType = CreateValueType;
        var Int64Type = function (_super) {
            __extends(Int64Type, _super);
            function Int64Type() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.wireWrite = push64;
                _this.wireRead = pop64;
                return _this;
            }
            return Int64Type;
        }(_nbind.BindType);
        _nbind.Int64Type = Int64Type;
        var _ = function () {
            function _() {}
            return _;
        }(); // tslint:disable-line:class-name
        _ = __decorate([emscripten_library_decorator_1.prepareNamespace('_nbind')], _);
        _nbind._ = _;
    })(_nbind = exports._nbind || (exports._nbind = {}));
    var nbind = function () {
        function nbind() {}
        // Initialize a C++ object based on a JavaScript object's contents.
        nbind._nbind_get_value_object = function (num, ptr) {
            var obj = _nbind.popValue(num);
            if (!obj.fromJS) {
                throw new Error('Object ' + obj + ' has no fromJS function');
            }
            obj.fromJS(function () {
                obj.__nbindValueConstructor.apply(this, Array.prototype.concat.apply([ptr], arguments));
            });
        };
        nbind._nbind_get_int_64 = function (num, ptr) {
            var obj = _nbind.popValue(num);
            obj.fromJS(function (lo, hi, sign) {
                if (sign) {
                    lo = ~lo;
                    hi = ~hi;
                    if (!++lo) ++hi;
                }
                ptr >>= 2;
                if (_nbind.bigEndian) {
                    // Emscripten itself might not work on big endian,
                    // but we support it here anyway.
                    HEAP32[ptr] = hi;
                    HEAP32[ptr + 1] = lo;
                } else {
                    HEAP32[ptr] = lo;
                    HEAP32[ptr + 1] = hi;
                }
            });
        };
        nbind.nbind_value = function (name, proto) {
            if (!_nbind.typeNameTbl[name]) _nbind.throwError('Unknown value type ' + name);
            Module['NBind'].bind_value(name, proto);
            // Copy value constructor reference from C++ wrapper prototype
            // to equivalent JS prototype.
            _defineHidden(_nbind.typeNameTbl[name].proto.prototype.__nbindValueConstructor)(proto.prototype, '__nbindValueConstructor');
        };
        return nbind;
    }();
    __decorate([emscripten_library_decorator_1.dep('_nbind')], nbind, "_nbind_get_value_object", null);
    __decorate([emscripten_library_decorator_1.dep('_nbind')], nbind, "_nbind_get_int_64", null);
    __decorate([emscripten_library_decorator_1.dep('_nbind')], nbind, "nbind_value", null);
    nbind = __decorate([emscripten_library_decorator_1.exportLibrary], nbind);
});
$__System.registerDynamic("12", ["e", "13", "c"], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
    // Released under the MIT license, see LICENSE.
    var __extends = exports && exports.__extends || function () {
        var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
            d.__proto__ = b;
        } || function (d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    }();
    var __decorate = exports && exports.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    // This file handles type conversion of C++ standard library types
    // to / from JavaScript.
    var emscripten_library_decorator_1 = $__require("e");
    var Globals_1 = $__require("13");
    var BindingType_1 = $__require("c");
    // Let decorators run eval in current scope to read function source code.
    emscripten_library_decorator_1.setEvil(function (code) {
        return eval(code);
    });
    var _nbind;
    (function (_nbind) {
        _nbind.Pool = Globals_1._nbind.Pool;
        _nbind.BindType = BindingType_1._nbind.BindType;
    })(_nbind = exports._nbind || (exports._nbind = {}));
    (function (_nbind) {
        function pushArray(arr, type) {
            if (!arr) return 0;
            var length = arr.length;
            if ((type.size || type.size === 0) && length < type.size) {
                throw new Error('Type mismatch');
            }
            var ptrSize = type.memberType.ptrSize;
            var result = _nbind.Pool.lalloc(4 + length * ptrSize);
            HEAPU32[result / 4] = length;
            var heap = type.memberType.heap;
            var ptr = (result + 4) / ptrSize;
            var wireWrite = type.memberType.wireWrite;
            var num = 0;
            if (wireWrite) {
                while (num < length) {
                    heap[ptr++] = wireWrite(arr[num++]);
                }
            } else {
                while (num < length) {
                    heap[ptr++] = arr[num++];
                }
            }
            return result;
        }
        _nbind.pushArray = pushArray;
        function popArray(ptr, type) {
            if (ptr === 0) return null;
            var length = HEAPU32[ptr / 4];
            var arr = new Array(length);
            var heap = type.memberType.heap;
            ptr = (ptr + 4) / type.memberType.ptrSize;
            var wireRead = type.memberType.wireRead;
            var num = 0;
            if (wireRead) {
                while (num < length) {
                    arr[num++] = wireRead(heap[ptr++]);
                }
            } else {
                while (num < length) {
                    arr[num++] = heap[ptr++];
                }
            }
            return arr;
        }
        _nbind.popArray = popArray;
        var ArrayType = function (_super) {
            __extends(ArrayType, _super);
            function ArrayType(spec) {
                var _this = _super.call(this, spec) || this;
                _this.wireRead = function (arg) {
                    return popArray(arg, _this);
                };
                _this.wireWrite = function (arg) {
                    return pushArray(arg, _this);
                };
                // Optional type conversion code
                /*
                makeWireRead = (expr: string, convertParamList: any[], num: number) => {
                    convertParamList[num] = this;
                    return('_nbind.popArray(' + expr + ',convertParamList[' + num + '])');
                };
                makeWireWrite = (expr: string, convertParamList: any[], num: number) => {
                    convertParamList[num] = this;
                    return('_nbind.pushArray(' + expr + ',convertParamList[' + num + '])');
                };
                */
                _this.readResources = [_nbind.resources.pool];
                _this.writeResources = [_nbind.resources.pool];
                _this.memberType = spec.paramList[0];
                if (spec.paramList[1]) _this.size = spec.paramList[1];
                return _this;
            }
            return ArrayType;
        }(_nbind.BindType);
        _nbind.ArrayType = ArrayType;
        function pushString(str, policyTbl) {
            if (str === null || str === undefined) {
                if (policyTbl && policyTbl['Nullable']) {
                    str = '';
                } else throw new Error('Type mismatch');
            }
            if (policyTbl && policyTbl['Strict']) {
                if (typeof str != 'string') throw new Error('Type mismatch');
            } else str = str.toString();
            var length = Module.lengthBytesUTF8(str);
            // 32-bit length, string and a zero terminator
            // (stringToUTF8Array insists on adding it)
            var result = _nbind.Pool.lalloc(4 + length + 1);
            HEAPU32[result / 4] = length;
            Module.stringToUTF8Array(str, HEAPU8, result + 4, length + 1);
            return result;
        }
        _nbind.pushString = pushString;
        function popString(ptr) {
            if (ptr === 0) return null;
            var length = HEAPU32[ptr / 4];
            return Module.Pointer_stringify(ptr + 4, length);
        }
        _nbind.popString = popString;
        var StringType = function (_super) {
            __extends(StringType, _super);
            function StringType() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.wireRead = popString;
                _this.wireWrite = pushString;
                _this.readResources = [_nbind.resources.pool];
                _this.writeResources = [_nbind.resources.pool];
                return _this;
            }
            StringType.prototype.makeWireWrite = function (expr, policyTbl) {
                return function (arg) {
                    return pushString(arg, policyTbl);
                };
            };
            return StringType;
        }(_nbind.BindType);
        _nbind.StringType = StringType;
        var _ = function () {
            function _() {}
            return _;
        }(); // tslint:disable-line:class-name
        _ = __decorate([emscripten_library_decorator_1.prepareNamespace('_nbind')], _);
        _nbind._ = _;
    })(_nbind = exports._nbind || (exports._nbind = {}));
});
$__System.registerDynamic("14", ["e"], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
    // Released under the MIT license, see LICENSE.
    var __decorate = exports && exports.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    // This file handles creating invoker functions for Emscripten dyncalls
    // wrapped in type conversions for arguments and return values.
    var emscripten_library_decorator_1 = $__require("e");
    // Let decorators run eval in current scope to read function source code.
    emscripten_library_decorator_1.setEvil(function (code) {
        return eval(code);
    });
    var _nbind;
    (function (_nbind) {
        /** Make a list of argument names a1, a2, a3...
          * for dynamically generating function source code. */
        function makeArgList(argCount) {
            return Array.apply(null, Array(argCount)).map(function (dummy, num) {
                return 'a' + (num + 1);
            });
        }
        /** Check if any type on the list requires conversion writing to C++.
          * Mainly numbers can be passed as-is between Asm.js and JavaScript. */
        function anyNeedsWireWrite(typeList, policyTbl) {
            return typeList.reduce(function (result, type) {
                return result || type.needsWireWrite(policyTbl);
            }, false);
        }
        /** Check if any type on the list requires conversion reading from C++.
          * Mainly numbers can be passed as-is between Asm.js and JavaScript. */
        function anyNeedsWireRead(typeList, policyTbl) {
            return typeList.reduce(function (result, type) {
                return result || !!type.needsWireRead(policyTbl);
            }, false);
        }
        function makeWireRead(convertParamList, policyTbl, type, expr) {
            /** Next free slot number in type converter data list. */
            var paramNum = convertParamList.length;
            if (type.makeWireRead) {
                return type.makeWireRead(expr, convertParamList, paramNum);
            } else if (type.wireRead) {
                convertParamList[paramNum] = type.wireRead;
                return '(convertParamList[' + paramNum + '](' + expr + '))';
            } else return expr;
        }
        function makeWireWrite(convertParamList, policyTbl, type, expr) {
            var wireWrite;
            /** Next free slot number in type converter data list. */
            var paramNum = convertParamList.length;
            if (type.makeWireWrite) {
                wireWrite = type.makeWireWrite(expr, policyTbl, convertParamList, paramNum);
            } else wireWrite = type.wireWrite;
            if (wireWrite) {
                if (typeof wireWrite == 'string') {
                    return wireWrite;
                } else {
                    convertParamList[paramNum] = wireWrite;
                    return '(convertParamList[' + paramNum + '](' + expr + '))';
                }
            } else return expr;
        }
        /** Dynamically build a function that calls an Asm.js invoker
          * with appropriate type conversion for complicated types:
            * - Push arguments to stack.
            * - Read return value.
            * - Restore stack pointer if necessary. */
        function buildCallerFunction(dynCall, ptrType, ptr, num, policyTbl, needsWireWrite, prefix, returnType, argTypeList, mask, err) {
            var argList = makeArgList(argTypeList.length);
            /** List of arbitrary data for type converters.
              * Each one may read and write its own slot. */
            var convertParamList = [];
            // Build code for function call and type conversion.
            var callExpression = makeWireRead(convertParamList, policyTbl, returnType, 'dynCall(' + [prefix].concat(argList.map(
            // TODO: if one wireWrite throws,
            // resources allocated by others may leak!
            function (name, index) {
                return makeWireWrite(convertParamList, policyTbl, argTypeList[index], name);
            })).join(',') + ')');
            // Build code to allocate and free the stack etc. if necessary.
            var resourceSet = _nbind.listResources([returnType], argTypeList);
            var sourceCode = 'function(' + argList.join(',') + '){' + (mask ? 'this.__nbindFlags&mask&&err();' : '') + resourceSet.makeOpen() + 'var r=' + callExpression + ';' + resourceSet.makeClose() + 'return r;' + '}';
            // Use eval to allow JIT compiling the function.
            return eval('(' + sourceCode + ')');
        }
        /** Dynamically build a function that calls a JavaScript callback invoker
          * with appropriate type conversion for complicated types:
            * - Read arguments from stack.
            * - Push return value.
            * - Restore stack pointer if necessary. */
        function buildJSCallerFunction(returnType, argTypeList) {
            var argList = makeArgList(argTypeList.length);
            /** List of arbitrary data for type converters.
              * Each one may read and write its own slot. */
            var convertParamList = [];
            var callExpression = makeWireWrite(convertParamList, null, returnType, '_nbind.externalList[num].data(' + argList.map(
            // TODO: if one wireRead throws,
            // resources held by others may leak!
            function (name, index) {
                return makeWireRead(convertParamList, null, argTypeList[index], name);
            }).join(',') + ')');
            var resourceSet = _nbind.listResources(argTypeList, [returnType]);
            // Let the calling C++ side handle resetting the pool (using the
            // PoolRestore class) after parsing the callback return value passed
            // through the pool.
            resourceSet.remove(_nbind.resources.pool);
            var sourceCode = 'function(' + ['dummy', 'num'].concat(argList).join(',') + '){' + resourceSet.makeOpen() + 'var r=' + callExpression + ';' + resourceSet.makeClose() + 'return r;' + '}';
            // Use eval to allow JIT compiling the function.
            return eval('(' + sourceCode + ')');
        }
        _nbind.buildJSCallerFunction = buildJSCallerFunction;
        /* tslint:disable:indent */
        /** Dynamically create an invoker for a JavaScript callback. */
        function makeJSCaller(idList) {
            var argCount = idList.length - 1;
            var typeList = _nbind.getTypes(idList, 'callback');
            var returnType = typeList[0];
            var argTypeList = typeList.slice(1);
            var needsWireRead = anyNeedsWireRead(argTypeList, null);
            var needsWireWrite = returnType.needsWireWrite(null);
            if (!needsWireWrite && !needsWireRead) {
                switch (argCount) {
                    case 0:
                        return function (dummy, num) {
                            return _nbind.externalList[num].data();
                        };
                    case 1:
                        return function (dummy, num, a1) {
                            return _nbind.externalList[num].data(a1);
                        };
                    case 2:
                        return function (dummy, num, a1, a2) {
                            return _nbind.externalList[num].data(a1, a2);
                        };
                    case 3:
                        return function (dummy, num, a1, a2, a3) {
                            return _nbind.externalList[num].data(a1, a2, a3);
                        };
                    default:
                        // Function takes over 3 arguments.
                        // Let's create the invoker dynamically then.
                        break;
                }
            }
            return buildJSCallerFunction(returnType, argTypeList);
        }
        _nbind.makeJSCaller = makeJSCaller;
        /** Dynamically create an invoker function for calling a C++ class method. */
        function makeMethodCaller(ptrType, spec) {
            var argCount = spec.typeList.length - 1;
            // The method invoker function adds two arguments to those of the method:
            // - Number of the method in a list of methods with identical signatures.
            // - Target object
            var typeIdList = spec.typeList.slice(0);
            typeIdList.splice(1, 0, 'uint32_t', spec.boundID);
            var typeList = _nbind.getTypes(typeIdList, spec.title);
            var returnType = typeList[0];
            var argTypeList = typeList.slice(3);
            var needsWireRead = returnType.needsWireRead(spec.policyTbl);
            var needsWireWrite = anyNeedsWireWrite(argTypeList, spec.policyTbl);
            var ptr = spec.ptr;
            var num = spec.num;
            var dynCall = _nbind.getDynCall(typeList, spec.title);
            var mask = ~spec.flags & 1 /* isConst */;
            function err() {
                throw new Error('Calling a non-const method on a const object');
            }
            if (!needsWireRead && !needsWireWrite) {
                // If there are only a few arguments not requiring type conversion,
                // build a simple invoker function without using eval.
                switch (argCount) {
                    case 0:
                        return function () {
                            return this.__nbindFlags & mask ? err() : dynCall(ptr, num, _nbind.pushPointer(this, ptrType));
                        };
                    case 1:
                        return function (a1) {
                            return this.__nbindFlags & mask ? err() : dynCall(ptr, num, _nbind.pushPointer(this, ptrType), a1);
                        };
                    case 2:
                        return function (a1, a2) {
                            return this.__nbindFlags & mask ? err() : dynCall(ptr, num, _nbind.pushPointer(this, ptrType), a1, a2);
                        };
                    case 3:
                        return function (a1, a2, a3) {
                            return this.__nbindFlags & mask ? err() : dynCall(ptr, num, _nbind.pushPointer(this, ptrType), a1, a2, a3);
                        };
                    default:
                        // Function takes over 3 arguments or needs type conversion.
                        // Let's create the invoker dynamically then.
                        break;
                }
            }
            return buildCallerFunction(dynCall, ptrType, ptr, num, spec.policyTbl, needsWireWrite, 'ptr,num,pushPointer(this,ptrType)', returnType, argTypeList, mask, err);
        }
        _nbind.makeMethodCaller = makeMethodCaller;
        /** Dynamically create an invoker function for calling a C++ function. */
        function makeCaller(spec) {
            var argCount = spec.typeList.length - 1;
            var typeList = _nbind.getTypes(spec.typeList, spec.title);
            var returnType = typeList[0];
            var argTypeList = typeList.slice(1);
            var needsWireRead = returnType.needsWireRead(spec.policyTbl);
            var needsWireWrite = anyNeedsWireWrite(argTypeList, spec.policyTbl);
            var direct = spec.direct;
            var dynCall;
            var ptr = spec.ptr;
            if (spec.direct && !needsWireRead && !needsWireWrite) {
                // If there are only a few arguments not requiring type conversion,
                // build a simple invoker function without using eval.
                dynCall = _nbind.getDynCall(typeList, spec.title);
                switch (argCount) {
                    case 0:
                        return function () {
                            return dynCall(direct);
                        };
                    case 1:
                        return function (a1) {
                            return dynCall(direct, a1);
                        };
                    case 2:
                        return function (a1, a2) {
                            return dynCall(direct, a1, a2);
                        };
                    case 3:
                        return function (a1, a2, a3) {
                            return dynCall(direct, a1, a2, a3);
                        };
                    default:
                        // Function takes over 3 arguments.
                        // Let's create the invoker dynamically then.
                        break;
                }
                // Input and output types don't need conversion so omit dispatcher.
                ptr = 0;
            }
            var prefix;
            if (ptr) {
                // The function invoker adds an argument to those of the function:
                // - Number of the function in a list of functions with identical signatures.
                var typeIdList = spec.typeList.slice(0);
                typeIdList.splice(1, 0, 'uint32_t');
                typeList = _nbind.getTypes(typeIdList, spec.title);
                prefix = 'ptr,num';
            } else {
                ptr = direct;
                prefix = 'ptr';
            }
            // Type ID list was changed.
            dynCall = _nbind.getDynCall(typeList, spec.title);
            return buildCallerFunction(dynCall, null, ptr, spec.num, spec.policyTbl, needsWireWrite, prefix, returnType, argTypeList);
        }
        _nbind.makeCaller = makeCaller;
        /* tslint:enable:indent */
        /** Create an overloader that can call several methods with the same name,
          * depending on the number of arguments passed in the call. */
        function makeOverloader(func, arity) {
            var callerList = [];
            function call() {
                return callerList[arguments.length].apply(this, arguments);
            }
            call.addMethod = function (_func, _arity) {
                callerList[_arity] = _func;
            };
            call.addMethod(func, arity);
            return call;
        }
        _nbind.makeOverloader = makeOverloader;
        var _ = function () {
            function _() {}
            return _;
        }(); // tslint:disable-line:class-name
        _ = __decorate([emscripten_library_decorator_1.prepareNamespace('_nbind')], _);
        _nbind._ = _;
    })(_nbind = exports._nbind || (exports._nbind = {}));
});
$__System.registerDynamic("d", ["e"], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
    // Released under the MIT license, see LICENSE.
    var __extends = exports && exports.__extends || function () {
        var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
            d.__proto__ = b;
        } || function (d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    }();
    var __decorate = exports && exports.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var emscripten_library_decorator_1 = $__require("e");
    // Let decorators run eval in current scope to read function source code.
    emscripten_library_decorator_1.setEvil(function (code) {
        return eval(code);
    });
    var _defineHidden = emscripten_library_decorator_1.defineHidden;
    var _nbind;
    (function (_nbind) {
        /** Base class for wrapped instances of bound C++ classes.
          * Note that some hacks avoid ever constructing this,
          * so initializing values inside its definition won't work. */
        var Wrapper = function () {
            function Wrapper() {}
            Wrapper.prototype.persist = function () {
                this.__nbindState |= 1 /* isPersistent */;
            };
            return Wrapper;
        }();
        _nbind.Wrapper = Wrapper;
        function makeBound(policyTbl, bindClass) {
            var Bound = function (_super) {
                __extends(Bound, _super);
                function Bound(marker, flags, ptr, shared) {
                    var _this = _super.call(this) || this;
                    if (!(_this instanceof Bound)) {
                        // Constructor called without new operator.
                        // Make correct call with given arguments.
                        // Few ways to do this work. This one should. See:
                        // http://stackoverflow.com/questions/1606797
                        // /use-of-apply-with-new-operator-is-this-possible
                        return new (Function.prototype.bind.apply(Bound, // arguments.callee
                        Array.prototype.concat.apply([null], arguments)))();
                    }
                    var nbindFlags = flags;
                    var nbindPtr = ptr;
                    var nbindShared = shared;
                    if (marker !== _nbind.ptrMarker) {
                        var wirePtr = _this.__nbindConstructor.apply(_this, arguments);
                        nbindFlags = 4096 /* isSharedClassPtr */ | 512 /* isSharedPtr */;
                        nbindShared = HEAPU32[wirePtr / 4];
                        nbindPtr = HEAPU32[wirePtr / 4 + 1];
                    }
                    var spec = {
                        configurable: true,
                        enumerable: false,
                        value: null,
                        writable: false
                    };
                    var propTbl = {
                        '__nbindFlags': nbindFlags,
                        '__nbindPtr': nbindPtr
                    };
                    if (nbindShared) {
                        propTbl['__nbindShared'] = nbindShared;
                        _nbind.mark(_this);
                    }
                    for (var _i = 0, _a = Object.keys(propTbl); _i < _a.length; _i++) {
                        var key = _a[_i];
                        spec.value = propTbl[key];
                        Object.defineProperty(_this, key, spec);
                    }
                    _defineHidden(0 /* none */)(_this, '__nbindState');
                    return _this;
                }
                Bound.prototype.free = function () {
                    bindClass.destroy.call(this, this.__nbindShared, this.__nbindFlags);
                    this.__nbindState |= 2 /* isDeleted */;
                    disableMember(this, '__nbindShared');
                    disableMember(this, '__nbindPtr');
                };
                return Bound;
            }(Wrapper);
            __decorate([_defineHidden()
            // tslint:disable-next-line:variable-name
            ], Bound.prototype, "__nbindConstructor", void 0);
            __decorate([_defineHidden()
            // tslint:disable-next-line:variable-name
            ], Bound.prototype, "__nbindValueConstructor", void 0);
            __decorate([_defineHidden(policyTbl)
            // tslint:disable-next-line:variable-name
            ], Bound.prototype, "__nbindPolicies", void 0);
            return Bound;
        }
        _nbind.makeBound = makeBound;
        function disableMember(obj, name) {
            function die() {
                throw new Error('Accessing deleted object');
            }
            Object.defineProperty(obj, name, {
                configurable: false,
                enumerable: false,
                get: die,
                set: die
            });
        }
        var _ = function () {
            function _() {}
            return _;
        }(); // tslint:disable-line:class-name
        _ = __decorate([emscripten_library_decorator_1.prepareNamespace('_nbind')], _);
        _nbind._ = _;
    })(_nbind = exports._nbind || (exports._nbind = {}));
});
$__System.registerDynamic("15", ["e"], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
    // Released under the MIT license, see LICENSE.
    var __decorate = exports && exports.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    // This file handles resource allocation and freeing for invoker functions.
    // For example if any type conversion requires space in the C++ stack,
    // at the end of the invoker it must be reset as it was before.
    var emscripten_library_decorator_1 = $__require("e");
    // Let decorators run eval in current scope to read function source code.
    emscripten_library_decorator_1.setEvil(function (code) {
        return eval(code);
    });
    var _nbind;
    (function (_nbind) {
        var Resource = function () {
            function Resource(open, close) {
                var _this = this;
                this.makeOpen = function () {
                    return Object.keys(_this.openTbl).join('');
                };
                this.makeClose = function () {
                    return Object.keys(_this.closeTbl).join('');
                };
                this.openTbl = {};
                this.closeTbl = {};
                if (open) this.openTbl[open] = true;
                if (close) this.closeTbl[close] = true;
            }
            Resource.prototype.add = function (other) {
                for (var _i = 0, _a = Object.keys(other.openTbl); _i < _a.length; _i++) {
                    var key = _a[_i];
                    this.openTbl[key] = true;
                }
                for (var _b = 0, _c = Object.keys(other.closeTbl); _b < _c.length; _b++) {
                    var key = _c[_b];
                    this.closeTbl[key] = true;
                }
            };
            Resource.prototype.remove = function (other) {
                for (var _i = 0, _a = Object.keys(other.openTbl); _i < _a.length; _i++) {
                    var key = _a[_i];
                    delete this.openTbl[key];
                }
                for (var _b = 0, _c = Object.keys(other.closeTbl); _b < _c.length; _b++) {
                    var key = _c[_b];
                    delete this.closeTbl[key];
                }
            };
            return Resource;
        }();
        _nbind.Resource = Resource;
        /** Create a single resource with open and close code included
          * once from each type of resource needed by a list of types. */
        function listResources(readList, writeList) {
            var result = new Resource();
            for (var _i = 0, readList_1 = readList; _i < readList_1.length; _i++) {
                var bindType = readList_1[_i];
                for (var _a = 0, _b = bindType.readResources || []; _a < _b.length; _a++) {
                    var resource = _b[_a];
                    result.add(resource);
                }
            }
            for (var _c = 0, writeList_1 = writeList; _c < writeList_1.length; _c++) {
                var bindType = writeList_1[_c];
                for (var _d = 0, _e = bindType.writeResources || []; _d < _e.length; _d++) {
                    var resource = _e[_d];
                    result.add(resource);
                }
            }
            return result;
        }
        _nbind.listResources = listResources;
        _nbind.resources = {
            pool: new Resource('var used=HEAPU32[_nbind.Pool.usedPtr],page=HEAPU32[_nbind.Pool.pagePtr];', '_nbind.Pool.lreset(used,page);')
            /*
                    stack: new Resource(
                        'var sp=Runtime.stackSave();',
                        'Runtime.stackRestore(sp);'
                    )
            */
        };
        var _ = function () {
            function _() {}
            return _;
        }(); // tslint:disable-line:class-name
        _ = __decorate([emscripten_library_decorator_1.prepareNamespace('_nbind')], _);
        _nbind._ = _;
    })(_nbind = exports._nbind || (exports._nbind = {}));
});
$__System.registerDynamic("13", ["e"], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
    // Released under the MIT license, see LICENSE.
    var __decorate = exports && exports.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    // This file contains some assorted functions.
    var emscripten_library_decorator_1 = $__require("e");
    // Let decorators run eval in current scope to read function source code.
    emscripten_library_decorator_1.setEvil(function (code) {
        return eval(code);
    });
    // Namespace that will be made available inside Emscripten compiled module.
    var _nbind;
    (function (_nbind) {
        // Generic table and list of functions.
        // Mapping from numeric typeIDs and type names to objects with type information.
        var typeIdTbl = {};
        _nbind.typeNameTbl = {};
        var Pool = function () {
            function Pool() {}
            Pool.lalloc = function (size) {
                // Round size up to a multiple of 8 bytes (size of a double)
                // to align pointers allocated later.
                size = size + 7 & ~7;
                var used = HEAPU32[Pool.usedPtr];
                if (size > Pool.pageSize / 2 || size > Pool.pageSize - used) {
                    var NBind = _nbind.typeNameTbl['NBind'].proto;
                    return NBind.lalloc(size);
                } else {
                    HEAPU32[Pool.usedPtr] = used + size;
                    return Pool.rootPtr + used;
                }
            };
            /** Reset linear allocator to a previous state, effectively to free
              * a stack frame. */
            Pool.lreset = function (used, page) {
                var topPage = HEAPU32[Pool.pagePtr];
                if (topPage) {
                    var NBind = _nbind.typeNameTbl['NBind'].proto;
                    NBind.lreset(used, page);
                } else {
                    HEAPU32[Pool.usedPtr] = used;
                }
            };
            return Pool;
        }();
        _nbind.Pool = Pool;
        function constructType(kind, spec) {
            var construct = kind == 10240 /* isOther */ ? _nbind.makeTypeNameTbl[spec.name] || _nbind.BindType : _nbind.makeTypeKindTbl[kind];
            // console.error(spec.id + ' ' + spec.name + ' ' + kind); // tslint:disable-line
            // console.error(construct.toString()); // tslint:disable-line
            var bindType = new construct(spec);
            typeIdTbl[spec.id] = bindType;
            _nbind.typeNameTbl[spec.name] = bindType;
            return bindType;
        }
        _nbind.constructType = constructType;
        function getType(id) {
            return typeIdTbl[id];
        }
        _nbind.getType = getType;
        function queryType(id) {
            var placeholderFlag = HEAPU8[id];
            var paramCount = _nbind.structureList[placeholderFlag][1];
            id /= 4;
            if (paramCount < 0) {
                ++id;
                paramCount = HEAPU32[id] + 1;
            }
            var paramList = Array.prototype.slice.call(HEAPU32.subarray(id + 1, id + 1 + paramCount));
            if (placeholderFlag == 9 /* callback */) {
                    paramList = [paramList[0], paramList.slice(1)];
                }
            return {
                paramList: paramList,
                placeholderFlag: placeholderFlag
            };
        }
        _nbind.queryType = queryType;
        // Look up a list of type objects based on their numeric typeID or name.
        function getTypes(idList, place) {
            return idList.map(function (id) {
                return typeof id == 'number' ? _nbind.getComplexType(id, constructType, getType, queryType, place) : _nbind.typeNameTbl[id];
            });
        }
        _nbind.getTypes = getTypes;
        function readTypeIdList(typeListPtr, typeCount) {
            return Array.prototype.slice.call(HEAPU32, typeListPtr / 4, typeListPtr / 4 + typeCount);
        }
        _nbind.readTypeIdList = readTypeIdList;
        function readAsciiString(ptr) {
            var endPtr = ptr;
            while (HEAPU8[endPtr++]);
            return String.fromCharCode.apply('', HEAPU8.subarray(ptr, endPtr - 1));
        }
        _nbind.readAsciiString = readAsciiString;
        function readPolicyList(policyListPtr) {
            var policyTbl = {};
            if (policyListPtr) {
                while (1) {
                    var namePtr = HEAPU32[policyListPtr / 4];
                    if (!namePtr) break;
                    policyTbl[readAsciiString(namePtr)] = true;
                    policyListPtr += 4;
                }
            }
            return policyTbl;
        }
        _nbind.readPolicyList = readPolicyList;
        // Generate a mangled signature from argument types.
        // Asm.js functions can only be called though Emscripten-generated invoker functions,
        // with slightly mangled type signatures appended to their names.
        // tslint:disable-next-line:no-shadowed-variable
        function getDynCall(typeList, name) {
            var mangleMap = {
                float32_t: 'd',
                float64_t: 'd',
                int64_t: 'd',
                uint64_t: 'd',
                void: 'v'
            };
            var signature = typeList.map(function (type) {
                return mangleMap[type.name] || 'i';
            }).join('');
            var dynCall = Module['dynCall_' + signature];
            if (!dynCall) {
                throw new Error('dynCall_' + signature + ' not found for ' + name + '(' + typeList.map(function (type) {
                    return type.name;
                }).join(', ') + ')');
            }
            return dynCall;
        }
        _nbind.getDynCall = getDynCall;
        // Add a method to a C++ class constructor (for static methods) or prototype,
        // or overload an existing method.
        function addMethod(obj, name, func, arity) {
            var overload = obj[name];
            // Check if the function has been overloaded.
            if (obj.hasOwnProperty(name) && overload) {
                if (overload.arity || overload.arity === 0) {
                    // Found an existing function, but it's not an overloader.
                    // Make a new overloader and add the existing function to it.
                    overload = _nbind.makeOverloader(overload, overload.arity);
                    obj[name] = overload;
                }
                // Add this function as an overload.
                overload.addMethod(func, arity);
            } else {
                // Add a new function and store its arity in case it gets overloaded.
                func.arity = arity;
                obj[name] = func;
            }
        }
        _nbind.addMethod = addMethod;
        function throwError(message) {
            throw new Error(message);
        }
        _nbind.throwError = throwError;
        _nbind.bigEndian = false;
        // Export the namespace to Emscripten compiled output.
        // This must be at the end of the namespace!
        // The dummy class is needed because unfortunately namespaces can't have decorators.
        // Everything after it inside the namespace will be discarded.
        var _ = function () {
            function _() {}
            return _;
        }(); // tslint:disable-line:class-name
        _ = __decorate([emscripten_library_decorator_1.prepareNamespace('_nbind')], _);
        _nbind._ = _;
    })(_nbind = exports._nbind || (exports._nbind = {}));
});
$__System.registerDynamic("c", ["e", "16"], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
    // Released under the MIT license, see LICENSE.
    var __extends = exports && exports.__extends || function () {
        var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
            d.__proto__ = b;
        } || function (d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    }();
    var __decorate = exports && exports.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    // This file contains the type conversion base class and handles conversion of
    // C++ primitive types to / from JavaScript. Following emscripten conventions,
    // the type passed between the two is called WireType.
    // Anything from the standard library is instead in BindingStd.ts
    var emscripten_library_decorator_1 = $__require("e");
    var Type_1 = $__require("16");
    var _typeModule = Type_1.typeModule;
    // Let decorators run eval in current scope to read function source code.
    emscripten_library_decorator_1.setEvil(function (code) {
        return eval(code);
    });
    var _nbind;
    (function (_nbind) {
        _a = _typeModule(_typeModule), _nbind.Type = _a.Type, _nbind.makeType = _a.makeType, _nbind.getComplexType = _a.getComplexType, _nbind.structureList = _a.structureList;
        // A type definition, which registers itself upon construction.
        var BindType = function (_super) {
            __extends(BindType, _super);
            function BindType() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.heap = HEAPU32;
                _this.ptrSize = 4;
                return _this;
            }
            BindType.prototype.needsWireRead = function (policyTbl) {
                return !!this.wireRead || !!this.makeWireRead;
            };
            BindType.prototype.needsWireWrite = function (policyTbl) {
                return !!this.wireWrite || !!this.makeWireWrite;
            };
            return BindType;
        }(_nbind.Type);
        _nbind.BindType = BindType;
        var PrimitiveType = function (_super) {
            __extends(PrimitiveType, _super);
            function PrimitiveType(spec) {
                var _this = _super.call(this, spec) || this;
                var heapTbl = spec.flags & 32 /* isFloat */ ? {
                    32: HEAPF32,
                    64: HEAPF64
                } : spec.flags & 8 /* isUnsigned */ ? {
                    8: HEAPU8,
                    16: HEAPU16,
                    32: HEAPU32
                } : {
                    8: HEAP8,
                    16: HEAP16,
                    32: HEAP32
                };
                _this.heap = heapTbl[spec.ptrSize * 8];
                _this.ptrSize = spec.ptrSize;
                return _this;
            }
            PrimitiveType.prototype.needsWireWrite = function (policyTbl) {
                return !!policyTbl && !!policyTbl['Strict'];
            };
            PrimitiveType.prototype.makeWireWrite = function (expr, policyTbl) {
                return policyTbl && policyTbl['Strict'] && function (arg) {
                    if (typeof arg == 'number') return arg;
                    throw new Error('Type mismatch');
                };
            };
            return PrimitiveType;
        }(BindType);
        _nbind.PrimitiveType = PrimitiveType;
        // Push a string to the C++ stack, zero-terminated and UTF-8 encoded.
        function pushCString(str, policyTbl) {
            if (str === null || str === undefined) {
                if (policyTbl && policyTbl['Nullable']) {
                    return 0;
                } else throw new Error('Type mismatch');
            }
            if (policyTbl && policyTbl['Strict']) {
                if (typeof str != 'string') throw new Error('Type mismatch');
            } else str = str.toString();
            var length = Module.lengthBytesUTF8(str) + 1;
            var result = _nbind.Pool.lalloc(length);
            // Convert the string and append a zero byte.
            Module.stringToUTF8Array(str, HEAPU8, result, length);
            return result;
        }
        _nbind.pushCString = pushCString;
        // Read a zero-terminated, UTF-8 encoded string from the C++ stack.
        function popCString(ptr) {
            if (ptr === 0) return null;
            return Module.Pointer_stringify(ptr);
        }
        _nbind.popCString = popCString;
        // Zero-terminated 'const char *' style string, passed through the C++ stack.
        var CStringType = function (_super) {
            __extends(CStringType, _super);
            function CStringType() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.wireRead = popCString;
                _this.wireWrite = pushCString;
                _this.readResources = [_nbind.resources.pool];
                _this.writeResources = [_nbind.resources.pool];
                return _this;
            }
            CStringType.prototype.makeWireWrite = function (expr, policyTbl) {
                return function (arg) {
                    return pushCString(arg, policyTbl);
                };
            };
            return CStringType;
        }(BindType);
        _nbind.CStringType = CStringType;
        // Booleans are returned as numbers from Asm.js.
        // Prefixing with !! converts them to JavaScript booleans.
        var BooleanType = function (_super) {
            __extends(BooleanType, _super);
            function BooleanType() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.wireRead = function (arg) {
                    return !!arg;
                };
                return _this;
            }
            BooleanType.prototype.needsWireWrite = function (policyTbl) {
                return !!policyTbl && !!policyTbl['Strict'];
            };
            BooleanType.prototype.makeWireRead = function (expr) {
                return '!!(' + expr + ')';
            };
            BooleanType.prototype.makeWireWrite = function (expr, policyTbl) {
                return policyTbl && policyTbl['Strict'] && function (arg) {
                    if (typeof arg == 'boolean') return arg;
                    throw new Error('Type mismatch');
                } || expr;
            };
            return BooleanType;
        }(BindType);
        _nbind.BooleanType = BooleanType;
        var _ = function () {
            function _() {}
            return _;
        }(); // tslint:disable-line:class-name
        _ = __decorate([emscripten_library_decorator_1.prepareNamespace('_nbind')], _);
        _nbind._ = _;
        var _a;
    })(_nbind = exports._nbind || (exports._nbind = {}));
});
$__System.registerDynamic("10", ["e", "c"], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
    // Released under the MIT license, see LICENSE.
    var __extends = exports && exports.__extends || function () {
        var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
            d.__proto__ = b;
        } || function (d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    }();
    var __decorate = exports && exports.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    // This file allows C++ to hold references to arbitrary JavaScript objects.
    // Each object is stored in a JavaScript array, and C++ receives its index.
    // C++ can then call JavaScript methods and refer to the object by index.
    var emscripten_library_decorator_1 = $__require("e");
    var BindingType_1 = $__require("c");
    // Let decorators run eval in current scope to read function source code.
    emscripten_library_decorator_1.setEvil(function (code) {
        return eval(code);
    });
    var _nbind;
    (function (_nbind) {
        _nbind.BindType = BindingType_1._nbind.BindType;
    })(_nbind = exports._nbind || (exports._nbind = {}));
    (function (_nbind) {
        // External JavaScript types are stored in a list,
        // so C++ code can find them by number.
        // A reference count allows storing them in C++ without leaking memory.
        // The first element is a dummy value just so that a valid index to
        // the list always tests as true (useful for the free list implementation).
        _nbind.externalList = [0];
        // Head of free list for recycling available slots in the externals list.
        var firstFreeExternal = 0;
        var External = function () {
            function External(data) {
                this.refCount = 1;
                this.data = data;
            }
            // Store this external in a JavaScript array and return its index
            // creating a reference that can be passed to C++.
            External.prototype.register = function () {
                var num = firstFreeExternal;
                if (num) {
                    firstFreeExternal = _nbind.externalList[num];
                } else num = _nbind.externalList.length;
                _nbind.externalList[num] = this;
                return num;
            };
            External.prototype.reference = function () {
                ++this.refCount;
            };
            External.prototype.dereference = function (num) {
                if (--this.refCount == 0) {
                    if (this.free) this.free();
                    _nbind.externalList[num] = firstFreeExternal;
                    firstFreeExternal = num;
                }
            };
            return External;
        }();
        _nbind.External = External;
        function popExternal(num) {
            var obj = _nbind.externalList[num];
            obj.dereference(num);
            return obj.data;
        }
        function pushExternal(obj) {
            var external = new External(obj);
            external.reference();
            return external.register();
        }
        var ExternalType = function (_super) {
            __extends(ExternalType, _super);
            function ExternalType() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.wireRead = popExternal;
                _this.wireWrite = pushExternal;
                return _this;
            }
            return ExternalType;
        }(_nbind.BindType);
        _nbind.ExternalType = ExternalType;
        var _ = function () {
            function _() {}
            return _;
        }(); // tslint:disable-line:class-name
        _ = __decorate([emscripten_library_decorator_1.prepareNamespace('_nbind')], _);
        _nbind._ = _;
    })(_nbind = exports._nbind || (exports._nbind = {}));
    var nbind = function () {
        function nbind() {}
        nbind._nbind_reference_external = function (num) {
            _nbind.externalList[num].reference();
        };
        nbind._nbind_free_external = function (num) {
            _nbind.externalList[num].dereference(num);
        };
        return nbind;
    }();
    __decorate([emscripten_library_decorator_1.dep('_nbind')], nbind, "_nbind_reference_external", null);
    __decorate([emscripten_library_decorator_1.dep('_nbind')], nbind, "_nbind_free_external", null);
    nbind = __decorate([emscripten_library_decorator_1.exportLibrary], nbind);
});
$__System.registerDynamic("17", ["e", "13", "c", "10"], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
    // Released under the MIT license, see LICENSE.
    var __extends = exports && exports.__extends || function () {
        var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
            d.__proto__ = b;
        } || function (d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    }();
    var __decorate = exports && exports.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    var emscripten_library_decorator_1 = $__require("e");
    var Globals_1 = $__require("13");
    var BindingType_1 = $__require("c");
    var External_1 = $__require("10");
    // Let decorators run eval in current scope to read function source code.
    emscripten_library_decorator_1.setEvil(function (code) {
        return eval(code);
    });
    var _nbind;
    (function (_nbind) {
        _nbind.Pool = Globals_1._nbind.Pool;
        _nbind.BindType = BindingType_1._nbind.BindType;
        _nbind.External = External_1._nbind.External;
    })(_nbind = exports._nbind || (exports._nbind = {}));
    (function (_nbind) {
        var ExternalBuffer = function (_super) {
            __extends(ExternalBuffer, _super);
            function ExternalBuffer(buf, ptr) {
                var _this = _super.call(this, buf) || this;
                _this.ptr = ptr;
                return _this;
            }
            ExternalBuffer.prototype.free = function () {
                _free(this.ptr);
            };
            return ExternalBuffer;
        }(_nbind.External);
        function getBuffer(buf) {
            if (buf instanceof ArrayBuffer) {
                return new Uint8Array(buf);
            } else if (buf instanceof DataView) {
                return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
            } else return buf;
        }
        function pushBuffer(buf, policyTbl) {
            if (buf === null || buf === undefined) {
                if (policyTbl && policyTbl['Nullable']) buf = [];
            }
            if (typeof buf != 'object') throw new Error('Type mismatch');
            var b = buf;
            var length = b.byteLength || b.length;
            if (!length && length !== 0 && b.byteLength !== 0) throw new Error('Type mismatch');
            var result = _nbind.Pool.lalloc(8);
            var data = _malloc(length);
            var ptr = result / 4;
            HEAPU32[ptr++] = length;
            HEAPU32[ptr++] = data;
            HEAPU32[ptr++] = new ExternalBuffer(buf, data).register();
            HEAPU8.set(getBuffer(buf), data);
            return result;
        }
        var BufferType = function (_super) {
            __extends(BufferType, _super);
            function BufferType() {
                var _this = _super !== null && _super.apply(this, arguments) || this;
                _this.wireWrite = pushBuffer;
                _this.readResources = [_nbind.resources.pool];
                _this.writeResources = [_nbind.resources.pool];
                return _this;
            }
            BufferType.prototype.makeWireWrite = function (expr, policyTbl) {
                return function (arg) {
                    return pushBuffer(arg, policyTbl);
                };
            };
            return BufferType;
        }(_nbind.BindType);
        _nbind.BufferType = BufferType;
        // Called from EM_ASM block in Buffer.h
        function commitBuffer(num, data, length) {
            var buf = _nbind.externalList[num].data;
            var NodeBuffer = Buffer;
            // tslint:disable-next-line:no-empty
            if (typeof Buffer != 'function') NodeBuffer = function () {};
            if (buf instanceof Array) {
                // TODO if needed
            } else {
                var src = HEAPU8.subarray(data, data + length);
                if (buf instanceof NodeBuffer) {
                    var srcBuf = void 0;
                    if (typeof Buffer.from == 'function' && Buffer.from.length >= 3) {
                        srcBuf = Buffer.from(src);
                    } else srcBuf = new Buffer(src);
                    srcBuf.copy(buf);
                } else getBuffer(buf).set(src);
            }
        }
        _nbind.commitBuffer = commitBuffer;
        var _ = function () {
            function _() {}
            return _;
        }(); // tslint:disable-line:class-name
        _ = __decorate([emscripten_library_decorator_1.prepareNamespace('_nbind')], _);
        _nbind._ = _;
    })(_nbind = exports._nbind || (exports._nbind = {}));
});
$__System.registerDynamic('e', [], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // This file is part of emscripten-library-decorator,
    // copyright (c) 2015-2017 BusFaster Ltd.
    // Released under the MIT license, see LICENSE.
    Object.defineProperty(exports, "__esModule", { value: true });
    var evil;
    /** Allow decorators to call eval() in the context that called them.
      * This is needed for various transformations.
      * @param otherEval must be this function: (code: string) => eval(code) */
    function setEvil(otherEval) {
        evil = otherEval;
    }
    exports.setEvil = setEvil;
    function __extends(Class, Parent) {
        for (var key in Parent) if (Parent.hasOwnProperty(key)) Class[key] = Parent[key];
        // tslint:disable-next-line:no-invalid-this
        function Base() {
            this.constructor = Class;
        }
        Base.prototype = Parent.prototype;
        Class.prototype = new Base();
    }
    exports.__extends = __extends;
    /** @dep decorator.
      * Apply to a function, to list other required variables needing protection
      * from dead code removal.
      * Arguments can be functions or names of global variables. */
    function dep() {
        var depList = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            depList[_i] = arguments[_i];
        }
        return function (target, functionName) {
            // Export names of other functions required by <functionName>
            // as an array named <functionName>__deps.
            var key = functionName + '__deps';
            var lib = target;
            lib[key] = (lib[key] || []).concat(depList.map(function (dep) {
                var name;
                if (typeof dep == 'function') {
                    // Get name of required function and remove underscore prefix.
                    name = dep.name.substr(1);
                    // Export required function with prefix removed from its name.
                    lib[name] = dep;
                } else {
                    name = dep.substr(1);
                    // Export any required global variable,
                    // looking it up by name in current scope.
                    if (name != 'initNamespaces') lib[name] = evil('(' + dep + ')');
                }
                // Send name without prefix to __deps list.
                return name;
            }));
        };
    }
    exports.dep = dep;
    /** @exportLibrary decorator.
      * Apply to a class with static methods, to export them as functions. */
    function exportLibrary(target) {
        mergeInto(LibraryManager.library, target);
    }
    exports.exportLibrary = exportLibrary;
    var namespaceBodyTbl = {};
    var namespaceDepTbl = {};
    /** @prepareNamespace decorator.
      * Apply to an empty, named dummy class defined at the end of the namespace
      * block, to prepare its contents for export in an Emscripten library.
      * Namespaces with matching names in different files are merged together.
      * All code in the block is separated because Emscripten only outputs global
      * functions, not methods. */
    function prepareNamespace(name) {
        var depList = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            depList[_i - 1] = arguments[_i];
        }
        return function (target) {
            var body = evil('__decorate').caller.toString();
            var prefix = new RegExp('^[ (]*function *\\( *' + name + ' *\\) *\\{');
            var suffix = new RegExp('var +' + target.name + ' *= *[^]*$');
            body = (namespaceBodyTbl[name] || '') + body.replace(prefix, '').replace(suffix, '');
            namespaceBodyTbl[name] = body;
            if (!namespaceDepTbl[name]) namespaceDepTbl[name] = {};
            for (var _i = 0, depList_1 = depList; _i < depList_1.length; _i++) {
                var dep_1 = depList_1[_i];
                namespaceDepTbl[name][dep_1.substr(1)] = evil('(' + dep_1 + ')');
            }
        };
    }
    exports.prepareNamespace = prepareNamespace;
    /** Call once per namespace at the global level, after all files with contents
      * in that namespace have been imported. Clears the namespace and exports a
      * "postset" function to populate it using its original code. */
    function publishNamespace(name) {
        var exportName = name.substr(1);
        var body = namespaceBodyTbl[name];
        var bodyWrapped = '(function(' + name + '){' + body + '})' + '(' + name + ')';
        evil(name + '={};');
        evil('__extends=' + __extends.toString() + ';');
        var lib = {
            _decorate: evil('__decorate'),
            defineHidden: defineHidden
        };
        for (var _i = 0, _a = Object.keys(namespaceDepTbl[name]); _i < _a.length; _i++) {
            var depName = _a[_i];
            lib[depName] = namespaceDepTbl[name][depName];
        }
        lib[exportName + '__deps'] = Object.keys(lib);
        lib[exportName + '__postset'] = bodyWrapped;
        mergeInto(LibraryManager.library, lib);
    }
    exports.publishNamespace = publishNamespace;
    /** @_defineHidden decorator.
      * Assign to a local variable called _defineHidden before using.
      * Apply to a property to protect it from modifications and hide it. */
    function defineHidden(value) {
        return function (target, key) {
            Object.defineProperty(target, key, {
                configurable: false,
                enumerable: false,
                value: value,
                writable: true
            });
        };
    }
    exports.defineHidden = defineHidden;
});
$__System.registerDynamic("18", ["e"], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
    // Released under the MIT license, see LICENSE.
    var __decorate = exports && exports.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    // This file handles creating invoker functions for Emscripten dyncalls
    // wrapped in type conversions for arguments and return values.
    var emscripten_library_decorator_1 = $__require("e");
    // Let decorators run eval in current scope to read function source code.
    emscripten_library_decorator_1.setEvil(function (code) {
        return eval(code);
    });
    var _nbind;
    (function (_nbind) {
        var dirtyList = [];
        var gcTimer = 0;
        function sweep() {
            for (var _i = 0, dirtyList_1 = dirtyList; _i < dirtyList_1.length; _i++) {
                var obj = dirtyList_1[_i];
                if (!(obj.__nbindState & (1 /* isPersistent */ | 2 /* isDeleted */))) {
                    obj.free();
                }
            }
            dirtyList = [];
            gcTimer = 0;
        }
        // tslint:disable-next-line:no-empty
        _nbind.mark = function (obj) {};
        function toggleLightGC(enable) {
            if (enable) {
                _nbind.mark = function (obj) {
                    dirtyList.push(obj);
                    if (!gcTimer) gcTimer = setTimeout(sweep, 0);
                };
            } else {
                // tslint:disable-next-line:no-empty
                _nbind.mark = function (obj) {};
            }
        }
        _nbind.toggleLightGC = toggleLightGC;
        var _ = function () {
            function _() {}
            return _;
        }(); // tslint:disable-line:class-name
        _ = __decorate([emscripten_library_decorator_1.prepareNamespace('_nbind')], _);
        _nbind._ = _;
    })(_nbind = exports._nbind || (exports._nbind = {}));
});
$__System.registerDynamic("19", [], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
    // Released under the MIT license, see LICENSE.
    Object.defineProperty(exports, "__esModule", { value: true });
    function removeAccessorPrefix(name) {
        // The C++ side gives the same name to getters and setters.
        var prefixMatcher = /^[Gg]et_?([A-Z]?([A-Z]?))/;
        return name.replace(prefixMatcher, function (match, initial, second) {
            return second ? initial : initial.toLowerCase();
        });
    }
    exports.removeAccessorPrefix = removeAccessorPrefix;
});
$__System.registerDynamic('16', [], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
    // Released under the MIT license, see LICENSE.
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Type = (_a = typeModule(typeModule), _a.Type), exports.makeType = _a.makeType, exports.structureList = _a.structureList;
    /* tslint:disable:no-shadowed-variable */
    function typeModule(self) {
        // Parameter count and printable name of each StructureType.
        var structureList = [[0, 1, 'X'], [1 /* isConst */, 1, 'const X'], [128 /* isPointer */, 1, 'X *'], [256 /* isReference */, 1, 'X &'], [384 /* isRvalueRef */, 1, 'X &&'], [512 /* isSharedPtr */, 1, 'std::shared_ptr<X>'], [640 /* isUniquePtr */, 1, 'std::unique_ptr<X>'], [5120 /* isVector */, 1, 'std::vector<X>'], [6144 /* isArray */, 2, 'std::array<X, Y>'], [9216 /* isCallback */, -1, 'std::function<X (Y)>']];
        function applyStructure(outerName, outerFlags, innerName, innerFlags, param, flip) {
            if (outerFlags == 1 /* isConst */) {
                    var ref = innerFlags & 896 /* refMask */;
                    if (ref == 128 /* isPointer */ || ref == 256 /* isReference */ || ref == 384 /* isRvalueRef */) outerName = 'X const';
                }
            var name;
            if (flip) {
                name = innerName.replace('X', outerName).replace('Y', param);
            } else {
                name = outerName.replace('X', innerName).replace('Y', param);
            }
            // Remove spaces between consecutive * and & characters.
            return name.replace(/([*&]) (?=[*&])/g, '$1');
        }
        function reportProblem(problem, id, kind, structureType, place) {
            throw new Error(problem + ' type ' + kind.replace('X', id + '?') + (structureType ? ' with flag ' + structureType : '') + ' in ' + place);
        }
        function getComplexType(id, constructType, getType, queryType, place,
        // C++ type name string built top-down, for printing helpful errors.
        kind, // tslint:disable-line
        // Outer type, used only for updating kind.
        prevStructure, // tslint:disable-line
        depth // tslint:disable-line
        ) {
            // C++ type name string built top-down, for printing helpful errors.
            if (kind === void 0) {
                kind = 'X';
            }
            if (depth === void 0) {
                depth = 1;
            } // tslint:disable-line
            var result = getType(id);
            if (result) return result;
            var query = queryType(id);
            var structureType = query.placeholderFlag;
            var structure = structureList[structureType];
            if (prevStructure && structure) {
                kind = applyStructure(prevStructure[2], prevStructure[0], kind, structure[0], '?', true);
            }
            var problem;
            if (structureType == 0) problem = 'Unbound';
            if (structureType >= 10 /* max */) problem = 'Corrupt';
            if (depth > 20) problem = 'Deeply nested';
            if (problem) reportProblem(problem, id, kind, structureType, place || '?');
            var subId = query.paramList[0];
            var subType = getComplexType(subId, constructType, getType, queryType, place, kind, structure, depth + 1);
            var srcSpec;
            var spec = {
                flags: structure[0],
                id: id,
                name: '',
                paramList: [subType]
            };
            var argList = [];
            var structureParam = '?';
            switch (query.placeholderFlag) {
                case 1 /* constant */:
                    srcSpec = subType.spec;
                    break;
                case 2 /* pointer */:
                    if ((subType.flags & 15360 /* kindMask */) == 1024 /* isArithmetic */ && subType.spec.ptrSize == 1) {
                        spec.flags = 7168 /* isCString */;
                        break;
                    }
                // tslint:disable-next-line:no-switch-case-fall-through
                case 3 /* reference */:
                // tslint:disable-next-line:no-switch-case-fall-through
                case 6 /* unique */:
                // tslint:disable-next-line:no-switch-case-fall-through
                case 5 /* shared */:
                    srcSpec = subType.spec;
                    if ((subType.flags & 15360 /* kindMask */) != 2048 /* isClass */) {
                            // reportProblem('Unsupported', id, kind, structureType, place);
                        }
                    break;
                case 8 /* array */:
                    structureParam = '' + query.paramList[1];
                    spec.paramList.push(query.paramList[1]);
                    break;
                case 9 /* callback */:
                    for (var _i = 0, _a = query.paramList[1]; _i < _a.length; _i++) {
                        var paramId = _a[_i];
                        var paramType = getComplexType(paramId, constructType, getType, queryType, place, kind, structure, depth + 1);
                        argList.push(paramType.name);
                        spec.paramList.push(paramType);
                    }
                    structureParam = argList.join(', ');
                    break;
                default:
                    break;
            }
            spec.name = applyStructure(structure[2], structure[0], subType.name, subType.flags, structureParam);
            if (srcSpec) {
                for (var _b = 0, _c = Object.keys(srcSpec); _b < _c.length; _b++) {
                    var key = _c[_b];
                    spec[key] = spec[key] || srcSpec[key];
                }
                spec.flags |= srcSpec.flags;
            }
            return makeType(constructType, spec);
        }
        function makeType(constructType, spec) {
            var flags = spec.flags;
            var refKind = flags & 896 /* refMask */;
            var kind = flags & 15360 /* kindMask */;
            if (!spec.name && kind == 1024 /* isArithmetic */) {
                    if (spec.ptrSize == 1) {
                        spec.name = (flags & 16 /* isSignless */ ? '' : (flags & 8 /* isUnsigned */ ? 'un' : '') + 'signed ') + 'char';
                    } else {
                        spec.name = (flags & 8 /* isUnsigned */ ? 'u' : '') + (flags & 32 /* isFloat */ ? 'float' : 'int') + (spec.ptrSize * 8 + '_t');
                    }
                }
            if (spec.ptrSize == 8 && !(flags & 32 /* isFloat */)) kind = 64 /* isBig */;
            if (kind == 2048 /* isClass */) {
                    if (refKind == 512 /* isSharedPtr */ || refKind == 640 /* isUniquePtr */) {
                            kind = 4096 /* isSharedClassPtr */;
                        } else if (refKind) kind = 3072 /* isClassPtr */;
                }
            return constructType(kind, spec);
        }
        var Type = function () {
            function Type(spec) {
                this.id = spec.id;
                this.name = spec.name;
                this.flags = spec.flags;
                this.spec = spec;
            }
            Type.prototype.toString = function () {
                return this.name;
            };
            return Type;
        }();
        var output = {
            Type: Type,
            getComplexType: getComplexType,
            makeType: makeType,
            structureList: structureList
        };
        self.output = output;
        return self.output || output;
    }
    exports.typeModule = typeModule;
    var _a;
});
$__System.registerDynamic("a", ["e", "13", "c", "b", "10", "f", "11", "12", "14", "d", "15", "17", "18", "19", "16"], true, function ($__require, exports, module) {
    var global = this || self,
        GLOBAL = global;
    // This file is part of nbind, copyright (C) 2014-2016 BusFaster Ltd.
    // Released under the MIT license, see LICENSE.
    var __extends = exports && exports.__extends || function () {
        var extendStatics = Object.setPrototypeOf || { __proto__: [] } instanceof Array && function (d, b) {
            d.__proto__ = b;
        } || function (d, b) {
            for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
        };
        return function (d, b) {
            extendStatics(d, b);
            function __() {
                this.constructor = d;
            }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    }();
    var __decorate = exports && exports.__decorate || function (decorators, target, key, desc) {
        var c = arguments.length,
            r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc,
            d;
        if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
        return c > 3 && r && Object.defineProperty(target, key, r), r;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    // This file contains JavaScript functions directly exposed to C++ through
    // Emscripten library exports.
    var emscripten_library_decorator_1 = $__require("e");
    var Globals_1 = $__require("13");
    exports._globals = Globals_1._nbind;
    var BindingType_1 = $__require("c");
    exports._type = BindingType_1._nbind;
    var BindClass_1 = $__require("b");
    exports._class = BindClass_1._nbind;
    var External_1 = $__require("10");
    exports._external = External_1._nbind;
    var Callback_1 = $__require("f");
    exports._callback = Callback_1._nbind;
    var ValueObj_1 = $__require("11");
    exports._value = ValueObj_1._nbind;
    var BindingStd_1 = $__require("12");
    exports._std = BindingStd_1._nbind;
    var Caller_1 = $__require("14");
    exports._caller = Caller_1._nbind;
    var Wrapper_1 = $__require("d");
    exports._wrapper = Wrapper_1._nbind;
    var Resource_1 = $__require("15");
    exports._resource = Resource_1._nbind;
    var Buffer_1 = $__require("17");
    exports._buffer = Buffer_1._nbind;
    var GC_1 = $__require("18");
    exports._gc = GC_1._nbind;
    var common_1 = $__require("19");
    var Type_1 = $__require("16");
    // Let decorators run eval in current scope to read function source code.
    emscripten_library_decorator_1.setEvil(function (code) {
        return eval(code);
    });
    var _removeAccessorPrefix = common_1.removeAccessorPrefix;
    var _typeModule = Type_1.typeModule;
    var _nbind;
    (function (_nbind) {})(_nbind = exports._nbind || (exports._nbind = {}));
    emscripten_library_decorator_1.publishNamespace('_nbind');
    // Ensure the __extends function gets defined.
    var Dummy = function (_super) {
        __extends(Dummy, _super);
        function Dummy() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        return Dummy;
    }(Boolean);
    var nbind = function () {
        function nbind() {}
        nbind._nbind_register_pool = function (pageSize, usedPtr, rootPtr, pagePtr) {
            _nbind.Pool.pageSize = pageSize;
            _nbind.Pool.usedPtr = usedPtr / 4;
            _nbind.Pool.rootPtr = rootPtr;
            _nbind.Pool.pagePtr = pagePtr / 4;
            HEAP32[usedPtr / 4] = 0x01020304;
            if (HEAP8[usedPtr] == 1) _nbind.bigEndian = true;
            HEAP32[usedPtr / 4] = 0;
            _nbind.makeTypeKindTbl = (_a = {}, _a[1024 /* isArithmetic */] = _nbind.PrimitiveType, _a[64 /* isBig */] = _nbind.Int64Type, _a[2048 /* isClass */] = _nbind.BindClass, _a[3072 /* isClassPtr */] = _nbind.BindClassPtr, _a[4096 /* isSharedClassPtr */] = _nbind.SharedClassPtr, _a[5120 /* isVector */] = _nbind.ArrayType, _a[6144 /* isArray */] = _nbind.ArrayType, _a[7168 /* isCString */] = _nbind.CStringType, _a[9216 /* isCallback */] = _nbind.CallbackType, _a[10240 /* isOther */] = _nbind.BindType, _a);
            _nbind.makeTypeNameTbl = {
                'Buffer': _nbind.BufferType,
                'External': _nbind.ExternalType,
                'Int64': _nbind.Int64Type,
                '_nbind_new': _nbind.CreateValueType,
                'bool': _nbind.BooleanType,
                // 'cbFunction': _nbind.CallbackType,
                'cbFunction &': _nbind.CallbackType,
                'const cbFunction &': _nbind.CallbackType,
                'const std::string &': _nbind.StringType,
                'std::string': _nbind.StringType
            };
            Module['toggleLightGC'] = _nbind.toggleLightGC;
            _nbind.callUpcast = Module['dynCall_ii'];
            var globalScope = _nbind.makeType(_nbind.constructType, {
                flags: 2048 /* isClass */
                , id: 0,
                name: ''
            });
            globalScope.proto = Module;
            _nbind.BindClass.list.push(globalScope);
            var _a;
        };
        nbind._nbind_register_type = function (id, namePtr) {
            var name = _nbind.readAsciiString(namePtr);
            var spec = {
                flags: 10240 /* isOther */
                , id: id,
                name: name
            };
            _nbind.makeType(_nbind.constructType, spec);
        };
        nbind._nbind_register_primitive = function (id, size, flags) {
            var spec = {
                flags: 1024 /* isArithmetic */ | flags,
                id: id,
                ptrSize: size
            };
            _nbind.makeType(_nbind.constructType, spec);
        };
        nbind._nbind_register_class = function (idListPtr, policyListPtr, superListPtr, upcastListPtr, superCount, destructorPtr, namePtr) {
            var name = _nbind.readAsciiString(namePtr);
            var policyTbl = _nbind.readPolicyList(policyListPtr);
            var idList = HEAPU32.subarray(idListPtr / 4, idListPtr / 4 + 2);
            var spec = {
                flags: 2048 /* isClass */ | (policyTbl['Value'] ? 2 /* isValueObject */ : 0),
                id: idList[0],
                name: name
            };
            var bindClass = _nbind.makeType(_nbind.constructType, spec);
            bindClass.ptrType = _nbind.getComplexType(idList[1], _nbind.constructType, _nbind.getType, _nbind.queryType);
            bindClass.destroy = _nbind.makeMethodCaller(bindClass.ptrType, {
                boundID: spec.id,
                flags: 0 /* none */
                , name: 'destroy',
                num: 0,
                ptr: destructorPtr,
                title: bindClass.name + '.free',
                typeList: ['void', 'uint32_t', 'uint32_t']
            });
            if (superCount) {
                bindClass.superIdList = Array.prototype.slice.call(HEAPU32.subarray(superListPtr / 4, superListPtr / 4 + superCount));
                bindClass.upcastList = Array.prototype.slice.call(HEAPU32.subarray(upcastListPtr / 4, upcastListPtr / 4 + superCount));
            }
            Module[bindClass.name] = bindClass.makeBound(policyTbl);
            _nbind.BindClass.list.push(bindClass);
        };
        nbind._nbind_register_function = function (boundID, policyListPtr, typeListPtr, typeCount, ptr, direct, signatureType, namePtr, num, flags) {
            var bindClass = _nbind.getType(boundID);
            var policyTbl = _nbind.readPolicyList(policyListPtr);
            var typeList = _nbind.readTypeIdList(typeListPtr, typeCount);
            var specList;
            if (signatureType == 5 /* construct */) {
                    specList = [{
                        direct: ptr,
                        name: '__nbindConstructor',
                        ptr: 0,
                        title: bindClass.name + ' constructor',
                        typeList: ['uint32_t'].concat(typeList.slice(1))
                    }, {
                        direct: direct,
                        name: '__nbindValueConstructor',
                        ptr: 0,
                        title: bindClass.name + ' value constructor',
                        typeList: ['void', 'uint32_t'].concat(typeList.slice(1))
                    }];
                } else {
                var name = _nbind.readAsciiString(namePtr);
                var title = (bindClass.name && bindClass.name + '.') + name;
                if (signatureType == 3 /* getter */ || signatureType == 4 /* setter */) {
                        name = _removeAccessorPrefix(name);
                    }
                specList = [{
                    boundID: boundID,
                    direct: direct,
                    name: name,
                    ptr: ptr,
                    title: title,
                    typeList: typeList
                }];
            }
            for (var _i = 0, specList_1 = specList; _i < specList_1.length; _i++) {
                var spec = specList_1[_i];
                spec.signatureType = signatureType;
                spec.policyTbl = policyTbl;
                spec.num = num;
                spec.flags = flags;
                bindClass.addMethod(spec);
            }
        };
        nbind._nbind_finish = function () {
            for (var _i = 0, _a = _nbind.BindClass.list; _i < _a.length; _i++) {
                var bindClass = _a[_i];
                bindClass.finish();
            }
        };
        nbind.nbind_debug = function () {
            debugger;
        };
        return nbind;
    }();
    __decorate([emscripten_library_decorator_1.dep('_nbind')], nbind, "_nbind_register_pool", null);
    __decorate([emscripten_library_decorator_1.dep('_nbind', '_typeModule')], nbind, "_nbind_register_type", null);
    __decorate([emscripten_library_decorator_1.dep('_nbind')], nbind, "_nbind_register_primitive", null);
    __decorate([emscripten_library_decorator_1.dep('_nbind', '__extends')], nbind, "_nbind_register_class", null);
    __decorate([emscripten_library_decorator_1.dep('_nbind', '_removeAccessorPrefix')], nbind, "_nbind_register_function", null);
    __decorate([emscripten_library_decorator_1.dep('_nbind')], nbind, "_nbind_finish", null);
    __decorate([emscripten_library_decorator_1.dep('_nbind')], nbind, "nbind_debug", null);
    nbind = __decorate([emscripten_library_decorator_1.exportLibrary], nbind);
});
})
(function(factory) {
  if (typeof define == 'function' && define.amd)
    define([], factory);
  else if (typeof module == 'object' && module.exports && typeof require == 'function')
    module.exports = factory();
  else
    factory();
});