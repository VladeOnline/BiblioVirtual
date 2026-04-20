import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { chapterService } from '@/services/api';
import { getMockChapterById, getMockMangaById } from '@/hooks/useMockData';
import type { Chapter } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function ChapterReader() {
  const { id } = useParams<{ id: string }>();
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [mangaTitle, setMangaTitle] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchChapter(id);
  }, [id]);

  const fetchChapter = async (chapterId: string) => {
    try {
      setLoading(true);
      const res = await chapterService.getById(chapterId);
      setChapter(res.data);
      // Try to get manga title
      try {
        const mangaRes = await import('@/services/api').then(m => m.mangaService.getById(res.data.mangaId));
        setMangaTitle(mangaRes.data.title);
      } catch {
        const mockManga = getMockMangaById(res.data.mangaId);
        if (mockManga) setMangaTitle(mockManga.title);
      }
    } catch (error) {
      const mockChapter = getMockChapterById(chapterId);
      if (mockChapter) {
        setChapter(mockChapter);
        const mockManga = getMockMangaById(mockChapter.mangaId);
        if (mockManga) setMangaTitle(mockManga.title);
      } else {
        toast.error('Error al cargar el capitulo');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (chapter?.fileUrl) {
      const link = document.createElement('a');
      link.href = chapter.fileUrl;
      link.download = `${chapter.chapterTitle}.pdf`;
      link.click();
      toast.success('Descarga iniciada');
    } else {
      toast.info('Archivo no disponible en modo demo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p>Capitulo no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/mangas/${chapter.mangaId}`}>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold truncate max-w-xs md:max-w-md">{chapter.chapterTitle}</h1>
              <p className="text-xs text-slate-400">
                {mangaTitle} - Capitulo #{chapter.chapterNumber}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleDownload} className="text-slate-300 hover:text-white hover:bg-slate-700">
            <Download className="h-4 w-4 mr-1" />
            Descargar
          </Button>
        </div>
      </div>

      {/* Content Viewer */}
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="bg-slate-800 rounded-lg p-12 text-center">
          <h2 className="text-2xl font-bold mb-4">{chapter.chapterTitle}</h2>
          <p className="text-slate-400 mb-8">
            {mangaTitle} - Capitulo #{chapter.chapterNumber}
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="ghost" disabled className="text-slate-300 disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-400 self-center">Pagina 1 de 1</span>
            <Button variant="ghost" disabled className="text-slate-300 disabled:opacity-30">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-slate-500 text-sm mt-8">
            En modo produccion con backend activo, aqui se mostraria el PDF del capitulo.
          </p>
        </div>
      </div>
    </div>
  );
}
