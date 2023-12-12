async function query(fastify, lines, value = []) {
  const data = await fastify.pg.query(lines, value)
  return data
}

module.exports = {
  query,
}
