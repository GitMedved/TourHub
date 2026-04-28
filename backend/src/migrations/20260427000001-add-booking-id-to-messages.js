module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('messages', 'booking_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'bookings',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    await queryInterface.sequelize.query(`
      UPDATE messages m
      SET booking_id = (
        SELECT b.id 
        FROM bookings b 
        WHERE (b.user_id = m.sender_id AND b.seller_id = m.receiver_id)
           OR (b.user_id = m.receiver_id AND b.seller_id = m.sender_id)
        LIMIT 1
      )
      WHERE m.booking_id IS NULL
    `);

    await queryInterface.changeColumn('messages', 'booking_id', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('messages', 'booking_id');
  }
};
