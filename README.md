prototype-extension
===================

Extension methods brought to javascript.

How does it work ?
---
I. Create an extension
```
// ./string-extension.js

module.exports = class StringExtension
{
    static toInt(self)
    {
        return +self
    }
}
```
II. Extend a type with your extension class
```
// ./main.js

const PrototypeExtension = require("prototype-extension")
const StringExtension = require("./string-extension")

String._.extendWith(StringExtension)
```

III. Use your extension method
```
// ./main.js

/*
 * Previous code
 */

console.log(typeof "42"._.toInt()) // => number
```

See which extensions are accessibles
---

```
""._.__extensions__()
// => {
//    StringExtension: Function StringExtension,
//    PrototypeExtension: Function PrototypeExtension
// }
```
This will show every extensions available for this type (even the inherited ones)

To have more information, you call it like this:
```
""._.__extensions__(true) // __extensions__(self, complete=false)
// => {
//    _: {
//      String: { StringExtension: Function StringExtension },
//      Object: { PrototypeExtension: Function PrototypeExtension }
//    }
// }
```
It will indicate how to access the extensions, on which type the extension came from and all the extension for the types of prototype chain.

You can't...
===

add twice the same extension on the same prototype
---
```
String._.extendWith(StringExtension)
String._.extendWith(StringExtension) // Will throw an error
```

But this will work
```
class A {}
class B extends A {}

class Extension {}
A._.extendWith(Extension)
B._.extendWith(Extension)
```

add two extension with the same method name on the same prototype
---
```
class A {}

class ExtensionHello {
    static method(self) {
        console.log('Hello')
    }
}

class ExtensionWorld {
    static method(self) {
        console.log('World')
    }
}

A._.extendWith(ExtensionHello)
A._.extendWith(ExtensionWorld) // Will throw an error both extension has a method named method
```

But this
```
class A {}
class B extends A {}

class ExtensionHello {
    static method(self) {
        console.log('Hello')
    }
}

class ExtensionWorld {
    static method(self) {
        console.log('World')
    }
}

A._.extendWith(ExtensionHello)
B._.extendWith(ExtensionWorld) // Will work

new A().method() // => 'Hello'
new B().method() // => 'World'
```

Be careful
===
```
const obj = {}
obj._ // or obj.yourAccessor will always be true

// So you can't expect this to work as usual
obj._ || (obj._ = "value")
```

but
```
obj.hasOwnProperty("_") // => false

const obj = {}
obj._ = "Hello"
obj.hasOwnProperty("_") // => true
```
