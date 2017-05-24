let PrototypeExtension

module.exports = class ExtensionProxyContainer
{
    constructor(proxyContainers, prototype)
    {
        this.proxyContainers = proxyContainers
        this.prototype = prototype
        if (! PrototypeExtension)
            PrototypeExtension = require("./prototype-extension")
        console.log(PrototypeExtension)
        this.parentPrototypes = PrototypeExtension.__protochain__(prototype)
        this.instance = null
        this.proxies = []
        this.proxy = new Proxy({}, { get: (taget, name) => this.getMember(name, this, null) })
    }

    addProxy(extension)
    {
        if (this.proxies.includes(p => p.extension === extension))
            throw new Error(`"${this.prototype.constructor.name}" already has "${extension.name}" as extension`)
        //const keys = ArrayExtension.flatten(this.proxies.map(p => Object.keys(p.extension)))
        //console.log(Object.keys(extension))
        //console.log(this.proxies.map(p => Object.keys(p.extension)))
        //if (Object.keys(extension).includes(k => keys.includes(k))))
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
                return (! (member instanceof Function) ? member : member.bind(void 0, this.instance))
        }
        out && (out.continue = true)
        return proxyContainer === this
            && this.getMemberInParentPrototype(name)
    }

    getMemberInParentPrototype(name)
    {
        let keys = Object.keys(this.proxyContainers)
        keys = this.parentPrototypes.filter(p => keys.includes(p))
        const out = { continue: true }
        for (let i = 0; i < keys.length; ++i)
        {
            const value = this.getMember(name, this.proxyContainers[keys[i]], out)
            if (! out.continue)
                return value
        }
        throw new Error(`"${this.prototype.constructor.name}" doesn't have a method "${name}" in its extensions.`)
    }

    getParentPrototype(prototype)
    {
        const parentPrototypes = []
        while (prototype.__proto__)
            parentPrototypes.push((prototype = prototype.__proto__).constructor.name)
        return parentPrototypes
    }
}
