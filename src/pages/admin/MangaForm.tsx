import { useState } from 'react';
import { mangaService } from '@/services/api';
import type { Manga } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

type MangaFormProps = {
  manga: Manga | null;
  onClose: () => void;
  onSuccess: () => void;
  isMock: boolean;
};

export function MangaForm({ manga, onClose, onSuccess, isMock }: MangaFormProps) {
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
        <CardTitle className="text-lg">{manga ? 'Editar Manga' : 'Nuevo Manga'}</CardTitle>
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
            <div className="space-y-2">
              <Label>Portada {manga ? '(opcional)' : '*'}</Label>
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

