import { mockBooks, mockMangas, mockChapters } from '@/services/mockData';
import { useBackendStatus } from '@/context/BackendStatusContext';
import type { Book, Manga, Chapter } from '@/types';

export function useMockData() {
  const { isMock } = useBackendStatus();
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
