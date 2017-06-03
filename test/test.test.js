'use strict'

import test from 'ava'
import PrototypeExtension from "../prototype-extension"

test.serial('Object is extended with PrototypeExtension', t => {
    t.is(Object._.__extensions__().PrototypeExtension, PrototypeExtension)
})

test('Extends I with Ix, instance of I has methodI from Ix', t => {
    class I {}
    class Ix { static methodI(self) { return self.constructor.name + ": Ix" }}
    I._.extendWith(Ix)
    const i = new I()
    t.is(i._.methodI(), "I: Ix")
})

test("Prototype inheritance means Extension inheritance", t => {
    class A {}
    class B extends A {}
    class C extends B {}

    class Ax { static methodA(self) { return self.constructor.name + ": Ax" }}
    class Bx { static methodB(self) { return self.constructor.name + ": Bx" }}
    class Cx { static methodC(self) { return self.constructor.name + ": Cx" }}

    A._.extendWith(Ax)
    B._.extendWith(Bx)
    C._.extendWith(Cx)

    const a = new A,
        b = new B,
        c = new C

    t.is(a._.methodA(), "A: Ax")

    t.is(b._.methodA(), "B: Ax")
    t.is(b._.methodB(), "B: Bx")

    t.is(c._.methodA(), "C: Ax")
    t.is(c._.methodB(), "C: Bx")
    t.is(c._.methodC(), "C: Cx")
})

test("Can add several time the same extension in the prototype chain", t => {
    class D {}
    class E extends D {}
    class Commonx { static methodCommon(self) { return self.constructor.name + ": Commonx" }}

    D._.extendWith(Commonx)
    E._.extendWith(Commonx)
    t.is(new D()._.methodCommon(), "D: Commonx")
    t.is(new E()._.methodCommon(), "E: Commonx")
})

test("Overriding extension method with the prototype chain", t => {
    class H {}
    class I extends H {}
    class J extends I {}
    class Edgex { static method(self) { return self.constructor.name + ": Edgex" }}
    class Middlex { static method(self) { return self.constructor.name + ": Middlex" }}

    H._.extendWith(Edgex)
    I._.extendWith(Middlex)
    J._.extendWith(Edgex)
    t.is(new H()._.method(), "H: Edgex")
    t.is(new I()._.method(), "I: Middlex")
    t.is(new J()._.method(), "J: Edgex")
})

test("Can add a second time the same extension after using unextendWith", t => {
    class Twice2 {}
    class Twice2X {}
    Twice2._.extendWith(Twice2X)
    Twice2._.unextendWith(Twice2X)
    Twice2._.extendWith(Twice2X)
    t.pass()
})

test("Can add a second time the an extension with the same method name after using unextendWith", t => {
    class N {}
    class Nx { static methodN(self) {} }
    class N2x { static methodN(self) {} }
    N._.extendWith(Nx)
    N._.unextendWith(Nx)
    N._.extendWith(Nx)
    t.pass()
})
