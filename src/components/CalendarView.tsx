import { useState } from 'react';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { cn } from '../lib/utils';
import { Task } from '../lib/tasks';
import { Badge } from './ui/badge';

interface CalendarViewProps {
  tasks: Task[];
  onSelectDate: (date: Date) => void;
  onAddTask: (date: Date) => void;
  onEditTask: (task: Task) => void;
}

export function CalendarView({ tasks, onSelectDate, onAddTask, onEditTask }: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

  const getDayTasks = (date: Date) => {
    return tasks.filter(task => isSameDay(new Date(task.date), date));
  };

  return (
    <div className="matcha-card p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-display capitalize">
          {format(currentMonth, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="matcha-button p-2 bg-white">
            <ChevronLeft className="w-5 h-4" />
          </button>
          <button onClick={() => setCurrentMonth(new Date())} className="matcha-button text-sm bg-white">
            Hoy
          </button>
          <button onClick={nextMonth} className="matcha-button p-2 bg-white">
            <ChevronRight className="w-5 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
          <div key={day} className="text-center font-display font-bold text-matcha-brown/50 text-sm uppercase py-2">
            {day}
          </div>
        ))}
        
        {calendarDays.map((day, idx) => {
          const dayTasks = getDayTasks(day);
          const isToday = isSameDay(day, new Date());
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentMonth = isSameMonth(day, monthStart);

          return (
            <div
              id={`day-${format(day, 'yyyy-MM-dd')}`}
              key={day.toISOString()}
              onClick={() => {
                setSelectedDate(day);
                onSelectDate(day);
              }}
              className={cn(
                "calendar-day flex flex-col items-start gap-1 min-h-[100px]",
                !isCurrentMonth && "opacity-30",
                isSelected && "selected",
                isToday && "today"
              )}
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-sm font-bold">{format(day, 'd')}</span>
                {isCurrentMonth && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      onAddTask(day);
                    }}
                    className="p-1 hover:bg-matcha-green/20 rounded-full text-matcha-brown opacity-0 hover:opacity-100 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                )}
              </div>
              
              <div className="flex flex-col gap-1 w-full mt-1">
                {dayTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditTask(task);
                    }}
                    className={cn(
                      "text-[10px] p-1 rounded border-l-2 truncate cursor-pointer hover:brightness-95",
                      task.status === 'completed' ? "opacity-50 line-through" : ""
                    )}
                    style={{ 
                      backgroundColor: task.color + '20', 
                      borderColor: task.color || '#3971b8',
                      color: task.color || '#3971b8'
                    }}
                  >
                    {task.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
