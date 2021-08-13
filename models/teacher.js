'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Teacher extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Teacher.init({
    name: DataTypes.STRING,
    sex: DataTypes.STRING,
    birth: DataTypes.STRING,
    phone: DataTypes.STRING,
    address: DataTypes.STRING,
    education: DataTypes.STRING,
    school: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Teacher',
  });
  return Teacher;
};