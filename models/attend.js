'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Attend extends Model {
    static associate(models) {
      Attend.belongsTo(models.Student)
      Attend.belongsTo(models.Calendar)
    }
  };
  Attend.init({
    CalendarId: DataTypes.INTEGER,
    StudentId: DataTypes.INTEGER,
    isAttend: DataTypes.BOOLEAN,
    reason: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Attend',
  });
  return Attend;
};