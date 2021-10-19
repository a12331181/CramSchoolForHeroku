'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    static associate(models) {
      Student.belongsToMany(models.Course, {
        through: models.Enrollment,
        foreignKey: 'StudentId',
        as: 'EnrolledCourses'
      })
      Student.hasMany(models.Attend)
    }
  };
  Student.init({
    name: DataTypes.STRING,
    sex: DataTypes.STRING,
    birth: DataTypes.STRING,
    school: DataTypes.STRING,
    grade: DataTypes.STRING,
    tel: DataTypes.STRING,
    address: DataTypes.STRING,
    image: DataTypes.STRING,
    status: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'Student',
  });
  return Student;
};