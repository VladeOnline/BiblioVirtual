const express = require('express');
const Book = require('../models/Book');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public: Get all books
router.get('/', async (req, res) => {
  try {
    const { search, genre } = req.query;
    let query = {};
    if (search) query.title = { $regex: search, $options: 'i' };
    if (genre) query.genre = genre;
    const books = await Book.find(query).populate('createdBy', 'name').sort({ createdAt: -1 });
    res.json(books);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public: Get single book
router.get('/:id', async (req, res) => {
  try {
    const book = await Book.findById(req.params.id).populate('createdBy', 'name');
    if (!book) return res.status(404).json({ message: 'Libro no encontrado' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Create book
router.post('/', authMiddleware, adminMiddleware, upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, author, description, genre } = req.body;
    if (!title || !author || !description || !genre) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    if (!req.files || !req.files.pdf || !req.files.cover) {
      return res.status(400).json({ message: 'Se requiere PDF y portada' });
    }

    const book = new Book({
      title, author, description, genre,
      coverUrl: `/uploads/covers/${req.files.cover[0].filename}`,
      pdfUrl: `/uploads/books/${req.files.pdf[0].filename}`,
      createdBy: req.user.userId
    });
    await book.save();
    res.status(201).json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update book
router.put('/:id', authMiddleware, adminMiddleware, upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, author, description, genre } = req.body;
    const updateData = { title, author, description, genre };
    if (req.files?.pdf) updateData.pdfUrl = `/uploads/books/${req.files.pdf[0].filename}`;
    if (req.files?.cover) updateData.coverUrl = `/uploads/covers/${req.files.cover[0].filename}`;

    const book = await Book.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!book) return res.status(404).json({ message: 'Libro no encontrado' });
    res.json(book);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Delete book
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    if (!book) return res.status(404).json({ message: 'Libro no encontrado' });
    res.json({ message: 'Libro eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
