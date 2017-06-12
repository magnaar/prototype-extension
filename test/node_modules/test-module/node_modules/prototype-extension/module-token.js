"use strict"

const path = require('path')
const GetCaller = require("./get-caller")

const sep = (path.sep === "/" ? "/" : "\\")
const nodeModulesString = `${sep}node_modules${sep}`
const rootDirectory = process.cwd()
const pathToToken = {}

function getTokenFromPath(path)
{
    const initialPath = path
    if (pathToToken[path])
        return pathToToken[path]
    const startIndex = path.indexOf(nodeModulesString, rootDirectory.length)
    if (startIndex === -1)
        return (pathToToken[initialPath] = rootDirectory)
    path = path.substring(0, path.lastIndexOf(sep))
    return (pathToToken[initialPath] = path)
}

function getModuleToken()
{
    return getTokenFromPath(GetCaller.file(1))
}

function getCallerModuleToken(callerLevel = 0)
{
    return getTokenFromPath(GetCaller.file(2 + callerLevel))
}

module.exports = {
    getModuleToken,
    getCallerModuleToken,
    getTokenFromPath
}
