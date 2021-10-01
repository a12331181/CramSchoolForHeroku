'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Calendars', 'period', {
      type: Sequelize.INTEGER,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Calendars', 'period');
  }
};
