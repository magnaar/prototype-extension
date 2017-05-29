'use strict'

import test from 'ava'
import PrototypeExtension from "../prototype-extension"
import ObjectExtension from "../object-extension"

test.serial('Extends Object with ObjectExtension', t => {
    Object._.extendWith(ObjectExtension)
    t.is(""._.__extensions__().ObjectExtension, ObjectExtension)
})
