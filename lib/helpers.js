//------//
// Main //
//------//

//
// This is a crude way to bind all the functions on your prototype chain.  It
//   doesn't check the input, so make sure to pass `this` from constructor
//   functions (or classes).
//
// **Note this method binds all methods up the prototype except for Object,
//   which will be the root prototype for all instances.
//
function bindAllPrototypeFunctions(instance) {
  const prototypeChain = passThrough(instance, [
    getPrototypeChain,
    getAllButLast,
  ])

  prototypeChain.forEach(prototypeN => {
    Object.getOwnPropertyNames(prototypeN)
      .filter(key => {
        return key !== 'constructor' && typeof instance[key] === 'function'
      })
      .forEach(key => {
        instance[key] = instance[key].bind(instance)
      })
  })

  return instance
}

const justReturn = something => () => something

const processSourceMaps = (parsedStack, fileNameToSourceMapConsumer) => {
  return parsedStack.reduce((result, aStackFrame) => {
    const {
      fileName,
      functionName,
      lineNumber,
      columnNumber,
      source,
    } = aStackFrame

    const aSourceMapConsumer = fileNameToSourceMapConsumer[fileName]

    if (!aSourceMapConsumer) return mAppend(source, result)

    const sourceMapPosition = aSourceMapConsumer.originalPositionFor({
      column: columnNumber,
      line: lineNumber,
    })

    const formattedSourceMapFrame = getFormattedSourceMapFrame(
      sourceMapPosition,
      functionName
    )

    return mAppend(formattedSourceMapFrame, result)
  }, [])
}

//
//------------------//
// Helper Functions //
//------------------//

//
// 'm' stands for 'mutates' which refers to anArray being modified
//
function mAppend(anElement, anArray) {
  anArray.push(anElement)
  return anArray
}

function passThrough(something, arrayOfFunctions) {
  return arrayOfFunctions.reduce(
    (result, aFunction) => aFunction(result),
    something
  )
}

function getAllButLast(array) {
  return array.slice(0, -1)
}

function getPrototypeChain(instance) {
  const result = []

  let currentPrototype = Reflect.getPrototypeOf(instance)

  while (currentPrototype !== null) {
    result.push(currentPrototype)
    currentPrototype = Reflect.getPrototypeOf(currentPrototype)
  }

  return result
}

//
// TODO: figure out a better name for this function
//
function getFormattedSourceMapFrame(sourceMapPosition, functionNamePerBrowser) {
  const {
    column,
    line,
    name: functionNamePerSourceMap,
    source: sourcePerSourceMap,
  } = sourceMapPosition

  const functionName =
    functionNamePerSourceMap || functionNamePerBrowser || '(unknown)'

  const source = maybeTransformSource(sourcePerSourceMap)

  return `    at ${functionName} (${source}:${line}:${column})`
}

function startsWith(possiblePrefix, stringToTest) {
  const prefixLength = possiblePrefix.length
  if (prefixLength > stringToTest) return false

  return stringToTest.slice(0, prefixLength) === possiblePrefix
}

//
// Currently this only transforms the source property if it's a webpack file.
//   I'm leaving the function name generic because it may perform other
//   transforms in the future.
//
function maybeTransformSource(sourcePerSourceMap) {
  let result = sourcePerSourceMap

  const webpackFile = 'webpack:///'

  if (startsWith(webpackFile, sourcePerSourceMap)) {
    const sourceAfterWebpackFile = sourcePerSourceMap.slice(webpackFile.length)
    //
    // This has not undergone much testing.  I only noticed in the chrome
    //   debugger that console outputs this transformed path which allows us
    //   to click it.
    //
    result = `${webpackFile}./${sourceAfterWebpackFile}`
  }

  return result
}

//
//---------//
// Exports //
//---------//

export { bindAllPrototypeFunctions, justReturn, processSourceMaps }
