//
// TODO: look into making these promises cancelable, because they do a good
//   amount of work and if the consumer decides they want to reject in the case
//   of a failed fetch, then all that work is for naught.
//

//---------//
// Imports //
//---------//

import axios from 'axios'
import createSourceMapConsumer from './create-source-map-consumer'

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
  constructor({ onFetchRejection, shouldSkipRequest }) {
    bindAllPrototypeFunctions(this)
    Object.assign(this, {
      onFetchRejection,
      shouldSkipRequest,
      fileNameToSourceMapConsumer: {},
    })
  }

  ajax(fileName) {
    if (this.shouldSkipRequest(fileName)) {
      return Promise.resolve({
        fileName,
        requestWasSkipped: true,
      })
    }

    return axios
      .get(fileName)
      .then(response => response.text())
      .then(fileContent => ({ fileContent, fileName }))
  }

  fetchScript(fileName) {
    if (fileName in this.fileNameToSourceMapConsumer) return Promise.resolve()

    this.fileNameToSourceMapConsumer[fileName] = null
    this.ajax(fileName)
      .then(ifRequestWasNotSkipped(this.onScriptLoad))
      //
      // Any number of reasons could cause a rejection when fetching a
      //   sourcemap, and processSourceMaps will take what it can get and
      //   fallback to the original source line when a sourcemapConsumer isn't
      //   available.  This is why the default onFetchRejection is a noop.
      //
      .catch(this.onFetchRejection)
  }

  handleEmbeddedSourceMap(content, fileName) {
    return createSourceMapConsumer(atob(content)).then(aSourceMapConsumer => {
      this.fileNameToSourceMapConsumer[fileName] = aSourceMapConsumer
    })
  }

  handleRemoteSourcemap({ fileContent, fileName }) {
    return Promise.all([createSourceMapConsumer(fileContent), fileName]).then(
      ([aSourceMapConsumer, fileName]) => {
        this.fileNameToSourceMapConsumer[fileName] = aSourceMapConsumer
      }
    )
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

    // no map
    if (!match || match.length !== 2) return Promise.resolve()

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
