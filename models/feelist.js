'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class FeeList extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  FeeList.init({
    price: DataTypes.INTEGER,
    ExtraFeeId: DataTypes.INTEGER,
    TuitionId: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'FeeList',
  });
  return FeeList;
};