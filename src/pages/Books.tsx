import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookService } from '@/services/api';
import { getMockBooks, useMockData } from '@/hooks/useMockData';
import type { Book } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Books() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { isMock } = useMockData();

  const fetchBooks = async (searchTerm = '') => {
    try {
      setLoading(true);
      if (isMock) {
        setBooks(getMockBooks(searchTerm));
        return;
      }
      const res = await bookService.getAll(searchTerm ? { search: searchTerm } : undefined);
      setBooks(res.data);
    } catch (error) {
      toast.error('Error al cargar los libros');
      setBooks(getMockBooks(searchTerm));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [isMock]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBooks(search);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpen className="h-8 w-8 text-amber-500" />
              Catalogo de Libros
            </h1>
            <p className="text-slate-500 mt-1">Explora nuestra coleccion de libros digitales</p>
          </div>
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Buscar por titulo..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Button type="submit" className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
          </div>
        ) : books.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="h-16 w-16 text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500 text-lg">No hay libros disponibles</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {books.map((book) => (
              <Link to={`/books/${book._id}`} key={book._id}>
                <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full">
                  <div className="aspect-[2/3] bg-slate-200 overflow-hidden">
                    <img
                      src={book.coverUrl}
                      alt={book.title}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/300x450?text=Sin+Portada'; }}
                    />
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-slate-900 truncate">{book.title}</h3>
                    <p className="text-sm text-slate-500">{book.author}</p>
                    <span className="inline-block mt-2 px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">{book.genre}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
