//---------//
// Imports //
//---------//

import createSourceMapConsumer from './create-source-map-consumer'
import Semaphore from './semaphore'

import { bindAllPrototypeFunctions } from './helpers'

//
//------//
// Init //
//------//

const absUrlRegex = new RegExp('^(?:[a-z]+:)?//', 'i'),
  XMLHttpFactories = getXmlHttpFactories()

//
//------//
// Main //
//------//

class Fetcher {
  constructor() {
    bindAllPrototypeFunctions(this)
    this.sem = new Semaphore()
    this.fileNameToSourceMapConsumer = {}
  }

  ajax(fileName, callback) {
    const xhr = createXMLHTTPObject()

    xhr.onreadystatechange = () => {
      if (xhr.readyState == 4) {
        callback(xhr, fileName)
      }
    }
    xhr.open('GET', fileName)
    xhr.send()
  }

  fetchScript(fileName) {
    if (!(fileName in this.fileNameToSourceMapConsumer)) {
      this.sem.incr()
      this.fileNameToSourceMapConsumer[fileName] = null
    } else {
      return
    }

    this.ajax(fileName, this.onScriptLoad)
  }

  async onScriptLoad(xhr, fileName) {
    if (
      xhr.status === 200 ||
      (fileName.slice(0, 7) === 'file://' && xhr.status === 0)
    ) {
      // find .map in file.
      //
      // attempt to find it at the very end of the file, but tolerate trailing
      // whitespace inserted by some packers.
      const match = xhr.responseText.match(
        '//# [s]ourceMappingURL=(.*)[\\s]*$',
        'm'
      )
      if (match && match.length === 2) {
        // get the map
        let mapUri = match[1]

        const embeddedSourceMap = mapUri.match(
          'data:application/json;(charset=[^;]+;)?base64,(.*)'
        )

        if (embeddedSourceMap && embeddedSourceMap[2]) {
          this.fileNameToSourceMapConsumer[
            fileName
          ] = await createSourceMapConsumer(atob(embeddedSourceMap[2]))
          this.sem.decr()
        } else {
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

          this.ajax(mapUri, async xhr => {
            if (
              xhr.status === 200 ||
              (mapUri.slice(0, 7) === 'file://' && xhr.status === 0)
            ) {
              this.fileNameToSourceMapConsumer[
                fileName
              ] = await createSourceMapConsumer(xhr.responseText)
            }
            this.sem.decr()
          })
        }
      } else {
        // no map
        this.sem.decr()
      }
    } else {
      // HTTP error fetching fileName of the script
      this.sem.decr()
    }
  }
}

//
//------------------//
// Helper Functions //
//------------------//

function createXMLHTTPObject() {
  let xmlhttp = false

  for (let i = 0; i < XMLHttpFactories.length; i++) {
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
