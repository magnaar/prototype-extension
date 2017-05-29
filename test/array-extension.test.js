'use strict'

import test from 'ava'
import PrototypeExtension from "../prototype-extension"
import ArrayExtension from "../array-extension"

test.serial('Extends Array with ArrayExtension', t => {
    Array._.extendWith(ArrayExtension)
    t.is([]._.__extensions__().ArrayExtension, ArrayExtension)
})

test('ArrayExtension.flatten', t => {
    const flattened = [0, 1, [2, 3, [4, 5], 6], 7, [[[8], 9], 10]]._.flatten()
    t.plan(11)
    for (let i = 0; i < flattened.length; ++i)
        t.is(flattened[i], i)
})
