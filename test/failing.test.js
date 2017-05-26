import test from 'ava'
import PrototypeExtension from "../prototype-extension"

test.failing("Scoped prototype extends outside ones", t => {
    (() => {
        class S {}
        class Sx { static methodS(self) {} }
        S._.extendsWith(Sx)
    })()
    
    class S {}
    class SOx { static methodS(self) {} }
    try
    {
        S._.extendWith(SOx)
        t.fail()
    }
    catch (error)
    {
        const expectedError = 'Error: "S" already has a "methodS" method'
        if (error.toString() == expectedError)
            t.pass()
        else
            t.fail(`value   : ${error}\nexpected: ${expectedError}`)
    }
})

test.failing("Scoped prototype extends outside ones 2", t => {
    (() => {
        class S {}
        class Sx { static methodS(self) {} }
        S._.extendsWith(Sx)
    })()
    
    class S {}
    class Sx { static anotherMethod(self) {} }
    try
    {
        S._.extendWith(SOx)
        t.fail()
    }
    catch (error)
    {
        const expectedError = 'Error: "S" already has "Sx" as extension'
        if (error.toString() == expectedError)
            t.pass()
        else
            t.fail(`value   : ${error}\nexpected: ${expectedError}`)
    }
})
