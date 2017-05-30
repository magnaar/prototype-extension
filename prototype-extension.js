'use strict'

const ExtensionProxyContainer = require("./extension-proxy-container")
const { getCallerModuleToken } = require("./module-token")

const proxyContainers = {}

class PrototypeExtension
{
    static extendWith(classReference, extension, accessorName="_")
    {
        const prototype = classReference.prototype
        const token = getCallerModuleToken()
        if (! proxyContainers[token])
            proxyContainers[token] = {}
        if (! proxyContainers[token][accessorName])
            proxyContainers[token][accessorName] = new Map()
        
        addExtension(proxyContainers[token], accessorName, Object.prototype, PrototypeExtension,
            (container) => ! container.extensions.find(e => e === PrototypeExtension)
        )
        const container = addExtension(proxyContainers[token], accessorName, prototype, extension,
            () => extension !== PrototypeExtension
        )
        
        if (! prototype.hasOwnProperty(accessorName))
            Object.defineProperty(prototype, accessorName, propertyBuilder(accessorName, container))
    }

    static __extensions__(self, complete=false)
    {
        const token = getCallerModuleToken()
        const prototypes = PrototypeExtension.__protochain__(self)
        const accessorNames = this instanceof ExtensionProxyContainer
            ? [this.accessorName]
            : Object.keys(proxyContainers[token])
        let extensions = {}
        const filler = ! complete
            ? (extension) => { extensions[extension.name] = extension }
            : (extension, accessor, prototype) => {
                if (! extensions.hasOwnProperty(accessor))
                    extensions[accessor] = {}
                extensions[accessor][prototype] || (extensions[accessor][prototype] = {})
                extensions[accessor][prototype][extension.name] = extension
            }
        for (const accessor of accessorNames)
        {
            let keys = Array.from(proxyContainers[token][accessor].keys())
            keys = prototypes.filter(p => keys.includes(p))
            for (let i = 0; i < keys.length; ++i)
                proxyContainers[token][accessor].get(keys[i]).extensions.forEach(e => filler(e, accessor, keys[i].constructor.name))
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


function addExtension(moduleProxyContainers, accessorName, prototype, extension, conditionToAdd)
{
    let container
    if (! moduleProxyContainers[accessorName].has(prototype))
        moduleProxyContainers[accessorName].set(prototype, new ExtensionProxyContainer(moduleProxyContainers, accessorName, prototype))
    container = moduleProxyContainers[accessorName].get(prototype)        
    if (conditionToAdd(container))
        container.addExtension(extension)
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
