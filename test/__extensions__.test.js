'use strict'

import test from 'ava'
import PrototypeExtension from "../prototype-extension"

test("Extension is not available in the old accessor", t => {
    class G {}
    class Gx { static methodG(self) { return self.constructor.name + ": Gx" }}

    G._.extendWith(Gx, "xx")
    t.is(new G()._.__extensions__().Gx, undefined)
})

test('using accessor on __extensions__(true) instance', t => {
    class U {}
    class Ux { static methodS(self) { return "Ux" } }

    U._.extendWith(Ux)
    t.is(new U()._.__extensions__(true)._.U.Ux.methodS(), "Ux")
})

test('using accessor on __extensionmethods__(false) instance', t => {
    t.is({}._.__extensionmethods__().extendWith, PrototypeExtension.extendWith)
})

test('using accessor on __extensionmethods__(true) instance', t => {
    t.is({}._.__extensionmethods__(true)._.Object.PrototypeExtension.extendWith, PrototypeExtension.extendWith)
})

test('using accessor on __extensionmethods__(false) class', t => {
    t.is(PrototypeExtension.__extensionmethods__({}).extendWith, PrototypeExtension.extendWith)
})

test('using accessor on __extensionmethods__(true) class', t => {
    t.is(PrototypeExtension.__extensionmethods__({}, true)._.Object.PrototypeExtension.extendWith, PrototypeExtension.extendWith)
})
