export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'reader';
  createdAt: string;
}

export interface Book {
  _id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  coverUrl: string;
  pdfUrl: string;
  createdBy: { name: string };
  createdAt: string;
}

export interface Manga {
  _id: string;
  title: string;
  author: string;
  description: string;
  genre: string;
  coverUrl: string;
  createdBy: { name: string };
  createdAt: string;
}

export interface Chapter {
  _id: string;
  mangaId: string;
  chapterTitle: string;
  chapterNumber: number;
  fileUrl: string;
  createdAt: string;
}
