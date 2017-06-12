**prototype-extension** 0.2.1
=================
###_Extension methods brought to javascript_


##**How does it work ?**
###I. Create an extension
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
###II. Extend a type with your extension class
```
// ./main.js

const PrototypeExtension = require("prototype-extension")
const StringExtension = require("./string-extension")

String._.extendWith(StringExtension)
```
It will allow you to use the StringExtension methods on every string of your module.
It won't affect the other modules, neither the ones which import yours.

###III. Use your extension method
```
// ./main.js

/*
 * Previous code
 */

console.log(typeof "42"._.toInt()) // => number
```

##**Choose your accessor name**
Go into your package.json
and add this section:
```
{
    /* Your package.json stuff */
    "prototype-extension": {
        "accessor": "$$"
    },
    /* Your other package.json stuff */
}
```

Now, the default accessor will be "$$" in your module.
```
String.$$.extendWith(StringExtension)
"123".$$.toInt()
```

It's useful to avoid conflicts with lodash and underscore.

##**See which extensions are accessibles**
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
It will indicate how to access the extensions, on which type the extension came from and all the extensions for the types of the prototype chain.

##**See which extension methods are accessibles**
```
""._.__extensionmethods__()
// => {
//    toInt: Function toInt
//    extendWith: Function extendWith
//    __extensions__: Function __extensions__
//    __extensionmethods__: Function __extensionmethods__
//    __protochain__: Function __protochain__
//    __protoproperties__: Function __protoproperties__
// }
```
This will show every extension methods available for this type (even the inherited ones)

To have more information, you call it like this:
```
""._.__extensionmethods__(true)
// => {
//    _: {
//      String: {
//          StringExtension: {
//              toInt: Function toInt
//          }
//      },
//      Object: {
//          PrototypeExtension: {
//              extendWith: Function extendWith
//              __extensions__: Function __extensions__
//              __extensionmethods__: Function __extensionmethods__
//              __protochain__: Function __protochain__
//              __protoproperties__: Function __protoproperties__
//          }
//      }
//    }
// }
```

##**Unextend your prototype**
```
String._.unextendWith(StringExtension)

""._.toInt => Will throw an error
""._.__extensions__().StringExtension // undefined
""._.__extensionmethods__().toInt // undefined
```
_**It will affect your whole module.** Every strings won't be able to use the StringExtensions methods._
*However, it won't affect the node_modules (either the ones you use or the ones that use yours)*

#**You can't...**

##**see the extensions added in a node_module**
and a node\_module can't see your extensions

You can't add methods dynamically on your extension after extending your prototype.
```
String._.extendWith(StringExtension)
StringExtension.dynamicMethod = function (self) { return "dynamicMethod" }
""._.dynamicMethod() // => Will throw an error
```

##**add twice the same extension on the same prototype**
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

##**add two extension with the same method name on the same prototype**
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
A._.extendWith(ExtensionWorld) // Will throw an error
```

###But this
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

new A()._.method() // => 'Hello'
new B()._.method() // => 'World'
```

#**Be careful**
```
const obj = {}
obj._ // or obj.yourAccessor will always be true

// So you can't expect this to work as usual
obj._ || (obj._ = "value")
```

###but
```
const obj = {}
obj.hasOwnProperty("_") // => false

obj._ = "Hello"
obj.hasOwnProperty("_") // => true
```

##**Threading**
No tests were made for testing this.
If you use a library for threading, you should process with caution.
It should work, but there is no guarantee.
