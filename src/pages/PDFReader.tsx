import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookService } from '@/services/api';
import { getMockBookById } from '@/hooks/useMockData';
import type { Book } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

export default function PDFReader() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [hasError, setHasError] = useState(false);

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

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setHasError(false);
  };

  const onDocumentError = () => {
    setHasError(true);
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

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const pdfUrl = book?.pdfUrl ? (book.pdfUrl.startsWith('http') ? book.pdfUrl : `${API_URL}${book.pdfUrl}`) : '';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p>Libro no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white">
      {/* Toolbar */}
      <div className="bg-slate-800 border-b border-slate-700 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to={`/books/${book._id}`}>
              <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white hover:bg-slate-700">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Volver
              </Button>
            </Link>
            <h1 className="font-semibold truncate max-w-xs md:max-w-md">{book.title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="text-slate-300 hover:text-white hover:bg-slate-700">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-400 w-12 text-center">{Math.round(scale * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={() => setScale(s => Math.min(2.5, s + 0.1))} className="text-slate-300 hover:text-white hover:bg-slate-700">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload} className="text-slate-300 hover:text-white hover:bg-slate-700">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="max-w-5xl mx-auto py-8 px-4">
        {hasError || !pdfUrl ? (
          <div className="text-center py-20">
            <p className="text-slate-400 mb-4">
              {!pdfUrl ? 'PDF no disponible en modo demostracion' : 'Error al cargar el PDF'}
            </p>
            <Button onClick={handleDownload} className="bg-amber-500 hover:bg-amber-600 text-slate-900">
              <Download className="h-4 w-4 mr-2" />
              Descargar PDF
            </Button>
          </div>
        ) : (
          <div className="flex justify-center">
            <Document
              file={pdfUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentError}
              loading={
                <div className="flex items-center justify-center h-96">
                  <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={scale}
                renderTextLayer
                renderAnnotationLayer
                className="shadow-2xl"
              />
            </Document>
          </div>
        )}

        {/* Page Navigation */}
        {numPages > 0 && !hasError && (
          <div className="flex items-center justify-center gap-4 mt-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPageNumber(p => Math.max(1, p - 1))}
              disabled={pageNumber <= 1}
              className="text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-300">
              Pagina {pageNumber} de {numPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPageNumber(p => Math.min(numPages, p + 1))}
              disabled={pageNumber >= numPages}
              className="text-slate-300 hover:text-white hover:bg-slate-700 disabled:opacity-30"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
