const fastifyPlugin = require('fastify-plugin')

// Lib Database
async function dbConnector(fastify) {
  // eslint-disable-next-line import/no-extraneous-dependencies, global-require
  fastify.register(require('@fastify/postgres'), fastify.config.POSTGRESQL)
}

// Wrapping a plugin function with fastify-plugin exposes the decorators
// and hooks, declared inside the plugin to the parent scope.
module.exports = fastifyPlugin(dbConnector)
