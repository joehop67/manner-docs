const fse = require('fs-extra')
const fs = require('fs')
const path = require('path')
const join = path.join
const mkdirp = require('mkdirp')
const promisify = require('util').promisify
const ejsRenderFile = promisify(require('ejs').renderFile)
const util = require('util')

/**
 * Read JSON output of Manner-Docs and generate a static webpage
 * 
 * @param {String} path
 * @param {Object?} config - Contains output directory and static site header/description
 * @api private
 */

module.exports = (path, config = {}) => {
  const jsonSrc = join(path, 'json')
  const outputPath = config.output != null ? config.output : join(path, 'static', 'public')
  const schemas = []
  const docData = config.data != null ? config.data : {name: 'No name', description: 'No Description'}
  fs.readdirSync(jsonSrc).forEach(file => {
    schemas.push(require(join(jsonSrc, file)))
  })
  const schemasWithId = schemas.map(schema => {
    Object.keys(schema).map(schem => {
      schema[schem].id = Math.floor(Math.random() * 10000000000)
    })
    return schema
  })
  mkdirp.sync(join(outputPath, 'data'))
  write(join(outputPath, 'data', 'schemaData.json'), JSON.stringify({schemas}))
  fse.copySync(join(__dirname, 'static'), join(outputPath, 'static'))
  renderTemplateFile(outputPath, {schemas: schemasWithId, apiData: docData})
}

/**
 * Takes an array of objects representing manner schemas and
 * renders an html document based on an EJS template
 * 
 * @param {String} outputPath
 * @param {Array} schemas
 * @api private
 */

function renderTemplateFile (outputPath, schemas) {
  walk(join(outputPath, 'static'), folder => {
    fs.readdirSync(folder).forEach(file => {
      if (file.indexOf('ejs') > -1) {
        mkdirp.sync(join(outputPath, 'public'))
        ejsRenderFile(join(outputPath, 'static', file), schemas).then(content => {
          write(join(outputPath, 'public', 'index.html'), content)
        })
      }
    })
  })
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

/**
 * Walk directories recursively
 * 
 * @param {String} path
 * @param {Function} cb
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