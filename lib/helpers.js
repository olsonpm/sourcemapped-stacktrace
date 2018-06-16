//------//
// Main //
//------//

const isChromeOrEdge = () => {
  return navigator.userAgent.toLowerCase().indexOf('chrome') > -1
}

const isFirefox = () => {
  return navigator.userAgent.toLowerCase().indexOf('firefox') > -1
}

const isSafari = () => {
  return navigator.userAgent.toLowerCase().indexOf('safari') > -1
}

const isIE11Plus = () => {
  return document.documentMode && document.documentMode >= 11
}

const processSourceMaps = (lines, rows, mapForUri) => {
  var result = []
  var map
  for (var i = 0; i < lines.length; i++) {
    var row = rows[i]
    if (row) {
      var uri = row[1]
      var line = parseInt(row[2], 10)
      var column = parseInt(row[3], 10)
      map = mapForUri[uri]

      if (map) {
        // we think we have a map for that uri. call source-map library
        var origPos = map.originalPositionFor({ line: line, column: column })
        result.push(
          formatOriginalPosition(
            origPos.source,
            origPos.line,
            origPos.column,
            origPos.name || origName(lines[i])
          )
        )
      } else {
        // we can't find a map for that url, but we parsed the row.
        // reformat unchanged line for consistency with the sourcemapped
        // lines.
        result.push(
          formatOriginalPosition(uri, line, column, origName(lines[i]))
        )
      }
    } else {
      // we weren't able to parse the row, push back what we were given
      result.push(lines[i])
    }
  }

  return result
}

//
//------------------//
// Helper Functions //
//------------------//

function origName(origLine) {
  var match = String(origLine).match(
    isChromeOrEdge() || isIE11Plus() ? / +at +([^ ]*).*/ : /([^@]*)@.*/
  )
  return match && match[1]
}

function formatOriginalPosition(source, line, column, name) {
  // mimic chrome's format
  return (
    '    at ' +
    (name ? name : '(unknown)') +
    ' (' +
    source +
    ':' +
    line +
    ':' +
    column +
    ')'
  )
}

//
//---------//
// Exports //
//---------//

export { isChromeOrEdge, isFirefox, isIE11Plus, isSafari, processSourceMaps }
