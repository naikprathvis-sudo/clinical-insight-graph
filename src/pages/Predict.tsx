import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, CheckCircle2, ChevronRight, DatabaseZap, Pill, Sparkles, X } from 'lucide-react';
import AppShell from '@/components/AppShell';
import { RiskGauge } from '@/components/RiskGauge';
import { DISEASES, SYMPTOMS, treatmentById, symptomById } from '@/data/medical';
import { detectMisdiagnosis, predictDiseases, similarPatients } from '@/lib/graph-engine';
import { supabase } from '@/integrations/supabase/client';

const SAMPLES = [
  { label: 'COVID-like', ids: ['s_fever', 's_cough', 's_loss_smell', 's_fatigue'] },
  { label: 'Cardiac', ids: ['s_chest_pain', 's_shortness_breath', 's_palpitations'] },
  { label: 'Diabetes', ids: ['s_thirst', 's_freq_urine', 's_weight_loss'] },
  { label: 'Migraine', ids: ['s_headache', 's_nausea', 's_blurred_vision'] },
];

export default function Predict() {
  const [selected, setSelected] = useState<string[]>([]);
  const [age, setAge] = useState(45);
  const [proposed, setProposed] = useState<string>('');
  const [neo4jStatus, setNeo4jStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [neo4jMessage, setNeo4jMessage] = useState('');

  const predictions = useMemo(() => predictDiseases(selected, age), [selected, age]);
  const similar = useMemo(() => similarPatients(selected, 5), [selected]);
  const misdx = useMemo(
    () => (proposed && selected.length ? detectMisdiagnosis(selected, proposed) : null),
    [proposed, selected]
  );

  const toggle = (id: string) =>
    setSelected(s => (s.includes(id) ? s.filter(x => x !== id) : [...s, id]));

  const syncToNeo4j = async () => {
    if (!predictions[0]) return;
    setNeo4jStatus('syncing');
    setNeo4jMessage('');

    const top = predictions[0];
    const { data, error } = await supabase.functions.invoke('sync-neo4j', {
      body: {
        age,
        symptoms: selected.map(id => symptomById(id)),
        prediction: {
          disease: top.disease,
          score: top.score,
          riskScore: top.riskScore,
          riskLevel: top.riskLevel,
          treatments: top.disease.treatments.map(treatmentById),
        },
      },
    });

    if (error) {
      setNeo4jStatus('error');
      setNeo4jMessage(error.message);
      return;
    }

    setNeo4jStatus('success');
    setNeo4jMessage(data?.cypherToView || 'Graph created in Neo4j Browser.');
  };

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold">Patient Intake & Diagnosis</h1>
          <p className="text-muted-foreground mt-2">
            Select observed symptoms — the graph engine ranks likely diseases, scores risk, finds similar patients, and explains its reasoning.
          </p>
        </div>

        <div className="grid lg:grid-cols-[1fr_1.4fr] gap-6">
          {/* Intake */}
          <div className="space-y-6">
            <div className="glass rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg">Patient Profile</h2>
                <button
                  onClick={() => { setSelected([]); setProposed(''); }}
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Reset
                </button>
              </div>
              <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Age: {age}</label>
              <input
                type="range" min={18} max={90} value={age}
                onChange={e => setAge(Number(e.target.value))}
                className="w-full accent-primary"
              />

              <div className="mt-5">
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Quick scenarios</div>
                <div className="flex flex-wrap gap-2">
                  {SAMPLES.map(s => (
                    <button
                      key={s.label}
                      onClick={() => setSelected(s.ids)}
                      className="text-xs px-3 py-1.5 rounded-full border border-border hover:border-primary/50 hover:bg-primary/5 transition"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="glass rounded-xl p-6">
              <h2 className="font-display font-semibold text-lg mb-4">Symptoms</h2>
              <div className="flex flex-wrap gap-2 max-h-[340px] overflow-y-auto pr-1">
                {SYMPTOMS.map(s => {
                  const on = selected.includes(s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggle(s.id)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition ${
                        on
                          ? 'bg-primary/15 border-primary text-primary shadow-glow'
                          : 'border-border hover:border-primary/40 text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {s.name}
                    </button>
                  );
                })}
              </div>
              {selected.length > 0 && (
                <div className="mt-4 pt-4 border-t border-border/60">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Selected ({selected.length})</div>
                  <div className="flex flex-wrap gap-1.5">
                    {selected.map(id => (
                      <span key={id} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-primary/10 text-primary">
                        {symptomById(id).name}
                        <button onClick={() => toggle(id)}><X className="w-3 h-3" /></button>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="glass rounded-xl p-6">
              <h2 className="font-display font-semibold text-lg mb-3">Misdiagnosis Check</h2>
              <p className="text-xs text-muted-foreground mb-3">Compare a proposed diagnosis against graph evidence.</p>
              <select
                value={proposed}
                onChange={e => setProposed(e.target.value)}
                className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
              >
                <option value="">— Select a proposed diagnosis —</option>
                {DISEASES.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
              <AnimatePresence>
                {misdx && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className={`mt-4 rounded-lg p-4 border ${
                      misdx.conflict
                        ? 'bg-accent/10 border-accent/40 text-foreground shadow-risk'
                        : 'bg-success/10 border-success/40'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {misdx.conflict
                        ? <AlertTriangle className="w-4 h-4 text-accent mt-0.5" />
                        : <CheckCircle2 className="w-4 h-4 text-success mt-0.5" />}
                      <div className="text-sm">{misdx.message}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Predictions */}
          <div className="space-y-6">
            {selected.length === 0 ? (
              <div className="glass rounded-xl p-12 text-center">
                <Sparkles className="w-10 h-10 text-primary mx-auto mb-3 opacity-60" />
                <h3 className="font-display text-xl">Awaiting symptoms</h3>
                <p className="text-sm text-muted-foreground mt-1">Pick symptoms or use a quick scenario to run the graph engine.</p>
              </div>
            ) : (
              <>
                {/* Top prediction card */}
                {predictions[0] && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="glass rounded-xl p-6 border-primary/30"
                  >
                    <div className="flex items-start justify-between gap-6 flex-wrap">
                      <div className="flex-1 min-w-[220px]">
                        <div className="text-xs uppercase tracking-widest text-primary mono">Top Prediction</div>
                        <h2 className="font-display text-3xl font-bold mt-1">{predictions[0].disease.name}</h2>
                        <div className="text-sm text-muted-foreground mt-1">{predictions[0].disease.category} · {predictions[0].disease.description}</div>
                        <div className="mt-4 inline-flex items-center gap-2 text-sm px-3 py-1 rounded-full bg-primary/10 text-primary mono">
                          {Math.round(predictions[0].score * 100)}% pattern match
                        </div>
                      </div>
                      <RiskGauge score={predictions[0].riskScore} level={predictions[0].riskLevel} />
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4 mt-6">
                      <div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Recommended Treatments</div>
                        <div className="space-y-1.5">
                          {predictions[0].disease.treatments.map(tid => (
                            <div key={tid} className="flex items-center gap-2 text-sm">
                              <Pill className="w-3.5 h-3.5 text-primary" />
                              {treatmentById(tid).name}
                              <span className="ml-auto text-[10px] text-muted-foreground mono">{treatmentById(tid).type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs uppercase tracking-widest text-muted-foreground mb-2">Why? (Explanation)</div>
                        <ul className="space-y-1.5 text-sm text-muted-foreground">
                          {predictions[0].explanation.map((e, i) => (
                            <li key={i} className="flex gap-2"><ChevronRight className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />{e}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-border/60">
                      <div className="flex items-center justify-between gap-3 flex-wrap">
                        <div>
                          <div className="text-xs uppercase tracking-widest text-primary mono">Neo4j Sync</div>
                          <p className="text-sm text-muted-foreground mt-1">Create this exact patient → symptom → diagnosis graph in Neo4j Browser.</p>
                        </div>
                        <button
                          onClick={syncToNeo4j}
                          disabled={neo4jStatus === 'syncing'}
                          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <DatabaseZap className="h-4 w-4" />
                          {neo4jStatus === 'syncing' ? 'Creating...' : 'Create in Neo4j'}
                        </button>
                      </div>
                      {neo4jMessage && (
                        <div className={`mt-3 rounded-lg border p-3 text-xs mono ${neo4jStatus === 'success' ? 'border-success/40 bg-success/10 text-success' : 'border-destructive/40 bg-destructive/10 text-destructive'}`}>
                          {neo4jStatus === 'success' ? 'Neo4j view query: ' : ''}{neo4jMessage}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Differential ranking */}
                <div className="glass rounded-xl p-6">
                  <h3 className="font-display font-semibold mb-4">Differential Ranking</h3>
                  <div className="space-y-2">
                    {predictions.map((p, i) => (
                      <div key={p.disease.id} className="flex items-center gap-4">
                        <div className="text-xs mono text-muted-foreground w-6">#{i + 1}</div>
                        <div className="flex-1">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="font-medium">{p.disease.name}</span>
                            <span className="mono text-muted-foreground">{Math.round(p.score * 100)}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-secondary overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }} animate={{ width: `${p.score * 100}%` }}
                              transition={{ duration: 0.6, delay: i * 0.05 }}
                              className={`h-full ${i === 0 ? 'bg-gradient-primary' : 'bg-primary/40'}`}
                            />
                          </div>
                        </div>
                        <div className={`text-xs px-2 py-0.5 rounded mono ${
                          p.riskLevel === 'Critical' ? 'bg-accent/15 text-accent' :
                          p.riskLevel === 'High' ? 'bg-destructive/15 text-destructive' :
                          p.riskLevel === 'Moderate' ? 'bg-warning/15 text-warning' :
                          'bg-success/15 text-success'
                        }`}>
                          {p.riskLevel}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Similar Patients */}
                <div className="glass rounded-xl p-6">
                  <h3 className="font-display font-semibold mb-1">Similar Patients</h3>
                  <p className="text-xs text-muted-foreground mb-4 mono">Jaccard similarity over symptom sets</p>
                  {similar.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No similar patients found.</p>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {similar.map(s => (
                        <div key={s.patient.id} className="rounded-lg border border-border/60 p-3 hover:border-primary/40 transition">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-medium">{s.patient.name}</div>
                              <div className="text-xs text-muted-foreground mono">{s.patient.id} · {s.patient.age}/{s.patient.sex}</div>
                            </div>
                            <div className="text-xs mono text-primary">{Math.round(s.similarity * 100)}%</div>
                          </div>
                          <div className="text-xs text-muted-foreground mt-2">
                            Diagnosed: <span className="text-foreground">{DISEASES.find(d => d.id === s.patient.diagnosed)?.name}</span> · <span className={
                              s.patient.outcome === 'recovered' ? 'text-success' :
                              s.patient.outcome === 'misdiagnosed' ? 'text-accent' : 'text-warning'
                            }>{s.patient.outcome}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
