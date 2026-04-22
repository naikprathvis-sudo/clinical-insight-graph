import { motion } from 'framer-motion';
import { Activity, Brain, Network, ShieldAlert } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const items = [
  { to: '/', label: 'Command', icon: Activity },
  { to: '/predict', label: 'Diagnose', icon: Brain },
  { to: '/graph', label: 'Graph', icon: Network },
  { to: '/analytics', label: 'Analytics', icon: ShieldAlert },
];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const loc = useLocation();
  return (
    <div className="min-h-screen flex flex-col">
      <header className="glass sticky top-0 z-40 border-b">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -20, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }}
              className="w-9 h-9 rounded-lg bg-gradient-primary shadow-glow flex items-center justify-center"
            >
              <Network className="w-5 h-5 text-primary-foreground" />
            </motion.div>
            <div>
              <div className="font-display font-bold tracking-tight text-lg leading-none">GCIS</div>
              <div className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
                Graph Clinical Intelligence
              </div>
            </div>
          </Link>
          <nav className="flex items-center gap-1">
            {items.map(({ to, label, icon: Icon }) => {
              const active = loc.pathname === to;
              return (
                <Link
                  key={to}
                  to={to}
                  className={`relative px-4 py-2 rounded-md text-sm flex items-center gap-2 transition-colors ${
                    active ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-md bg-primary/10 border border-primary/30 -z-10"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t border-border/50 py-6 text-center text-xs text-muted-foreground mono">
        GCIS v1.0 — Big Data Analytics · Graph Intelligence over Medical Knowledge
      </footer>
    </div>
  );
}
