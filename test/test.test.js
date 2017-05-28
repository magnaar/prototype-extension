import test from 'ava'
import PrototypeExtension from "../prototype-extension"

test.serial('Object is extended with PrototypeExtension', t => {
    t.is(Object._.__extensions__().PrototypeExtension, PrototypeExtension)
});

test("Can't use Extension method without the accessor", t => {
    t.is(Object.extendWith, undefined)
})

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

test('Extends I with Ix, instance of I has methodI from Ix', t => {
    class I {}
    class Ix { static methodI(self) { return self.constructor.name + ": Ix" }}
    I._.extendWith(Ix)
    const i = new I()
    t.is(i._.methodI(), "I: Ix")
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

test("Can create a new accessor", t => {
    class F {}
    class Fx { static methodF(self) { return self.constructor.name + ": Fx" }}

    F._.extendWith(Fx, "xx")
    t.is(new F().xx.methodF(), "F: Fx")
})

test("Extension is not available in the old accessor", t => {
    class G {}
    class Gx { static methodG(self) { return self.constructor.name + ": Gx" }}

    G._.extendWith(Gx, "xx")
    t.is(new G()._.__extensions__().Gx, undefined)
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

test('using accessor on __extensions__(true) object', t => {
    class U {}
    class Ux { static methodS(self) { return "Ux" } }

    U._.extendWith(Ux)
    t.is(new U()._.__extensions__(true)._.U.Ux.methodS(), "Ux")
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


/*
const PrototypeExtension = require("./prototype-extension")
const ArrayExtension = require("./array-extension")
const StringExtension = require("./string-extension")
const ObjectExtension = require("./object-extension")

String._.extendWith(StringExtension)
Object._.extendWith(ObjectExtension)
Array._.extendWith(ArrayExtension)

console.log([0, 1, [2, 3, [4, 5], 6], 7, [[[8], 9], 10]]._.flatten())
//const proxy = new ExtensionProxy(StringExtension)
//Object.defineProperty(String.prototype, "_", { get: function() { return proxy.getBound(this.toString()) }})

console.log("123"._.toInt)
console.log("123"._.toInt())
console.log("42"._.toInt())
console.log("123"._.addNumber(42))
"test"._.displayProps()

class A {}
class B extends A {}
class C extends B {}

class Ax { static methodA(self) { return self.constructor.name + ": Ax" }}
class A2x { static methodA(self) { return self.constructor.name + ": Ax" }}
class Bx { static methodB(self) { return self.constructor.name + ": Bx" }}
class Cx { static methodC(self) { return self.constructor.name + ": Cx" }}
class Commonx { static methodCommon(self) { return self.constructor.name + ": Commonx" }}

A._.extendWith(Ax)
B._.extendWith(Bx, "__")
C._.extendWith(Cx)


A._.extendWith(Commonx)
C._.extendWith(Commonx)

const a = new A,
    b = new B,
    c = new C

console.log(a._.methodA())

console.log(b._.methodA())
console.log(b.__.methodB())

console.log(c._.methodA())
console.log(c.__.methodB())
console.log(c._.methodC())

console.log(a._.methodCommon())
console.log(b._.methodCommon())
console.log(c._.methodCommon())

console.log(c._.__extensions__(true))
console.log(c.__.__extensions__(true))
console.log(c._.__extensions__().Ax.methodA(b))
console.log(PrototypeExtension.__extensions__(c).Bx.methodB(a))
console.log(PrototypeExtension.__extensions__(c, true).x__.B.Bx.methodB(a))

//console.log(a._.methodB())

//A._.extendWith(A2x)

//C._.extendWith(Cx)
*/