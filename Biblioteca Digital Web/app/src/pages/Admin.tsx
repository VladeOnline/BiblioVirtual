import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { bookService, mangaService, chapterService } from '@/services/api';
import { getMockBooks, getMockMangas, getMockChaptersByManga } from '@/hooks/useMockData';
import type { Book, Manga, Chapter } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Pencil, Trash2, BookOpen, Sparkles, ListOrdered, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [books, setBooks] = useState<Book[]>([]);
  const [mangas, setMangas] = useState<Manga[]>([]);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('books');
  const [isMock, setIsMock] = useState(false);

  // Form states
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
  }, [user]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [booksRes, mangasRes] = await Promise.all([
        bookService.getAll(),
        mangaService.getAll(),
      ]);
      setBooks(booksRes.data);
      setMangas(mangasRes.data);
    } catch (error) {
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
    } catch (error) {
      setChapters(getMockChaptersByManga(mangaId));
    }
  };

  const handleDeleteBook = async (id: string) => {
    if (!confirm('¿Eliminar este libro?')) return;
    if (isMock) {
      setBooks(books.filter(b => b._id !== id));
      toast.success('Libro eliminado (demo)');
      return;
    }
    try {
      await bookService.delete(id);
      toast.success('Libro eliminado');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleDeleteManga = async (id: string) => {
    if (!confirm('¿Eliminar este manga y todos sus capitulos?')) return;
    if (isMock) {
      setMangas(mangas.filter(m => m._id !== id));
      toast.success('Manga eliminado (demo)');
      return;
    }
    try {
      await mangaService.delete(id);
      toast.success('Manga eliminado');
      fetchData();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const handleDeleteChapter = async (id: string) => {
    if (!confirm('¿Eliminar este capitulo?')) return;
    if (isMock) {
      setChapters(chapters.filter(c => c._id !== id));
      toast.success('Capitulo eliminado (demo)');
      return;
    }
    try {
      await chapterService.delete(id);
      toast.success('Capitulo eliminado');
      if (selectedMangaId) fetchChapters(selectedMangaId);
    } catch (error) {
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
              Modo demostracion: Los cambios no se guardaran permanentemente. Conecta el backend para funcionalidad completa.
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

          {/* Books Tab */}
          <TabsContent value="books">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Gestion de Libros</h2>
              <Button onClick={() => { setEditingBook(null); setShowBookForm(true); }} className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                <Plus className="h-4 w-4 mr-1" />
                Nuevo Libro
              </Button>
            </div>

            {showBookForm && (
              <BookForm
                book={editingBook}
                onClose={() => { setShowBookForm(false); setEditingBook(null); }}
                onSuccess={() => { fetchData(); setShowBookForm(false); setEditingBook(null); }}
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
                          <Button variant="ghost" size="sm" onClick={() => { setEditingBook(book); setShowBookForm(true); }}>
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

          {/* Mangas Tab */}
          <TabsContent value="mangas">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Gestion de Mangas</h2>
              <Button onClick={() => { setEditingManga(null); setShowMangaForm(true); }} className="bg-amber-500 hover:bg-amber-600 text-slate-900">
                <Plus className="h-4 w-4 mr-1" />
                Nuevo Manga
              </Button>
            </div>

            {showMangaForm && (
              <MangaForm
                manga={editingManga}
                onClose={() => { setShowMangaForm(false); setEditingManga(null); }}
                onSuccess={() => { fetchData(); setShowMangaForm(false); setEditingManga(null); }}
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
                          <Button variant="ghost" size="sm" onClick={() => { setEditingManga(manga); setShowMangaForm(true); }}>
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

          {/* Chapters Tab */}
          <TabsContent value="chapters">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Gestion de Capitulos</h2>
            </div>

            <div className="mb-4">
              <Label>Seleccionar Manga</Label>
              <select
                className="w-full md:w-64 mt-1 p-2 border rounded-md bg-white"
                value={selectedMangaId}
                onChange={(e) => { setSelectedMangaId(e.target.value); fetchChapters(e.target.value); }}
              >
                <option value="">-- Seleccionar --</option>
                {mangas.map((m) => (
                  <option key={m._id} value={m._id}>{m.title}</option>
                ))}
              </select>
            </div>

            {selectedMangaId && (
              <>
                <Button onClick={() => { setEditingChapter(null); setShowChapterForm(true); }} className="mb-4 bg-amber-500 hover:bg-amber-600 text-slate-900">
                  <Plus className="h-4 w-4 mr-1" />
                  Nuevo Capitulo
                </Button>

                {showChapterForm && (
                  <ChapterForm
                    mangaId={selectedMangaId}
                    chapter={editingChapter}
                    onClose={() => { setShowChapterForm(false); setEditingChapter(null); }}
                    onSuccess={() => { fetchChapters(selectedMangaId); setShowChapterForm(false); setEditingChapter(null); }}
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
                      {chapters.map((ch) => (
                        <TableRow key={ch._id}>
                          <TableCell>{ch.chapterNumber}</TableCell>
                          <TableCell className="font-medium">{ch.chapterTitle}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="sm" onClick={() => { setEditingChapter(ch); setShowChapterForm(true); }}>
                                <Pencil className="h-4 w-4 text-blue-500" />
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteChapter(ch._id)}>
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

// Book Form Component
function BookForm({ book, onClose, onSuccess, isMock }: { book: Book | null; onClose: () => void; onSuccess: () => void; isMock: boolean }) {
  const [formData, setFormData] = useState({
    title: book?.title || '',
    author: book?.author || '',
    description: book?.description || '',
    genre: book?.genre || '',
  });
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.description || !formData.genre) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    if (isMock) {
      toast.success(book ? 'Libro actualizado (demo)' : 'Libro creado (demo)');
      onSuccess();
      return;
    }
    if (!book && (!pdfFile || !coverFile)) {
      toast.error('Se requiere PDF y portada');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('author', formData.author);
    data.append('description', formData.description);
    data.append('genre', formData.genre);
    if (pdfFile) data.append('pdf', pdfFile);
    if (coverFile) data.append('cover', coverFile);

    setSubmitting(true);
    try {
      if (book) {
        await bookService.update(book._id, data);
        toast.success('Libro actualizado');
      } else {
        await bookService.create(data);
        toast.success('Libro creado');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{book ? 'Editar Libro' : 'Nuevo Libro'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Titulo *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Autor *</Label>
              <Input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descripcion *</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Genero *</Label>
            <Input value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} />
          </div>
          {!isMock && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>PDF {book ? '(opcional)' : '*'} </Label>
                <Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
              </div>
              <div className="space-y-2">
                <Label>Portada {book ? '(opcional)' : '*'} </Label>
                <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
              </div>
            </div>
          )}
          <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-slate-900">
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {book ? 'Actualizar' : 'Crear'} Libro
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Manga Form Component
function MangaForm({ manga, onClose, onSuccess, isMock }: { manga: Manga | null; onClose: () => void; onSuccess: () => void; isMock: boolean }) {
  const [formData, setFormData] = useState({
    title: manga?.title || '',
    author: manga?.author || '',
    description: manga?.description || '',
    genre: manga?.genre || '',
  });
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.author || !formData.description || !formData.genre) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    if (isMock) {
      toast.success(manga ? 'Manga actualizado (demo)' : 'Manga creado (demo)');
      onSuccess();
      return;
    }
    if (!manga && !coverFile) {
      toast.error('Se requiere portada');
      return;
    }

    const data = new FormData();
    data.append('title', formData.title);
    data.append('author', formData.author);
    data.append('description', formData.description);
    data.append('genre', formData.genre);
    if (coverFile) data.append('cover', coverFile);

    setSubmitting(true);
    try {
      if (manga) {
        await mangaService.update(manga._id, data);
        toast.success('Manga actualizado');
      } else {
        await mangaService.create(data);
        toast.success('Manga creado');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{manga ? 'Editar Manga' : 'Nuevo Manga'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Titulo *</Label>
              <Input value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Autor *</Label>
              <Input value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Descripcion *</Label>
            <Textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          </div>
          <div className="space-y-2">
            <Label>Genero *</Label>
            <Input value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} />
          </div>
          {!isMock && (
            <div className="space-y-2">
              <Label>Portada {manga ? '(opcional)' : '*'} </Label>
              <Input type="file" accept="image/*" onChange={(e) => setCoverFile(e.target.files?.[0] || null)} />
            </div>
          )}
          <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-slate-900">
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {manga ? 'Actualizar' : 'Crear'} Manga
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Chapter Form Component
function ChapterForm({ mangaId, chapter, onClose, onSuccess, isMock }: { mangaId: string; chapter: Chapter | null; onClose: () => void; onSuccess: () => void; isMock: boolean }) {
  const [formData, setFormData] = useState({
    chapterTitle: chapter?.chapterTitle || '',
    chapterNumber: chapter?.chapterNumber?.toString() || '',
  });
  const [chapterFile, setChapterFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.chapterTitle || !formData.chapterNumber) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    if (isMock) {
      toast.success(chapter ? 'Capitulo actualizado (demo)' : 'Capitulo creado (demo)');
      onSuccess();
      return;
    }
    if (!chapter && !chapterFile) {
      toast.error('Se requiere archivo del capitulo');
      return;
    }

    const data = new FormData();
    data.append('mangaId', mangaId);
    data.append('chapterTitle', formData.chapterTitle);
    data.append('chapterNumber', formData.chapterNumber);
    if (chapterFile) data.append('chapterFile', chapterFile);

    setSubmitting(true);
    try {
      if (chapter) {
        await chapterService.update(chapter._id, data);
        toast.success('Capitulo actualizado');
      } else {
        await chapterService.create(data);
        toast.success('Capitulo creado');
      }
      onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{chapter ? 'Editar Capitulo' : 'Nuevo Capitulo'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}><X className="h-4 w-4" /></Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Titulo del Capitulo *</Label>
              <Input value={formData.chapterTitle} onChange={(e) => setFormData({ ...formData, chapterTitle: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Numero de Capitulo *</Label>
              <Input type="number" value={formData.chapterNumber} onChange={(e) => setFormData({ ...formData, chapterNumber: e.target.value })} />
            </div>
          </div>
          {!isMock && (
            <div className="space-y-2">
              <Label>Archivo {chapter ? '(opcional)' : '*'} </Label>
              <Input type="file" accept=".pdf,image/*" onChange={(e) => setChapterFile(e.target.files?.[0] || null)} />
            </div>
          )}
          <Button type="submit" disabled={submitting} className="bg-amber-500 hover:bg-amber-600 text-slate-900">
            {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            {chapter ? 'Actualizar' : 'Crear'} Capitulo
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
