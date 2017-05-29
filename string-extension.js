'use strict'

module.exports = class StringExtension
{
    static toInt(self)
    {
        return +self
    }

    static addNumber(self, number)
    {
        return (self._.toInt() + number) + ""
    }
}
