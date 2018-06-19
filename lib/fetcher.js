//---------//
// Imports //
//---------//

import axios from 'axios'
import createSourceMapConsumer from './create-source-map-consumer'
import Semaphore from './semaphore'

import { bindAllPrototypeFunctions } from './helpers'

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

class Fetcher {
  constructor({ shouldSkipRequest }) {
    bindAllPrototypeFunctions(this)
    this.shouldSkipRequest = shouldSkipRequest
    this.sem = new Semaphore()
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

    return axios
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
    return createSourceMapConsumer(atob(content))
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
    return Promise.all([createSourceMapConsumer(fileContent), fileName])
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

export default Fetcher
