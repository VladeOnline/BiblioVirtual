import { useState } from 'react';
import { chapterService } from '@/services/api';
import type { Chapter } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

type ChapterFormProps = {
  mangaId: string;
  chapter: Chapter | null;
  onClose: () => void;
  onSuccess: () => void;
  isMock: boolean;
};

export function ChapterForm({ mangaId, chapter, onClose, onSuccess, isMock }: ChapterFormProps) {
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
        <CardTitle className="text-lg">{chapter ? 'Editar Capitulo' : 'Nuevo Capitulo'}</CardTitle>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Titulo del Capitulo *</Label>
              <Input
                value={formData.chapterTitle}
                onChange={(e) => setFormData({ ...formData, chapterTitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Numero de Capitulo *</Label>
              <Input
                type="number"
                value={formData.chapterNumber}
                onChange={(e) => setFormData({ ...formData, chapterNumber: e.target.value })}
              />
            </div>
          </div>
          {!isMock && (
            <div className="space-y-2">
              <Label>Archivo {chapter ? '(opcional)' : '*'}</Label>
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

