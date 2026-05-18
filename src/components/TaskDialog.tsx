import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Checkbox } from './ui/checkbox';
import { Task, createTask, updateTask, deleteTask } from '../lib/tasks';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface TaskDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  selectedDate: Date;
  taskToEdit?: Task | null;
}

const COLORS = [
  { name: 'Azul', value: '#3971b8' },
  { name: 'Verde', value: '#c8d69b' },
  { name: 'Vainilla', value: '#f6e6a5' },
  { name: 'Marrón', value: '#343b1b' },
  { name: 'Salmón', value: '#ff8a8a' },
  { name: 'Lavanda', value: '#b6a7f5' },
];

export function TaskDialog({ isOpen, onClose, userId, selectedDate, taskToEdit }: TaskDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<'pending' | 'completed'>('pending');
  const [color, setColor] = useState(COLORS[0].value);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
      setColor(taskToEdit.color || COLORS[0].value);
    } else {
      setTitle('');
      setDescription('');
      setStatus('pending');
      setColor(COLORS[0].value);
    }
  }, [taskToEdit, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;
    
    setIsSubmitting(true);
    try {
      if (taskToEdit) {
        await updateTask(taskToEdit.id, { 
          title, 
          description, 
          status, 
          color 
        });
      } else {
        await createTask({
          userId,
          title,
          description,
          date: selectedDate.toISOString(),
          status,
          color
        });
      }
      onClose();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!taskToEdit) return;
    if (window.confirm('¿Estás seguro de eliminar esta tarea?')) {
      await deleteTask(taskToEdit.id);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] border-matcha-brown border-2 rounded-2xl">
        <DialogHeader>
          <DialogTitle className="font-display font-bold text-2xl">
            {taskToEdit ? 'Editar Tarea' : 'Nueva Tarea'}
          </DialogTitle>
          <p className="text-sm text-matcha-brown/60">
            {format(selectedDate, 'EEEE, d de MMMM', { locale: es })}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="¿Qué planes tienes?"
              className="border-matcha-brown/20 focus:border-matcha-brown"
              required
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="description">Descripción</Label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="flex min-h-[80px] w-full rounded-md border border-matcha-brown/20 bg-transparent px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-matcha-brown disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Detalles de la tarea..."
            />
          </div>

          <div className="flex items-center gap-2">
            <Checkbox 
              id="status" 
              checked={status === 'completed'}
              onCheckedChange={(checked) => setStatus(checked ? 'completed' : 'pending')}
              className="border-matcha-brown"
            />
            <Label htmlFor="status">Completada</Label>
          </div>

          <div className="grid gap-2">
            <Label>Color de etiqueta</Label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setColor(c.value)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all",
                    color === c.value ? "border-matcha-brown scale-110 shadow-sm" : "border-transparent"
                  )}
                  style={{ backgroundColor: c.value }}
                />
              ))}
            </div>
          </div>

          <DialogFooter className="flex justify-between items-center sm:justify-between w-full">
            {taskToEdit ? (
              <button
                type="button"
                onClick={handleDelete}
                className="matcha-button bg-red-50 text-red-600 border-red-600 shadow-[2px_2px_0px_0px_rgba(220,38,38,1)] px-3"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            ) : <div />}
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="matcha-button bg-matcha-green"
            >
              {isSubmitting ? 'Guardando...' : taskToEdit ? 'Actualizar' : 'Crear Tarea'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
