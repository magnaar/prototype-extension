'use strict'

const ObjectExtension = require("./object-extension")
let PrototypeExtension

module.exports = class ExtensionProxyContainer
{
    constructor(prototype, accessors)
    {
        this.accessors = accessors
        this.proxyContainers = prototype[accessors.moduleSymbol]
        this.prototype = prototype
        if (! PrototypeExtension)
            PrototypeExtension = require("./prototype-extension")
        this.parentPrototypes = PrototypeExtension.__protochain__(prototype)
        this.extensions = []
        this.proxy = new Proxy({}, { get: (target, name) => this.getMember(name) })
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

    bindProxy(instance)
    {
        this.instance = instance
        return this.proxy
    }

    getMember(name)
    {
        if (this.staticReferences[name])
            return this.staticReferences[name].bind(this.accessors, this.instance)
        for (const prototype of this.parentPrototypes)
        {
            const method = ObjectExtension.onlyGetOwnAt(prototype,
                this.accessors.moduleSymbol,
                this.accessors.moduleToken,
                this.accessors.accessorName,
                "staticReferences",
                name
            )
            if (method)
                return method.bind(this.accessors, this.instance)
        }
        throw new Error(`"${this.prototype.constructor.name}" doesn't have a method "${name}" in its extensions.`)
    }
}
