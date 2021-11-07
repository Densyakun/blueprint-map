'use strict'

module.exports = async function (fastify, opts) {
  const path = require('path')

  fastify.register(require('fastify-static'), {
      root: path.join(__dirname, '../public')
  })
}
