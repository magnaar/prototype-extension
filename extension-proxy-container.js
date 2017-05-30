'use strict'

const ArrayExtension = require("./array-extension")
let PrototypeExtension

module.exports = class ExtensionProxyContainer
{
    constructor(proxyContainers, accessorName, prototype)
    {
        this.accessorName = accessorName
        this.proxyContainers = proxyContainers
        this.prototype = prototype
        if (! PrototypeExtension)
            PrototypeExtension = require("./prototype-extension")
        this.parentPrototypes = PrototypeExtension.__protochain__(prototype)
        this.instance = null
        this.extensions = []
        this.proxy = new Proxy({}, { get: (target, name) => this.getMember(name, this, null) })
        this.staticReferences = {}
    }

    addExtension(extension)
    {
        if (this.extensions.find(e => e === extension))
            throw new Error(`"${this.prototype.constructor.name}" already has "${extension.name}" as extension`)
        const keys = ArrayExtension.flatten(this.extensions.map(p => PrototypeExtension.__protoproperties__(p)))
        const extensionKeys = PrototypeExtension.__protoproperties__(extension)
        let key
        if ((key = extensionKeys.find(p => keys.includes(p))))
            throw new Error(`"${this.prototype.constructor.name}" already has a "${key}" method`)
        this.extensions.push(extension)
        keys.forEach(k => (this.staticReferences[k] = extension[k]))
        extensionKeys.forEach(k => (this.staticReferences[k] = extension[k]))
    }

    bindProxy(instance)
    {
        this.instance = instance
        return this.proxy
    }

    getMember(name, proxyContainer=this, out={ continue: false })
    {
        if (this.staticReferences[name])
            return  this.staticReferences[name].bind(this, this.instance)
        out && (out.continue = false)
        for (let i = 0; i < proxyContainer.extensions.length; ++i)
        {
            let member = proxyContainer.extensions[i][name]
            if (member && member instanceof Function)
                return (this.staticReferences[name] = member).bind(this, this.instance)
        }
        out && (out.continue = true)
        return proxyContainer === this
            && out === null
            && this.getMemberInParentPrototype(name)
    }

    getMemberInParentPrototype(name)
    {
        let keys = Array.from(this.proxyContainers[this.accessorName].keys())
        keys = this.parentPrototypes.filter(p => keys.includes(p))
        const out = { continue: true }
        for (let i = 0; i < keys.length; ++i)
        {
            const value = this.getMember(name, this.proxyContainers[this.accessorName].get(keys[i]), out)
            if (! out.continue)
                return value
        }
        if (this.instance.hasOwnProperty(name))
            return this.instance[name]
        throw new Error(`"${this.prototype.constructor.name}" doesn't have a method "${name}" in its extensions.`)
    }
}
