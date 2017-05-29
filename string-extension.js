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

    // https://stackoverflow.com/a/7924240/5813357
    static occurrences(string, subString, allowOverlapping=false)
    {
        string += ""
        subString += ""
        if (subString.length <= 0)
            return string.length + 1
        let n = 0,
            pos = 0,
            step = +allowOverlapping || subString.length

        while (0 <= (pos = string.indexOf(subString, pos)) && ++n)
            pos += step
        return n
    }
}
