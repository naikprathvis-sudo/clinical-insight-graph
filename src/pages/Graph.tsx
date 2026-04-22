import { useMemo, useState } from 'react';
import AppShell from '@/components/AppShell';
import GraphView from '@/components/GraphView';
import { DISEASES } from '@/data/medical';
import { buildFullGraph } from '@/lib/graph-engine';

const LEGEND = [
  { type: 'symptom', color: '#22d3ee', label: 'Symptom' },
  { type: 'disease', color: '#f5b94a', label: 'Disease' },
  { type: 'patient', color: '#e879f9', label: 'Patient' },
  { type: 'treatment', color: '#34d399', label: 'Treatment' },
];

export default function Graph() {
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const data = useMemo(() => buildFullGraph(filter), [filter]);

  return (
    <AppShell>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-end justify-between flex-wrap gap-4 mb-6">
          <div>
            <h1 className="font-display text-4xl font-bold">Knowledge Graph Explorer</h1>
            <p className="text-muted-foreground mt-2">
              Live force-directed view of the clinical network. Drag nodes, zoom, hover.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs uppercase tracking-widest text-muted-foreground mr-1">Focus</label>
            <select
              value={filter || ''}
              onChange={e => setFilter(e.target.value || undefined)}
              className="bg-input border border-border rounded-md px-3 py-2 text-sm focus:outline-none focus:border-primary"
            >
              <option value="">All diseases</option>
              {DISEASES.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
        </div>

        <div className="flex gap-3 mb-4 flex-wrap">
          {LEGEND.map(l => (
            <div key={l.type} className="flex items-center gap-2 text-xs glass px-3 py-1.5 rounded-full">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color, boxShadow: `0 0 8px ${l.color}` }} />
              {l.label}
            </div>
          ))}
        </div>

        <GraphView data={data} height={600} />

        <div className="mt-6 grid sm:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-5">
            <div className="text-3xl font-display font-bold text-primary">{data.nodes.length}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Nodes</div>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="text-3xl font-display font-bold text-primary">{data.links.length}</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Relationships</div>
          </div>
          <div className="glass rounded-xl p-5">
            <div className="text-3xl font-display font-bold text-primary">4</div>
            <div className="text-xs uppercase tracking-widest text-muted-foreground mt-1">Node Types</div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
