import { useEffect, useRef } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { GraphLink, GraphNode } from '@/lib/graph-engine';

const COLORS = {
  symptom: '#22d3ee',     // cyan
  disease: '#f5b94a',     // amber/warning
  patient: '#e879f9',     // magenta
  treatment: '#34d399',   // green
};

export default function GraphView({
  data,
  height = 520,
  highlight,
}: {
  data: { nodes: GraphNode[]; links: GraphLink[] };
  height?: number;
  highlight?: Set<string>;
}) {
  const ref = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const t = setTimeout(() => ref.current?.zoomToFit?.(400, 60), 300);
    return () => clearTimeout(t);
  }, [data]);

  return (
    <div ref={containerRef} className="w-full rounded-xl overflow-hidden border border-border/60 bg-background/50 grid-bg">
      <ForceGraph2D
        ref={ref}
        graphData={data}
        height={height}
        width={containerRef.current?.clientWidth || 800}
        backgroundColor="rgba(0,0,0,0)"
        nodeRelSize={5}
        linkColor={() => 'rgba(148, 163, 184, 0.3)'}
        linkWidth={(l: any) => (l.weight ? l.weight * 1.5 : 0.6)}
        linkDirectionalParticles={2}
        linkDirectionalParticleWidth={1.2}
        linkDirectionalParticleColor={() => 'hsl(174, 84%, 60%)'}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          const label = node.label as string;
          const color = COLORS[node.type as keyof typeof COLORS] || '#fff';
          const isHi = highlight?.has(node.id);
          const r = (node.val || 6) * (isHi ? 1.6 : 1);
          ctx.beginPath();
          ctx.arc(node.x, node.y, r, 0, 2 * Math.PI);
          ctx.fillStyle = color;
          ctx.shadowBlur = isHi ? 20 : 8;
          ctx.shadowColor = color;
          ctx.fill();
          ctx.shadowBlur = 0;

          const fs = 11 / globalScale;
          ctx.font = `${fs}px Inter, sans-serif`;
          ctx.fillStyle = isHi ? '#fff' : 'rgba(226, 232, 240, 0.85)';
          ctx.textAlign = 'center';
          ctx.fillText(label, node.x, node.y + r + fs + 1);
        }}
      />
    </div>
  );
}
