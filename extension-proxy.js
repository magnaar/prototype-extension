'use strict'

const ObjectExtension = require("./object-extension")

module.exports = class ExtensionProxy
{
    constructor(extensionContainer, instance)
    {
        this.extensionContainer = extensionContainer
        this.instance = instance
        this.proxy = new Proxy({}, { get: (target, name) => this.getMember(name) })
    }

    getMember(name)
    {
        const container = this.extensionContainer
        if (container.staticReferences[name])
            return container.staticReferences[name].bind(container.accessors, this.instance)
        for (const prototype of container.parentPrototypes)
        {
            const method = ObjectExtension.onlyGetOwnAt(prototype,
                container.accessors.moduleSymbol,
                container.accessors.moduleToken,
                container.accessors.accessorName,
                "staticReferences",
                name
            )
            if (method)
                return method.bind(container.accessors, this.instance)
        }
        throw new Error(`"${container.prototype.constructor.name}" doesn't have a method "${name}" in its extensions.`)
    }
}
