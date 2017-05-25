const ExtensionProxyContainer = require("./extension-proxy-container")

const proxyContainers = {}

class PrototypeExtension
{
    static extendWith(classReference, extension, accessorName="_")
    {
        const prototype = classReference.prototype
        const prototypeName = prototype.constructor.name
        let container
        if (! proxyContainers[accessorName])
            proxyContainers[accessorName] = {}
        if (! (container = proxyContainers[accessorName][prototypeName]))
            container = proxyContainers[accessorName][prototypeName] = new ExtensionProxyContainer(proxyContainers, accessorName, prototype)
        if (! proxyContainers[accessorName].Object)
            proxyContainers[accessorName].Object = new ExtensionProxyContainer(proxyContainers, accessorName, Object)
        if (! proxyContainers[accessorName].Object.proxies.find(p => p.extension === PrototypeExtension))
            proxyContainers[accessorName].Object.addProxy(PrototypeExtension)
        if (extension !== PrototypeExtension)
            container.addProxy(extension)
        if (! prototype.hasOwnProperty(accessorName))
            Object.defineProperty(prototype, accessorName,
                { get: function () { return container.bindProxy(this) } }
            )
    }

    static __extensions__(self, complete=false)
    {
        const prototypes = PrototypeExtension.__protochain__(self)
        const accessorNames = this instanceof ExtensionProxyContainer
            ? [this.accessorName]
            : Object.keys(proxyContainers)
        let extensions = {}
        const filler = ! complete
            ? (proxy) => { extensions[proxy.extension.name] = proxy.extension }
            : (proxy, accessor, prototype) => {
                extensions[accessor] || (extensions[accessor] = {})
                extensions[accessor][prototype] || (extensions[accessor][prototype] = {})
                extensions[accessor][prototype][proxy.extension.name] = proxy.extension
            }
        for (const accessor of accessorNames)
        {
            let keys = Object.keys(proxyContainers[accessor])
            keys = prototypes.filter(p => keys.includes(p))
            for (let i = 0; i < keys.length; ++i)
                proxyContainers[accessor][keys[i]].proxies.forEach(p => filler(p, `x${accessor}`, keys[i]))
        }
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
	
	static __protoproperties__(prototype)
	{
        const result = []
		for (const property of Object.getOwnPropertyNames(prototype))
		    if (! Object.hasOwnProperty(property))
			    result.push(property)
        return result
	}
}

module.exports = PrototypeExtension

PrototypeExtension.extendWith(Object, PrototypeExtension)
