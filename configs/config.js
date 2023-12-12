const fp = require('fastify-plugin')

function configGet() {
  return new Promise(function (resolve, reject) {
    try {
      const env = `./${process.env.NODE_ENV || 'local'}`
      // eslint-disable-next-line import/no-dynamic-require, global-require
      const config = require(env)
      resolve(config)
    } catch (err) {
      reject(err)
    }
  })
}

module.exports = fp((fastify, opts, done) => {
  configGet()
    .then((config) => {
      fastify.decorate('config', config)
      done()
    })
    .catch((err) => console.error(err))
})
