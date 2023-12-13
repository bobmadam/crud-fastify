/* eslint-disable import/no-extraneous-dependencies */
// Require the framework and instantiate it
const fastify = require('fastify')({
  logger: true,
  ignoreTrailingSlash: true,
  pluginTimeout: 30000,
})

const createError = require('http-errors')
const httpResp = require('./helper/httpResp')

// Declare a Config
fastify.register(require('./configs/config'))
fastify.register(require('fastify-graceful-shutdown'))

// Declare a Database
fastify.register(require('./database/postgresql'))
fastify.register(require('./database/redis'))

// Declare a Route
fastify.register(require('./routes/profile'), { prefix: '/profile' }) // PostgreSQL implementation
fastify.register(require('./routes/token'), { prefix: '/token' }) // Redis implementation

// Declare Hooks
fastify.decorateRequest('response', null)

// Middleware
fastify.addHook('preHandler', async (req) => {
  req.response = {}
  req.response.data = {}
})

// eslint-disable-next-line consistent-return
fastify.addHook('onSend', (req, reply, payload, done) => {
  if (!req.response.rc) {
    return done(new createError.NotFound())
  }
  req.response.timestamp = new Date().toLocaleString('id-ID')
  reply.code(req.response.rc).header('Content-Type', 'application/json')
  done(null, JSON.stringify(req.response))
})

fastify.setErrorHandler(async (error, req, reply) => {
  req.response = {}
  req.response.data = {}
  let statusCode = ''

  if (error) {
    statusCode = error.status ? error.status.toString() : httpResp.HTTP_BADREQUEST
    statusCode = parseInt(statusCode)
    req.response.rc = statusCode || httpResp.HTTP_BADREQUEST
    req.response.rd = error.message || error.Error || 'ERROR'
    req.response.data = {}
  }

  req.response.timestamp = new Date().toLocaleString('id-ID')
  reply.header('Content-Type', 'application/json')

  if (statusCode) {
    reply.status(statusCode).send(req.response)
  } else {
    reply.status(httpResp.HTTP_GENERALERROR).send(req.response)
  }
})

// Run the server!
fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' }, (err) => {
  if (err) {
    fastify.log.error(err)
    process.exit(1)
  }
})

// Gracefully close the server on process termination
fastify.after(() => {
  fastify.gracefulShutdown((signal, next) => {
    fastify.log.info('Server closed gracefully')
    next()
  })
})
