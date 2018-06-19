module.exports =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./lib/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./lib/index.js":
/*!**********************************!*\
  !*** ./lib/index.js + 4 modules ***!
  \**********************************/
/*! exports provided: default */
/*! ModuleConcatenation bailout: Cannot concat with external "axios" (<- Module is not an ECMAScript module) */
/*! ModuleConcatenation bailout: Cannot concat with external "dedent" (<- Module is not an ECMAScript module) */
/*! ModuleConcatenation bailout: Cannot concat with external "error-stack-parser" (<- Module is not an ECMAScript module) */
/*! ModuleConcatenation bailout: Cannot concat with external "source-map/lib/source-map-consumer" (<- Module is not an ECMAScript module) */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";

// EXTERNAL MODULE: external "dedent"
var external_dedent_ = __webpack_require__("dedent");
var external_dedent_default = /*#__PURE__*/__webpack_require__.n(external_dedent_);

// EXTERNAL MODULE: external "error-stack-parser"
var external_error_stack_parser_ = __webpack_require__("error-stack-parser");
var external_error_stack_parser_default = /*#__PURE__*/__webpack_require__.n(external_error_stack_parser_);

// EXTERNAL MODULE: external "source-map/lib/source-map-consumer"
var source_map_consumer_ = __webpack_require__("source-map/lib/source-map-consumer");

// EXTERNAL MODULE: external "axios"
var external_axios_ = __webpack_require__("axios");
var external_axios_default = /*#__PURE__*/__webpack_require__.n(external_axios_);

// CONCATENATED MODULE: ./lib/create-source-map-consumer.js
//
// README
//  - This method only exists because it felt too awkward getting a promise
//    from a constructor.  At least now that awkward code only lives here!
//



/* harmony default export */ var create_source_map_consumer = ((...args) => new source_map_consumer_["SourceMapConsumer"](...args));

// CONCATENATED MODULE: ./lib/semaphore.js
//
// TODO: remove this file and utilize promises instead
//

//------//
// Main //
//------//

class Semaphore {
  constructor() {
    this.count = 0
    this.pending = []
  }

  incr() {
    this.count += 1
  }

  decr() {
    this.count -= 1
    this.flush()
  }

  whenReady(fn) {
    this.pending.push(fn)
    this.flush()
  }

  flush() {
    if (this.count === 0) {
      this.pending.forEach(function(fn) {
        fn()
      })
      this.pending = []
    }
  }
}

//
//---------//
// Exports //
//---------//

/* harmony default export */ var semaphore = (Semaphore);

// CONCATENATED MODULE: ./lib/helpers.js
//------//
// Main //
//------//

//
// This is a crude way to bind all the functions on your prototype chain.  It
//   doesn't check the input, so make sure to pass `this` from constructor
//   functions (or classes).
//
// **Note this method binds all methods up the prototype except for Object,
//   which will be the root prototype for all instances.
//
function bindAllPrototypeFunctions(instance) {
  const prototypeChain = passThrough(instance, [
    getPrototypeChain,
    getAllButLast,
  ])

  prototypeChain.forEach(prototypeN => {
    Object.getOwnPropertyNames(prototypeN)
      .filter(key => {
        return key !== 'constructor' && typeof instance[key] === 'function'
      })
      .forEach(key => {
        instance[key] = instance[key].bind(instance)
      })
  })

  return instance
}

const justReturn = something => () => something

const processSourceMaps = (parsedStack, fileNameToSourceMapConsumer) => {
  return parsedStack.reduce((result, aStackFrame) => {
    const {
      fileName,
      functionName,
      lineNumber,
      columnNumber,
      source,
    } = aStackFrame

    const aSourceMapConsumer = fileNameToSourceMapConsumer[fileName]

    if (!aSourceMapConsumer) return mAppend(source, result)

    const sourceMapPosition = aSourceMapConsumer.originalPositionFor({
      column: columnNumber,
      line: lineNumber,
    })

    const formattedSourceMapFrame = getFormattedSourceMapFrame(
      sourceMapPosition,
      functionName
    )

    return mAppend(formattedSourceMapFrame, result)
  }, [])
}

//
//------------------//
// Helper Functions //
//------------------//

//
// 'm' stands for 'mutates' which refers to anArray being modified
//
function mAppend(anElement, anArray) {
  anArray.push(anElement)
  return anArray
}

function passThrough(something, arrayOfFunctions) {
  return arrayOfFunctions.reduce(
    (result, aFunction) => aFunction(result),
    something
  )
}

function getAllButLast(array) {
  return array.slice(0, -1)
}

function getPrototypeChain(instance) {
  const result = []

  let currentPrototype = Reflect.getPrototypeOf(instance)

  while (currentPrototype !== null) {
    result.push(currentPrototype)
    currentPrototype = Reflect.getPrototypeOf(currentPrototype)
  }

  return result
}

//
// TODO: figure out a better name for this function
//
function getFormattedSourceMapFrame(sourceMapPosition, functionNamePerBrowser) {
  const {
    column,
    line,
    name: functionNamePerSourceMap,
    source: sourcePerSourceMap,
  } = sourceMapPosition

  const functionName =
    functionNamePerSourceMap || functionNamePerBrowser || '(unknown)'

  const source = maybeTransformSource(sourcePerSourceMap)

  return `    at ${functionName} (${source}:${line}:${column})`
}

function startsWith(possiblePrefix, stringToTest) {
  const prefixLength = possiblePrefix.length
  if (prefixLength > stringToTest) return false

  return stringToTest.slice(0, prefixLength) === possiblePrefix
}

//
// Currently this only transforms the source property if it's a webpack file.
//   I'm leaving the function name generic because it may perform other
//   transforms in the future.
//
function maybeTransformSource(sourcePerSourceMap) {
  let result = sourcePerSourceMap

  const webpackFile = 'webpack:///'

  if (startsWith(webpackFile, sourcePerSourceMap)) {
    const sourceAfterWebpackFile = sourcePerSourceMap.slice(webpackFile.length)
    //
    // This has not undergone much testing.  I only noticed in the chrome
    //   debugger that console outputs this transformed path which allows us
    //   to click it.
    //
    result = `${webpackFile}./${sourceAfterWebpackFile}`
  }

  return result
}

//
//---------//
// Exports //
//---------//



// CONCATENATED MODULE: ./lib/fetcher.js
//---------//
// Imports //
//---------//







//
//------//
// Init //
//------//

const absUrlRegex = /^(?:[a-z]+:)?\/\//i,
  embeddedSourceMapRe = /data:application\/json;(charset=[^;]+;)?base64,(.*)/,
  sourceMapUrlRe = /\/\/# [s]ourceMappingURL=(.*)[\\s]*$/m

//
//------//
// Main //
//------//

class fetcher_Fetcher {
  constructor({ shouldSkipRequest }) {
    bindAllPrototypeFunctions(this)
    this.shouldSkipRequest = shouldSkipRequest
    this.sem = new semaphore()
    this.fileNameToSourceMapConsumer = {}
  }

  ajax(fileName) {
    if (this.shouldSkipRequest(fileName)) {
      this.sem.decr()
      return Promise.resolve({
        fileName,
        requestWasSkipped: true,
      })
    }

    return external_axios_default.a
      .get(fileName)
      .then(response => response.text())
      .then(fileContent => ({ fileContent, fileName }))
      .catch(this.decrementSemaphoreAndRejectError)
  }

  fetchScript(fileName) {
    if (fileName in this.fileNameToSourceMapConsumer) return

    this.sem.incr()
    this.fileNameToSourceMapConsumer[fileName] = null
    this.ajax(fileName).then(ifRequestWasNotSkipped(this.onScriptLoad))
  }

  handleEmbeddedSourceMap(content, fileName) {
    return create_source_map_consumer(atob(content))
      .catch(this.decrementSemaphoreAndRejectError)
      .then(aSourceMapConsumer => {
        this.fileNameToSourceMapConsumer[fileName] = aSourceMapConsumer
        this.sem.decr()
      })
  }

  decrementSemaphoreAndRejectError(e) {
    this.sem.decr()
    return Promise.reject(e)
  }

  handleRemoteSourcemap({ fileContent, fileName }) {
    return Promise.all([create_source_map_consumer(fileContent), fileName])
      .catch(this.decrementSemaphoreAndRejectError)
      .then(([aSourceMapConsumer, fileName]) => {
        this.sem.decr()
        this.fileNameToSourceMapConsumer[fileName] = aSourceMapConsumer
      })
  }

  //
  // TODO: Clean up this method so the shortcutting return statements make
  //   more sense
  //
  // TODO: See if external libraries exist which handle all this custom parsing
  //
  onScriptLoad([fileContent, fileName]) {
    // find .map in file.
    //
    // attempt to find it at the very end of the file, but tolerate trailing
    // whitespace inserted by some packers.
    const match = fileContent.match(sourceMapUrlRe)

    if (!match || match.length !== 2) {
      // no map
      this.sem.decr()
      return Promise.resolve()
    }

    // get the map
    let mapUri = match[1]

    const embeddedSourceMap = mapUri.match(embeddedSourceMapRe),
      content = embeddedSourceMap && embeddedSourceMap[2]

    if (content) return this.handleEmbeddedSourceMap(content, fileName)

    if (!absUrlRegex.test(mapUri)) {
      // relative url; according to sourcemaps spec is 'source origin'
      const lastSlash = fileName.lastIndexOf('/')
      if (lastSlash !== -1) {
        const origin = fileName.slice(0, lastSlash + 1)
        mapUri = origin + mapUri
        // note if lastSlash === -1, actual script fileName has no slash
        // somehow, so no way to use it as a prefix... we give up and try
        // as absolute
      }
    }

    return this.ajax(mapUri).then(
      ifRequestWasNotSkipped(this.handleRemoteSourcemap)
    )
  }
}

//
//------------------//
// Helper Functions //
//------------------//

function ifRequestWasNotSkipped(callback) {
  return result => {
    return result.requestWasSkipped ? undefined : callback(result)
  }
}

//
//---------//
// Exports //
//---------//

/* harmony default export */ var lib_fetcher = (fetcher_Fetcher);

// CONCATENATED MODULE: ./lib/index.js
//
// README
//   - We're kind of stuck with the 'initialize' method unless and until
//     source-map decides to make SourceMapConsumer a non-stateful singleton.
//     Ideally they would have provided a factory method that allows us to
//     initialize multiple SourceMapConsumer's.
//

//
// TODO: reorganize SourceMapConsumer code to utilize its new `with` method.
//   The goal is to remove the state being passed around because it makes the
//   code more complex.
//
//   reference: https://github.com/mozilla/source-map#sourcemapconsumerwith
//

/*
 * sourcemapped-stacktrace.js
 * created by James Salter <iteration@gmail.com> (2014)
 *
 * https://github.com/novocaine/sourcemapped-stacktrace
 *
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

//---------//
// Imports //
//---------//









//
//------//
// Init //
//------//

const anonymousRe = /<anonymous>/

let hasInitialized = false

//
//------//
// Main //
//------//

const initialize = ({ ignoreWarning, urlToMappingsWasm }) => {
  if (!urlToMappingsWasm || typeof urlToMappingsWasm !== 'string') {
    throw new Error(
      external_dedent_default()(`
        urlToMappingsWasm must be a non-empty string

        typeof urlToMappingsWasm: ${typeof urlToMappingsWasm}
        urlToMappingsWasm: ${urlToMappingsWasm}
      `)
    )
  }

  if (hasInitialized && !ignoreWarning) {
    // eslint-disable-next-line no-console
    console.error(
      'You have already initialized sourcemapped-stacktrace so this function is a noop.'
    )
  } else {
    hasInitialized = true
    source_map_consumer_["SourceMapConsumer"].initialize({
      'lib/mappings.wasm': urlToMappingsWasm,
    })
  }
}

const mapStackTrace = (anError, options = {}) => {
  const { shouldSkipRequest = justReturn(false), timeoutMs = 2000 } = options

  return new Promise((resolve, reject) => {
    try {
      if (!hasInitialized) {
        throw new Error(
          'You must run `initialize` before calling `mapStackTrace`'
        )
      }

      const fetcher = new lib_fetcher({ shouldSkipRequest }),
        parsedStack = external_error_stack_parser_default.a.parse(anError)

      parsedStack
        .filter(aStackFrame => {
          return aStackFrame.fileName && !anonymousRe.test(aStackFrame.fileName)
        })
        .forEach(aStackFrame => {
          fetcher.fetchScript(aStackFrame.fileName)
        })

      waitMs(timeoutMs).then(() =>
        reject(
          new Error(
            external_dedent_default()(`
              mapStackTrace has timed out

              timeoutMs: ${timeoutMs}

              you can pass a more appropriate 'timeoutMs' value as an option if
              this does not suit your needs.
            `)
          )
        )
      )

      fetcher.sem.whenReady(() => {
        const result = processSourceMaps(
          parsedStack,
          fetcher.fileNameToSourceMapConsumer
        )

        const { fileNameToSourceMapConsumer } = fetcher

        Object.keys(fileNameToSourceMapConsumer)
          .filter(fileName => fileNameToSourceMapConsumer[fileName])
          .forEach(fileName => {
            fetcher.fileNameToSourceMapConsumer[fileName].destroy()
          })

        resolve(result)
      })
    } catch (e) {
      reject(e)
    }
  })
}

//
//------------------//
// Helper Functions //
//------------------//

function waitMs(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

//
//---------//
// Exports //
//---------//

/* harmony default export */ var lib = __webpack_exports__["default"] = ({ initialize, mapStackTrace });


/***/ }),

/***/ "axios":
/*!************************!*\
  !*** external "axios" ***!
  \************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

module.exports = require("axios");

/***/ }),

/***/ "dedent":
/*!*************************!*\
  !*** external "dedent" ***!
  \*************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

module.exports = require("dedent");

/***/ }),

/***/ "error-stack-parser":
/*!*************************************!*\
  !*** external "error-stack-parser" ***!
  \*************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

module.exports = require("error-stack-parser");

/***/ }),

/***/ "source-map/lib/source-map-consumer":
/*!*****************************************************!*\
  !*** external "source-map/lib/source-map-consumer" ***!
  \*****************************************************/
/*! no static exports found */
/*! ModuleConcatenation bailout: Module is not an ECMAScript module */
/***/ (function(module, exports) {

module.exports = require("source-map/lib/source-map-consumer");

/***/ })

/******/ })["default"];
//# sourceMappingURL=index.js.map