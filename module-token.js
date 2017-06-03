"use strict"

const path = require('path')
const StringExtension = require("./string-extension")
const GetCaller = require("./get-caller")

const sep = (path.sep === "/" ? "/" : "\\")
const nodeModulesString = `${sep}node_modules${sep}`
const nodeModuleRegex = RegExp(`\\${sep}node_modules\\${sep}`, "g")
const rootDirectory = process.cwd()
const pathToToken = {}

function getTokenFromPath(path)
{
    const initialPath = path
    if (pathToToken[path])
        return pathToToken[path]
    const startIndex = path.indexOf(nodeModulesString, rootDirectory.length) + nodeModulesString.length
    if (startIndex === nodeModulesString.length - 1)
        return (pathToToken[initialPath] = "")
    path = path.substring(startIndex, path.lastIndexOf(sep))
    return (pathToToken[initialPath] = path.replace(nodeModuleRegex, sep))
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
