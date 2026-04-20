require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const authRoutes = require('./routes/auth');
const bookRoutes = require('./routes/books');
const mangaRoutes = require('./routes/mangas');
const chapterRoutes = require('./routes/chapters');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bibliverse';
const uploadsPath = path.join(__dirname, 'uploads');
const distPath = path.join(__dirname, '..', 'dist');

if (!process.env.JWT_SECRET) {
  console.error('Missing JWT_SECRET in environment variables.');
  process.exit(1);
}

// Ensure upload directories exist before handling requests.
['books', 'covers', 'chapters'].forEach((folder) => {
  fs.mkdirSync(path.join(uploadsPath, folder), { recursive: true });
});

// Middleware
app.use(cors());
app.use(express.json());

// Static files - uploads
app.use('/uploads', express.static(uploadsPath));

// Static files - frontend (production)
app.use(express.static(distPath));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/mangas', mangaRoutes);
app.use('/api/chapters', chapterRoutes);
app.use('/api/{*splat}', (req, res) => {
  res.status(404).json({ message: 'Ruta no encontrada.' });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' });
});

// SPA fallback - serve index.html for all non-API routes
app.get('/{*splat}', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  if (res.headersSent) {
    return next(err);
  }

  const status = err.status || (err.name === 'MulterError' ? 400 : 500);
  const message = err.message || 'Error interno del servidor.';

  if (req.path.startsWith('/api/')) {
    return res.status(status).json({ message });
  }

  return res.status(status).send('Error interno del servidor.');
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
