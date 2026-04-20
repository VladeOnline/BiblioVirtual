import { useState } from 'react';
import { bookService } from '@/services/api';
import type { Book } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

type BookFormProps = {
  book: Book | null;
  onClose: () => void;
  onSuccess: () => void;
  isMock: boolean;
};

export function BookForm({ book, onClose, onSuccess, isMock }: BookFormProps) {
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
    } catch (error: unknown) {
      const message =
        typeof error === 'object' &&
        error !== null &&
        'response' in error &&
        typeof (error as { response?: { data?: { message?: string } } }).response?.data?.message === 'string'
          ? (error as { response?: { data?: { message?: string } } }).response?.data?.message
          : 'Error';
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">{book ? 'Editar Libro' : 'Nuevo Libro'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
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
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>Genero *</Label>
            <Input value={formData.genre} onChange={(e) => setFormData({ ...formData, genre: e.target.value })} />
          </div>
          {!isMock && (
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>PDF {book ? '(opcional)' : '*'}</Label>
                <Input type="file" accept=".pdf" onChange={(e) => setPdfFile(e.target.files?.[0] || null)} />
              </div>
              <div className="space-y-2">
                <Label>Portada {book ? '(opcional)' : '*'}</Label>
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

