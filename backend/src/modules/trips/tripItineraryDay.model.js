const { DataTypes } = require('sequelize');

const sequelize =
  require('../../config/database');

const TripItineraryDay =
  sequelize.define(
    'TripItineraryDay',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue:
          DataTypes.UUIDV4,
        primaryKey: true
      },

      title: {
        type: DataTypes.STRING,
        allowNull: false
      },

      order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }
  );

module.exports =
  TripItineraryDay;
