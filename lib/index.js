//
// README
//   - We're kind of stuck with the 'initialize' method unless and until
//     source-map decides to make SourceMapConsumer a non-stateful singleton.
//     Ideally they would have provided a factory method that allows us to
//     initialize multiple SourceMapConsumer's.
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

import dedentMacro from 'dedent/macro'
import { SourceMapConsumer } from 'source-map/lib/source-map-consumer'

import Fetcher from './fetcher'

import {
  isChromeOrEdge,
  isFirefox,
  isIE11Plus,
  isSafari,
  processSourceMaps,
} from './helpers'

//
//------//
// Init //
//------//

let hasInitialized = false

//
//------//
// Main //
//------//

const initialize = ({ ignoreWarning, urlToMappingsWasm }) => {
  if (!urlToMappingsWasm || typeof urlToMappingsWasm !== 'string') {
    throw new Error(
      dedentMacro(`
        urlToMappingsWasm must be a non-empty string

        typeof urlToMappingsWasm: ${typeof urlToMappingsWasm}
        urlToMappingsWasm: ${urlToMappingsWasm}
      `)
    )
  }

  if (hasInitialized && !ignoreWarning) {
    // eslint-disable-next-line no-console
    console.error(
      'You have already initialized sourcemapped-stacktrace, so this function is a noop.'
    )
  } else {
    hasInitialized = true
    SourceMapConsumer.initialize({
      'lib/mappings.wasm': urlToMappingsWasm,
    })
  }
}

/**
 * Re-map entries in a stacktrace using sourcemaps if available.
 *
 * @param {Array} stack - Array of strings from the browser's stack
 *                        representation. Currently only Chrome
 *                        format is supported.
 * @param {function} done - Callback invoked with the transformed stacktrace
 *                          (an Array of Strings) passed as the first
 *                          argument
 * @param {Object} [opts] - Optional options object.
 * @param {Function} [opts.filter] - Filter function applied to each stackTrace line.
 *                                   Lines which do not pass the filter won't be processesd.
 * @param {boolean} [opts.cacheGlobally] - Whether to cache sourcemaps globally across multiple calls.
 */
const mapStackTrace = (stack, done, opts) => {
  if (!hasInitialized) {
    throw new Error('You must run `initialize` before calling `mapStackTrace`')
  }

  const rows = {},
    fetcher = new Fetcher(opts)

  let line, fields, uri, expected_fields, regex, skip_lines

  if (isChromeOrEdge() || isIE11Plus()) {
    regex = /^ +at.+\((.*):([0-9]+):([0-9]+)/
    expected_fields = 4
    // (skip first line containing exception message)
    skip_lines = 1
  } else if (isFirefox() || isSafari()) {
    regex = /@(.*):([0-9]+):([0-9]+)/
    expected_fields = 4
    skip_lines = 0
  } else {
    throw new Error('unknown browser :(')
  }

  const lines = stack.split('\n').slice(skip_lines)

  for (let i = 0; i < lines.length; i++) {
    line = lines[i]
    if (opts && opts.filter && !opts.filter(line)) continue

    fields = line.match(regex)
    if (fields && fields.length === expected_fields) {
      rows[i] = fields
      uri = fields[1]
      if (!uri.match(/<anonymous>/)) {
        fetcher.fetchScript(uri)
      }
    }
  }

  fetcher.sem.whenReady(function() {
    const result = processSourceMaps(lines, rows, fetcher.mapForUri)

    if (!(opts && opts.cacheGlobally)) {
      //
      // if there's no cache, then we need to destroy the SourceMap consumers
      //
      Object.keys(fetcher.mapForUri).forEach(uri => {
        const aSourceMapConsumer = fetcher.mapForUri[uri]
        aSourceMapConsumer.destroy()
      })
    }

    done(result)
  })
}

//
//---------//
// Exports //
//---------//

export { initialize, mapStackTrace }
