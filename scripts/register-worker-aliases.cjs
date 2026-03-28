const Module = require("node:module")
const path = require("node:path")

const repoRoot = path.resolve(__dirname, "..")
const originalResolveFilename = Module._resolveFilename

Module._resolveFilename = function resolveFilename(request, parent, isMain, options) {
  if (typeof request === "string" && request.startsWith("@/")) {
    const relativePath = request.slice(2)
    const absolutePath = path.join(repoRoot, ".worker-dist", relativePath)
    return originalResolveFilename.call(this, absolutePath, parent, isMain, options)
  }

  return originalResolveFilename.call(this, request, parent, isMain, options)
}
