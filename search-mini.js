const Minisearch = require('minisearch')


function search_mem(options) {
  const seneca = this


  if (null == options.search) {
    return {ok: false,
            why: 'invalid-search',
    }
    // return seneca.fail('The "search" option is required')
  }

  const { search: search_config } = options
  const minisearch = Minisearch.default ? new Minisearch.default(search_config) : new Minisearch(search_config)

  
  /* NOTE: Minisearch does not support removal by id. To remove
   * a document, you have to pass it whole to the #remove method.
   * For example:
   * ```
   *   minisearch.add({ id: 'aaa', value: 'zzz' })
   *   minisearch.remove({ id: 'aaa', value: 'zzz' })
   * ```
   *
   * In order to implement the API that removes a document by id,
   * we have to store the id->document mapping.
   *
   * Additionally, Minisearch currently allows documents with
   * duplicate ids to be added. That is something we want to guard
   * against, too. For more information on this, please see:
   *
   * https://github.com/lucaong/minisearch/issues/101
   *
   */
  const ids_to_docs = new Map()


  seneca.add('sys:search,cmd:add', function (msg, reply) {
    if (null == msg.doc) {
      return {
        ok: false,
        why: 'invalid-field',
        details: {
          path: ['doc'],
          why_exactly: 'required'
        }
      }
    }

    const { doc } = msg


    if (null == typeof doc.id) {
      return {
        ok: false,
        why: 'invalid-field',
        details: {
          path: ['doc', 'id'],
          why_exactly: 'required'
        }
      }
    }

    const { id: doc_id } = doc


    if (ids_to_docs.has(doc_id)) {
      return reply(new Error('A document with the id already exists'))
    }


    minisearch.add(doc)
    ids_to_docs.set(doc_id, doc)


    return reply(null, { ok: true })
  })


  seneca.add('sys:search,cmd:search', function (msg, reply) {
    const params = msg.params || {}

    if (null == msg.query) {
      return {
        ok: false,
        why: 'invalid-field',
        details: {
          path: ['query'],
          why_exactly: 'required'
        }
      }
    }

    const { query } = msg

    /* NOTE: For more information, please see documentation at:
     *
     * https://www.npmjs.com/package/minisearch
     *
     */
    const out = minisearch.search(query, params)


    const hits = out.map(hit => {
      const { id } = hit


      const fields = search_config.storeFields || []

      const doc = fields.reduce((acc, k) => {
        if (k in hit) {
          acc[k] = hit[k]
        }

        return acc
      }, {})


      return { id, doc }
    })


    return reply(null, { ok: true, data: { hits } })
  })


  seneca.add('sys:search,cmd:remove', async function (msg, reply) {
    if (null == msg.id) {
      return {
        ok: false,
        why: 'invalid-field',
        details: {
          path: ['id'],
          why_exactly: 'required'
        }
      }
    }

    const { id: doc_id } = msg


    const doc = ids_to_docs.get(doc_id)

    if (null == doc) {
      return reply(null, { ok: false, why: 'remove-failed' })
    }


    minisearch.remove(doc)
    ids_to_docs.delete(doc_id)


    return reply(null, { ok: true })
  })
  
  seneca.add('sys:search,cmd:add_all', function (msg, reply) {
    if (null == msg.docs) {
      return {
        ok: false,
        why: 'invalid-docs-argument',
        details: {
          path: ['docs'],
          why_exactly: 'required'
        }
      }
    }

    const { docs } = msg
    
    for(let doc of docs) {
    
      if (ids_to_docs.has(doc.id)) {
        return reply(new Error('A document with the id already exists'))
      }
      try {
        minisearch.add(doc)
        ids_to_docs.set(doc.id, doc)
      }catch(err) {
        return reply(err)
      }
    }


    return reply(null, { ok: true })
  })


  return
}


module.exports = search_mem
