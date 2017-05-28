import test from 'ava'
import PrototypeExtension from "../prototype-extension"

//test.skip('No more known issues for the moment', t => {})

test.failing("Side effect: accessor properties are always true", t => {
    t.is({}._ && true, void 0)
})

