const ExtensionProxyContainer = require("./extension-proxy-container")

const proxyContainers = {}

class PrototypeExtension
{
    static extendWith(classReference, extension, accessorName="_")
    {
        const prototype = classReference.prototype
        if (! proxyContainers[accessorName])
            proxyContainers[accessorName] = new Map()
        
        addProxy(accessorName, Object.prototype, PrototypeExtension,
            (container) => ! container.proxies.find(p => p.extension === PrototypeExtension)
        )
        const container = addProxy(accessorName, prototype, extension,
            () => extension !== PrototypeExtension
        )
        
        if (! prototype.hasOwnProperty(accessorName))
            Object.defineProperty(prototype, accessorName, propertyBuilder(accessorName, container))
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
                if (! extensions.hasOwnProperty(accessor))
                    extensions[accessor] = {}
                extensions[accessor][prototype] || (extensions[accessor][prototype] = {})
                extensions[accessor][prototype][proxy.extension.name] = proxy.extension
            }
        for (const accessor of accessorNames)
        {
            let keys = Array.from(proxyContainers[accessor].keys())
            keys = prototypes.filter(p => keys.includes(p))
            for (let i = 0; i < keys.length; ++i)
                proxyContainers[accessor].get(keys[i]).proxies.forEach(p => filler(p, accessor, keys[i].constructor.name))
        }
        return extensions
    }

    static __protochain__(self)
    {
        let prototype = self.__proto__
        if (! prototype)
            return [self]
        const prototypes = [prototype]
        while (prototype.__proto__)
            prototypes.push((prototype = prototype.__proto__))
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


function addProxy(accessorName, prototype, extension, conditionToAdd)
{
    let container
    if (! proxyContainers[accessorName].has(prototype))
        proxyContainers[accessorName].set(prototype, new ExtensionProxyContainer(proxyContainers, accessorName, prototype))
    container = proxyContainers[accessorName].get(prototype)        
    if (conditionToAdd(container))
        container.addProxy(extension)
    return container
}

function propertyBuilder(accessorName, container)
{
    return {
        enumerable: true,
        get: function ()
        {
            return this.hasOwnProperty(accessorName)
                ? this[accessorName]
                : container.bindProxy(this)
        },
        set: function(value)
        {
            if (! this.hasOwnProperty(accessorName))
                Object.defineProperty(this, accessorName, {
                    enumerable: true,
                    configurable: true,
                    writable: true,
                    value: value
                })
            return this[accessorName]
        }
    }
}


module.exports = PrototypeExtension

PrototypeExtension.extendWith(Object, PrototypeExtension)
