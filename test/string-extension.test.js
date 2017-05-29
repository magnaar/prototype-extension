'use strict'

import test from 'ava'
import PrototypeExtension from "../prototype-extension"
import StringExtension from "../string-extension"

test.serial('Extends String with StringExtension', t => {
    String._.extendWith(StringExtension)
    t.is(""._.__extensions__().StringExtension, StringExtension)
})
