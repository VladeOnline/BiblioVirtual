import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { bookService } from '@/services/api';
import { getMockBookById } from '@/hooks/useMockData';
import type { Book } from '@/types';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Download, ZoomIn, ZoomOut, ChevronLeft, ChevronRight, Loader2, BookmarkPlus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/build/pdf.worker.min.mjs', import.meta.url).toString();

type TextMarker = {
  id: string;
  pageNumber: number;
  quote: string;
  createdAt: string;
};

export default function PDFReader() {
  const { id } = useParams<{ id: string }>();
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [hasError, setHasError] = useState(false);
  const [markers, setMarkers] = useState<TextMarker[]>([]);
  const [viewerWidth, setViewerWidth] = useState(900);
  const viewerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (id) fetchBook(id);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const stored = localStorage.getItem(`pdf_markers_${id}`);
    setMarkers(stored ? JSON.parse(stored) : []);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    localStorage.setItem(`pdf_markers_${id}`, JSON.stringify(markers));
  }, [id, markers]);

  useEffect(() => {
    if (!viewerRef.current) return;

    const updateWidth = () => {
      const width = viewerRef.current?.clientWidth || 900;
      setViewerWidth(Math.max(280, Math.floor(width)));
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(viewerRef.current);

    return () => observer.disconnect();
  }, []);

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

  const handleSaveMarker = () => {
    const selection = window.getSelection()?.toString().trim() || '';
    if (!selection) {
      toast.info('Selecciona texto del PDF antes de guardar un marcador');
      return;
    }

    const newMarker: TextMarker = {
      id: crypto.randomUUID(),
      pageNumber,
      quote: selection.slice(0, 180),
      createdAt: new Date().toISOString(),
    };

    setMarkers((prev) => [newMarker, ...prev]);
    toast.success('Marcador guardado');
  };

  const removeMarker = (markerId: string) => {
    setMarkers((prev) => prev.filter((m) => m.id !== markerId));
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  const pdfUrl = book?.pdfUrl ? (book.pdfUrl.startsWith('http') ? book.pdfUrl : `${API_URL}${book.pdfUrl}`) : '';
  const renderWidth = Math.floor(Math.min(980, viewerWidth - 32) * zoom);

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
            <Button variant="ghost" size="sm" onClick={() => setZoom((s) => Math.max(0.6, s - 0.1))} className="text-slate-300 hover:text-white hover:bg-slate-700">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-slate-400 w-12 text-center">{Math.round(zoom * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom((s) => Math.min(2.2, s + 0.1))} className="text-slate-300 hover:text-white hover:bg-slate-700">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleSaveMarker} className="text-slate-300 hover:text-white hover:bg-slate-700">
              <BookmarkPlus className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleDownload} className="text-slate-300 hover:text-white hover:bg-slate-700">
              <Download className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div ref={viewerRef} className="max-w-5xl mx-auto py-8 px-4">
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
          <div className="overflow-x-auto flex justify-center">
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
                width={renderWidth}
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

        {markers.length > 0 && (
          <div className="mt-8 bg-slate-800/70 border border-slate-700 rounded-lg p-4">
            <h3 className="font-semibold mb-3">Marcadores ({markers.length})</h3>
            <div className="space-y-2">
              {markers.map((marker) => (
                <div key={marker.id} className="flex items-center justify-between gap-3 bg-slate-900/70 rounded-md p-3">
                  <button
                    type="button"
                    className="text-left text-sm text-slate-200 hover:text-white"
                    onClick={() => setPageNumber(marker.pageNumber)}
                  >
                    <span className="text-amber-400 font-medium">Pag. {marker.pageNumber}:</span>{' '}
                    {marker.quote}
                  </button>
                  <Button variant="ghost" size="sm" onClick={() => removeMarker(marker.id)} className="text-red-400 hover:text-red-300 hover:bg-red-900/30">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
