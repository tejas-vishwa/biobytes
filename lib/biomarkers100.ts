export type BiomarkerDef = {
  name: string;
  code: string;
  category: string;
  unit: string;
  refMin: number | null;
  refMax: number | null;
}

export const BIOMARKERS_100: BiomarkerDef[] = [
  // CBC
  { name: 'Hemoglobin', code: 'HEMOGLOBIN', category: 'CBC', unit: 'g/dL', refMin: 12.0, refMax: 15.5 },
  { name: 'RBC Count', code: 'RBC', category: 'CBC', unit: 'mill/µL', refMin: 4.1, refMax: 5.1 },
  { name: 'WBC Count', code: 'WBC', category: 'CBC', unit: 'thou/µL', refMin: 4.5, refMax: 11.0 },
  { name: 'Platelet Count', code: 'PLATELETS', category: 'CBC', unit: 'thou/µL', refMin: 150, refMax: 450 },
  { name: 'Hematocrit (PCV)', code: 'HEMATOCRIT', category: 'CBC', unit: '%', refMin: 36, refMax: 46 },
  { name: 'MCV', code: 'MCV', category: 'CBC', unit: 'fL', refMin: 80, refMax: 100 },
  { name: 'MCH', code: 'MCH', category: 'CBC', unit: 'pg', refMin: 27, refMax: 33 },
  { name: 'MCHC', code: 'MCHC', category: 'CBC', unit: 'g/dL', refMin: 32, refMax: 36 },
  { name: 'Neutrophils', code: 'NEUTROPHILS', category: 'CBC', unit: '%', refMin: 40, refMax: 70 },
  { name: 'Lymphocytes', code: 'LYMPHOCYTES', category: 'CBC', unit: '%', refMin: 20, refMax: 40 },
  { name: 'Monocytes', code: 'MONOCYTES', category: 'CBC', unit: '%', refMin: 2, refMax: 10 },
  { name: 'Eosinophils', code: 'EOSINOPHILS', category: 'CBC', unit: '%', refMin: 1, refMax: 6 },
  { name: 'Basophils', code: 'BASOPHILS', category: 'CBC', unit: '%', refMin: 0, refMax: 1 },
  { name: 'ESR', code: 'ESR', category: 'CBC', unit: 'mm/hr', refMin: 0, refMax: 20 },

  // Lipid Profile
  { name: 'Total Cholesterol', code: 'CHOLESTEROL_TOTAL', category: 'Lipid Profile', unit: 'mg/dL', refMin: 125, refMax: 200 },
  { name: 'HDL Cholesterol', code: 'HDL', category: 'Lipid Profile', unit: 'mg/dL', refMin: 40, refMax: 60 },
  { name: 'LDL Cholesterol', code: 'LDL', category: 'Lipid Profile', unit: 'mg/dL', refMin: 0, refMax: 99 },
  { name: 'VLDL Cholesterol', code: 'VLDL', category: 'Lipid Profile', unit: 'mg/dL', refMin: 5, refMax: 40 },
  { name: 'Triglycerides', code: 'TRIGLYCERIDES', category: 'Lipid Profile', unit: 'mg/dL', refMin: 0, refMax: 149 },
  { name: 'Total Cholesterol / HDL Ratio', code: 'CHOL_HDL_RATIO', category: 'Lipid Profile', unit: '', refMin: 3.5, refMax: 5.0 },

  // Liver Function (LFT)
  { name: 'Total Bilirubin', code: 'BILIRUBIN_TOTAL', category: 'Liver Function', unit: 'mg/dL', refMin: 0.1, refMax: 1.2 },
  { name: 'Direct Bilirubin', code: 'BILIRUBIN_DIRECT', category: 'Liver Function', unit: 'mg/dL', refMin: 0.0, refMax: 0.3 },
  { name: 'Indirect Bilirubin', code: 'BILIRUBIN_INDIRECT', category: 'Liver Function', unit: 'mg/dL', refMin: 0.2, refMax: 0.8 },
  { name: 'SGOT (AST)', code: 'SGOT', category: 'Liver Function', unit: 'U/L', refMin: 5, refMax: 40 },
  { name: 'SGPT (ALT)', code: 'SGPT', category: 'Liver Function', unit: 'U/L', refMin: 7, refMax: 56 },
  { name: 'Alkaline Phosphatase', code: 'ALP', category: 'Liver Function', unit: 'U/L', refMin: 44, refMax: 147 },
  { name: 'Total Protein', code: 'PROTEIN_TOTAL', category: 'Liver Function', unit: 'g/dL', refMin: 6.0, refMax: 8.3 },
  { name: 'Albumin', code: 'ALBUMIN', category: 'Liver Function', unit: 'g/dL', refMin: 3.4, refMax: 5.4 },
  { name: 'Globulin', code: 'GLOBULIN', category: 'Liver Function', unit: 'g/dL', refMin: 2.0, refMax: 3.5 },
  { name: 'A/G Ratio', code: 'AG_RATIO', category: 'Liver Function', unit: '', refMin: 1.1, refMax: 2.5 },
  { name: 'Gamma GT (GGT)', code: 'GGT', category: 'Liver Function', unit: 'U/L', refMin: 9, refMax: 48 },

  // Kidney Function (KFT)
  { name: 'Blood Urea Nitrogen', code: 'BUN', category: 'Kidney Function', unit: 'mg/dL', refMin: 7, refMax: 20 },
  { name: 'Blood Urea', code: 'UREA', category: 'Kidney Function', unit: 'mg/dL', refMin: 15, refMax: 40 },
  { name: 'Serum Creatinine', code: 'CREATININE', category: 'Kidney Function', unit: 'mg/dL', refMin: 0.6, refMax: 1.2 },
  { name: 'Uric Acid', code: 'URIC_ACID', category: 'Kidney Function', unit: 'mg/dL', refMin: 3.5, refMax: 7.2 },
  { name: 'Serum Sodium', code: 'SODIUM', category: 'Kidney Function', unit: 'mEq/L', refMin: 135, refMax: 145 },
  { name: 'Serum Potassium', code: 'POTASSIUM', category: 'Kidney Function', unit: 'mEq/L', refMin: 3.5, refMax: 5.1 },
  { name: 'Serum Chloride', code: 'CHLORIDE', category: 'Kidney Function', unit: 'mEq/L', refMin: 96, refMax: 106 },
  { name: 'Serum Calcium', code: 'CALCIUM', category: 'Kidney Function', unit: 'mg/dL', refMin: 8.8, refMax: 10.6 },
  { name: 'Serum Phosphorus', code: 'PHOSPHORUS', category: 'Kidney Function', unit: 'mg/dL', refMin: 2.5, refMax: 4.5 },

  // Diabetes
  { name: 'Fasting Blood Sugar', code: 'GLUCOSE_FASTING', category: 'Diabetes', unit: 'mg/dL', refMin: 70, refMax: 100 },
  { name: 'PPBS', code: 'PPBS', category: 'Diabetes', unit: 'mg/dL', refMin: 70, refMax: 140 },
  { name: 'Random Blood Sugar', code: 'RBS', category: 'Diabetes', unit: 'mg/dL', refMin: 70, refMax: 140 },
  { name: 'HbA1c', code: 'HBA1C', category: 'Diabetes', unit: '%', refMin: 4.0, refMax: 5.6 },
  { name: 'Average Blood Glucose', code: 'EAG', category: 'Diabetes', unit: 'mg/dL', refMin: 70, refMax: 114 },
  { name: 'Fasting Insulin', code: 'INSULIN', category: 'Diabetes', unit: 'uIU/mL', refMin: 2.6, refMax: 24.9 },

  // Thyroid
  { name: 'Total T3', code: 'T3_TOTAL', category: 'Thyroid', unit: 'ng/dL', refMin: 80, refMax: 200 },
  { name: 'Total T4', code: 'T4_TOTAL', category: 'Thyroid', unit: 'ug/dL', refMin: 4.5, refMax: 11.2 },
  { name: 'Free T3', code: 'FT3', category: 'Thyroid', unit: 'pg/mL', refMin: 2.3, refMax: 4.1 },
  { name: 'Free T4', code: 'FT4', category: 'Thyroid', unit: 'ng/dL', refMin: 0.9, refMax: 1.7 },
  { name: 'TSH', code: 'TSH', category: 'Thyroid', unit: 'uIU/mL', refMin: 0.55, refMax: 4.78 },

  // Vitamins & Minerals
  { name: 'Vitamin D', code: 'VITAMIN_D', category: 'Vitamins & Minerals', unit: 'ng/mL', refMin: 30, refMax: 100 },
  { name: 'Vitamin B12', code: 'VITAMIN_B12', category: 'Vitamins & Minerals', unit: 'pg/mL', refMin: 211, refMax: 911 },
  { name: 'Serum Iron', code: 'IRON', category: 'Vitamins & Minerals', unit: 'ug/dL', refMin: 60, refMax: 170 },
  { name: 'TIBC', code: 'TIBC', category: 'Vitamins & Minerals', unit: 'ug/dL', refMin: 240, refMax: 450 },
  { name: 'Ferritin', code: 'FERRITIN', category: 'Vitamins & Minerals', unit: 'ng/mL', refMin: 30, refMax: 400 },
  { name: 'Transferrin Saturation', code: 'TRANSFERRIN_SAT', category: 'Vitamins & Minerals', unit: '%', refMin: 20, refMax: 50 },
  { name: 'Folic Acid', code: 'FOLATE', category: 'Vitamins & Minerals', unit: 'ng/mL', refMin: 4.0, refMax: 20.0 },
  { name: 'Magnesium', code: 'MAGNESIUM', category: 'Vitamins & Minerals', unit: 'mg/dL', refMin: 1.7, refMax: 2.2 },
  { name: 'Zinc', code: 'ZINC', category: 'Vitamins & Minerals', unit: 'ug/dL', refMin: 60, refMax: 120 },

  // Infectious Diseases
  { name: 'Widal Test', code: 'WIDAL', category: 'Infectious Diseases', unit: 'Titer', refMin: null, refMax: null },
  { name: 'Dengue NS1', code: 'DENGUE_NS1', category: 'Infectious Diseases', unit: 'Index', refMin: null, refMax: null },
  { name: 'Dengue IgG', code: 'DENGUE_IGG', category: 'Infectious Diseases', unit: 'Index', refMin: null, refMax: null },
  { name: 'Dengue IgM', code: 'DENGUE_IGM', category: 'Infectious Diseases', unit: 'Index', refMin: null, refMax: null },
  { name: 'Malaria Parasite', code: 'MALARIA', category: 'Infectious Diseases', unit: '', refMin: null, refMax: null },
  { name: 'Chikungunya', code: 'CHIKUNGUNYA', category: 'Infectious Diseases', unit: '', refMin: null, refMax: null },
  { name: 'HBsAg', code: 'HBSAG', category: 'Infectious Diseases', unit: '', refMin: null, refMax: null },
  { name: 'Anti-HCV', code: 'ANTI_HCV', category: 'Infectious Diseases', unit: '', refMin: null, refMax: null },
  { name: 'HIV', code: 'HIV', category: 'Infectious Diseases', unit: '', refMin: null, refMax: null },
  { name: 'VDRL', code: 'VDRL', category: 'Infectious Diseases', unit: '', refMin: null, refMax: null },
  { name: 'CRP', code: 'CRP', category: 'Infectious Diseases', unit: 'mg/L', refMin: 0, refMax: 5 },
  { name: 'hs-CRP', code: 'HS_CRP', category: 'Infectious Diseases', unit: 'mg/L', refMin: 0, refMax: 1 },
  { name: 'Procalcitonin', code: 'PROCALCITONIN', category: 'Infectious Diseases', unit: 'ng/mL', refMin: 0, refMax: 0.1 },

  // Urine Analysis
  { name: 'Urine pH', code: 'URINE_PH', category: 'Urine Analysis', unit: '', refMin: 4.6, refMax: 8.0 },
  { name: 'Urine Specific Gravity', code: 'URINE_SG', category: 'Urine Analysis', unit: '', refMin: 1.005, refMax: 1.030 },
  { name: 'Urine Protein', code: 'URINE_PROTEIN', category: 'Urine Analysis', unit: 'mg/dL', refMin: 0, refMax: 14 },
  { name: 'Urine Glucose', code: 'URINE_GLUCOSE', category: 'Urine Analysis', unit: 'mg/dL', refMin: 0, refMax: 15 },
  { name: 'Urine Ketones', code: 'URINE_KETONES', category: 'Urine Analysis', unit: 'mg/dL', refMin: 0, refMax: 0 },
  { name: 'Urine Bilirubin', code: 'URINE_BILIRUBIN', category: 'Urine Analysis', unit: 'mg/dL', refMin: 0, refMax: 0 },
  { name: 'Urine Urobilinogen', code: 'URINE_UROBILINOGEN', category: 'Urine Analysis', unit: 'EU/dL', refMin: 0.2, refMax: 1.0 },
  { name: 'Urine Blood', code: 'URINE_BLOOD', category: 'Urine Analysis', unit: '', refMin: null, refMax: null },
  { name: 'Urine Pus Cells', code: 'URINE_PUS', category: 'Urine Analysis', unit: 'hpf', refMin: 0, refMax: 5 },
  { name: 'Urine RBC', code: 'URINE_RBC', category: 'Urine Analysis', unit: 'hpf', refMin: 0, refMax: 2 },
  { name: 'Urine Epithelial Cells', code: 'URINE_EPITHELIAL', category: 'Urine Analysis', unit: 'hpf', refMin: null, refMax: null },
  { name: 'Urine Casts', code: 'URINE_CASTS', category: 'Urine Analysis', unit: 'hpf', refMin: null, refMax: null },
  { name: 'Urine Crystals', code: 'URINE_CRYSTALS', category: 'Urine Analysis', unit: 'hpf', refMin: null, refMax: null },

  // Cardiac Markers
  { name: 'Troponin I', code: 'TROPONIN_I', category: 'Cardiac Markers', unit: 'ng/mL', refMin: 0, refMax: 0.04 },
  { name: 'Troponin T', code: 'TROPONIN_T', category: 'Cardiac Markers', unit: 'ng/mL', refMin: 0, refMax: 0.01 },
  { name: 'CPK-MB', code: 'CPK_MB', category: 'Cardiac Markers', unit: 'ng/mL', refMin: 0, refMax: 5.0 },
  { name: 'CPK Total', code: 'CPK_TOTAL', category: 'Cardiac Markers', unit: 'U/L', refMin: 22, refMax: 198 },
  { name: 'D-Dimer', code: 'D_DIMER', category: 'Cardiac Markers', unit: 'ng/mL', refMin: 0, refMax: 500 },
  { name: 'PT', code: 'PT', category: 'Cardiac Markers', unit: 'sec', refMin: 11.0, refMax: 13.5 },
  { name: 'INR', code: 'INR', category: 'Cardiac Markers', unit: '', refMin: 0.8, refMax: 1.1 },
  { name: 'APTT', code: 'APTT', category: 'Cardiac Markers', unit: 'sec', refMin: 30, refMax: 40 },

  // Hormones & Others
  { name: 'Prolactin', code: 'PROLACTIN', category: 'Hormones & Others', unit: 'ng/mL', refMin: 4.79, refMax: 23.3 },
  { name: 'FSH', code: 'FSH', category: 'Hormones & Others', unit: 'mIU/mL', refMin: 1.5, refMax: 12.4 },
  { name: 'LH', code: 'LH', category: 'Hormones & Others', unit: 'mIU/mL', refMin: 1.7, refMax: 8.6 },
  { name: 'Testosterone', code: 'TESTOSTERONE', category: 'Hormones & Others', unit: 'ng/dL', refMin: 240, refMax: 950 },
  { name: 'Estradiol', code: 'ESTRADIOL', category: 'Hormones & Others', unit: 'pg/mL', refMin: 15, refMax: 350 },
  { name: 'PSA', code: 'PSA', category: 'Hormones & Others', unit: 'ng/mL', refMin: 0, refMax: 4.0 },
  { name: 'CA-125', code: 'CA_125', category: 'Hormones & Others', unit: 'U/mL', refMin: 0, refMax: 35 },
  { name: 'CEA', code: 'CEA', category: 'Hormones & Others', unit: 'ng/mL', refMin: 0, refMax: 3.0 },
  { name: 'Rheumatoid Factor', code: 'RA_FACTOR', category: 'Hormones & Others', unit: 'IU/mL', refMin: 0, refMax: 14 },
  { name: 'Anti-CCP', code: 'ANTI_CCP', category: 'Hormones & Others', unit: 'U/mL', refMin: 0, refMax: 20 },
  { name: 'ANA', code: 'ANA', category: 'Hormones & Others', unit: 'Titer', refMin: null, refMax: null },
  { name: 'IgE Total', code: 'IGE', category: 'Hormones & Others', unit: 'IU/mL', refMin: 0, refMax: 100 },
  { name: 'Serum Amylase', code: 'AMYLASE', category: 'Hormones & Others', unit: 'U/L', refMin: 28, refMax: 100 },
  { name: 'Serum Lipase', code: 'LIPASE', category: 'Hormones & Others', unit: 'U/L', refMin: 13, refMax: 60 }
];
