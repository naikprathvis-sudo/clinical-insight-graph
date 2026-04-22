import { motion } from 'framer-motion';

export function RiskGauge({ score, level }: { score: number; level: string }) {
  const color =
    level === 'Critical' ? 'hsl(var(--accent))' :
    level === 'High' ? 'hsl(var(--destructive))' :
    level === 'Moderate' ? 'hsl(var(--warning))' :
    'hsl(var(--success))';
  const circumference = 2 * Math.PI * 52;
  const offset = circumference - (score / 100) * circumference;

  return (
    <div className="relative w-40 h-40 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r="52" stroke="hsl(var(--border))" strokeWidth="8" fill="none" />
        <motion.circle
          cx="60" cy="60" r="52" stroke={color} strokeWidth="8" fill="none"
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut' }}
          style={{ filter: `drop-shadow(0 0 8px ${color})` }}
        />
      </svg>
      <div className="text-center">
        <div className="font-display font-bold text-4xl" style={{ color }}>{score}</div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
          {level} Risk
        </div>
      </div>
    </div>
  );
}
