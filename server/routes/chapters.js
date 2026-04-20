const express = require('express');
const Chapter = require('../models/Chapter');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Public: Get chapters by manga
router.get('/manga/:mangaId', async (req, res) => {
  try {
    const chapters = await Chapter.find({ mangaId: req.params.mangaId }).sort({ chapterNumber: 1 });
    res.json(chapters);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Public: Get single chapter
router.get('/:id', async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Capítulo no encontrado' });
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Create chapter
router.post('/', authMiddleware, adminMiddleware, upload.single('chapterFile'), async (req, res) => {
  try {
    const { mangaId, chapterTitle, chapterNumber } = req.body;
    if (!mangaId || !chapterTitle || !chapterNumber) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }
    if (!req.file) {
      return res.status(400).json({ message: 'Se requiere archivo del capítulo' });
    }

    const chapter = new Chapter({
      mangaId,
      chapterTitle,
      chapterNumber: parseInt(chapterNumber),
      fileUrl: `/uploads/chapters/${req.file.filename}`
    });
    await chapter.save();
    res.status(201).json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Update chapter
router.put('/:id', authMiddleware, adminMiddleware, upload.single('chapterFile'), async (req, res) => {
  try {
    const { chapterTitle, chapterNumber } = req.body;
    const updateData = { chapterTitle, chapterNumber: parseInt(chapterNumber) };
    if (req.file) updateData.fileUrl = `/uploads/chapters/${req.file.filename}`;

    const chapter = await Chapter.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!chapter) return res.status(404).json({ message: 'Capítulo no encontrado' });
    res.json(chapter);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Admin: Delete chapter
router.delete('/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const chapter = await Chapter.findByIdAndDelete(req.params.id);
    if (!chapter) return res.status(404).json({ message: 'Capítulo no encontrado' });
    res.json({ message: 'Capítulo eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
