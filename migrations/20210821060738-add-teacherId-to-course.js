'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('Courses', 'TeacherId', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'Teachers',
        key: 'id'
      }
    })
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('Courses', 'TeacherId')
  }
};
