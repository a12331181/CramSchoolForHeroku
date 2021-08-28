'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Calendar extends Model {
    static associate(models) {
      Calendar.belongsTo(models.Course)
      Calendar.hasMany(models.Attend)
    }
  };
  Calendar.init({
    date: DataTypes.STRING,
    content: DataTypes.TEXT,
    CourseId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Calendar',
  });
  return Calendar;
};