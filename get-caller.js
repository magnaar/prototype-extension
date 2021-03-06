"use strict"

module.exports = class GetCaller
{
    static file(depth=1)
    {
        const originalPrepareStackTrace = Error.prepareStackTrace
        let callerFile
        try
        {
            const err = new Error()
            Error.prepareStackTrace = (err, stack) => stack
            let currentFile = callerFile = err.stack[0].getFileName()
            for (let i = 1; i < err.stack.length && 0 < depth; ++i)
            {
                currentFile = err.stack[i].getFileName()
                if (currentFile === "module.js")
                    break
                if (callerFile !== currentFile && depth--)
                    callerFile = currentFile
            }
        }
        catch (e)
        {
        }
        Error.prepareStackTrace = originalPrepareStackTrace
        return callerFile
    }
}

/*
callsite.getThis() - returns the value of this
callsite.getTypeName() - returns the type of this as a string. This is the name of the function stored in the constructor field of this, if available, otherwise the object's [[Class]] internal property.
callsite.getFunction() - returns the current function
callsite.getFunctionName() - returns the name of the current function, typically its name property. If a name property is not available an attempt will be made to try to infer a name from the function's context.
callsite.getMethodName() - returns the name of the property of this or one of its prototypes that holds the current function
callsite.getFileName() - if this function was defined in a script returns the name of the script
callsite.getLineNumber() - if this function was defined in a script returns the current line number
callsite.getColumnNumber() - if this function was defined in a script returns the current column number
callsite.getEvalOrigin() - if this function was created using a call to eval returns a CallSite object representing the location where eval was called
callsite.isToplevel() - is this a toplevel invocation, that is, is this the global object?
callsite.isEval() - does this call take place in code defined by a call to eval?
callsite.isNative() - is this call in native V8 code?
callsite.isConstructor() - is this a constructor call?
*/