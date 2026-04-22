import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Brain, Network, ShieldAlert, Users, Activity, Sparkles } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { analytics } from '@/lib/graph-engine';

const features = [
  { icon: Brain, title: 'Multi-Symptom Prediction', desc: 'Weighted Jaccard scoring across the disease graph.' },
  { icon: Activity, title: 'Risk Scoring', desc: 'Combines pattern match, severity, base risk & age.' },
  { icon: ShieldAlert, title: 'Misdiagnosis Detection', desc: 'Flags conflicts between graph evidence and proposed diagnosis.' },
  { icon: Users, title: 'Similar Patient Search', desc: 'Graph similarity over historical patient symptom sets.' },
  { icon: Network, title: 'Live Graph Explorer', desc: 'Symptoms ↔ Diseases ↔ Patients ↔ Treatments.' },
  { icon: Sparkles, title: 'Explainable AI', desc: 'Every prediction comes with a reasoning trace.' },
];

export default function Home() {
  const a = analytics();
  return (
    <AppShell>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 pt-20 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/5 text-xs mono text-primary mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              GRAPH-BASED CLINICAL INTELLIGENCE · BDA PROJECT
            </div>
            <h1 className="font-display text-5xl md:text-6xl font-bold leading-[1.05] tracking-tight">
              Diagnose smarter with a <span className="text-gradient-primary">living medical graph</span>.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl leading-relaxed">
              GCIS treats symptoms, diseases, patients and treatments as a connected network.
              It predicts conditions, scores risk, surfaces similar cases, and explains every
              decision — turning clinical data into relationship intelligence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/predict" className="group inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-gradient-primary text-primary-foreground font-medium shadow-glow hover:scale-[1.02] transition-transform">
                Start Diagnosis <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link to="/graph" className="px-5 py-3 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-colors">
                Explore the Graph
              </Link>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: 'Symptoms', value: a.totals.symptoms },
              { label: 'Diseases', value: a.totals.diseases },
              { label: 'Patients', value: a.totals.patients },
              { label: 'Misdiagnosis Flag Rate', value: `${a.totals.misdiagnosisRate}%` },
            ].map(s => (
              <div key={s.label} className="glass rounded-xl p-5">
                <div className="text-3xl font-display font-bold text-primary">{s.value}</div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((f, i) => (
            <motion.div
              key={f.title}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-6 hover:border-primary/40 transition-colors group"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-display font-semibold text-lg">{f.title}</h3>
              <p className="text-sm text-muted-foreground mt-1.5">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Cypher-style snippet */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        <div className="glass rounded-xl p-8">
          <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3">Graph Query Model</div>
          <pre className="mono text-sm overflow-x-auto leading-relaxed text-foreground/90">
{`(:Patient)-[:HAS_SYMPTOM]->(:Symptom)<-[:PRESENTS_WITH]-(:Disease)
(:Disease)-[:TREATED_BY]->(:Treatment)
(:Patient)-[:DIAGNOSED_AS]->(:Disease)

// Top predicted diseases for a symptom set
MATCH (s:Symptom)<-[r:PRESENTS_WITH]-(d:Disease)
WHERE s.id IN $patientSymptoms
RETURN d, sum(r.weight) AS score ORDER BY score DESC LIMIT 5;`}
          </pre>
        </div>
      </section>
    </AppShell>
  );
}
