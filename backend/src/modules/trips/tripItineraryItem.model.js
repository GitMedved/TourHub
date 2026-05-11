const { DataTypes } = require('sequelize');

const sequelize =
  require('../../config/database');

const TripItineraryItem =
  sequelize.define(
    'TripItineraryItem',
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

      description: {
        type: DataTypes.TEXT
      },

      location: {
        type: DataTypes.STRING
      },

      startsAt: {
        type: DataTypes.DATE
      },

      order: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      }
    }
  );

module.exports =
  TripItineraryItem;
