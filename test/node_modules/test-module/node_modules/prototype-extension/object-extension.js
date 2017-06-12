'use strict'

module.exports = class ObjectExtension
{
    static forEach(self, fn)
    {
        Object.keys(self)
            .forEach(k => fn(k, self[k]))
    }

    // static flatten(self, ...path)
    // {

    // }

    static setAt(self, value, ...path)
    {
        const length = path.length - 1
        for (let i = 0; i < length; ++i)
            self = self[path[i]] || (self[path[i]] = {})
        return (self[path[length]] = value)
    }

    static getAt(self, setter = () => void 0, ...path)
    {
        const length = path.length - 1
        for (let i = 0; i < length; ++i)
            self = self[path[i]] || (self[path[i]] = {})
        return self[path[length]] || (self[path[length]] = setter())
    }

    static onlyGetAt(self, ...path)
    {
        const length = path.length - 1
        for (let i = 0; i < length; ++i)
            self = self[path[i]] || (self[path[i]] = {})
        return self[path[length]]
    }

    static setOwnAt(self, value, ...path)
    {
        const length = path.length - 1
        for (let i = 0; i < length; ++i)
            self = self.hasOwnProperty(path[i]) ? self[path[i]] : (self[path[i]] = {})
        return (self[path[length]] = value)
    }

    static getOwnAt(self, setter = () => void 0, ...path)
    {
        const length = path.length - 1
        for (let i = 0; i < length; ++i)
            self = self.hasOwnProperty(path[i]) ? self[path[i]] : (self[path[i]] = {})
        return self.hasOwnProperty(path[length]) ? self[path[length]] : (self[path[length]] = setter())
    }

    static onlyGetOwnAt(self, ...path)
    {
        const length = path.length - 1
        for (let i = 0; i < length; self = self[path[i++]])
            if (! self.hasOwnProperty(path[i]))
                return
        return ! self.hasOwnProperty(path[length]) ? void 0 : self[path[length]]
    }
}
