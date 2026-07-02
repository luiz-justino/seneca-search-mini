import Seneca from 'seneca-browser'

import Vue from 'vue'
import App from './App.vue'


const SearchMem = require('../../../../search-mini')
/* eslint-disable */

async function start(opts) {
  Vue.config.productionTip = false
  let seneca = new Seneca({
    log: { logger: 'flat', level: 'warn' },
    plugin: {
      browser: {
        endpoint: '/',
        headers: {
	},
      }
    },
    timeout: 44444,
  })


  console.log('SearchMem: ', SearchMem)

  seneca
    .test()
    .use(SearchMem, {
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
    {
      id: 3,
      title: 'Neuromancer',
      text: 'The sky above the port was...',
      category: 'fiction'
    },
    {
      id: 4,
      title: 'Zen and the Art of Archery',
      text: 'At first sight it must seem...',
      category: 'non-fiction'
    },

    {
      id: 5,
      title: 'Christine',
      text: 'Reporter in search of success...',
      category: 'drama'
    },

  ]

  for(const doc of docs) {
    let out = await seneca.post('sys:search,cmd:add', {doc,})
    console.log('out: ', out)
  }

  async function search_test() {
    // perform a search by query
    let out = await seneca.post('sys:search,cmd:search', 
      {query: 'drama', params: {},
    })
    // access the hits of the performed search for reuse
    console.log('search hits: ', out.data.hits)
  }



  Vue.prototype.$seneca = seneca

  await seneca.ready()
  seneca.client({
    type: 'browser',
    pin: [
    ]
  })

  const Main = {
    seneca,
  }
  
  Vue.prototype.$main = Main
  window.main = Main

  let root = new Vue({
    render: h => h(App),
  }).$mount('#app')
  Main.root = root
}

function init(opts) {
  start(opts)
}

init({})
