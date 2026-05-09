const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const sequelize = require('./config/database');
const Event = require('./models/Event');
const { Op } = require('sequelize');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const adminRoutes = require('./routes/adminRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const messageRoutes = require('./routes/messageRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const sellerRoutes = require('./routes/sellerRoutes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/sellers', sellerRoutes);

// Auto-complete events cron job (runs every hour)
cron.schedule('0 * * * *', async () => {
  try {
    console.log('Running auto-complete cron...');
    const now = new Date();
    
    await Event.update(
      { status: 'COMPLETED' },
      {
        where: {
          endDate: { [Op.lt]: now },
          status: 'ACTIVE'
        }
      }
    );
    
    console.log('Auto-complete cron finished');
  } catch (error) {
    console.error('Cron error:', error);
  }
});

// Sync database and start server
const PORT = process.env.PORT || 5001;

sequelize.sync({ alter: true }).then(() => {
  console.log('Database synced');
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Database sync error:', err);
});

module.exports = app;
