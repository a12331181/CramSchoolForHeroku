'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Course extends Model {
    static associate(models) {
      Course.belongsToMany(models.Student, {
        through: models.Enrollment,
        foreignKey: 'CourseId',
        as: 'EnrolledStudents'
      })
    }
  };
  Course.init({
    name: DataTypes.STRING,
    time: DataTypes.STRING,
    type: DataTypes.STRING,
    amounts: DataTypes.INTEGER,
    price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Course',
  });
  return Course;
};