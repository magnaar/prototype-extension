module.exports = class ObjectExtension
{
    static displayProps(self)
    {
        Object.keys(self)
            .filter(k => self.hasOwnProperty(k))
            .forEach(k => console.log(k))
    }
}
