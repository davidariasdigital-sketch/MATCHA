import { useState, useEffect } from 'react';
import { useAuth } from './hooks/useAuth';
import { loginWithGoogle } from './lib/firebase';
import { Task, subscribeToTasks } from './lib/tasks';
import { Navbar } from './components/Navbar';
import { CalendarView } from './components/CalendarView';
import { TaskDialog } from './components/TaskDialog';
import { motion, AnimatePresence } from 'motion/react';
import { Calendar as CalendarIcon, CheckCircle, Clock, Sparkles, Plus } from 'lucide-react';

export default function App() {
  const { user, userData, loading, updateProfile } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    if (user) {
      const unsubscribe = subscribeToTasks(user.uid, (newTasks) => {
        setTasks(newTasks);
      });
      return () => unsubscribe();
    } else {
      setTasks([]);
    }
  }, [user]);

  const handleAddTask = (date: Date) => {
    setSelectedDate(date);
    setSelectedTask(null);
    setIsDialogOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setSelectedDate(new Date(task.date));
    setSelectedTask(task);
    setIsDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-matcha-ivory">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-matcha-green border-t-matcha-brown rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} userData={userData} onUpdateProfile={updateProfile} />
      
      <main className="flex-1 p-4 md:p-8 max-w-7xl mx-auto w-full">
        <AnimatePresence mode="wait">
          {!user ? (
            <motion.div 
              key="hero"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20 text-center gap-8"
            >
              <div className="relative">
                <div className="w-48 h-48 bg-matcha-green rounded-full border-4 border-matcha-brown shadow-[10px_10px_0px_0px_rgba(52,59,27,1)] flex items-center justify-center overflow-hidden">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0], scale: [1, 1.05, 0.95, 1] }}
                    transition={{ duration: 4, repeat: Infinity }}
                    className="text-white flex flex-col items-center"
                  >
                    <Sparkles className="w-16 h-16 fill-white" />
                  </motion.div>
                </div>
                <motion.div 
                  className="absolute -top-4 -right-4 bg-matcha-vanilla border-2 border-matcha-brown p-2 rounded-xl shadow-[4px_4px_0px_0px_rgba(52,59,27,1)]"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Clock className="w-6 h-6" />
                </motion.div>
              </div>

              <div className="max-w-2xl">
                <h1 className="text-6xl md:text-7xl font-display font-black leading-tight">
                  Organiza tu día con <span className="text-matcha-blue">Matcha</span>
                </h1>
                <p className="mt-6 text-xl text-matcha-brown/70">
                  Una plataforma de calendario lúdica y simple para mantener tus tareas en orden. 
                  Inspirada en la calma del matcha, diseñada para tu productividad.
                </p>
              </div>

              <button 
                onClick={loginWithGoogle}
                className="matcha-button bg-matcha-blue text-white text-xl py-4 px-8"
              >
                Empezar ahora gratis
              </button>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 w-full">
                {[
                  { icon: CalendarIcon, title: "Calendario Visual", desc: "Mira tus tareas mes a mes con colores orgánicos." },
                  { icon: CheckCircle, title: "Seguimiento", desc: "Marca tareas completadas y mantente motivado." },
                  { icon: Clock, title: "Simplicidad", desc: "Sin distracciones, solo tú y tus objetivos." }
                ].map((feature, i) => (
                  <div key={i} className="matcha-card p-6 flex flex-col items-center text-center gap-3">
                    <div className="w-12 h-12 bg-matcha-green/20 rounded-full flex items-center justify-center text-matcha-brown border-2 border-matcha-brown/10">
                      <feature.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold">{feature.title}</h3>
                    <p className="text-sm text-matcha-brown/60">{feature.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-1 lg:grid-cols-4 gap-8"
            >
              {/* Sidebar / Stats */}
              <div className="lg:col-span-1 flex flex-col gap-6">
                <div className="matcha-card p-6 bg-matcha-vanilla/30">
                  <h3 className="text-xl mb-4">Progreso de hoy</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Tareas</span>
                    <span className="text-sm font-bold">
                      {tasks.filter(t => t.status === 'completed').length} / {tasks.length}
                    </span>
                  </div>
                  <div className="w-full h-4 bg-white border-2 border-matcha-brown rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-matcha-green"
                      initial={{ width: 0 }}
                      animate={{ width: `${tasks.length > 0 ? (tasks.filter(t => t.status === 'completed').length / tasks.length) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="mt-4 text-xs text-matcha-brown/60">
                    ¡Vas muy bien! Sigue así para completar todos tus objetivos.
                  </p>
                </div>

                <div className="matcha-card p-4 flex flex-col gap-2">
                  <h4 className="font-bold text-sm uppercase tracking-wider opacity-50 px-2">Próximas Tareas</h4>
                  <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto pr-2">
                    {tasks.filter(t => t.status === 'pending').slice(0, 5).map(task => (
                      <div 
                        key={task.id} 
                        onClick={() => handleEditTask(task)}
                        className="p-3 bg-white border-2 border-matcha-brown/10 rounded-xl hover:border-matcha-brown transition-all cursor-pointer text-sm"
                      >
                        {task.title}
                      </div>
                    ))}
                    {tasks.filter(t => t.status === 'pending').length === 0 && (
                      <p className="text-center py-4 text-sm text-matcha-brown/40 italic">No hay pendientes ✨</p>
                    )}
                  </div>
                </div>

                <button 
                  onClick={() => handleAddTask(new Date())}
                  className="matcha-button bg-matcha-green flex items-center justify-center gap-2"
                >
                  <Plus className="w-5 h-5" />
                  Nueva Tarea
                </button>
              </div>

              {/* Main Calendar */}
              <div className="lg:col-span-3">
                <CalendarView 
                  tasks={tasks}
                  onSelectDate={setSelectedDate}
                  onAddTask={handleAddTask}
                  onEditTask={handleEditTask}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {user && (
        <TaskDialog 
          isOpen={isDialogOpen}
          onClose={() => {
            setIsDialogOpen(false);
            setSelectedTask(null);
          }}
          userId={user.uid}
          selectedDate={selectedDate}
          taskToEdit={selectedTask}
        />
      )}

      <footer className="p-8 text-center text-matcha-brown/40 text-sm font-display">
        &copy; 2026 Matcha Tasks &bull; Hecho con calma y balance
      </footer>
    </div>
  );
}

