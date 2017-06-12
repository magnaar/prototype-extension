'use strict'

const path = require('path')
const fs = require("fs")
const version = require("./package.json").version
const ObjectExtension = require("./object-extension")
const ExtensionContainer = require("./extension-container")
const { getCallerModuleToken } = require("./module-token")

const moduleSymbol = Symbol.for("prototype-extension@" + version)
const classSymbol = Symbol.for("PrototypeExtension")
const moduleObject = (
        Object.prototype[moduleSymbol]
        || (Object.prototype[moduleSymbol] = {})
    )

class PrototypeExtension
{
    static extendWith(classReference, extension, accessorName="")
    {
        const moduleToken = getCleanModuleToken()
        accessorName = accessorName || getAccessorNameFromConfig(moduleToken) || "_"
        const prototype = classReference.prototype || classReference.__proto__
        let container = ObjectExtension.getOwnAt(prototype,
            () => new ExtensionContainer(prototype, { moduleSymbol, moduleToken, accessorName }),
            moduleSymbol, moduleToken, accessorName
        )
        container.addExtension(extension)

        if (! prototype.hasOwnProperty(accessorName))
            Object.defineProperty(prototype, accessorName, propertyBuilder(prototype, accessorName))
    }

    static unextendWith(classReference, extension)
    {
        const prototype = classReference.prototype
        const moduleToken = getCleanModuleToken()
        let container = ObjectExtension.onlyGetOwnAt(prototype,
            moduleSymbol, moduleToken, this && this.accessorName
        )
        container && container.removeExtension(extension)
    }

    static __extensions__(self, complete=false)
    {
        return (complete ? listFullExtensions : listExtensions)(self, this && this.accessorName)
    }

    static __extensionmethods__(self, complete=false)
    {
        return (complete ? listFullExtensions : listExtensions)(self, this && this.accessorName, true)
    }

    static __protochain__(self)
    {
        let prototype = (self.prototype || self).__proto__
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

function getCleanModuleToken()
{
    return getCallerModuleToken(1)
        .replace(path.sep === "/"
            ? "/node_modules/prototype-extension"
            : "\\node_modules\\prototype-extension"
            , ""
        )
}

function getAccessorNameFromConfig(modulePath)
{
    const path = modulePath + "/package.json"
    return fs.existsSync(path)
        && ObjectExtension.onlyGetAt(require(path),
            "prototype-extension",
            "accessor"
        )
}

function propertyBuilder(prototype, accessorName)
{
    return {
        enumerable: false,
        get: function ()
        {
            let container
            return this.hasOwnProperty(accessorName)
                ? this[accessorName]
                : (container = ObjectExtension.onlyGetOwnAt(prototype,
                    moduleSymbol,
                    getCleanModuleToken(),
                    accessorName
                )) && container.bindProxy(this)
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

function listExtensions(self, accessorName, returnMethods)
{
    const token = getCleanModuleToken()
    const prototypes = moduleObject[classSymbol].__protochain__(self)
    const extensions = {}
    let container
    for (const prototype of prototypes)
        if (accessorName)
        {
            if ((container = prototype[moduleSymbol][token][accessorName]))
                addExtensionClass(extensions, container, returnMethods)
        }
        else
        {
            container = prototype[moduleSymbol][token]
            for (const accessor of Object.keys(container).filter(k => container.hasOwnProperty(k)))
                addExtensionClass(extensions, container[accessor], returnMethods)
        }
    return extensions
}

function listFullExtensions(self, accessorName, returnMethods)
{
    const token = getCleanModuleToken()
    const prototypes = moduleObject[classSymbol].__protochain__(self)
    const extensions = {}
    let container
    for (const prototype of prototypes)
    {
        if (accessorName)
        {
            if ((container = prototype[moduleSymbol][token][accessorName]) && container.hasOwnProperty("extensions"))
                addExtensionMethods(extensions, container, prototype, accessorName, returnMethods)
        }
        else
        {
            container = prototype[moduleSymbol][token]
            for (const accessor of Object.keys(container).filter(k => container.hasOwnProperty(k)))
                if (container[accessor].hasOwnProperty("extensions"))
                    addExtensionMethods(extensions, container[accessor], prototype, accessor, returnMethods)
        }
    }
    return extensions
}

function addExtensionClass(extensions, container, returnMethods)
{
    if (returnMethods)
        ObjectExtension.forEach(container.staticReferences, (k, v) => (extensions[k] = v))
    else if(container.hasOwnProperty("extensions"))
        for (const extension of container.extensions)
            extensions[extension.name] = extension
}

function addExtensionMethods(extensions, container, prototype, accessorName, returnMethods)
{
    for (const extension of container.extensions)
        if (! returnMethods)
            ObjectExtension.setOwnAt(extensions, extension,
                accessorName,
                prototype.name || prototype.constructor.name,
                extension.name
            )
        else
            moduleObject[classSymbol].__protoproperties__(extension)
                .forEach(p => {
                    ObjectExtension.setOwnAt(extensions, extension[p],
                        accessorName,
                        prototype.name || prototype.constructor.name,
                        extension.name,
                        p
                    )
                })
}

moduleObject[classSymbol] =moduleObject[classSymbol] || PrototypeExtension

module.exports = moduleObject[classSymbol]

moduleObject[classSymbol].extendWith(Object, moduleObject[classSymbol])
