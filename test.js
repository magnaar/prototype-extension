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

console.log(c._.__extensions__())
console.log(c.__.__extensions__())
console.log(c._.__extensions__().Ax.methodA(b))
console.log(PrototypeExtension.__extensions__(c))

//console.log(a._.methodB())

//A._.extendWith(A2x)

//C._.extendWith(Cx)