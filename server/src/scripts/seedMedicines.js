require('dotenv').config();
const mongoose = require('mongoose');
const Medicine = require('../modules/medicines/medicine.model');
const User = require('../models/user.model');

const sampleMedicines = [
  {
    name: 'Panadol',
    brand: 'GSK',
    category: 'Pain Relief',
    description: 'Paracetamol 500mg tablets for effective pain relief and fever reduction.',
    prescriptionRequired: false,
    manufacturer: 'GlaxoSmithKline',
  },
  {
    name: 'Amoxicillin',
    brand: 'Amoxil',
    category: 'Antibiotics',
    description: 'Penicillin antibiotic used to treat various bacterial infections.',
    prescriptionRequired: true,
    manufacturer: 'Pfizer',
  },
  {
    name: 'Lisinopril',
    brand: 'Prinivil',
    category: 'Cardiovascular',
    description: 'ACE inhibitor used to treat high blood pressure and heart failure.',
    prescriptionRequired: true,
    manufacturer: 'Merck',
  },
  {
    name: 'Ibuprofen',
    brand: 'Advil',
    category: 'Pain Relief',
    description: 'Nonsteroidal anti-inflammatory drug (NSAID) used for pain and inflammation.',
    prescriptionRequired: false,
    manufacturer: 'Pfizer',
  },
  {
    name: 'Cetirizine',
    brand: 'Zyrtec',
    category: 'Allergy',
    description: 'Antihistamine used to relieve allergy symptoms like watery eyes, runny nose, and sneezing.',
    prescriptionRequired: false,
    manufacturer: 'Johnson & Johnson',
  },
  {
    name: 'Metformin',
    brand: 'Glucophage',
    category: 'Diabetes',
    description: 'First-line medication for the treatment of type 2 diabetes.',
    prescriptionRequired: true,
    manufacturer: 'Bristol-Myers Squibb',
  },
  {
    name: 'Omeprazole',
    brand: 'Prilosec',
    category: 'Gastrointestinal',
    description: 'Proton pump inhibitor (PPI) that decreases stomach acid production.',
    prescriptionRequired: false,
    manufacturer: 'AstraZeneca',
  },
  {
    name: 'Atorvastatin',
    brand: 'Lipitor',
    category: 'Cardiovascular',
    description: 'Statin medication used to prevent cardiovascular disease and lower lipid levels.',
    prescriptionRequired: true,
    manufacturer: 'Pfizer',
  },
  {
    name: 'Salbutamol',
    brand: 'Ventolin',
    category: 'Respiratory',
    description: 'Inhaler used for the relief of asthma and COPD symptoms.',
    prescriptionRequired: true,
    manufacturer: 'GlaxoSmithKline',
  },
  {
    name: 'Aspirin',
    brand: 'Bayer',
    category: 'Pain Relief',
    description: 'Used to reduce pain, fever, or inflammation.',
    prescriptionRequired: false,
    manufacturer: 'Bayer AG',
  }
];

const seedMedicines = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      console.error('Missing MONGODB_URI in env');
      process.exit(1);
    }
    
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB.');

    // Find an admin user to own these medicines
    const adminUser = await User.findOne({ role: 'ADMIN' });
    
    if (!adminUser) {
      console.error('No ADMIN user found in the database. Please create one first before seeding medicines.');
      process.exit(1);
    }

    console.log(`Found Admin User: ${adminUser.email}`);

    // Clear existing
    await Medicine.deleteMany({});
    console.log('Cleared existing medicines.');

    const medicinesToInsert = sampleMedicines.map(med => ({
      ...med,
      createdBy: adminUser._id,
    }));

    await Medicine.insertMany(medicinesToInsert);
    console.log(`Successfully seeded ${medicinesToInsert.length} medicines.`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding medicines:', error);
    process.exit(1);
  }
};

seedMedicines();
