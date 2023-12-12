/* eslint-disable import/no-extraneous-dependencies */
const createError = require('http-errors')
const { v4: uuidv4 } = require('uuid')
const httpResp = require('../helper/httpResp')

const MAX_LIFE_TIME = 300 // 300 Second == 5 Minute
const REDIS_USER_TOKEN = `user:token:`

// Route
async function routes(fastify) {
  // API for Get
  fastify.get(
    '/',
    {
      schema: {
        query: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', minLength: 1 },
          },
          required: ['accessToken'],
        },
      },
    },
    async (req) => {
      const { redis } = fastify
      const { accessToken } = req.query

      const getDataRedis = await redis.get(`${REDIS_USER_TOKEN}${accessToken}`)
      if (!getDataRedis) {
        return new createError.NotFound('Token not found')
      }

      const dataRedis = JSON.parse(getDataRedis)

      req.response.rc = httpResp.HTTP_OK
      req.response.rd = 'SUCCESS'
      req.response.data = dataRedis
      return true
    }
  )

  // API for Create
  fastify.post(
    '/set',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            idUser: { type: 'integer', minimum: 0 },
            phone: { type: 'string', minLength: 8, maxLength: 15 },
          },
          required: ['idUser', 'phone'],
        },
      },
    },
    async (req) => {
      const { redis } = fastify
      const { idUser, phone } = req.body
      const genereateToken = uuidv4()

      await redis.setex(
        `${REDIS_USER_TOKEN}${genereateToken}`,
        MAX_LIFE_TIME,
        JSON.stringify({
          idUser,
          phone,
        })
      )

      req.response.rc = httpResp.HTTP_CREATED
      req.response.rd = 'SUCCESS'
      req.response.data = {
        accessToken: genereateToken,
      }
      return true
    }
  )

  // API for Update
  fastify.put(
    '/update',
    {
      schema: {
        query: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', minLength: 1 },
          },
          required: ['accessToken'],
        },
        body: {
          type: 'object',
          properties: {
            idUser: { type: 'integer', minimum: 1 },
            phone: { type: 'string', minLength: 8, maxLength: 15 },
          },
          required: ['idUser', 'phone'],
        },
      },
    },
    async (req) => {
      const { redis } = fastify
      const { accessToken } = req.query
      const { idUser, phone } = req.body

      const getDataRedis = await redis.get(`${REDIS_USER_TOKEN}${accessToken}`)
      if (!getDataRedis) {
        return new createError.NotFound('Token not found')
      }

      const dataRedis = JSON.parse(getDataRedis)
      dataRedis.idUser = idUser !== undefined ? idUser : dataRedis.idUser
      dataRedis.phone = phone !== undefined ? phone : dataRedis.phone

      await redis.setex(
        `${REDIS_USER_TOKEN}${accessToken}`,
        MAX_LIFE_TIME,
        JSON.stringify(dataRedis)
      )

      req.response.rc = httpResp.HTTP_ACCEPTED
      req.response.rd = 'SUCCESS'
      req.response.data = dataRedis
      return true
    }
  )

  // API for Delete
  fastify.delete(
    '/remove',
    {
      schema: {
        query: {
          type: 'object',
          properties: {
            accessToken: { type: 'string', minLength: 1 },
          },
          required: ['accessToken'],
        },
      },
    },
    async (req) => {
      const { redis } = fastify
      const { accessToken } = req.query

      const getDataRedis = await redis.get(`${REDIS_USER_TOKEN}${accessToken}`)
      if (!getDataRedis) {
        return new createError.NotFound('Token not found')
      }

      await redis.unlink(`${REDIS_USER_TOKEN}${accessToken}`)

      req.response.rc = httpResp.HTTP_ACCEPTED
      req.response.rd = 'SUCCESS'
      req.response.data = {}
      return true
    }
  )
}

module.exports = routes
