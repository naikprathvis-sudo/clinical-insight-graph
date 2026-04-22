import AppShell from '@/components/AppShell';
import { analytics } from '@/lib/graph-engine';
import {
  Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';

const OUTCOME_COLORS: Record<string, string> = {
  recovered: 'hsl(152 70% 48%)',
  ongoing: 'hsl(38 95% 60%)',
  misdiagnosed: 'hsl(320 90% 62%)',
};

export default function Analytics() {
  const a = analytics();
  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <h1 className="font-display text-4xl font-bold">Clinical Analytics</h1>
        <p className="text-muted-foreground mt-2">Aggregations across the patient–disease–symptom graph.</p>

        <div className="grid sm:grid-cols-4 gap-4 mt-8">
          {[
            { label: 'Patients', value: a.totals.patients },
            { label: 'Diseases tracked', value: a.totals.diseases },
            { label: 'Symptoms in graph', value: a.totals.symptoms },
            { label: 'Misdiagnosis rate', value: `${a.totals.misdiagnosisRate}%`, accent: true },
          ].map(s => (
            <div key={s.label} className="glass rounded-xl p-5">
              <div className={`text-3xl font-display font-bold ${s.accent ? 'text-accent' : 'text-primary'}`}>{s.value}</div>
              <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <div className="glass rounded-xl p-6">
            <h3 className="font-display font-semibold mb-4">Diagnoses by Disease</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={a.diseaseCounts}>
                <XAxis dataKey="name" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} angle={-20} textAnchor="end" height={60} />
                <YAxis tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                  cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
                />
                <Bar dataKey="count" fill="hsl(var(--primary))" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass rounded-xl p-6">
            <h3 className="font-display font-semibold mb-4">Outcomes Distribution</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={a.outcomes} dataKey="value" nameKey="name" innerRadius={60} outerRadius={100} paddingAngle={4}>
                  {a.outcomes.map(o => (
                    <Cell key={o.name} fill={OUTCOME_COLORS[o.name]} stroke="hsl(var(--background))" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-2">
              {a.outcomes.map(o => (
                <div key={o.name} className="flex items-center gap-2 text-xs">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: OUTCOME_COLORS[o.name] }} />
                  <span className="capitalize">{o.name}</span>
                  <span className="mono text-muted-foreground">{o.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-6 mt-6">
          <h3 className="font-display font-semibold mb-4">Most Reported Symptoms</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={a.topSymptoms} layout="vertical" margin={{ left: 30 }}>
              <XAxis type="number" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} />
              <YAxis dataKey="name" type="category" tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 11 }} width={140} />
              <Tooltip
                contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                cursor={{ fill: 'hsl(var(--primary) / 0.05)' }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </AppShell>
  );
}
