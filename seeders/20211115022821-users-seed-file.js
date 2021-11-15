'use strict';
const bcrypt = require('bcryptjs')

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('Users', [{
      email: 'admin@example.com',
      password: bcrypt.hashSync('123', bcrypt.genSaltSync(10), null),
      isAdmin: true,
      name: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'guest1@example.com',
      password: bcrypt.hashSync('123', bcrypt.genSaltSync(10), null),
      isAdmin: false,
      name: 'guest1',
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      email: 'guest2@example.com',
      password: bcrypt.hashSync('123', bcrypt.genSaltSync(10), null),
      isAdmin: false,
      name: 'guest2',
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null, {})
  }
};
