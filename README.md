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
yourObject._.__extensions__()
// => {
//    StringExtension: Function StringExtension,
//    PrototypeExtension: Function PrototypeExtension
// }
```
This will show every extensions available for this type (even the inherited ones)

To have more information, you call it like this:
```
yourObject._.__extensions__(true) // __extensions__(self, complete=false)
// => {
//    _: {
//      String: { StringExtension: Function StringExtension },
//      Object: { PrototypeExtension: Function PrototypeExtension }
//    }
// }
```
It will indicate how to access the extensions, on which type the extension came from and all the extension for the types of prototype chain.
