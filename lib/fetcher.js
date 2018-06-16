//---------//
// Imports //
//---------//

import { SourceMapConsumer } from 'source-map/lib/source-map-consumer'

import Semaphore from './semaphore'

//
//------//
// Init //
//------//

var absUrlRegex = new RegExp('^(?:[a-z]+:)?//', 'i'),
  global_mapForUri = {},
  XMLHttpFactories = getXmlHttpFactories()

//
//------//
// Main //
//------//

class Fetcher {
  constructor(opts) {
    this.sem = new Semaphore()
    this.mapForUri = opts && opts.cacheGlobally ? global_mapForUri : {}
  }

  ajax(uri, callback) {
    var xhr = createXMLHTTPObject()
    var that = this
    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        callback.call(that, xhr, uri)
      }
    }
    xhr.open('GET', uri)
    xhr.send()
  }

  fetchScript(uri) {
    if (!(uri in this.mapForUri)) {
      this.sem.incr()
      this.mapForUri[uri] = null
    } else {
      return
    }

    this.ajax(uri, this.onScriptLoad)
  }

  onScriptLoad(xhr, uri) {
    if (
      xhr.status === 200 ||
      (uri.slice(0, 7) === 'file://' && xhr.status === 0)
    ) {
      // find .map in file.
      //
      // attempt to find it at the very end of the file, but tolerate trailing
      // whitespace inserted by some packers.
      var match = xhr.responseText.match(
        '//# [s]ourceMappingURL=(.*)[\\s]*$',
        'm'
      )
      if (match && match.length === 2) {
        // get the map
        var mapUri = match[1]

        var embeddedSourceMap = mapUri.match(
          'data:application/json;(charset=[^;]+;)?base64,(.*)'
        )

        if (embeddedSourceMap && embeddedSourceMap[2]) {
          this.mapForUri[uri] = new SourceMapConsumer(
            atob(embeddedSourceMap[2])
          )
          this.sem.decr()
        } else {
          if (!absUrlRegex.test(mapUri)) {
            // relative url; according to sourcemaps spec is 'source origin'
            var origin
            var lastSlash = uri.lastIndexOf('/')
            if (lastSlash !== -1) {
              origin = uri.slice(0, lastSlash + 1)
              mapUri = origin + mapUri
              // note if lastSlash === -1, actual script uri has no slash
              // somehow, so no way to use it as a prefix... we give up and try
              // as absolute
            }
          }

          this.ajax(mapUri, function(xhr) {
            if (
              xhr.status === 200 ||
              (mapUri.slice(0, 7) === 'file://' && xhr.status === 0)
            ) {
              this.mapForUri[uri] = new SourceMapConsumer(xhr.responseText)
            }
            this.sem.decr()
          })
        }
      } else {
        // no map
        this.sem.decr()
      }
    } else {
      // HTTP error fetching uri of the script
      this.sem.decr()
    }
  }
}

//
//------------------//
// Helper Functions //
//------------------//

function createXMLHTTPObject() {
  var xmlhttp = false
  for (var i = 0; i < XMLHttpFactories.length; i++) {
    try {
      xmlhttp = XMLHttpFactories[i]()
    } catch (e) {
      continue
    }
    break
  }
  return xmlhttp
}

function getXmlHttpFactories() {
  return [
    () => new XMLHttpRequest(),
    () => new ActiveXObject('Msxml2.XMLHTTP'),
    () => new ActiveXObject('Msxml3.XMLHTTP'),
    () => new ActiveXObject('Microsoft.XMLHTTP'),
  ]
}

//
//---------//
// Exports //
//---------//

export default Fetcher
