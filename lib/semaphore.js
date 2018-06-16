//------//
// Main //
//------//

class Semaphore {
  constructor() {
    this.count = 0
    this.pending = []
  }

  incr() {
    this.count += 1
  }

  decr() {
    this.count -= 1
    this.flush()
  }

  whenReady(fn) {
    this.pending.push(fn)
    this.flush()
  }

  flush() {
    if (this.count === 0) {
      this.pending.forEach(function(fn) {
        fn()
      })
      this.pending = []
    }
  }
}

//
//---------//
// Exports //
//---------//

export default Semaphore
