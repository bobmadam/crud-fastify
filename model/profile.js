const postgresql = require('../helper/postgresql')

async function getAllProfile(fastify, offset = 0, limit = 20) {
  const data = await postgresql.query(
    fastify,
    `SELECT 
        id_user, name_user, phone, address 
    FROM public.profile
    ORDER BY 
        id_user DESC 
    OFFSET $1 
    LIMIT $2`,
    [offset, limit]
  )
  return data.rows || []
}

async function getSpecificProfile(fastify, idUser) {
  const data = await postgresql.query(
    fastify,
    `SELECT 
        id_user, name_user, phone, address
      FROM public.profile
      WHERE id_user = $1`,
    [idUser]
  )
  return data.rows[0] || {}
}

async function insertProfile(fastify, input) {
  const data = await postgresql.query(
    fastify,
    `INSERT INTO public.profile (name_user, phone, address) 
      VALUES ($1, $2, $3) 
      RETURNING id_user, name_user, phone, address`,
    [input.nameUser, input.phone, input.address]
  )
  return data.rows[0] || {}
}

async function updateProfile(fastify, idUser, input) {
  const data = await postgresql.query(
    fastify,
    `UPDATE public.profile 
    SET name_user = $1, phone = $2, address = $3, updated_at = NOW() 
    WHERE id_user = $4 
    RETURNING id_user, name_user, phone, address`,
    [input.nameUser, input.phone, input.address, idUser]
  )
  return data.rows[0] || {}
}

async function deleteProfile(fastify, idUser) {
  const data = await postgresql.query(
    fastify,
    `DELETE FROM public.profile 
      WHERE id_user = $1`,
    [idUser]
  )
  return data.rowCount || null
}

module.exports = {
  getAllProfile,
  getSpecificProfile,
  insertProfile,
  updateProfile,
  deleteProfile,
}
