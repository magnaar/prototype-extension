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
        this.proxies = []
        this.proxy = new Proxy({}, { get: (target, name) => this.getMember(name, this, null) })
    }

    addProxy(extension)
    {
        if (this.proxies.find(p => p.extension === extension))
            throw new Error(`"${this.prototype.constructor.name}" already has "${extension.name}" as extension`)
        const keys = ArrayExtension.flatten(this.proxies.map(p => PrototypeExtension.__protoproperties__(p.extension)))
        let key
        if ((key = PrototypeExtension.__protoproperties__(extension)
            .find(p => keys.includes(p))
        ))
            throw new Error(`"${this.prototype.constructor.name}" already has a "${key}" method`)
        this.proxies.push({
            extension: extension,
            proxy: new Proxy(extension, { get: (target, name) => target[name] })
        })
    }

    bindProxy(instance)
    {
        this.instance = instance
        return this.proxy
    }

    getMember(name, proxyContainer=this, out={ continue: false })
    {
        out && (out.continue = false)
        for (let i = 0; i < proxyContainer.proxies.length; ++i)
        {
            let member = proxyContainer.proxies[i].proxy[name]
            if (member)
                return (! (member instanceof Function) ? member : member.bind(this, this.instance))
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
