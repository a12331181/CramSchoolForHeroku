'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Tuition extends Model {
    static associate(models) {
      Tuition.belongsToMany(models.ExtraFee, {
        through: models.FeeList,
        foreignKey: 'TuitionId',
        as: 'RequiredFee'
      })
      Tuition.belongsTo(models.Course)
      Tuition.belongsTo(models.Student)
    }
  };
  Tuition.init({
    course_price: DataTypes.INTEGER,
    amounts: DataTypes.INTEGER,
    CourseId: DataTypes.INTEGER,
    StudentId: DataTypes.INTEGER,
    period: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Tuition',
  });
  return Tuition;
};