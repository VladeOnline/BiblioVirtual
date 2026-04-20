import { useState, useEffect } from 'react';
import { mockBooks, mockMangas, mockChapters } from '@/services/mockData';
import type { Book, Manga, Chapter } from '@/types';

let backendAvailable: boolean | null = null;

export function useMockData() {
  const [isMock, setIsMock] = useState(backendAvailable === false);

  useEffect(() => {
    if (backendAvailable !== null) {
      setIsMock(!backendAvailable);
      return;
    }

    // Check if backend is available
    fetch('/api/health', { method: 'GET', signal: AbortSignal.timeout(2000) })
      .then(() => {
        backendAvailable = true;
        setIsMock(false);
      })
      .catch(() => {
        backendAvailable = false;
        setIsMock(true);
        console.log('Backend not available, using mock data');
      });
  }, []);

  return { isMock, mockBooks, mockMangas, mockChapters };
}

export function getMockBooks(search?: string): Book[] {
  if (search) {
    return mockBooks.filter(b => b.title.toLowerCase().includes(search.toLowerCase()));
  }
  return mockBooks;
}

export function getMockBookById(id: string): Book | undefined {
  return mockBooks.find(b => b._id === id);
}

export function getMockMangas(search?: string): Manga[] {
  if (search) {
    return mockMangas.filter(m => m.title.toLowerCase().includes(search.toLowerCase()));
  }
  return mockMangas;
}

export function getMockMangaById(id: string): Manga | undefined {
  return mockMangas.find(m => m._id === id);
}

export function getMockChaptersByManga(mangaId: string): Chapter[] {
  return mockChapters.filter(c => c.mangaId === mangaId).sort((a, b) => a.chapterNumber - b.chapterNumber);
}

export function getMockChapterById(id: string): Chapter | undefined {
  return mockChapters.find(c => c._id === id);
}
