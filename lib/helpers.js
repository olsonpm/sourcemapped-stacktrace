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
  const result = []

  for (let i = 0; i < lines.length; i++) {
    const row = rows[i]
    if (row) {
      const uri = row[1],
        line = parseInt(row[2], 10),
        column = parseInt(row[3], 10),
        map = mapForUri[uri]

      if (map) {
        // we think we have a map for that uri. call source-map library
        const origPos = map.originalPositionFor({ line: line, column: column })
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
  const match = String(origLine).match(
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
