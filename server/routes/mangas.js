const express = require('express');
const Manga = require('../models/Manga');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public: Get all mangas
router.get('/', async (req, res) => {
  try {
    const { search, genre } = req.query;
    let query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (genre) query.genre = genre;
    const mangas = await Manga.find(query).populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json(mangas);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public: Get single manga
router.get('/:id', async (req, res) => {
  try {
    const manga = await Manga.findById(req.params.id).populate('createdBy', 'name');
    if (!manga) return res.status(404).json({ message: 'Manga no encontrado' });
    res.json(manga);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Create manga
router.post('/', authMiddleware, adminMiddleware, upload.single('cover'), async (req, res) => {
  try {
    const { title, author, description, genre } = req.body;
    if (!title || !author || !description || !genre) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Se requiere portada' });
    }

    const manga = new Manga({
      title, author, description, genre,
      coverUrl: `/uploads/covers/${req.file.filename}`,
      createdBy: req.user.userId
    });
    await manga.save();
    res.status(201).json(manga);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update manga
router.put('/:id', authMiddleware, adminMiddleware, upload.single('cover'), async (req, res) => {
  try {
    const { title, author, description, genre } = req.body;
    const updateData = { title, author, description, genre };
    if (req.file) updateData.coverUrl = `/uploads/covers/${req.file.filename}`;

    const manga = await Manga.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!manga) return res.status(404).json({ message: 'Manga no encontrado' });
    res.json(manga);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Delete manga
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const manga = await Manga.findByIdAndDelete(req.params.id);
    if (!manga) return res.status(404).json({ message: 'Manga no encontrado' });
    // Also delete related chapters
    const Chapter = require('../models/Chapter');
    await Chapter.deleteMany({ mangaId: req.params.id });
    res.json({ message: 'Manga y capítulos eliminados' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
