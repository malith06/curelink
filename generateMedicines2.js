const fs = require('fs');

const medicines = [
  // Original 12 + Variations
  { name: 'Panadol', brand: 'GSK', dosage: '500mg', category: 'Pain Relief', description: 'Paracetamol 500mg tablets for effective pain relief and fever reduction.', prescriptionRequired: false, manufacturer: 'GlaxoSmithKline' },
  { name: 'Panadol', brand: 'GSK', dosage: 'Syrup 120mg/5ml', category: 'Pain Relief', description: 'Paracetamol syrup for children.', prescriptionRequired: false, manufacturer: 'GlaxoSmithKline' },
  { name: 'Paracetamol', brand: 'Generic', dosage: '500mg', category: 'Pain Relief', description: 'Paracetamol 500mg tablets.', prescriptionRequired: false, manufacturer: 'Generic' },
  { name: 'Paracetamol', brand: 'Generic', dosage: '650mg', category: 'Pain Relief', description: 'Paracetamol 650mg tablets for severe pain.', prescriptionRequired: false, manufacturer: 'Generic' },
  { name: 'Loratadine', brand: 'Claritin', dosage: '10mg', category: 'Allergy', description: 'Antihistamine used to treat allergies.', prescriptionRequired: false, manufacturer: 'Bayer' },
  { name: 'Amoxicillin', brand: 'Amoxil', dosage: '250mg', category: 'Antibiotics', description: 'Penicillin antibiotic used to treat various bacterial infections.', prescriptionRequired: true, manufacturer: 'Pfizer' },
  { name: 'Amoxicillin', brand: 'Amoxil', dosage: '500mg', category: 'Antibiotics', description: 'Penicillin antibiotic used to treat various bacterial infections.', prescriptionRequired: true, manufacturer: 'Pfizer' },
  { name: 'Amoxicillin', brand: 'Amoxil', dosage: 'Syrup 125mg/5ml', category: 'Antibiotics', description: 'Penicillin antibiotic syrup.', prescriptionRequired: true, manufacturer: 'Pfizer' },
  { name: 'Lisinopril', brand: 'Prinivil', dosage: '10mg', category: 'Cardiovascular', description: 'ACE inhibitor used to treat high blood pressure and heart failure.', prescriptionRequired: true, manufacturer: 'Merck' },
  { name: 'Lisinopril', brand: 'Prinivil', dosage: '20mg', category: 'Cardiovascular', description: 'ACE inhibitor used to treat high blood pressure and heart failure.', prescriptionRequired: true, manufacturer: 'Merck' },
  { name: 'Ibuprofen', brand: 'Advil', dosage: '200mg', category: 'Pain Relief', description: 'Nonsteroidal anti-inflammatory drug (NSAID).', prescriptionRequired: false, manufacturer: 'Pfizer' },
  { name: 'Ibuprofen', brand: 'Advil', dosage: '400mg', category: 'Pain Relief', description: 'Nonsteroidal anti-inflammatory drug (NSAID) used for pain and inflammation.', prescriptionRequired: false, manufacturer: 'Pfizer' },
  { name: 'Cetirizine', brand: 'Zyrtec', dosage: '10mg', category: 'Allergy', description: 'Antihistamine used to relieve allergy symptoms like watery eyes, runny nose, and sneezing.', prescriptionRequired: false, manufacturer: 'Johnson & Johnson' },
  { name: 'Cetirizine', brand: 'Zyrtec', dosage: 'Syrup 5mg/5ml', category: 'Allergy', description: 'Antihistamine syrup for children.', prescriptionRequired: false, manufacturer: 'Johnson & Johnson' },
  { name: 'Metformin', brand: 'Glucophage', dosage: '500mg', category: 'Diabetes', description: 'First-line medication for the treatment of type 2 diabetes.', prescriptionRequired: true, manufacturer: 'Bristol-Myers Squibb' },
  { name: 'Metformin', brand: 'Glucophage', dosage: '850mg', category: 'Diabetes', description: 'First-line medication for the treatment of type 2 diabetes.', prescriptionRequired: true, manufacturer: 'Bristol-Myers Squibb' },
  { name: 'Omeprazole', brand: 'Prilosec', dosage: '20mg', category: 'Gastrointestinal', description: 'Proton pump inhibitor (PPI) that decreases stomach acid production.', prescriptionRequired: false, manufacturer: 'AstraZeneca' },
  { name: 'Omeprazole', brand: 'Prilosec', dosage: '40mg', category: 'Gastrointestinal', description: 'Proton pump inhibitor (PPI) that decreases stomach acid production.', prescriptionRequired: false, manufacturer: 'AstraZeneca' },
  { name: 'Atorvastatin', brand: 'Lipitor', dosage: '10mg', category: 'Cardiovascular', description: 'Statin medication used to prevent cardiovascular disease and lower lipid levels.', prescriptionRequired: true, manufacturer: 'Pfizer' },
  { name: 'Atorvastatin', brand: 'Lipitor', dosage: '20mg', category: 'Cardiovascular', description: 'Statin medication used to prevent cardiovascular disease and lower lipid levels.', prescriptionRequired: true, manufacturer: 'Pfizer' },
  { name: 'Salbutamol', brand: 'Ventolin', dosage: '100mcg', category: 'Respiratory', description: 'Inhaler used for the relief of asthma and COPD symptoms.', prescriptionRequired: true, manufacturer: 'GlaxoSmithKline' },
  { name: 'Aspirin', brand: 'Bayer', dosage: '75mg', category: 'Pain Relief', description: 'Used to reduce pain, fever, or inflammation.', prescriptionRequired: false, manufacturer: 'Bayer AG' },
  { name: 'Aspirin', brand: 'Bayer', dosage: '150mg', category: 'Pain Relief', description: 'Used to reduce pain, fever, or inflammation.', prescriptionRequired: false, manufacturer: 'Bayer AG' },

  // Added Popular & Essential Medicines
  { name: 'Piriton', brand: 'Piriton', dosage: '4mg', category: 'Allergy', description: 'Chlorphenamine maleate used for hayfever and allergy relief.', prescriptionRequired: false, manufacturer: 'GSK' },
  { name: 'Amoxil', brand: 'Amoxil', dosage: '250mg', category: 'Antibiotics', description: 'Broad spectrum penicillin antibiotic.', prescriptionRequired: true, manufacturer: 'GSK' },
  { name: 'Augmentin', brand: 'Augmentin', dosage: '375mg', category: 'Antibiotics', description: 'Co-amoxiclav used for treating bacterial infections.', prescriptionRequired: true, manufacturer: 'GSK' },
  { name: 'Zithromax', brand: 'Zithromax', dosage: '250mg', category: 'Antibiotics', description: 'Azithromycin antibiotic for respiratory and skin infections.', prescriptionRequired: true, manufacturer: 'Pfizer' },
  { name: 'Losar', brand: 'Losar', dosage: '50mg', category: 'Cardiovascular', description: 'Losartan potassium used for high blood pressure.', prescriptionRequired: true, manufacturer: 'Torrent Pharma' },
  { name: 'Amloc', brand: 'Amloc', dosage: '5mg', category: 'Cardiovascular', description: 'Amlodipine tablet for treating hypertension.', prescriptionRequired: true, manufacturer: 'Pfizer' },
  { name: 'Concor', brand: 'Concor', dosage: '5mg', category: 'Cardiovascular', description: 'Bisoprolol fumarate used for heart failure and hypertension.', prescriptionRequired: true, manufacturer: 'Merck' },
  { name: 'Ecosprin', brand: 'Ecosprin', dosage: '75mg', category: 'Cardiovascular', description: 'Low dose aspirin used to prevent heart attacks.', prescriptionRequired: false, manufacturer: 'USV' },
  { name: 'Diamicron', brand: 'Diamicron', dosage: '60mg', category: 'Diabetes', description: 'Gliclazide used for controlling blood sugar in type 2 diabetes.', prescriptionRequired: true, manufacturer: 'Servier' },
  { name: 'Januvia', brand: 'Januvia', dosage: '50mg', category: 'Diabetes', description: 'Sitagliptin used for type 2 diabetes management.', prescriptionRequired: true, manufacturer: 'Merck' },
  { name: 'Jardiance', brand: 'Jardiance', dosage: '10mg', category: 'Diabetes', description: 'Empagliflozin used to treat type 2 diabetes.', prescriptionRequired: true, manufacturer: 'Boehringer Ingelheim' },
  { name: 'Digene', brand: 'Digene', dosage: 'Tablet', category: 'Gastrointestinal', description: 'Antacid used for relieving acidity and gas.', prescriptionRequired: false, manufacturer: 'Abbott' },
  { name: 'Gelusil', brand: 'Gelusil', dosage: 'Syrup', category: 'Gastrointestinal', description: 'Antacid liquid for heartburn and indigestion.', prescriptionRequired: false, manufacturer: 'Pfizer' },
  { name: 'Domstal', brand: 'Domstal', dosage: '10mg', category: 'Gastrointestinal', description: 'Domperidone used for nausea and vomiting.', prescriptionRequired: false, manufacturer: 'Torrent Pharma' },
  { name: 'Nexium', brand: 'Nexium', dosage: '20mg', category: 'Gastrointestinal', description: 'Esomeprazole used for acid reflux.', prescriptionRequired: true, manufacturer: 'AstraZeneca' },
  { name: 'Imodium', brand: 'Imodium', dosage: '2mg', category: 'Gastrointestinal', description: 'Loperamide used for treating diarrhea.', prescriptionRequired: false, manufacturer: 'Johnson & Johnson' },
  { name: 'Singulair', brand: 'Singulair', dosage: '10mg', category: 'Respiratory', description: 'Montelukast used for asthma and allergies.', prescriptionRequired: true, manufacturer: 'Merck' },
  { name: 'Flixotide', brand: 'Flixotide', dosage: '125mcg', category: 'Respiratory', description: 'Fluticasone inhaler for asthma management.', prescriptionRequired: true, manufacturer: 'GSK' },
  { name: 'Seretide', brand: 'Seretide', dosage: '250mcg', category: 'Respiratory', description: 'Combination inhaler for asthma and COPD.', prescriptionRequired: true, manufacturer: 'GSK' },
  { name: 'Telfast', brand: 'Telfast', dosage: '120mg', category: 'Allergy', description: 'Fexofenadine used for allergy relief.', prescriptionRequired: false, manufacturer: 'Sanofi' },
  { name: 'Vitamin C', brand: 'Generic', dosage: '500mg', category: 'Vitamins', description: 'Ascorbic acid supplement for immunity.', prescriptionRequired: false, manufacturer: 'Generic' },
  { name: 'Neurobion', brand: 'Neurobion', dosage: 'Forte', category: 'Vitamins', description: 'Vitamin B complex supplement.', prescriptionRequired: false, manufacturer: 'Merck' },
  { name: 'Caltrate', brand: 'Caltrate', dosage: '600mg', category: 'Vitamins', description: 'Calcium and Vitamin D3 supplement.', prescriptionRequired: false, manufacturer: 'Pfizer' },
  { name: 'Centrum', brand: 'Centrum', dosage: 'Adult', category: 'Vitamins', description: 'Daily multivitamin supplement.', prescriptionRequired: false, manufacturer: 'GSK' },
  { name: 'Betnovate', brand: 'Betnovate', dosage: '0.1%', category: 'Dermatology', description: 'Betamethasone cream for skin inflammation.', prescriptionRequired: true, manufacturer: 'GSK' },
  { name: 'Canesten', brand: 'Canesten', dosage: '1%', category: 'Dermatology', description: 'Clotrimazole cream for fungal infections.', prescriptionRequired: false, manufacturer: 'Bayer' },
  { name: 'Voltaren', brand: 'Voltaren', dosage: '1%', category: 'Pain Relief', description: 'Diclofenac gel for muscle and joint pain.', prescriptionRequired: false, manufacturer: 'Novartis' },
  { name: 'Thyrox', brand: 'Thyrox', dosage: '50mcg', category: 'Endocrine', description: 'Levothyroxine for hypothyroidism.', prescriptionRequired: true, manufacturer: 'MacLeod' },
  { name: 'Eltroxin', brand: 'Eltroxin', dosage: '50mcg', category: 'Endocrine', description: 'Levothyroxine sodium tablets.', prescriptionRequired: true, manufacturer: 'GSK' }
];

const generics = [
  { n: 'Azithromycin', c: 'Antibiotics', ds: '500mg', d: 'Macrolide antibiotic.', m: 'Generic' },
  { n: 'Ciprofloxacin', c: 'Antibiotics', ds: '500mg', d: 'Fluoroquinolone antibiotic.', m: 'Generic' },
  { n: 'Doxycycline', c: 'Antibiotics', ds: '100mg', d: 'Tetracycline antibiotic.', m: 'Generic' },
  { n: 'Cephalexin', c: 'Antibiotics', ds: '500mg', d: 'Cephalosporin antibiotic.', m: 'Generic' },
  { n: 'Metronidazole', c: 'Antibiotics', ds: '400mg', d: 'Antibiotic and antiprotozoal.', m: 'Generic' },
  { n: 'Clindamycin', c: 'Antibiotics', ds: '300mg', d: 'Lincosamide antibiotic.', m: 'Generic' },
  { n: 'Levofloxacin', c: 'Antibiotics', ds: '500mg', d: 'Fluoroquinolone antibiotic.', m: 'Generic' },
  { n: 'Rosuvastatin', c: 'Cardiovascular', ds: '10mg', d: 'Statin for lowering cholesterol.', m: 'Generic' },
  { n: 'Simvastatin', c: 'Cardiovascular', ds: '20mg', d: 'Statin for lowering cholesterol.', m: 'Generic' },
  { n: 'Valsartan', c: 'Cardiovascular', ds: '80mg', d: 'Angiotensin II receptor blocker.', m: 'Generic' },
  { n: 'Enalapril', c: 'Cardiovascular', ds: '5mg', d: 'ACE inhibitor.', m: 'Generic' },
  { n: 'Ramipril', c: 'Cardiovascular', ds: '5mg', d: 'ACE inhibitor.', m: 'Generic' },
  { n: 'Atenolol', c: 'Cardiovascular', ds: '50mg', d: 'Beta blocker.', m: 'Generic' },
  { n: 'Metoprolol', c: 'Cardiovascular', ds: '50mg', d: 'Beta blocker.', m: 'Generic' },
  { n: 'Carvedilol', c: 'Cardiovascular', ds: '6.25mg', d: 'Beta blocker.', m: 'Generic' },
  { n: 'Furosemide', c: 'Cardiovascular', ds: '40mg', d: 'Loop diuretic.', m: 'Generic' },
  { n: 'Spironolactone', c: 'Cardiovascular', ds: '25mg', d: 'Potassium-sparing diuretic.', m: 'Generic' },
  { n: 'Glimepiride', c: 'Diabetes', ds: '2mg', d: 'Sulfonylurea for type 2 diabetes.', m: 'Generic' },
  { n: 'Glipizide', c: 'Diabetes', ds: '5mg', d: 'Sulfonylurea for type 2 diabetes.', m: 'Generic' },
  { n: 'Pioglitazone', c: 'Diabetes', ds: '15mg', d: 'Thiazolidinedione for type 2 diabetes.', m: 'Generic' },
  { n: 'Insulin Glargine', c: 'Diabetes', ds: '100 IU/mL', d: 'Long-acting insulin.', m: 'Generic' },
  { n: 'Insulin Aspart', c: 'Diabetes', ds: '100 IU/mL', d: 'Rapid-acting insulin.', m: 'Generic' },
  { n: 'Pantoprazole', c: 'Gastrointestinal', ds: '40mg', d: 'Proton pump inhibitor.', m: 'Generic' },
  { n: 'Lansoprazole', c: 'Gastrointestinal', ds: '30mg', d: 'Proton pump inhibitor.', m: 'Generic' },
  { n: 'Famotidine', c: 'Gastrointestinal', ds: '20mg', d: 'H2 blocker for acidity.', m: 'Generic' },
  { n: 'Ranitidine', c: 'Gastrointestinal', ds: '150mg', d: 'H2 blocker for acidity.', m: 'Generic' },
  { n: 'Mebeverine', c: 'Gastrointestinal', ds: '135mg', d: 'Antispasmodic for IBS.', m: 'Generic' },
  { n: 'Ondansetron', c: 'Gastrointestinal', ds: '4mg', d: 'Antiemetic for nausea.', m: 'Generic' },
  { n: 'Budesonide', c: 'Respiratory', ds: '200mcg', d: 'Corticosteroid for asthma.', m: 'Generic' },
  { n: 'Formoterol', c: 'Respiratory', ds: '12mcg', d: 'Long-acting beta agonist.', m: 'Generic' },
  { n: 'Tiotropium', c: 'Respiratory', ds: '18mcg', d: 'Anticholinergic for COPD.', m: 'Generic' },
  { n: 'Ipratropium', c: 'Respiratory', ds: '20mcg', d: 'Bronchodilator.', m: 'Generic' },
  { n: 'Levocetirizine', c: 'Allergy', ds: '5mg', d: 'Antihistamine.', m: 'Generic' },
  { n: 'Desloratadine', c: 'Allergy', ds: '5mg', d: 'Antihistamine.', m: 'Generic' },
  { n: 'Chlorpheniramine', c: 'Allergy', ds: '4mg', d: 'Antihistamine.', m: 'Generic' },
  { n: 'Folic Acid', c: 'Vitamins', ds: '5mg', d: 'Vitamin B9 supplement.', m: 'Generic' },
  { n: 'Vitamin D3', c: 'Vitamins', ds: '1000 IU', d: 'Cholecalciferol supplement.', m: 'Generic' },
  { n: 'Vitamin E', c: 'Vitamins', ds: '400 IU', d: 'Antioxidant vitamin.', m: 'Generic' },
  { n: 'Zinc', c: 'Vitamins', ds: '50mg', d: 'Mineral supplement.', m: 'Generic' },
  { n: 'Iron', c: 'Vitamins', ds: '200mg', d: 'Ferrous sulfate supplement.', m: 'Generic' },
  { n: 'Calcium', c: 'Vitamins', ds: '500mg', d: 'Calcium carbonate supplement.', m: 'Generic' },
  { n: 'Magnesium', c: 'Vitamins', ds: '250mg', d: 'Mineral supplement.', m: 'Generic' },
  { n: 'Ketoconazole', c: 'Dermatology', ds: '2%', d: 'Antifungal.', m: 'Generic' },
  { n: 'Mupirocin', c: 'Dermatology', ds: '2%', d: 'Topical antibiotic.', m: 'Generic' },
  { n: 'Isotretinoin', c: 'Dermatology', ds: '20mg', d: 'Treatment for severe acne.', m: 'Generic' },
  { n: 'Sertraline', c: 'Psychiatry', ds: '50mg', d: 'SSRI antidepressant.', m: 'Generic' },
  { n: 'Escitalopram', c: 'Psychiatry', ds: '10mg', d: 'SSRI antidepressant.', m: 'Generic' },
  { n: 'Fluoxetine', c: 'Psychiatry', ds: '20mg', d: 'SSRI antidepressant.', m: 'Generic' },
  { n: 'Alprazolam', c: 'Psychiatry', ds: '0.5mg', d: 'Benzodiazepine for anxiety.', m: 'Generic' },
  { n: 'Clonazepam', c: 'Psychiatry', ds: '0.5mg', d: 'Benzodiazepine.', m: 'Generic' },
  { n: 'Diazepam', c: 'Psychiatry', ds: '5mg', d: 'Benzodiazepine.', m: 'Generic' },
  { n: 'Zolpidem', c: 'Psychiatry', ds: '10mg', d: 'Sedative for insomnia.', m: 'Generic' },
  { n: 'Gabapentin', c: 'Neurology', ds: '300mg', d: 'Nerve pain medication.', m: 'Generic' },
  { n: 'Pregabalin', c: 'Neurology', ds: '75mg', d: 'Nerve pain medication.', m: 'Generic' },
  { n: 'Levetiracetam', c: 'Neurology', ds: '500mg', d: 'Anticonvulsant.', m: 'Generic' },
  { n: 'Carbamazepine', c: 'Neurology', ds: '200mg', d: 'Anticonvulsant.', m: 'Generic' },
  { n: 'Topiramate', c: 'Neurology', ds: '50mg', d: 'Anticonvulsant and migraine preventer.', m: 'Generic' },
  { n: 'Sumatriptan', c: 'Neurology', ds: '50mg', d: 'Migraine medication.', m: 'Generic' },
  { n: 'Allopurinol', c: 'Rheumatology', ds: '100mg', d: 'Gout medication.', m: 'Generic' },
  { n: 'Colchicine', c: 'Rheumatology', ds: '0.5mg', d: 'Gout medication.', m: 'Generic' },
  { n: 'Methotrexate', c: 'Rheumatology', ds: '2.5mg', d: 'Immunosuppressant.', m: 'Generic' },
  { n: 'Hydroxychloroquine', c: 'Rheumatology', ds: '200mg', d: 'DMARD.', m: 'Generic' },
  { n: 'Prednisolone', c: 'Steroids', ds: '5mg', d: 'Corticosteroid.', m: 'Generic' },
  { n: 'Dexamethasone', c: 'Steroids', ds: '0.5mg', d: 'Corticosteroid.', m: 'Generic' },
  { n: 'Methylprednisolone', c: 'Steroids', ds: '4mg', d: 'Corticosteroid.', m: 'Generic' },
  { n: 'Sildenafil', c: 'Urology', ds: '50mg', d: 'ED medication.', m: 'Generic' },
  { n: 'Tamsulosin', c: 'Urology', ds: '0.4mg', d: 'Alpha blocker for enlarged prostate.', m: 'Generic' },
  { n: 'Finasteride', c: 'Urology', ds: '5mg', d: '5-alpha reductase inhibitor.', m: 'Generic' },
];

generics.forEach(g => {
  medicines.push({
    name: g.n,
    brand: 'Generic',
    dosage: g.ds,
    category: g.c,
    description: g.d,
    prescriptionRequired: !['Vitamins', 'Allergy', 'Gastrointestinal', 'Pain Relief'].includes(g.c),
    manufacturer: g.m
  });
});

let jsCode = `const sampleMedicines = [\n`;
medicines.forEach((m, idx) => {
  jsCode += `  {\n`;
  jsCode += `    name: '${m.name}',\n`;
  jsCode += `    brand: '${m.brand}',\n`;
  jsCode += `    dosage: '${m.dosage}',\n`;
  jsCode += `    category: '${m.category}',\n`;
  jsCode += `    description: '${m.description.replace(/'/g, "\\'")}',\n`;
  jsCode += `    prescriptionRequired: ${m.prescriptionRequired},\n`;
  jsCode += `    manufacturer: '${m.manufacturer}',\n`;
  jsCode += `  }${idx < medicines.length - 1 ? ',' : ''}\n`;
});
jsCode += `];`;

const filePath = 'c:/Users/CHAMA COMPUTERS/Documents/Final-Year-Project/CureLink/server/src/scripts/seedMedicines.js';
let content = fs.readFileSync(filePath, 'utf8');

const startIdx = content.indexOf('const sampleMedicines = [');
const endMarker = '];\r\n\r\nconst seedMedicines =';
let endIdx = content.indexOf(endMarker);
let actualEndMarker = endMarker;

if(endIdx === -1) {
    actualEndMarker = '];\n\nconst seedMedicines =';
    endIdx = content.indexOf(actualEndMarker);
}

if (startIdx !== -1 && endIdx !== -1) {
  const newContent = content.substring(0, startIdx) + jsCode + '\n\nconst seedMedicines =' + content.substring(endIdx + actualEndMarker.length);
  fs.writeFileSync(filePath, newContent, 'utf8');
  console.log('Successfully updated seedMedicines.js with ' + medicines.length + ' medicines including dosages.');
} else {
  console.log('Could not find the array bounds in the file. Start:', startIdx, 'End:', endIdx);
}
