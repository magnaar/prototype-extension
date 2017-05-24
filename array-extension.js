module.exports = class ArrayExtension
{
    static flatten(self)
    {
        const result = []
        for (const elem of self)
            if (! (elem instanceof Array))
                result.push(elem)
            else
                result.push.apply(result, ArrayExtension.flatten(elem))
        return result
    }
}
