const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = 'server/uploads/';
    if (file.fieldname === 'pdf') uploadPath += 'books/';
    else if (file.fieldname === 'cover') uploadPath += 'covers/';
    else if (file.fieldname === 'chapterFile') uploadPath += 'chapters/';
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  if (file.fieldname === 'pdf') {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Solo se permiten archivos PDF'), false);
  } else if (file.fieldname === 'cover') {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten imágenes'), false);
  } else if (file.fieldname === 'chapterFile') {
    if (file.mimetype === 'application/pdf' || file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Solo se permiten archivos PDF o imágenes'), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 50 * 1024 * 1024 } });

module.exports = upload;
