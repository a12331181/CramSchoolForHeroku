'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Payments', 'EnrollmentId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Payments', 'EnrollmentId', {
      type: Sequelize.INTEGER,
    })
  },
};
