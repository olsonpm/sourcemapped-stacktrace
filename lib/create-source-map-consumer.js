//
// README
//  - This method only exists because it felt too awkward getting a promise
//    from a constructor.  At least now that awkward code only lives here!
//

import { SourceMapConsumer } from 'source-map/lib/source-map-consumer'

export default (...args) => new SourceMapConsumer(...args)
