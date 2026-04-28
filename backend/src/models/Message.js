module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    text: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'sender_id'
    },
    receiverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'receiver_id'
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'booking_id',
      references: {
        model: 'bookings',
        key: 'id'
      }
    },
    read: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: {
      type: DataTypes.DATE,
      field: 'created_at',
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'messages',
    timestamps: false,
    underscored: true
  });

  Message.associate = (models) => {
    Message.belongsTo(models.Booking, {
      foreignKey: 'booking_id',
      as: 'booking'
    });
    Message.belongsTo(models.User, {
      foreignKey: 'sender_id',
      as: 'sender'
    });
    Message.belongsTo(models.User, {
      foreignKey: 'receiver_id',
      as: 'receiver'
    });
  };

  return Message;
};
