/**
 * Dependencies
 */
const fs = require('fs')
const {
  join,
  relative
} = require('path')
const util = require('util')
const mkdirp = require('mkdirp')
const mdGen = require('./markdownGen')
const staticGen = require('./staticGen')

/**
 * Generate documention from schema files
 * 
 * @param {String} path - Path of manner API to generate documentation from
 * @param {Object?} options - Generator options
 * @api public
 */

module.exports = (path, options = {}) => {
  let schemas = []
  walk(path, folder => {
    schemas.push(build(join('/', relative(path, folder)), schema(folder)))
  })
  jsonOutput(schemas, path, options)
}
function build (path, schema) {
  const result = {}
  Object.keys(schema).map(method => {
    const inLoop = {}
    inLoop['method'] = method
    const layout = schema[method]
    if (typeof layout === 'object') {
      Object.keys(layout).map(p => {
        inLoop['path'] = trim(join(path, p))
        inLoop['title'] = layout[p].title || ''
        inLoop['data'] = layout[p].data
      })
    }
    result[inLoop.path] = inLoop
  })
  return result
}

/**
 * Walk folder recursively.
 *
 * @param {String} path
 * @param {Function} cb
 * @param {String} relative
 * @api private
 */

function walk (path, cb) {
  cb(path)
  fs.readdirSync(path).map(file => {
    const folder = join(path, file)
    if (fs.statSync(folder).isDirectory()) {
      walk(folder, cb)
    }
  })
}

/**
 * Merge srouce object with manner tree.
 *
 * @param {Object} src
 * @param {Object} tree
 * @return {Object}
 * @api private
 */

function merge (src, tree) {
  Object.keys(tree).map(method => {
    const services = tree[method]
    const node = src[method] = src[method] || {}
    if (typeof services === 'object') {
      Object.keys(services).map(path => {
        node[path] = services[path]
      })
    } else {
      node = services
    }
  })
  return src
}

/**
 * Read schema if exist.
 *
 * @param {String} path
 * @return {Object} (empty if schema does not exist)
 * @api private
 */

function schema (path, name = 'schema') {
  const js = read(join(path, `${name}.js`), e => console.error(e))
  const json = read(join(path, `${name}.json`))
  return js || json || {}
}

/**
 * Read manner resource Synchronously.
 *
 * @param {String} folder
 * @api private
 */

function read (folder, catcher = a => a) {
  var resource = null
  if (fs.existsSync(folder)) {
    try {
      resource = require(folder)
    } catch (e) {
      catcher(e)
    }
  }
  return resource
}

/**
 * Trim path.
 *
 * Remove empty characters and end backslash.
 *
 * @param {String} path
 * @return {String}
 * @api private
 */

function trim (path) {
  path = path.trim()
  const length = path.length - 1
  if (length > 0 && path[length] === '/') {
    path = path.substring(0, length)
  }
  return path
}

/**
 * Takes manner Schema Objects, generates a json file from said objects,
 * and outputs them into a "Docs" folder inside the provided path
 * 
 * @param {Array} schemas - Array of schema objects
 * @param {String} path - Path to generate documentation from
 * @param {Object?} options - Options object passed to original function
 * @api private
 */

function jsonOutput (schemas, path, options = {}) {
  const docsPath = join(path, 'docs')
  const jsonPath = join(docsPath, 'json')
  // mkdirp(docsPath)
  mkdirp.sync(jsonPath)
  schemas.map(schema => {
    if (typeof schema === 'object' && Object.keys(schema).length > 0) {
      var data = Object.keys(schema)[0]
      if (typeof data === 'string' && data.indexOf('/') > -1) {
        const name = (data === '/') ? 'root' : data.replace(/\//g, '_')
        write(join(docsPath, 'json' , name + '.json'), JSON.stringify(schema))
      }
    }
  })
  if (options.output === 'markdown'){
    mdGen(docsPath)
  } else if (options.output === 'static') {
    if (typeof options.config === 'object') {
      staticGen(docsPath, options.config)
    } else {
      staticGen(docsPath)
    }
  }
}

/**
 * Write content to file
 * 
 * @param {String} name - Path name to write file to
 * @param {String} content - Content to write to file
 * @api private
 */

function write (name, content) {
  fs.writeFileSync(name, content, err => {
    if (err) console.error(`File ${name} could not be create`)
  })
}