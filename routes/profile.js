/* eslint-disable import/no-extraneous-dependencies */
const createError = require('http-errors')
const modelProfile = require('../model/profile')
const httpResp = require('../helper/httpResp')

// Route
async function routes(fastify) {
  // API for Get
  fastify.get(
    '/all',
    {
      schema: {
        query: {
          type: 'object',
          properties: {
            offset: { type: 'integer', minimum: 0 },
            limit: { type: 'integer', maximum: 20 },
          },
          required: ['offset', 'limit'],
        },
      },
    },
    async (req) => {
      const { offset, limit } = req.query

      req.response.rc = httpResp.HTTP_OK
      req.response.rd = 'SUCCESS'

      const getData = await modelProfile.getAllProfile(fastify, offset, limit)

      req.response.data = getData
      return true
    }
  )

  // API for Get Specific
  fastify.get(
    '/specific',
    {
      schema: {
        query: {
          type: 'object',
          properties: {
            idUser: { type: 'integer', minimum: 0 },
          },
          required: ['idUser'],
        },
      },
    },
    async (req) => {
      const { idUser } = req.query
      req.response.rc = httpResp.HTTP_OK
      req.response.rd = 'SUCCESS'

      const getData = await modelProfile.getSpecificProfile(fastify, idUser)
      if (!getData.id_user) {
        req.response.rd = 'SUCCESS, NOT FOUND'
      }
      req.response.data = getData
      return true
    }
  )

  // API for Create
  fastify.post(
    '/create',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            nameUser: { type: 'string', minLength: 4, maxLength: 60 },
            phone: { type: 'string', minLength: 8, maxLength: 15 },
            address: { type: 'string', minLength: 1, maxLength: 255 },
          },
          required: ['nameUser', 'phone', 'address'],
        },
      },
    },
    async (req) => {
      const { nameUser, phone, address } = req.body
      req.response.rc = httpResp.HTTP_CREATED
      req.response.rd = 'SUCCESS'

      const insertData = await modelProfile.insertProfile(fastify, {
        nameUser,
        phone,
        address,
      })

      req.response.data = insertData
      return true
    }
  )

  // API for Update
  fastify.put(
    '/update',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            idUser: { type: 'integer', minimum: 0 },
            nameUser: { type: 'string', minLength: 4, maxLength: 60 },
            phone: { type: 'string', minLength: 8, maxLength: 15 },
            address: { type: 'string', minLength: 1, maxLength: 255 },
          },
          required: ['idUser'],
        },
      },
    },
    async (req) => {
      const { idUser, nameUser, phone, address } = req.body
      req.response.rc = httpResp.HTTP_ACCEPTED
      req.response.rd = 'SUCCESS'

      const getData = await modelProfile.getSpecificProfile(fastify, idUser)
      if (!getData.id_user) {
        return new createError.NotFound('User Not Found')
      }

      const updateData = await modelProfile.updateProfile(fastify, idUser, {
        nameUser: nameUser !== undefined ? nameUser : getData.name_user,
        phone: phone !== undefined ? phone : getData.phone,
        address: address !== undefined ? address : getData.address,
      })

      req.response.data = updateData
      return true
    }
  )

  // API for Delete
  fastify.delete(
    '/delete',
    {
      schema: {
        body: {
          type: 'object',
          properties: {
            idUser: { type: 'integer', minimum: 0 },
          },
          required: ['idUser'],
        },
      },
    },
    async (req) => {
      const { idUser } = req.body
      req.response.rc = httpResp.HTTP_GENERALERROR
      req.response.rd = 'ERROR'
      req.response.data = {}

      const getData = await modelProfile.getSpecificProfile(fastify, idUser)
      if (!getData.id_user) {
        return new createError.NotFound('User Not Found or Already Deleted')
      }

      const deleteProfile = await modelProfile.deleteProfile(fastify, idUser)
      if (deleteProfile === 1) {
        req.response.rc = httpResp.HTTP_ACCEPTED
        req.response.rd = 'SUCCESS'
      }

      return true
    }
  )
}

module.exports = routes
