'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class ExtraFee extends Model {
    static associate(models) {
      ExtraFee.belongsToMany(models.Tuition, {
        through: models.FeeList,
        foreignKey: 'ExtraFeeId',
        as: 'BelongTuition'
      })
    }
  };
  ExtraFee.init({
    name: DataTypes.STRING,
    price: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'ExtraFee',
  });
  return ExtraFee;
};