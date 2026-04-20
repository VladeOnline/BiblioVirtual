require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const mangaRoutes = require('./routes/mangas');
const chapterRoutes = require('./routes/chapters');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bibliverse';

// Middleware
app.use(cors());
app.use(express.json());

// Static files - uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Static files - frontend (production)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/mangas', mangaRoutes);
app.use('/api/chapters', chapterRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// SPA fallback - serve index.html for all non-API routes
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// MongoDB connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('MongoDB Error:', err));

// Seed admin user
const seedAdmin = async () => {
  try {
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const adminExists = await User.findOne({ email: 'admin@bibliverse.com' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        name: 'Administrador',
        email: 'admin@bibliverse.com',
        password: hashedPassword,
        role: 'admin'
      });
      console.log('Admin user created: admin@bibliverse.com / admin123');
    }
  } catch (error) {
    console.error('Seed error:', error);
  }
};

mongoose.connection.once('open', seedAdmin);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
