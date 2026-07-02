![Seneca](http://senecajs.org/files/assets/seneca-logo.png)
> A [Seneca.js](http://senecajs.org) plugin

# @seneca/search-mini

[![npm version](https://img.shields.io/npm/v/@seneca/search-mini.svg)](https://npmjs.com/package/@seneca/search-mini)
[![build](https://github.com/senecajs/seneca-search-mini/actions/workflows/build.yml/badge.svg)](https://github.com/senecajs/seneca-search-mini/actions/workflows/build.yml)
[![Known Vulnerabilities](https://snyk.io/test/github/senecajs/seneca-search-mini/badge.svg)](https://snyk.io/test/github/senecajs/seneca-search-mini)

| ![Voxgig](https://www.voxgig.com/res/img/vgt01r.png) | This open source module is sponsored and supported by [Voxgig](https://www.voxgig.com). |
|---|---|

## Install

```sh
$ npm install @seneca/search-mini
```

## Quick Example

```js
// for a live example - please, run the web example from examples/web locally after running npm install
const Seneca = require('seneca')
const SearchMini = require('@seneca/search-mini')

const seneca = Seneca({ log: 'test' })

seneca
  .test()
  .use(SearchMini, {
    search: {
      // fields to be used for each search to be performed
      fields: ['text', 'category'],
      // fields to be stored in the hits after the performed search
      // more on this: https://lucaong.github.io/minisearch
      storeFields: ['text', 'category']
    }

  })

let docs = [
  {
    id: 1,
    title: 'Moby Dick',
    text: 'Call me Ishmael. Some years ago...',
    category: 'fiction'
  },
  {
    id: 2,
    title: 'Zen and the Art of Motorcycle Maintenance',
    text: 'I can see by my watch...',
    category: 'fiction'
  },
  // ...
] 

for(const doc of docs) { // make sure to index all the documents
  // index a document
  await seneca.post('sys:search, cmd:add', { doc, }) // { doc: { id: 'id', ... } }
}


let out = await seneca.post('sys:search, cmd:search',
  // perform a search by query: { query: String, params: Object }
  {
    query: 'drama',
    params: {},
    // params: {prefix: true, fuzzy: 0.2,} // params usage example
    // more on: https://lucaong.github.io/minisearch/#search-options
})

// access the hits of the performed search for reuse
console.log('search hits: ', out.data.hits)

// Removing a doc

let doc = docs[0]
await seneca.post('sys:search, cmd:remove', { ...doc, })


// This is especially useful when you need to update the doc
// and make it present next time you apply 'sys:search, cmd:search'

let doc = docs[1]
doc.text = "new text ..."
await seneca.post('sys:search, cmd:remove', { ...doc, })
await seneca.post('sys:search, cmd:add', { doc, })

```

## More Examples

See [test/](test/) for more usage examples.

## Motivation

A [Seneca.js](http://senecajs.org) plugin.

## Support

If you're using this module and need help, you can:

- Post a [github issue](https://github.com/senecajs/seneca-search-mini/issues)
- Tweet to [@senecajs](http://twitter.com/senecajs)
- Ask on the [Gitter](https://gitter.im/senecajs/seneca)

## API

See [source](https://github.com/senecajs/seneca-search-mini) for API details.

## Contributing

The [Senecajs org](https://github.com/senecajs/) encourages open participation. If you feel you can help in any way, be it with documentation, examples, extra testing, or new features please get in touch.

The [SenecaJS org](http://senecajs.org/) encourages participation. If you feel you can help in any way, be
it with bug reporting, documentation, examples, extra testing, or new features, feel free
to [create an issue](https://github.com/senecajs/seneca-maintain/issues/new), or better yet - [submit a Pull Request](https://github.com/senecajs/seneca-maintain/pulls). For more
information on contribution, please see our [Contributing Guide](http://senecajs.org/contribute).

## Background

Check out the SenecaJS roadmap [here](https://senecajs.org/roadmap/)!

### License

Licensed under [MIT](./LICENSE).
