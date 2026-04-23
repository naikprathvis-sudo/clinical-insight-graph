import neo4j from 'npm:neo4j-driver@5.28.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type SymptomInput = { id: string; name: string; severity: number };
type TreatmentInput = { id: string; name: string; type: string };
type DiseaseInput = { id: string; name: string; category: string; baseRisk: number; description: string };

type SyncPayload = {
  age: number;
  symptoms: SymptomInput[];
  prediction: {
    disease: DiseaseInput;
    score: number;
    riskScore: number;
    riskLevel: string;
    treatments: TreatmentInput[];
  };
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const isValidPayload = (body: unknown): body is SyncPayload => {
  const value = body as SyncPayload;
  return Boolean(
    value &&
    Number.isFinite(value.age) &&
    Array.isArray(value.symptoms) &&
    value.symptoms.length > 0 &&
    value.prediction?.disease?.id &&
    Number.isFinite(value.prediction.score) &&
    Number.isFinite(value.prediction.riskScore) &&
    Array.isArray(value.prediction.treatments)
  );
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const uri = Deno.env.get('NEO4J_URI');
  const username = Deno.env.get('NEO4J_USERNAME');
  const password = Deno.env.get('NEO4J_PASSWORD');

  if (!uri || !username || !password) {
    return json({ error: 'Neo4j credentials are not configured' }, 500);
  }

  if (!/^(neo4j|bolt)(\+s|\+ssc)?:\/\//.test(uri)) {
    return json({ error: 'NEO4J_URI must start with neo4j+s://, neo4j://, bolt+s://, or bolt://' }, 500);
  }

  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  if (!isValidPayload(payload)) {
    return json({ error: 'Invalid graph payload' }, 400);
  }

  const patientId = `app_${crypto.randomUUID()}`;
  const createdAt = new Date().toISOString();
  const driver = neo4j.driver(uri, neo4j.auth.basic(username, password));
  const session = driver.session({ database: 'neo4j' });

  try {
    await session.executeWrite((tx) =>
      tx.run(
        `
        MERGE (d:Disease {id: $disease.id})
        SET d.name = $disease.name,
            d.category = $disease.category,
            d.baseRisk = $disease.baseRisk,
            d.description = $disease.description

        CREATE (p:Patient {
          id: $patientId,
          name: $patientName,
          age: $age,
          source: 'GCIS App',
          createdAt: datetime($createdAt)
        })

        MERGE (p)-[dx:DIAGNOSED_AS]->(d)
        SET dx.confidence = $score,
            dx.riskScore = $riskScore,
            dx.riskLevel = $riskLevel,
            dx.createdAt = datetime($createdAt)

        WITH p, d
        UNWIND $symptoms AS symptom
          MERGE (s:Symptom {id: symptom.id})
          SET s.name = symptom.name,
              s.severity = symptom.severity
          MERGE (p)-[:HAS_SYMPTOM]->(s)
          MERGE (s)-[:EVIDENCE_FOR]->(d)

        WITH d
        UNWIND $treatments AS treatment
          MERGE (t:Treatment {id: treatment.id})
          SET t.name = treatment.name,
              t.type = treatment.type
          MERGE (d)-[:TREATED_BY]->(t)
        `,
        {
          patientId,
          patientName: `GCIS Patient ${patientId.slice(-6)}`,
          age: payload.age,
          createdAt,
          disease: payload.prediction.disease,
          score: payload.prediction.score,
          riskScore: payload.prediction.riskScore,
          riskLevel: payload.prediction.riskLevel,
          symptoms: payload.symptoms,
          treatments: payload.prediction.treatments,
        }
      )
    );

    return json({
      patientId,
      message: 'Graph created in Neo4j',
      cypherToView: `MATCH (p:Patient {id: '${patientId}'})-[r]-(n) RETURN p, r, n`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Neo4j error';
    console.error('Neo4j sync failed:', message);
    return json({ error: `Neo4j sync failed: ${message}` }, 500);
  } finally {
    await session.close();
    await driver.close();
  }
});