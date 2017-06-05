'use strict'

import test from 'ava'
import PrototypeExtension from "../prototype-extension"

//test.skip('No more known issues for the moment', t => {})

test.failing("Side effect: accessor properties are always true", t => {
    t.is({}._ && true, void 0)
})

test.failing("Call with a different instance between the accessor and the method", t => {
    class O { constructor(arg) { this.field = arg } }
    class Ox { static double(self) { return self.field + self.field } }
    O._.extendWith(Ox)

    const oInt = new O(21)
    const oString = new O("to")
    const accessor = oInt._
    t.is(oString._.double(), "toto")
    t.is(accessor.double(), 42)
})
