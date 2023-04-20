'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Spot extends Model {
    static associate(models) {
      Spot.belongsTo(models.User, {as: 'Owner', foreignKey: 'ownerId'});
      Spot.hasMany(models.SpotImage, {foreignKey: 'spotId', onDelete: 'CASCADE', as: 'previewImage'});
      Spot.hasMany(models.Review, {foreignKey: 'spotId', onDelete: 'CASCADE'});
    }
  }
  
  Spot.init({
    ownerId: DataTypes.INTEGER,
    address: DataTypes.STRING,
    city: DataTypes.STRING,
    state: DataTypes.STRING,
    country: DataTypes.STRING,
    lat: DataTypes.DECIMAL,
    lng: DataTypes.DECIMAL,
    name: DataTypes.STRING,
    description: DataTypes.STRING,
    price: DataTypes.DECIMAL
  }, {
    sequelize,
    modelName: 'Spot',
  });
  return Spot;
};