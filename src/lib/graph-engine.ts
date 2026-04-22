// Graph intelligence engine — prediction, risk, similarity, explanation
import { DISEASES, PATIENTS, SYMPTOMS, Disease, Patient, diseaseById, symptomById } from '@/data/medical';

export type Prediction = {
  disease: Disease;
  score: number;        // 0..1 confidence
  matched: { id: string; weight: number }[];
  missing: { id: string; weight: number }[];
  riskScore: number;    // 0..100
  riskLevel: 'Low' | 'Moderate' | 'High' | 'Critical';
  explanation: string[];
};

export function predictDiseases(patientSymptoms: string[], age = 35): Prediction[] {
  if (patientSymptoms.length === 0) return [];
  const symSet = new Set(patientSymptoms);

  const results = DISEASES.map(disease => {
    const matched = disease.symptoms.filter(s => symSet.has(s.id));
    const missing = disease.symptoms.filter(s => !symSet.has(s.id));
    const totalWeight = disease.symptoms.reduce((a, s) => a + s.weight, 0);
    const matchedWeight = matched.reduce((a, s) => a + s.weight, 0);

    // Weighted Jaccard-like score
    const score = totalWeight > 0 ? matchedWeight / totalWeight : 0;

    // Risk: combine match score, disease base risk, symptom severity, age factor
    const severity = matched.reduce((a, s) => a + symptomById(s.id).severity, 0) / Math.max(matched.length, 1);
    const ageFactor = age > 60 ? 1.2 : age > 40 ? 1.05 : 0.9;
    const riskRaw = (score * 0.55 + disease.baseRisk * 0.25 + severity * 0.2) * ageFactor;
    const riskScore = Math.min(100, Math.round(riskRaw * 100));

    const riskLevel: Prediction['riskLevel'] =
      riskScore >= 80 ? 'Critical' : riskScore >= 60 ? 'High' : riskScore >= 35 ? 'Moderate' : 'Low';

    const explanation = [
      `Matched ${matched.length} of ${disease.symptoms.length} key symptoms (${Math.round(score * 100)}% pattern match).`,
      `Top contributing symptoms: ${matched.slice(0, 3).map(m => `${symptomById(m.id).name} (w=${m.weight.toFixed(2)})`).join(', ') || 'none'}.`,
      `Disease base risk = ${disease.baseRisk.toFixed(2)}; mean severity of matched = ${severity.toFixed(2)}; age factor = ${ageFactor.toFixed(2)}.`,
      missing.length
        ? `Absent expected symptoms: ${missing.slice(0, 3).map(m => symptomById(m.id).name).join(', ')}.`
        : `All expected symptoms present.`,
    ];

    return { disease, score, matched, missing, riskScore, riskLevel, explanation };
  })
    .filter(r => r.score > 0)
    .sort((a, b) => b.score - a.score);

  return results.slice(0, 5);
}

// Graph similarity: Jaccard on symptom sets
export function similarPatients(symptoms: string[], topK = 5) {
  const a = new Set(symptoms);
  return PATIENTS.map(p => {
    const b = new Set(p.symptoms);
    const intersection = [...a].filter(x => b.has(x)).length;
    const union = new Set([...a, ...b]).size;
    const jaccard = union === 0 ? 0 : intersection / union;
    return { patient: p, similarity: jaccard, shared: intersection };
  })
    .filter(r => r.similarity > 0)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

// Misdiagnosis detection: top prediction differs from doctor's diagnosis
export function detectMisdiagnosis(symptoms: string[], proposedDiseaseId: string) {
  const preds = predictDiseases(symptoms);
  if (preds.length === 0) return null;
  const top = preds[0];
  const proposed = preds.find(p => p.disease.id === proposedDiseaseId);
  if (!proposed) {
    return {
      conflict: true,
      message: `Proposed diagnosis "${diseaseById(proposedDiseaseId).name}" has no matching symptoms in the graph.`,
      top,
      proposed: null,
    };
  }
  const gap = top.score - proposed.score;
  return {
    conflict: top.disease.id !== proposedDiseaseId && gap > 0.15,
    gap,
    top,
    proposed,
    message:
      top.disease.id === proposedDiseaseId
        ? 'Diagnosis aligns with graph evidence.'
        : `Graph suggests ${top.disease.name} (${Math.round(top.score * 100)}%) over ${proposed.disease.name} (${Math.round(proposed.score * 100)}%).`,
  };
}

// Co-occurrence: how often two symptoms appear together across patients
export function symptomCoOccurrence() {
  const matrix: Record<string, Record<string, number>> = {};
  SYMPTOMS.forEach(s => (matrix[s.id] = {}));
  PATIENTS.forEach(p => {
    for (let i = 0; i < p.symptoms.length; i++) {
      for (let j = i + 1; j < p.symptoms.length; j++) {
        const a = p.symptoms[i], b = p.symptoms[j];
        matrix[a][b] = (matrix[a][b] || 0) + 1;
        matrix[b][a] = (matrix[b][a] || 0) + 1;
      }
    }
  });
  return matrix;
}

// Build graph data for visualization
export type GraphNode = {
  id: string;
  label: string;
  type: 'symptom' | 'disease' | 'patient' | 'treatment';
  val?: number;
};
export type GraphLink = { source: string; target: string; type: string; weight?: number };

export function buildFullGraph(filterDiseaseId?: string) {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const seen = new Set<string>();
  const add = (n: GraphNode) => { if (!seen.has(n.id)) { seen.add(n.id); nodes.push(n); } };

  const diseases = filterDiseaseId ? DISEASES.filter(d => d.id === filterDiseaseId) : DISEASES;
  diseases.forEach(d => {
    add({ id: d.id, label: d.name, type: 'disease', val: 12 });
    d.symptoms.forEach(s => {
      const sym = symptomById(s.id);
      add({ id: sym.id, label: sym.name, type: 'symptom', val: 6 });
      links.push({ source: sym.id, target: d.id, type: 'PRESENTS_WITH', weight: s.weight });
    });
    d.treatments.forEach(tid => {
      add({ id: tid, label: tid.replace('t_', '').replace('_', ' '), type: 'treatment', val: 5 });
      links.push({ source: d.id, target: tid, type: 'TREATED_BY' });
    });
  });

  PATIENTS.forEach(p => {
    if (filterDiseaseId && p.diagnosed !== filterDiseaseId) return;
    add({ id: p.id, label: p.name, type: 'patient', val: 7 });
    links.push({ source: p.id, target: p.diagnosed, type: 'DIAGNOSED_AS' });
    p.symptoms.forEach(sid => {
      add({ id: sid, label: symptomById(sid).name, type: 'symptom', val: 6 });
      links.push({ source: p.id, target: sid, type: 'HAS_SYMPTOM' });
    });
  });

  return { nodes, links };
}

// Aggregate analytics
export function analytics() {
  const byDisease: Record<string, number> = {};
  const byOutcome: Record<string, number> = { recovered: 0, ongoing: 0, misdiagnosed: 0 };
  const bySymptom: Record<string, number> = {};
  PATIENTS.forEach(p => {
    byDisease[p.diagnosed] = (byDisease[p.diagnosed] || 0) + 1;
    byOutcome[p.outcome] += 1;
    p.symptoms.forEach(s => (bySymptom[s] = (bySymptom[s] || 0) + 1));
  });
  return {
    diseaseCounts: Object.entries(byDisease).map(([id, count]) => ({
      name: diseaseById(id).name, count, category: diseaseById(id).category,
    })),
    outcomes: Object.entries(byOutcome).map(([name, value]) => ({ name, value })),
    topSymptoms: Object.entries(bySymptom)
      .map(([id, count]) => ({ name: symptomById(id).name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8),
    totals: {
      patients: PATIENTS.length,
      diseases: DISEASES.length,
      symptoms: SYMPTOMS.length,
      misdiagnosisRate: Math.round((byOutcome.misdiagnosed / PATIENTS.length) * 100),
    },
  };
}
