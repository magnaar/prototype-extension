'use strict'

import test from 'ava'
import PrototypeExtension from "../prototype-extension"

test("Can't use Extension method without the accessor", t => {
    t.is(Object.extendWith, undefined)
})

test("Can create a new accessor", t => {
    class F {}
    class Fx { static methodF(self) { return self.constructor.name + ": Fx" }}

    F._.extendWith(Fx, "xx")
    t.is(new F().xx.methodF(), "F: Fx")
})

test("Can overwrite the accessor property on an instance", t => {
    const obj = {}
    obj._ = "Hello"
    t.is(obj._, "Hello")
})

test("Can overwrite the accessor property on an instance with undefined", t => {
    const obj = {}
    obj._ = void 0
    t.is(obj._, void 0)
})

test("Accessor property can be checked with hasOwnProperty", t => {
    const obj = {}
    t.is(obj.hasOwnProperty("_"), false)
    obj._ = "Hello"
    t.is(obj.hasOwnProperty("_"), true)
})
