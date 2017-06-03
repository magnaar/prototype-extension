'use strict'

import test from 'ava'
import PrototypeExtension from "../prototype-extension"

test("Can't add twice the same extension", t => {
    class Twice {}
    class TwiceX {}
    try
    {
        Twice._.extendWith(TwiceX)
        Twice._.extendWith(TwiceX)
        t.fail()
    }
    catch (error)
    {
        const expectedError = 'Error: "Twice" already has "TwiceX" as extension'
        if (error.toString() == expectedError)
            t.pass()
        else
            t.fail(`value   : ${error}\nexpected: ${expectedError}`)
    }
})

test("Can't have twice the same method name on the same prototype", t => {
    class M {}
    class Mx { static methodM(self) {} }
    class M2x { static methodM(self) {} }
    M._.extendWith(Mx)
    try
    {
        M._.extendWith(M2x)
        t.fail()
    }
    catch (error)
    {
        const expectedError = 'Error: "M" already has a "methodM" method'
        if (error.toString() == expectedError)
            t.pass()
        else
            t.fail(`value   : ${error}\nexpected: ${expectedError}`)
    }
})

test("Scoped prototype extends outside ones: Same method extension names", t => {
    (() => {
        class S {}
        class Sx { static methodS(self) {} }
        S._.extendWith(Sx)
    })()
    
    class S {}
    class SOx { static methodS(self) {} }
    try
    {
        S._.extendWith(SOx)
        t.pass()
    }
    catch (error)
    {
        t.fail(error.toString())
    }
})

test("Scoped prototype doesn't extends outside ones: Same extension names", t => {
    (() => {
        class S {}
        class Sx { static methodS(self) {} }
        S._.extendWith(Sx)
    })()
    
    class S {}
    class Sx { static anotherMethod(self) {} }
    try
    {
        S._.extendWith(Sx)
        t.pass()
    }
    catch (error)
    {
        t.fail(error.toString())
    }
})

test("Can't find dynamically added methods", t => {
    class Dynami {}
    class DynamiX {}
    try
    {
        Dynami._.extendWith(DynamiX)
        DynamiX.dynamicMethod = function (self) { return "dynamicMethod" }
        new Dynami()._.dynamicMethod()
        t.fail()
    }
    catch (error)
    {
        const expectedError = `Error: "Dynami" doesn't have a method "dynamicMethod" in its extensions.`
        if (error.toString() == expectedError)
            t.pass()
        else
            t.fail(`value   : ${error}\nexpected: ${expectedError}`)
    }
})

test("Extension method is unavailable after unextendwith", t => {
    class K {}
    class Kx { static methodK(self) { return self.constructor.name + ": Kx" }}

    K._.extendWith(Kx)
    t.is(new K()._.methodK(), "K: Kx")
    K._.unextendWith(Kx)
    try
    {
        t.is(new K()._.methodK, void 0)
        t.fail()
    }
    catch (error)
    {
        const expectedError = `Error: "K" doesn't have a method "methodK" in its extensions.`
        if (error.toString() == expectedError)
            t.pass()
        else
            t.fail(`value   : ${error}\nexpected: ${expectedError}`)
    }
})

test("Extension class is unavailable after unextendwith", t => {
    class K {}
    class Kx { static methodK(self) { return self.constructor.name + ": Kx" }}

    K._.extendWith(Kx)
    t.is(new K()._.__extensions__().Kx, Kx)
    K._.unextendWith(Kx)
    t.is(new K()._.__extensions__().Kx, void 0)
})

test("Extension method is unavailable with __extensionmethods__ after unextendwith", t => {
    class K {}
    class Kx { static methodK(self) { return self.constructor.name + ": Kx" }}

    K._.extendWith(Kx)
    t.is(new K()._.methodK(), "K: Kx")
    K._.unextendWith(Kx)
    t.is(new K()._.__extensionmethods__.methodK, void 0)
})