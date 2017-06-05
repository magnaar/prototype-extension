'use strict'

const ExtensionProxy = require("./extension-proxy")
let PrototypeExtension

module.exports = class ExtensionContainer
{
    constructor(prototype, accessors)
    {
        this.accessors = accessors
        this.prototype = prototype
        if (! PrototypeExtension)
            PrototypeExtension = require("./prototype-extension")
        this.parentPrototypes = PrototypeExtension.__protochain__(prototype)
        this.extensions = []
        this.staticReferences = {}
    }

    addExtension(extension)
    {
        if (this.extensions.find(e => e === extension))
        {
            if (this.prototype === Object.prototype && extension === PrototypeExtension)
                return
            throw new Error(`"${this.prototype.constructor.name}" already has "${extension.name}" as extension`)
        }
        const keys = Object.keys(this.staticReferences)
        const extensionKeys = PrototypeExtension.__protoproperties__(extension)
        let key
        if ((key = extensionKeys.find(p => keys.includes(p))))
            throw new Error(`"${this.prototype.constructor.name}" already has a "${key}" method`)
        this.extensions.push(extension)
        extensionKeys.forEach(k => (this.staticReferences[k] = extension[k]))
    }

    removeExtension(extension)
    {
        const index = this.extensions.indexOf(extension)
        this.extensions.splice(index, 1)
        PrototypeExtension.__protoproperties__(extension)
            .forEach(p => (delete this.staticReferences[p]))
    }

    bindProxy(instance)
    {
        return new ExtensionProxy(this, instance).proxy
    }
}
