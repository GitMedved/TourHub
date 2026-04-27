const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

require('./models');

const sequelize = require('./config/database');
const initAdmin = require('./utils/initAdmin');
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const adminRoutes = require('./routes/adminRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const messageRoutes = require('./routes/messageRoutes');

const app = express();

app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001', 'http://127.0.0.1:3000', 'http://127.0.0.1:3001'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(helmet({ crossOriginResourcePolicy: false, contentSecurityPolicy: false }));
app.use(express.json());
app.use(morgan('dev'));
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/seller', sellerRoutes);
app.use('/api/messages', messageRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'Server is running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message });
});

const bookingRoutes = require('./routes/bookingRoutes');
app.use('/api/bookings', bookingRoutes);
const reviewRoutes = require("./routes/reviewRoutes");
app.use("/api/reviews", reviewRoutes);
const PORT = process.env.PORT || 5001;

// Cron-задача: авто-завершение событий с истекшим сроком публикации
cron.schedule('0 * * * *', async () => {
  try {
    const Event = require('./models/Event');
    const { Op } = require('sequelize');
    
    const [updated] = await Event.update(
      { isPublished: false, moderationStatus: 'completed' },
      { 
        where: { 
          publishUntil: { [Op.lt]: new Date() },
          isPublished: true 
        } 
      }
    );
    
    if (updated > 0) {
      console.log(`🕐 Auto-completed ${updated} events with expired publishUntil`);
    }
  } catch (error) {
    console.error('Cron error:', error.message);
  }
});

sequelize.sync({ alter: true }).then(async () => {
  console.log('✅ Database connected');
  await initAdmin();
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch(err => {
  console.error('❌ Database connection failed:', err.message);
  app.listen(PORT, () => console.log(`⚠️ Server running on port ${PORT} (without database)`));
});
