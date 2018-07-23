# Manner-docs
#### Generate documentation for your Manner API directly from you schema files!

#### Note: This package is meant to be used in tandem with [Manner](https://github.com/tether/manner)

## Usage - Markdown
----
If your api is in a folder named `v1`:

Create a file named `docs.js`

```js
const docs = require('manner-docs')
const join = require('path').join

/**
 * Generate documentation in MarkDown format
 */

docs(join(__dirname, 'v1'), {output: 'markdown'})
```

and add the following to your `package.json` file:

```json
    "scripts": {
        "gendocs": "node docs.js"
    }
```

and run with the command:
`npm run gendocs`
Then watch in awe as your `v1` folder now contains a directory called `docs` with a structure resembling your api, but filled with MarkDown files that contain all the documentation you need for your API!

## Usage - Static Website
----
If your API is in a folder named `v1`

create a file named `docs.js` and add the following code:
```js
const docs = require('manner-docs')
const join = require('path').join

/**
 * Generate documentation and export to static website
 */

docs(join(__dirname, 'v1'), {output: 'static', config: {output: join(__dirname, 'v1', 'static_docs'), data: {name: 'My API', description: 'API For My App'}}})
```

then add this script to your `package.json` file:
```json
    "scripts": {
        "gendocs": "node docs.js"
    }
```
then run `npm run gendocs` and watch as a directory named `static_docs` appears in your `v1` directory!

This directory contains:
- `public` directory: where the outputted index.js lives (if you set your configuration as above)
- `data` directory: Stores a large JSON file containing all the data relevant to build the static website based on your api
- `static` directory: contains the index.ejs file used to generate the static website

Congratulations! You just generated a fully fledged API documentation website with minimal hassel! All the data lives inside `index.html` so feel free to customize it as you like! Though, I would recommend moving it from the specified output directory, as it will be overwritten if you generate your docs again!

### Config Data for Static option
When you choose to export your Manner-docs as a static website, it is recommended that you also include a config object in your options as such:
```
{output: 'static', config: {output: join(__dirname, 'v1', 'static_docs'), data: {name: 'My API', description: 'API For My App'}}}
```

Which sets the following:
- `config.output` is the directory where you wish to export your static website data to
- `config.data` is used to fill in the jumbotron header on the website. This consists of the following:
    * `name` is the name of your API project/the title for the static website
    * `description` serves as the subheading for your static website

### Serving your Static site
This part is up to you! You can use a custom express server, raw NodeJS, etc. The site is just standard HTML! Serve it how you like.

My humble recommendation is [http-server](https://github.com/indexzero/http-server) a blazingly fast, simple to use server that you can setup directly in your NPM scripts!

## Installation
____
```shell
npm install manner-docs --save-dev
```

## Contributing
____
If you'd like to contribute, feel free to fork the project and start hacking!