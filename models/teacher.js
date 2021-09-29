'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Teacher extends Model {
    static associate(models) {
      Teacher.belongsTo(models.User)
      Teacher.hasMany(models.Course)
      Teacher.hasMany(models.Meeting)
    }
  };
  Teacher.init({
    name: DataTypes.STRING,
    sex: DataTypes.STRING,
    birth: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    education: DataTypes.STRING,
    school: DataTypes.STRING,
    UserId: DataTypes.INTEGER,
    image: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Teacher',
  });
  return Teacher;
};