const ExtensionProxyContainer = require("./extension-proxy-container")

const proxyContainers = {}

class PrototypeExtension
{
    static extendWith(classReference, extension, extensionAccessorName="_")
    {
        const prototype = classReference.prototype
        const prototypeName = prototype.constructor.name
        let container
        if (! (container = proxyContainers[prototypeName]))
            container = proxyContainers[prototypeName] = new ExtensionProxyContainer(proxyContainers, prototype)
        container.addProxy(extension)
        if (! prototype.hasOwnProperty(extensionAccessorName))
            Object.defineProperty(prototype, extensionAccessorName,
                { get: function () { return container.bindProxy(this) } }
            )
    }

    static __extensions__(self)
    {
        const prototypes = PrototypeExtension.__protochain__(self)
        let keys = Object.keys(proxyContainers)
        keys = prototypes.filter(p => keys.includes(p))
        const extensions = {}
        for (let i = 0; i < keys.length; ++i)
            proxyContainers[keys[i]].proxies.forEach(p => { extensions[p.extension.name] = p.extension })
        return extensions
    }

    static __protochain__(self)
    {
        let prototype = self.__proto__
        if (! prototype)
            return [self.constructor.name]
        const prototypes = [prototype.constructor.name]
        while (prototype.__proto__)
            prototypes.push((prototype = prototype.__proto__).constructor.name)
        return prototypes
    }
	
	static getPrototypeProperties(proto)
	{
		for (const prop of Object.getOwnPropertyNames(proto))
		if (! Object.hasOwnProperty(prop))
			console.log(prop)
	}
}

module.exports = PrototypeExtension

PrototypeExtension.extendWith(Object, PrototypeExtension)
