'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('ExtraFees', [{
      name: '學雜費',
      price: 1200,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      name: '教材費',
      price: 1500,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      name: '手續費',
      price: 1000,
      createdAt: new Date(),
      updatedAt: new Date()
    }, {
      name: '點心費',
      price: 500,
      createdAt: new Date(),
      updatedAt: new Date()
    }], {})
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('ExtraFees', null, {})
  }
};
