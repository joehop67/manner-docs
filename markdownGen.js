/**
 * Dependencies
 */
const fs = require('fs')
const {
  join,
  relative
} = require('path')
const mkdirp = require('mkdirp')
const util = require('util')

/**
 * Takes Manner-Doc Json output and generates a markdown file for each endpoint
 * 
 * @param {String} path - Path to JSON generated from manner-docs
 * @api private
 */

module.exports = path => {
  const jPath = join(path, 'json')
  const schemas = []
  fs.readdirSync(jPath).forEach(file => {
    schemas.push(require(join(jPath, file)))
  })
  generate(schemas, path)
}

/**
 * Walks the JSON objects and writes the generated MarkDown to files
 * 
 * @param {Array} schemas - Array of JSON objects
 * @param {String} path - path to documentation folder
 * @api private
 */

function generate (schemas, path) {
  if (schemas.length < 1) {
    console.error('Must have at least one schema to generate documentation')
  } else {
    schemas.map(schema => {
      Object.keys(schema).map(paths => {
        const dir = paths === '/' ? join(path, 'root') : join(path, paths)
        mkdirp.sync(dir)
        if (typeof schema[paths] === 'object') {
          const values = schema[paths]
          const {path, title, method, description, data} = values
          write(join(dir, 'docs.md'), templateSimple(paths, title, method, description, data))
        }
      })
    })
  }
}

/**
 * MarkDown templates to be filled depending on the data required by the schema files
 * 
 * @param {String} path
 * @param {String} title
 * @param {String} method
 * @param {String?} description
 * @param {Object} data
 * @api private
 */

function templateSimple (path, title, method, description = '', data) {
  if (typeof data !== 'undefined') {
    const complexData = {}
    const dataArr = Object.keys(data).map(subData => {
      if (data[subData].type !== 'object' && data[subData].type !== 'array') {
        return `${subData}|${data[subData].type}|${data[subData].description || 'None'}|${data[subData].required ? 'true' : 'false'}`
      } else {
        Object.keys(data[subData]).map(nested => {
          if (typeof data[subData][nested] === 'object' && typeof data[subData][nested] !== 'undefined') {
            complexData.name = subData
            complexData.object = nested
            complexData.description = templateNestedObjects(path, data[subData][nested]).description
            complexData.complexName = templateNestedObjects(path, data[subData][nested]).name
            complexData.value = JSON.stringify(templateNestedObjects(path, data[subData][nested]).value, null, 2)
          }
        })
      }
    })
    if (Object.keys(complexData).length === 0) {
      return `
  # ${path === '/' ? 'Api root ("/")' : path}
  ## ${title}
  ### ${method}
      
  > ${typeof description !== 'undefined' ? description : 'No Description Provided'}
  
  ## Data
      
  Name | Type | Description | Required?
  ---|---|---|---
  ${dataArr.join('\n')}
  `
    } else {
      return `
  # ${path === '/' ? 'Api root ("/")' : path}
  ## ${title}
  ### ${method}
      
  > ${typeof description !== 'undefined' ? description : 'No Description Provided'}
  
  ## Data
      
  Name | Type | Description | Required?
  ---|---|---|---
  ${dataArr.join('\n')}

  ### Nested Data

  Name: ${complexData.name}
  Complex Object: ${complexData.object}
      Next Object: ${complexData.complexName}
      Description: ${complexData.description}
  Data Structure:
  ` + '```' + complexData.value
    }
  } else {
    return `
  # ${path}
  ## ${title}
  ### ${method}

  > ${typeof description !== 'undefined' ? description : 'No Description Provided'}

  ### No Data
    `
  }
}

/**
 * Organize complex (nested) object data to be viewed in it's entire structure
 * 
 * @param {String} path
 * @param {Object} nestedObject
 * @api private
 */

function templateNestedObjects (path, nestedObject) {
  const deep = {}
  Object.keys(nestedObject).map(values => {
    if (values === 'description') {
      deep.description = nestedObject[values]
      return
    }
    deep.name = values
    deep.value = nestedObject[values]
  })
  return deep
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