import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { bookService, mangaService, chapterService } from '@/services/api';
import { getMockBooks, getMockMangas, getMockChaptersByManga } from '@/hooks/useMockData';
import type { Book, Manga, Chapter } from '@/types';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, BookOpen, Sparkles, ListOrdered, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { BookForm } from '@/pages/admin/BookForm';
import { MangaForm } from '@/pages/admin/MangaForm';
import { ChapterForm } from '@/pages/admin/ChapterForm';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books');
  const [isMock, setIsMock] = useState(false);

  const [showBookForm, setShowBookForm] = useState(false);
  const [showMangaForm, setShowMangaForm] = useState(false);
  const [showChapterForm, setShowChapterForm] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [editingManga, setEditingManga] = useState<Manga | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [selectedMangaId, setSelectedMangaId] = useState('');

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksRes, mangasRes] = await Promise.all([bookService.getAll(), mangaService.getAll()]);
      setBooks(booksRes.data);
      setMangas(mangasRes.data);
      setIsMock(false);
    } catch {
      setIsMock(true);
      setBooks(getMockBooks());
      setMangas(getMockMangas());
      toast.info('Usando datos de demostracion');
    } finally {
      setLoading(false);
    }
  };

  const fetchChapters = async (mangaId: string) => {
    try {
      const res = await chapterService.getByManga(mangaId);
      setChapters(res.data);
    } catch {
      setChapters(getMockChaptersByManga(mangaId));
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('¿Eliminar este libro?')) return;
    if (isMock) {
      setBooks(books.filter((book) => book._id !== id));
      toast.success('Libro eliminado (demo)');
      return;
    }
    try {
      await bookService.delete(id);
      toast.success('Libro eliminado');
      fetchData();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleDeleteManga = async (id: string) => {
    if (!confirm('¿Eliminar este manga y todos sus capitulos?')) return;
    if (isMock) {
      setMangas(mangas.filter((manga) => manga._id !== id));
      toast.success('Manga eliminado (demo)');
      return;
    }
    try {
      await mangaService.delete(id);
      toast.success('Manga eliminado');
      fetchData();
    } catch {
      toast.error('Error al eliminar');
    }
  };

  const handleDeleteChapter = async (id: string) => {
    if (!confirm('¿Eliminar este capitulo?')) return;
    if (isMock) {
      setChapters(chapters.filter((chapter) => chapter._id !== id));
      toast.success('Capitulo eliminado (demo)');
      return;
    }
    try {
      await chapterService.delete(id);
      toast.success('Capitulo eliminado');
      if (selectedMangaId) fetchChapters(selectedMangaId);
    } catch {
      toast.error('Error al eliminar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-8">Panel de Administracion</h1>
        {isMock && (
          <Card className="mb-6 bg-amber-50 border-amber-200">
            <CardContent className="p-4 text-amber-700 text-sm">
              Modo demostracion: Los cambios no se guardaran permanentemente. Conecta el backend para funcionalidad
              completa.
            </CardContent>
          </Card>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="books" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Libros ({books.length})
            </TabsTrigger>
            <TabsTrigger value="mangas" className="flex items-center gap-1">
              <Sparkles className="h-4 w-4" />
              Mangas ({mangas.length})
            </TabsTrigger>
            <TabsTrigger value="chapters" className="flex items-center gap-1">
              <ListOrdered className="h-4 w-4" />
              Capitulos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="books">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Gestion de Libros</h2>
              <Button
                onClick={() => {
                  setEditingBook(null);
                  setShowBookForm(true);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nuevo Libro
              </Button>
            </div>

            {showBookForm && (
              <BookForm
                book={editingBook}
                onClose={() => {
                  setShowBookForm(false);
                  setEditingBook(null);
                }}
                onSuccess={() => {
                  fetchData();
                  setShowBookForm(false);
                  setEditingBook(null);
                }}
                isMock={isMock}
              />
            )}

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titulo</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Genero</TableHead>
                    <TableHead className="w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {books.map((book) => (
                    <TableRow key={book._id}>
                      <TableCell className="font-medium">{book.title}</TableCell>
                      <TableCell>{book.author}</TableCell>
                      <TableCell>{book.genre}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingBook(book);
                              setShowBookForm(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteBook(book._id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="mangas">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Gestion de Mangas</h2>
              <Button
                onClick={() => {
                  setEditingManga(null);
                  setShowMangaForm(true);
                }}
                className="bg-amber-500 hover:bg-amber-600 text-slate-900"
              >
                <Plus className="h-4 w-4 mr-1" />
                Nuevo Manga
              </Button>
            </div>

            {showMangaForm && (
              <MangaForm
                manga={editingManga}
                onClose={() => {
                  setShowMangaForm(false);
                  setEditingManga(null);
                }}
                onSuccess={() => {
                  fetchData();
                  setShowMangaForm(false);
                  setEditingManga(null);
                }}
                isMock={isMock}
              />
            )}

            <Card>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titulo</TableHead>
                    <TableHead>Autor</TableHead>
                    <TableHead>Genero</TableHead>
                    <TableHead className="w-24">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mangas.map((manga) => (
                    <TableRow key={manga._id}>
                      <TableCell className="font-medium">{manga.title}</TableCell>
                      <TableCell>{manga.author}</TableCell>
                      <TableCell>{manga.genre}</TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setEditingManga(manga);
                              setShowMangaForm(true);
                            }}
                          >
                            <Pencil className="h-4 w-4 text-blue-500" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteManga(manga._id)}>
                            <Trash2 className="h-4 w-4 text-red-500" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>
          </TabsContent>

          <TabsContent value="chapters">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Gestion de Capitulos</h2>
            </div>

            <div className="mb-4">
              <Label>Seleccionar Manga</Label>
              <select
                className="w-full md:w-64 mt-1 p-2 border rounded-md bg-white"
                value={selectedMangaId}
                onChange={(e) => {
                  setSelectedMangaId(e.target.value);
                  fetchChapters(e.target.value);
                }}
              >
                <option value="">-- Seleccionar --</option>
                {mangas.map((manga) => (
                  <option key={manga._id} value={manga._id}>
                    {manga.title}
                  </option>
                ))}
              </select>
            </div>

            {selectedMangaId && (
              <>
                <Button
                  onClick={() => {
                    setEditingChapter(null);
                    setShowChapterForm(true);
                  }}
                  className="mb-4 bg-amber-500 hover:bg-amber-600 text-slate-900"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Nuevo Capitulo
                </Button>

                {showChapterForm && (
                  <ChapterForm
                    mangaId={selectedMangaId}
                    chapter={editingChapter}
                    onClose={() => {
                      setShowChapterForm(false);
                      setEditingChapter(null);
                    }}
                    onSuccess={() => {
                      fetchChapters(selectedMangaId);
                      setShowChapterForm(false);
                      setEditingChapter(null);
                    }}
                    isMock={isMock}
                  />
                )}

                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Titulo</TableHead>
                        <TableHead className="w-24">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chapters.map((chapter) => (
                        <TableRow key={chapter._id}>
                          <TableCell>{chapter.chapterNumber}</TableCell>
                          <TableCell className="font-medium">{chapter.chapterTitle}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setEditingChapter(chapter);
                                  setShowChapterForm(true);
                                }}
                              >
                                <Pencil className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteChapter(chapter._id)}>
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

