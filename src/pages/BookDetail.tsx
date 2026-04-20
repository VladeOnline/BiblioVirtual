import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookService } from '@/services/api';
import { getMockBookById } from '@/hooks/useMockData';
import type { Book } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, Download, ArrowLeft, Calendar, User, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function BookDetail() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) fetchBook(id);
  }, [id]);

  const fetchBook = async (bookId: string) => {
    try {
      setLoading(true);
      const res = await bookService.getById(bookId);
      setBook(res.data);
    } catch (error) {
      const mockBook = getMockBookById(bookId);
      if (mockBook) {
        setBook(mockBook);
      } else {
        toast.error('Error al cargar el libro');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (book?.pdfUrl) {
      const link = document.createElement('a');
      link.href = book.pdfUrl;
      link.download = `${book.title}.pdf`;
      link.click();
      toast.success('Descarga iniciada');
    } else {
      toast.info('PDF no disponible en modo demo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-[calc(100vh-64px)] flex items-center justify-center">
        <p className="text-slate-500 text-lg">Libro no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-50 px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <Link to="/books" className="inline-flex items-center text-slate-500 hover:text-slate-700 mb-6">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver al catalogo
        </Link>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Cover */}
          <div className="md:col-span-1">
            <Card className="overflow-hidden shadow-lg">
              <img
                src={book.coverUrl}
                alt={book.title}
                className="w-full aspect-[2/3] object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/400x600?text=Sin+Portada'; }}
              />
            </Card>
          </div>

          {/* Details */}
          <div className="md:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900">{book.title}</h1>
              <p className="text-lg text-slate-500 mt-1 flex items-center gap-1">
                <User className="h-4 w-4" />
                {book.author}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm font-medium">{book.genre}</span>
              <span className="px-3 py-1 bg-slate-200 text-slate-600 rounded-full text-sm flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {new Date(book.createdAt).toLocaleDateString()}
              </span>
            </div>

            <Card>
              <CardContent className="p-4">
                <h3 className="font-semibold text-slate-900 mb-2">Sinopsis</h3>
                <p className="text-slate-600 leading-relaxed">{book.description}</p>
              </CardContent>
            </Card>

            <div className="flex flex-wrap gap-4">
              <Link to={`/reader/book/${book._id}`}>
                <Button size="lg" className="bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Leer Ahora
                </Button>
              </Link>
              <Button size="lg" variant="outline" onClick={handleDownload}>
                <Download className="h-5 w-5 mr-2" />
                Descargar PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
