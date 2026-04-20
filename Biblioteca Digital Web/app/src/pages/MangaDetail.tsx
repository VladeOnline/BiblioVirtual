import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { mangaService, chapterService } from '@/services/api';
import { getMockMangaById, getMockChaptersByManga } from '@/hooks/useMockData';
import type { Manga, Chapter } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Calendar, User, BookOpen, ListOrdered, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function MangaDetail() {
  const { id } = useParams<{ id: string }>();
  const [manga, setManga] = useState<Manga | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchData(id);
  }, [id]);

  const fetchData = async (mangaId: string) => {
    try {
      setLoading(true);
      const [mangaRes, chaptersRes] = await Promise.all([
        mangaService.getById(mangaId),
        chapterService.getByManga(mangaId),
      ]);
      setManga(mangaRes.data);
      setChapters(chaptersRes.data);
    } catch (error) {
      const mockManga = getMockMangaById(mangaId);
      if (mockManga) {
        setManga(mockManga);
        setChapters(getMockChaptersByManga(mangaId));
      } else {
        toast.error('Error al cargar el manga');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!manga) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <p className="text-slate-500 text-lg">Manga no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <Link to="/mangas" className="inline-flex items-center text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al catalogo
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Cover */}
          <div className="md:col-span-1">
            <Card className="overflow-hidden shadow-lg">
              <img
                src={manga.coverUrl}
                alt={manga.title}
                className="w-full aspect-[2/3] object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x600?text=Sin+Portada'; }}
              />
            </Card>
          </div>

          {/* Details + Chapters */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{manga.title}</h1>
              <p className="text-lg text-slate-500 mt-1 flex items-center gap-1">
                <User className="h-4 w-4" />
                {manga.author}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">{manga.genre}</span>
              <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-sm flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(manga.createdAt).toLocaleDateString()}
              </span>
            </div>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Sinopsis</h3>
                <p className="text-slate-600 leading-relaxed">{manga.description}</p>
              </CardContent>
            </Card>

            {/* Chapters List */}
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <ListOrdered className="h-5 w-5 text-amber-500" />
                Capitulos
              </h2>
              {chapters.length === 0 ? (
                <Card>
                  <CardContent className="p-6 text-center text-slate-500">
                    No hay capitulos disponibles
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-2">
                  {chapters.map((chapter) => (
                    <Link to={`/reader/chapter/${chapter._id}`} key={chapter._id}>
                      <Card className="hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-4 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-bold">
                              #{chapter.chapterNumber}
                            </span>
                            <span className="font-medium text-slate-900">{chapter.chapterTitle}</span>
                          </div>
                          <BookOpen className="h-5 w-5 text-slate-400" />
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
