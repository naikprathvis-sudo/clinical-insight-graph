// Seeded medical knowledge graph for GCIS
// Nodes: Symptoms, Diseases, Patients, Treatments
// Edges: PRESENTS_WITH, TREATED_BY, DIAGNOSED_AS, CO_OCCURS

export type Symptom = { id: string; name: string; severity: number };
export type Disease = {
  id: string;
  name: string;
  category: string;
  baseRisk: number; // 0..1
  symptoms: { id: string; weight: number }[]; // weight 0..1
  treatments: string[];
  description: string;
};
export type Treatment = { id: string; name: string; type: string };
export type Patient = {
  id: string;
  name: string;
  age: number;
  sex: 'M' | 'F';
  symptoms: string[]; // symptom ids
  diagnosed: string;  // disease id
  outcome: 'recovered' | 'ongoing' | 'misdiagnosed';
};

export const SYMPTOMS: Symptom[] = [
  { id: 's_fever', name: 'Fever', severity: 0.6 },
  { id: 's_cough', name: 'Cough', severity: 0.5 },
  { id: 's_fatigue', name: 'Fatigue', severity: 0.4 },
  { id: 's_headache', name: 'Headache', severity: 0.4 },
  { id: 's_chest_pain', name: 'Chest Pain', severity: 0.9 },
  { id: 's_shortness_breath', name: 'Shortness of Breath', severity: 0.85 },
  { id: 's_nausea', name: 'Nausea', severity: 0.4 },
  { id: 's_vomiting', name: 'Vomiting', severity: 0.5 },
  { id: 's_diarrhea', name: 'Diarrhea', severity: 0.5 },
  { id: 's_sore_throat', name: 'Sore Throat', severity: 0.4 },
  { id: 's_runny_nose', name: 'Runny Nose', severity: 0.3 },
  { id: 's_muscle_ache', name: 'Muscle Aches', severity: 0.4 },
  { id: 's_loss_smell', name: 'Loss of Smell', severity: 0.7 },
  { id: 's_dizziness', name: 'Dizziness', severity: 0.5 },
  { id: 's_blurred_vision', name: 'Blurred Vision', severity: 0.7 },
  { id: 's_high_bp', name: 'High Blood Pressure', severity: 0.8 },
  { id: 's_thirst', name: 'Excessive Thirst', severity: 0.6 },
  { id: 's_freq_urine', name: 'Frequent Urination', severity: 0.5 },
  { id: 's_weight_loss', name: 'Unexplained Weight Loss', severity: 0.7 },
  { id: 's_joint_pain', name: 'Joint Pain', severity: 0.5 },
  { id: 's_rash', name: 'Skin Rash', severity: 0.5 },
  { id: 's_palpitations', name: 'Heart Palpitations', severity: 0.8 },
];

export const TREATMENTS: Treatment[] = [
  { id: 't_paracetamol', name: 'Paracetamol', type: 'Medication' },
  { id: 't_antiviral', name: 'Antiviral Therapy', type: 'Medication' },
  { id: 't_antibiotic', name: 'Antibiotics', type: 'Medication' },
  { id: 't_insulin', name: 'Insulin Therapy', type: 'Medication' },
  { id: 't_metformin', name: 'Metformin', type: 'Medication' },
  { id: 't_statins', name: 'Statins', type: 'Medication' },
  { id: 't_betablocker', name: 'Beta Blockers', type: 'Medication' },
  { id: 't_ors', name: 'Oral Rehydration', type: 'Supportive' },
  { id: 't_oxygen', name: 'Oxygen Therapy', type: 'Procedure' },
  { id: 't_isolation', name: 'Isolation & Rest', type: 'Lifestyle' },
  { id: 't_diet', name: 'Diet Plan', type: 'Lifestyle' },
  { id: 't_ecg', name: 'ECG Monitoring', type: 'Diagnostic' },
];

export const DISEASES: Disease[] = [
  {
    id: 'd_covid',
    name: 'COVID-19',
    category: 'Infectious',
    baseRisk: 0.7,
    description: 'Viral respiratory infection caused by SARS-CoV-2.',
    symptoms: [
      { id: 's_fever', weight: 0.85 },
      { id: 's_cough', weight: 0.8 },
      { id: 's_fatigue', weight: 0.7 },
      { id: 's_loss_smell', weight: 0.9 },
      { id: 's_shortness_breath', weight: 0.75 },
      { id: 's_muscle_ache', weight: 0.5 },
    ],
    treatments: ['t_antiviral', 't_isolation', 't_paracetamol', 't_oxygen'],
  },
  {
    id: 'd_flu',
    name: 'Influenza',
    category: 'Infectious',
    baseRisk: 0.5,
    description: 'Seasonal viral illness affecting the respiratory system.',
    symptoms: [
      { id: 's_fever', weight: 0.8 },
      { id: 's_cough', weight: 0.7 },
      { id: 's_muscle_ache', weight: 0.75 },
      { id: 's_headache', weight: 0.6 },
      { id: 's_sore_throat', weight: 0.65 },
      { id: 's_runny_nose', weight: 0.7 },
    ],
    treatments: ['t_paracetamol', 't_isolation', 't_antiviral'],
  },
  {
    id: 'd_pneumonia',
    name: 'Pneumonia',
    category: 'Infectious',
    baseRisk: 0.8,
    description: 'Inflammation of lung tissue, often bacterial or viral.',
    symptoms: [
      { id: 's_fever', weight: 0.7 },
      { id: 's_cough', weight: 0.85 },
      { id: 's_chest_pain', weight: 0.8 },
      { id: 's_shortness_breath', weight: 0.9 },
      { id: 's_fatigue', weight: 0.5 },
    ],
    treatments: ['t_antibiotic', 't_oxygen', 't_paracetamol'],
  },
  {
    id: 'd_diabetes',
    name: 'Type 2 Diabetes',
    category: 'Metabolic',
    baseRisk: 0.6,
    description: 'Chronic condition impairing the body’s glucose regulation.',
    symptoms: [
      { id: 's_thirst', weight: 0.9 },
      { id: 's_freq_urine', weight: 0.85 },
      { id: 's_fatigue', weight: 0.6 },
      { id: 's_blurred_vision', weight: 0.65 },
      { id: 's_weight_loss', weight: 0.7 },
    ],
    treatments: ['t_metformin', 't_insulin', 't_diet'],
  },
  {
    id: 'd_hypertension',
    name: 'Hypertension',
    category: 'Cardiovascular',
    baseRisk: 0.65,
    description: 'Persistent elevation of arterial blood pressure.',
    symptoms: [
      { id: 's_high_bp', weight: 0.95 },
      { id: 's_headache', weight: 0.5 },
      { id: 's_dizziness', weight: 0.55 },
      { id: 's_blurred_vision', weight: 0.5 },
    ],
    treatments: ['t_betablocker', 't_diet', 't_statins'],
  },
  {
    id: 'd_mi',
    name: 'Myocardial Infarction',
    category: 'Cardiovascular',
    baseRisk: 0.95,
    description: 'Heart attack caused by blocked blood flow to heart muscle.',
    symptoms: [
      { id: 's_chest_pain', weight: 0.95 },
      { id: 's_shortness_breath', weight: 0.8 },
      { id: 's_palpitations', weight: 0.75 },
      { id: 's_nausea', weight: 0.5 },
      { id: 's_dizziness', weight: 0.5 },
    ],
    treatments: ['t_ecg', 't_betablocker', 't_statins'],
  },
  {
    id: 'd_migraine',
    name: 'Migraine',
    category: 'Neurological',
    baseRisk: 0.4,
    description: 'Recurrent neurological disorder causing severe headaches.',
    symptoms: [
      { id: 's_headache', weight: 0.95 },
      { id: 's_nausea', weight: 0.6 },
      { id: 's_blurred_vision', weight: 0.55 },
      { id: 's_dizziness', weight: 0.5 },
    ],
    treatments: ['t_paracetamol', 't_isolation'],
  },
  {
    id: 'd_gastro',
    name: 'Gastroenteritis',
    category: 'Digestive',
    baseRisk: 0.45,
    description: 'Inflammation of the stomach and intestines.',
    symptoms: [
      { id: 's_nausea', weight: 0.8 },
      { id: 's_vomiting', weight: 0.85 },
      { id: 's_diarrhea', weight: 0.9 },
      { id: 's_fever', weight: 0.4 },
    ],
    treatments: ['t_ors', 't_antibiotic', 't_diet'],
  },
];

export const PATIENTS: Patient[] = [
  { id: 'p_001', name: 'A. Sharma', age: 42, sex: 'M', symptoms: ['s_fever', 's_cough', 's_loss_smell', 's_fatigue'], diagnosed: 'd_covid', outcome: 'recovered' },
  { id: 'p_002', name: 'R. Mehta', age: 56, sex: 'F', symptoms: ['s_chest_pain', 's_shortness_breath', 's_palpitations'], diagnosed: 'd_mi', outcome: 'ongoing' },
  { id: 'p_003', name: 'S. Iyer', age: 33, sex: 'F', symptoms: ['s_headache', 's_nausea', 's_blurred_vision'], diagnosed: 'd_migraine', outcome: 'recovered' },
  { id: 'p_004', name: 'K. Patel', age: 61, sex: 'M', symptoms: ['s_thirst', 's_freq_urine', 's_fatigue', 's_weight_loss'], diagnosed: 'd_diabetes', outcome: 'ongoing' },
  { id: 'p_005', name: 'N. Khan', age: 48, sex: 'M', symptoms: ['s_high_bp', 's_headache', 's_dizziness'], diagnosed: 'd_hypertension', outcome: 'ongoing' },
  { id: 'p_006', name: 'L. Das', age: 27, sex: 'F', symptoms: ['s_nausea', 's_vomiting', 's_diarrhea'], diagnosed: 'd_gastro', outcome: 'recovered' },
  { id: 'p_007', name: 'V. Rao', age: 70, sex: 'M', symptoms: ['s_fever', 's_cough', 's_chest_pain', 's_shortness_breath'], diagnosed: 'd_pneumonia', outcome: 'ongoing' },
  { id: 'p_008', name: 'M. Joshi', age: 39, sex: 'F', symptoms: ['s_fever', 's_muscle_ache', 's_sore_throat', 's_runny_nose'], diagnosed: 'd_flu', outcome: 'recovered' },
  { id: 'p_009', name: 'P. Singh', age: 52, sex: 'M', symptoms: ['s_chest_pain', 's_shortness_breath', 's_nausea'], diagnosed: 'd_mi', outcome: 'misdiagnosed' },
  { id: 'p_010', name: 'T. Bose', age: 45, sex: 'F', symptoms: ['s_fever', 's_cough', 's_fatigue'], diagnosed: 'd_flu', outcome: 'recovered' },
  { id: 'p_011', name: 'H. Nair', age: 60, sex: 'M', symptoms: ['s_thirst', 's_freq_urine', 's_blurred_vision'], diagnosed: 'd_diabetes', outcome: 'ongoing' },
  { id: 'p_012', name: 'D. Gupta', age: 31, sex: 'F', symptoms: ['s_headache', 's_dizziness'], diagnosed: 'd_migraine', outcome: 'recovered' },
  { id: 'p_013', name: 'A. Verma', age: 58, sex: 'M', symptoms: ['s_high_bp', 's_blurred_vision', 's_headache'], diagnosed: 'd_hypertension', outcome: 'ongoing' },
  { id: 'p_014', name: 'I. Kumar', age: 24, sex: 'F', symptoms: ['s_diarrhea', 's_vomiting', 's_fever'], diagnosed: 'd_gastro', outcome: 'recovered' },
  { id: 'p_015', name: 'O. Reddy', age: 66, sex: 'M', symptoms: ['s_fever', 's_cough', 's_loss_smell'], diagnosed: 'd_covid', outcome: 'recovered' },
];

export const symptomById = (id: string) => SYMPTOMS.find(s => s.id === id)!;
export const diseaseById = (id: string) => DISEASES.find(d => d.id === id)!;
export const treatmentById = (id: string) => TREATMENTS.find(t => t.id === id)!;
