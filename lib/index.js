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

import tedent from 'tedent'
import errorStackParser from 'error-stack-parser'
import { SourceMapConsumer } from 'source-map/lib/source-map-consumer'

import Fetcher from './fetcher'

import { justReturn, processSourceMaps } from './helpers'

//
//------//
// Init //
//------//

const anonymousRe = /<anonymous>/,
  noop = () => {}

//
//------//
// Main //
//------//

const initialize = ({ urlToMappingsWasm }) => {
  if (!urlToMappingsWasm || typeof urlToMappingsWasm !== 'string') {
    throw new Error(
      tedent(`
        urlToMappingsWasm must be a non-empty string

        typeof urlToMappingsWasm: ${typeof urlToMappingsWasm}
        urlToMappingsWasm: ${urlToMappingsWasm}
      `)
    )
  }

  SourceMapConsumer.initialize({
    'lib/mappings.wasm': urlToMappingsWasm,
  })
}

const mapStackTrace = (anError, options = {}) => {
  const {
    onFetchRejection = noop,
    shouldSkipRequest = justReturn(false),
    timeoutMs = 3000,
  } = options

  return new Promise((resolve, reject) => {
    try {
      const fetcher = new Fetcher({ onFetchRejection, shouldSkipRequest }),
        arrayOfStackFrames = errorStackParser.parse(anError)

      //
      // TODO: rewrite this to reduce the stack frames into
      //   `fileNameToSourceMapConsumer` as opposed to have fetcher maintain
      //   that state on its own.  That means we'd need `resolveAllProperties`
      //   instead of `Promise.all`, but that's ezpz.
      //
      const fetchAllSourcemaps = arrayOfStackFrames
        .filter(({ fileName }) => fileName && !anonymousRe.test(fileName))
        .map(aStackFrame => fetcher.fetchScript(aStackFrame.fileName))

      waitMs(timeoutMs).then(() =>
        reject(
          new Error(
            tedent(`
              mapStackTrace has timed out

              timeoutMs: ${timeoutMs}

              you can pass a more appropriate 'timeoutMs' value as an option if
              this does not suit your needs.
            `)
          )
        )
      )

      Promise.all(fetchAllSourcemaps)
        .then(() => {
          const result = processSourceMaps(
            arrayOfStackFrames,
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
        .catch(reject)
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

export default { initialize, mapStackTrace }
