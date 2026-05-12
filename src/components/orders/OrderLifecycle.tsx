import { motion } from 'motion/react';
import { ImportStage } from '../../types';
import { STAGE_LABELS } from '../../constants';
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';

interface LifecycleStateProps {
  currentStage: ImportStage;
}

const stages = Object.values(ImportStage);

export function OrderLifecycle({ currentStage }: LifecycleStateProps) {
  const currentIndex = stages.indexOf(currentStage);

  return (
    <div className="w-full pt-4 pb-2">
      <div className="flex gap-1.5 mb-6">
        {stages.map((_, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          
          return (
            <div 
              key={index} 
              className={cn(
                "flex-1 h-1 rounded-sm transition-all duration-500",
                isCompleted ? "bg-blue-600" : isCurrent ? "bg-blue-600 shadow-[0_0_8px_rgba(59,130,246,0.5)]" : "bg-slate-100"
              )} 
            />
          );
        })}
      </div>
      
      <div className="grid grid-cols-13 text-[9px] font-bold text-slate-400 uppercase tracking-tighter text-center">
        {stages.map((stage, index) => {
          const isCurrent = index === currentIndex;
          const isExtreme = index === 0 || index === stages.length - 1;

          return (
            <div 
              key={stage} 
              className={cn(
                "px-0.5 transition-colors",
                isCurrent ? "text-blue-600" : isExtreme ? "text-slate-500" : ""
              )}
            >
              {STAGE_LABELS[stage]}
            </div>
          );
        })}
      </div>
    </div>
  );
}
