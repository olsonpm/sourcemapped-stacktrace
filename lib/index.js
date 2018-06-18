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

import dedent from 'dedent'
import errorStackParser from 'error-stack-parser'
import { SourceMapConsumer } from 'source-map/lib/source-map-consumer'

import Fetcher from './fetcher'

import { processSourceMaps } from './helpers'

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

const initialize = argObject => {
  const { ignoreWarning, mappingsWasmArrayBuffer, mappingsWasmUrl } = argObject

  const urlWasPassed = !!mappingsWasmUrl,
    arrayBufferWasPassed = !!mappingsWasmArrayBuffer

  if (urlWasPassed === arrayBufferWasPassed) {
    throw new Error(
      dedent(`
        either mappingsWasmArrayBuffer or mappingsWasmUrl must be truthy

        is mappingsWasmUrl truthy: ${urlWasPassed}
        is mappingsWasmArrayBuffer truthy: ${arrayBufferWasPassed}
      `)
    )
  }

  const urlOrArrayBuffer = mappingsWasmUrl || mappingsWasmArrayBuffer

  if (urlWasPassed && typeof mappingsWasmUrl !== 'string') {
    throw new Error(
      dedent(`
        mappingsWasmUrl must be a string

        typeof mappingsWasmUrl: ${typeof mappingsWasmUrl}
        mappingsWasmUrl: ${mappingsWasmUrl}
      `)
    )
  } else if (
    arrayBufferWasPassed &&
    !(mappingsWasmArrayBuffer instanceof ArrayBuffer)
  ) {
    throw new Error('mappingsWasmArrayBuffer must be instanceof ArrayBuffer')
  }

  if (hasInitialized && !ignoreWarning) {
    // eslint-disable-next-line no-console
    console.error(
      'You have already initialized sourcemapped-stacktrace so this function is a noop.'
    )
  } else {
    hasInitialized = true
    SourceMapConsumer.initialize({
      'lib/mappings.wasm': urlOrArrayBuffer,
    })
  }
}

const mapStackTrace = anError => {
  return new Promise((resolve, reject) => {
    try {
      if (!hasInitialized) {
        throw new Error(
          'You must run `initialize` before calling `mapStackTrace`'
        )
      }

      const fetcher = new Fetcher(),
        parsedStack = errorStackParser.parse(anError)

      parsedStack
        .filter(aStackFrame => {
          return aStackFrame.fileName && !anonymousRe.test(aStackFrame.fileName)
        })
        .forEach(aStackFrame => {
          fetcher.fetchScript(aStackFrame.fileName)
        })

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
//---------//
// Exports //
//---------//

export default { initialize, mapStackTrace }
