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
// Main //
//------//

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
  var lines
  var line
  var rows = {}
  var fields
  var uri
  var expected_fields
  var regex
  var skip_lines

  var fetcher = new Fetcher(opts)

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

  lines = stack.split('\n').slice(skip_lines)

  for (var i = 0; i < lines.length; i++) {
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
    var result = processSourceMaps(lines, rows, fetcher.mapForUri)
    done(result)
  })
}

//
//---------//
// Exports //
//---------//

export default { mapStackTrace }
