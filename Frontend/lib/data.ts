export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  date: string;
  category: 'vaccine' | 'medicine' | 'growth' | 'pregnancy' | 'checkup';
  status: 'completed' | 'due' | 'overdue' | 'upcoming';
  aiExplanation?: string;
}

export interface GrowthRecord {
  date: string;
  height: number;
  weight: number;
  milestone?: string;
}

export interface Dependent {
  id: string;
  name: string;
  relation: 'child' | 'spouse' | 'parent' | 'self';
  dob: string;
  gender: 'male' | 'female';
  avatar: string;
  timeline: TimelineEvent[];
  growthRecords: GrowthRecord[];
  pregnancyWeek?: number;
  edd?: string;
  highRiskFlags?: string[];
}

export interface Medicine {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  forDependent: string;
  safety: 'safe' | 'caution' | 'avoid';
  active: boolean;
  startDate: string;
  endDate?: string;
  dosesTaken: number;
  totalDoses: number;
}

export interface Reminder {
  id: string;
  title: string;
  description: string;
  time: string;
  forDependent: string;
  done: boolean;
  category: 'vaccine' | 'medicine' | 'checkup' | 'growth';
}

export interface HealthCenter {
  id: string;
  name: string;
  type: 'PHC' | 'Hospital' | 'Clinic' | 'ASHA';
  distance: string;
  openNow: boolean;
  phone: string;
  address: string;
  specialties: string[];
}

export interface Family {
  id: string;
  name: string;
  language: string;
  dependents: Dependent[];
  medicines: Medicine[];
  reminders: Reminder[];
  healthCenters: HealthCenter[];
  schemes: { name: string; description: string; eligible: boolean }[];
}

export interface DemoLoginAccount {
  familyId: string;
  familyName: string;
  username: string;
  email: string;
  password: string;
}

const sharmaTimeline: TimelineEvent[] = [
  { id: 'e1', title: 'BCG Vaccine', description: 'Bacillus Calmette-Guérin vaccine for tuberculosis protection', date: '2024-01-20', category: 'vaccine', status: 'completed', aiExplanation: 'BCG vaccine protects your baby against tuberculosis (TB), a serious lung disease. It is given at birth or within the first few weeks. The small bump on the arm is normal and shows the vaccine is working.' },
  { id: 'e2', title: 'OPV Dose 0', description: 'Oral Polio Vaccine - Birth dose', date: '2024-01-20', category: 'vaccine', status: 'completed', aiExplanation: 'This is the first polio drop given at birth. Polio can cause paralysis in children. This vaccine is given as drops in the mouth and is completely safe.' },
  { id: 'e3', title: 'Hepatitis B - Birth', description: 'First dose of Hepatitis B vaccine', date: '2024-01-21', category: 'vaccine', status: 'completed', aiExplanation: 'Hepatitis B is a liver infection. This first dose given within 24 hours of birth protects your baby early. Three more doses will follow to complete protection.' },
  { id: 'e4', title: 'OPV Dose 1', description: 'Oral Polio Vaccine - First dose', date: '2024-03-15', category: 'vaccine', status: 'completed', aiExplanation: 'This is the second round of polio drops. Given at 6 weeks of age, it strengthens your baby\'s protection against polio virus.' },
  { id: 'e5', title: 'Pentavalent 1', description: 'DPT + HepB + Hib combined vaccine', date: '2024-03-15', category: 'vaccine', status: 'completed', aiExplanation: 'This single injection protects against 5 diseases: Diphtheria, Pertussis (whooping cough), Tetanus, Hepatitis B, and Haemophilus influenzae type b. Some mild fever after is normal.' },
  { id: 'e6', title: 'Rotavirus Dose 1', description: 'Rotavirus vaccine for diarrhea prevention', date: '2024-03-15', category: 'vaccine', status: 'completed', aiExplanation: 'Rotavirus causes severe diarrhea in babies. This oral vaccine protects your child from getting very sick with watery stools and vomiting.' },
  { id: 'e7', title: 'Weight Check - 6 months', description: 'Routine growth monitoring', date: '2024-07-20', category: 'growth', status: 'completed', aiExplanation: 'Regular weight checks help ensure your baby is growing well. At 6 months, babies typically double their birth weight.' },
  { id: 'e8', title: 'OPV Dose 3', description: 'Oral Polio Vaccine - Third dose', date: '2024-07-15', category: 'vaccine', status: 'completed', aiExplanation: 'The third polio dose further strengthens immunity. After this, your child needs one more booster dose later.' },
  { id: 'e9', title: 'Measles/MR Dose 1', description: 'Measles-Rubella first dose at 9 months', date: '2024-10-20', category: 'vaccine', status: 'due', aiExplanation: 'Measles can be very dangerous for children. This vaccine given at 9 months provides the first layer of protection. A second dose will be given at 16 months for full immunity.' },
  { id: 'e10', title: 'Vitamin A - 1st Dose', description: 'Vitamin A supplementation', date: '2024-10-20', category: 'medicine', status: 'due', aiExplanation: 'Vitamin A helps your child\'s eyes and immune system stay healthy. It is given as drops every 6 months starting at 9 months of age.' },
  { id: 'e11', title: 'IPV Booster', description: 'Injectable Polio Vaccine booster', date: '2025-03-20', category: 'vaccine', status: 'upcoming', aiExplanation: 'This injectable polio booster at 14 months ensures long-lasting protection against all types of polio virus.' },
  { id: 'e12', title: 'DPT Booster 1', description: 'First DPT booster dose', date: '2025-07-20', category: 'vaccine', status: 'upcoming', aiExplanation: 'The DPT booster at 16-24 months reinforces protection against Diphtheria, Pertussis, and Tetanus that was started with the Pentavalent vaccines.' },
];

const patelTimeline: TimelineEvent[] = [
  { id: 'p1', title: 'BCG Vaccine', description: 'TB protection vaccine', date: '2023-06-10', category: 'vaccine', status: 'completed', aiExplanation: 'BCG vaccine given at birth protects against tuberculosis.' },
  { id: 'p2', title: 'OPV Dose 0', description: 'Birth polio drops', date: '2023-06-10', category: 'vaccine', status: 'completed', aiExplanation: 'First polio drops given at birth.' },
  { id: 'p3', title: 'Pentavalent 1', description: '5-in-1 vaccine first dose', date: '2023-07-22', category: 'vaccine', status: 'completed', aiExplanation: 'Protects against 5 diseases in one injection.' },
  { id: 'p4', title: 'Pentavalent 2', description: '5-in-1 vaccine second dose', date: '2023-08-26', category: 'vaccine', status: 'completed', aiExplanation: 'Second dose strengthens immunity from the first dose.' },
  { id: 'p5', title: 'Pentavalent 3', description: '5-in-1 vaccine third dose', date: '2023-10-07', category: 'vaccine', status: 'completed', aiExplanation: 'Final primary dose of the 5-in-1 vaccine series.' },
  { id: 'p6', title: 'Measles/MR Dose 1', description: 'First measles-rubella vaccine', date: '2024-03-10', category: 'vaccine', status: 'completed', aiExplanation: 'First dose of measles protection given at 9 months.' },
  { id: 'p7', title: 'MR Dose 2', description: 'Second measles-rubella vaccine', date: '2024-10-10', category: 'vaccine', status: 'overdue', aiExplanation: 'The second MR dose at 16 months completes measles protection. This is overdue and should be given as soon as possible.' },
  { id: 'p8', title: 'DPT Booster 1', description: 'First DPT booster', date: '2024-12-10', category: 'vaccine', status: 'overdue', aiExplanation: 'DPT booster reinforces protection. This is overdue - please visit your health center.' },
  { id: 'p9', title: 'OPV Booster', description: 'Oral polio booster dose', date: '2025-01-10', category: 'vaccine', status: 'due', aiExplanation: 'Polio booster dose to maintain strong immunity.' },
  { id: 'p10', title: 'Weight & Height Check', description: 'Growth monitoring at 2 years', date: '2025-06-10', category: 'growth', status: 'upcoming', aiExplanation: 'Regular growth monitoring ensures your child is developing normally.' },
];

export const demoFamilies: Family[] = [
  {
    id: 'sharma',
    name: 'Sharma',
    language: 'Hindi',
    dependents: [
      {
        id: 'd1',
        name: 'Priya Sharma',
        relation: 'self',
        dob: '1995-05-12',
        gender: 'female',
        avatar: '👩',
        timeline: [
          { id: 'ps1', title: 'Annual Health Checkup', description: 'Routine blood work and physical exam', date: '2025-02-15', category: 'checkup', status: 'upcoming', aiExplanation: 'Annual checkups help detect health issues early. Blood tests check for diabetes, thyroid, and anemia which are common in women.' },
        ],
        growthRecords: [],
        pregnancyWeek: 28,
        edd: '2025-09-15',
        highRiskFlags: ['Gestational Diabetes - Monitor blood sugar', 'Low hemoglobin - Take iron supplements'],
      },
      {
        id: 'd2',
        name: 'Aarav Sharma',
        relation: 'child',
        dob: '2024-01-15',
        gender: 'male',
        avatar: '👶',
        timeline: sharmaTimeline,
        growthRecords: [
          { date: '2024-01-15', height: 50, weight: 3.2, milestone: 'Birth' },
          { date: '2024-03-15', height: 58, weight: 5.1, milestone: 'Holds head up' },
          { date: '2024-07-15', height: 67, weight: 7.5, milestone: 'Sits without support' },
          { date: '2024-10-15', height: 72, weight: 8.8, milestone: 'Crawling' },
        ],
      },
      {
        id: 'd3',
        name: 'Rajesh Sharma',
        relation: 'spouse',
        dob: '1992-08-20',
        gender: 'male',
        avatar: '👨',
        timeline: [
          { id: 'rs1', title: 'Blood Pressure Check', description: 'Routine BP monitoring', date: '2025-01-10', category: 'checkup', status: 'due', aiExplanation: 'Regular blood pressure checks help prevent heart disease and stroke. Adults should check BP at least once a year.' },
        ],
        growthRecords: [],
      },
    ],
    medicines: [
      { id: 'm1', name: 'Iron + Folic Acid', dosage: '1 tablet', frequency: 'Daily after lunch', forDependent: 'd1', safety: 'safe', active: true, startDate: '2025-01-01', dosesTaken: 45, totalDoses: 180 },
      { id: 'm2', name: 'Calcium + Vitamin D3', dosage: '500mg', frequency: 'Twice daily', forDependent: 'd1', safety: 'safe', active: true, startDate: '2025-01-01', dosesTaken: 90, totalDoses: 360 },
      { id: 'm3', name: 'Paracetamol Drops', dosage: '0.6ml', frequency: 'As needed for fever', forDependent: 'd2', safety: 'caution', active: false, startDate: '2024-10-01', endDate: '2024-10-05', dosesTaken: 6, totalDoses: 6 },
    ],
    reminders: [
      { id: 'r1', title: 'Aarav - MR Dose 1', description: 'Measles-Rubella vaccine due at 9 months', time: '2024-10-20 09:00', forDependent: 'd2', done: false, category: 'vaccine' },
      { id: 'r2', title: 'Priya - Iron Tablet', description: 'Take iron supplement after lunch', time: 'Daily 13:00', forDependent: 'd1', done: false, category: 'medicine' },
      { id: 'r3', title: 'Priya - Prenatal Checkup', description: '28-week prenatal visit', time: '2025-02-10 10:00', forDependent: 'd1', done: false, category: 'checkup' },
      { id: 'r4', title: 'Aarav - Weight Check', description: 'Monthly growth monitoring', time: '2025-02-15 11:00', forDependent: 'd2', done: true, category: 'growth' },
      { id: 'r5', title: 'Rajesh - BP Check', description: 'Blood pressure monitoring', time: '2025-01-10 09:00', forDependent: 'd3', done: false, category: 'checkup' },
    ],
    healthCenters: [
      { id: 'h1', name: 'Government PHC Andheri', type: 'PHC', distance: '1.2 km', openNow: true, phone: '+91-22-2631-XXXX', address: 'Near Andheri Station, Mumbai', specialties: ['General', 'Pediatrics', 'Maternal Care'] },
      { id: 'h2', name: 'District Hospital Jogeshwari', type: 'Hospital', distance: '3.5 km', openNow: true, phone: '+91-22-2678-XXXX', address: 'SV Road, Jogeshwari West', specialties: ['Emergency', 'Surgery', 'Pediatrics', 'Gynecology'] },
      { id: 'h3', name: 'Sunita Devi - ASHA Worker', type: 'ASHA', distance: '0.3 km', openNow: true, phone: '+91-98765-XXXXX', address: 'Block 4, Sector 7', specialties: ['Home Visits', 'Vaccination', 'Maternal Counseling'] },
      { id: 'h4', name: 'LifeCare Clinic', type: 'Clinic', distance: '0.8 km', openNow: false, phone: '+91-22-2634-XXXX', address: 'Market Road, Andheri East', specialties: ['General Medicine', 'Diagnostics'] },
    ],
    schemes: [
      { name: 'Janani Suraksha Yojana', description: 'Cash assistance for institutional delivery and prenatal care', eligible: true },
      { name: 'Mission Indradhanush', description: 'Free vaccination drive for children under 2 years', eligible: true },
      { name: 'PMJAY - Ayushman Bharat', description: 'Health insurance cover of ₹5 lakh per family per year', eligible: true },
      { name: 'Rashtriya Bal Swasthya Karyakram', description: 'Free health screening for children 0-18 years', eligible: true },
    ],
  },
  {
    id: 'patel',
    name: 'Patel',
    language: 'Gujarati',
    dependents: [
      {
        id: 'pd1',
        name: 'Meera Patel',
        relation: 'self',
        dob: '1998-11-03',
        gender: 'female',
        avatar: '👩',
        timeline: [
          { id: 'mp1', title: 'Dental Checkup', description: 'Routine dental examination', date: '2025-03-01', category: 'checkup', status: 'upcoming', aiExplanation: 'Regular dental checkups every 6 months help prevent cavities and gum disease.' },
        ],
        growthRecords: [],
      },
      {
        id: 'pd2',
        name: 'Anaya Patel',
        relation: 'child',
        dob: '2023-06-10',
        gender: 'female',
        avatar: '👧',
        timeline: patelTimeline,
        growthRecords: [
          { date: '2023-06-10', height: 48, weight: 2.9, milestone: 'Birth' },
          { date: '2023-09-10', height: 60, weight: 5.5, milestone: 'Social smile' },
          { date: '2024-01-10', height: 68, weight: 7.2, milestone: 'Rolling over' },
          { date: '2024-06-10', height: 75, weight: 8.5, milestone: 'First words' },
          { date: '2024-12-10', height: 80, weight: 10.2, milestone: 'Walking independently' },
        ],
      },
      {
        id: 'pd3',
        name: 'Dadi Patel',
        relation: 'parent',
        dob: '1955-02-14',
        gender: 'female',
        avatar: '👵',
        timeline: [
          { id: 'dp1', title: 'Diabetes Checkup', description: 'Quarterly HbA1c and blood sugar monitoring', date: '2025-01-15', category: 'checkup', status: 'overdue', aiExplanation: 'For diabetes patients, checking HbA1c every 3 months shows how well blood sugar has been controlled. This is overdue.' },
          { id: 'dp2', title: 'Eye Examination', description: 'Annual diabetic retinopathy screening', date: '2025-04-01', category: 'checkup', status: 'upcoming', aiExplanation: 'Diabetes can affect eyesight over time. Annual eye exams help catch problems early.' },
        ],
        growthRecords: [],
      },
    ],
    medicines: [
      { id: 'pm1', name: 'Metformin 500mg', dosage: '1 tablet', frequency: 'Twice daily with meals', forDependent: 'pd3', safety: 'caution', active: true, startDate: '2024-01-01', dosesTaken: 600, totalDoses: 730 },
      { id: 'pm2', name: 'Multivitamin Syrup', dosage: '5ml', frequency: 'Once daily morning', forDependent: 'pd2', safety: 'safe', active: true, startDate: '2024-12-01', dosesTaken: 60, totalDoses: 180 },
    ],
    reminders: [
      { id: 'pr1', title: 'Anaya - MR Dose 2', description: 'Second measles-rubella vaccine (OVERDUE)', time: '2024-10-10 09:00', forDependent: 'pd2', done: false, category: 'vaccine' },
      { id: 'pr2', title: 'Anaya - DPT Booster', description: 'DPT booster dose (OVERDUE)', time: '2024-12-10 09:00', forDependent: 'pd2', done: false, category: 'vaccine' },
      { id: 'pr3', title: 'Dadi - Diabetes Checkup', description: 'Quarterly blood sugar test (OVERDUE)', time: '2025-01-15 10:00', forDependent: 'pd3', done: false, category: 'checkup' },
      { id: 'pr4', title: 'Dadi - Metformin', description: 'Morning and evening dose', time: 'Daily 08:00, 20:00', forDependent: 'pd3', done: false, category: 'medicine' },
    ],
    healthCenters: [
      { id: 'ph1', name: 'CHC Vadodara', type: 'PHC', distance: '2.0 km', openNow: true, phone: '+91-265-234-XXXX', address: 'Near Bus Stand, Vadodara', specialties: ['General', 'Pediatrics'] },
      { id: 'ph2', name: 'SSG Hospital', type: 'Hospital', distance: '4.5 km', openNow: true, phone: '+91-265-242-XXXX', address: 'Jail Road, Vadodara', specialties: ['Emergency', 'Surgery', 'Medicine', 'Pediatrics'] },
      { id: 'ph3', name: 'Kavita Ben - ASHA Worker', type: 'ASHA', distance: '0.5 km', openNow: true, phone: '+91-97654-XXXXX', address: 'Ward 12, Sector 3', specialties: ['Home Visits', 'Elderly Care', 'Child Health'] },
    ],
    schemes: [
      { name: 'Mission Indradhanush', description: 'Free vaccination drive for children', eligible: true },
      { name: 'PMJAY - Ayushman Bharat', description: 'Health insurance ₹5 lakh coverage', eligible: true },
      { name: 'National Programme for Elderly', description: 'Free health services for senior citizens', eligible: true },
    ],
  },
  {
    id: 'kumar',
    name: 'Kumar',
    language: 'Hindi',
    dependents: [
      {
        id: 'kd1',
        name: 'Neha Kumar',
        relation: 'self',
        dob: '1994-03-10',
        gender: 'female',
        avatar: '👩',
        timeline: [
          { id: 'kt1', title: 'Postnatal Checkup', description: '6-week maternal follow-up', date: '2025-01-22', category: 'checkup', status: 'completed', aiExplanation: 'This visit checks recovery after delivery and helps detect anemia or blood pressure concerns early.' },
        ],
        growthRecords: [],
      },
      {
        id: 'kd2',
        name: 'Aditya Kumar',
        relation: 'child',
        dob: '2024-10-15',
        gender: 'male',
        avatar: '👶',
        timeline: [
          { id: 'kt2', title: 'Pentavalent 1', description: '6-week immunization dose', date: '2024-11-26', category: 'vaccine', status: 'completed', aiExplanation: 'First pentavalent dose gives broad protection from five serious infections.' },
          { id: 'kt3', title: 'Pentavalent 2', description: '10-week immunization dose', date: '2024-12-24', category: 'vaccine', status: 'completed', aiExplanation: 'Second dose boosts immunity developed from the first dose.' },
          { id: 'kt4', title: 'Pentavalent 3', description: '14-week immunization dose', date: '2025-01-21', category: 'vaccine', status: 'due', aiExplanation: 'Third dose completes the primary pentavalent schedule and should be taken soon.' },
        ],
        growthRecords: [
          { date: '2024-10-15', height: 49, weight: 3.0, milestone: 'Birth' },
          { date: '2024-12-15', height: 56, weight: 4.8, milestone: 'Responds to voice' },
        ],
      },
    ],
    medicines: [
      { id: 'km1', name: 'Vitamin D Drops', dosage: '0.5ml', frequency: 'Daily', forDependent: 'kd2', safety: 'safe', active: true, startDate: '2024-10-20', dosesTaken: 90, totalDoses: 180 },
    ],
    reminders: [
      { id: 'kr1', title: 'Aditya - Pentavalent 3', description: 'Complete 14-week dose', time: '2025-01-21 10:00', forDependent: 'kd2', done: false, category: 'vaccine' },
      { id: 'kr2', title: 'Aditya - Monthly Growth', description: 'Track weight and feeding', time: '2025-02-15 11:00', forDependent: 'kd2', done: false, category: 'growth' },
    ],
    healthCenters: [
      { id: 'kh1', name: 'PHC Patna Central', type: 'PHC', distance: '1.4 km', openNow: true, phone: '+91-612-233-XXXX', address: 'Main Road, Patna', specialties: ['Pediatrics', 'Maternal Care'] },
    ],
    schemes: [
      { name: 'Janani Suraksha Yojana', description: 'Cash support for maternal care', eligible: true },
      { name: 'Mission Indradhanush', description: 'Routine immunization support', eligible: true },
    ],
  },
  {
    id: 'singh',
    name: 'Singh',
    language: 'Punjabi',
    dependents: [
      {
        id: 'sd1',
        name: 'Harleen Singh',
        relation: 'child',
        dob: '2022-08-10',
        gender: 'female',
        avatar: '👧',
        timeline: [
          { id: 'st1', title: 'MR Dose 2', description: 'Second measles-rubella dose', date: '2024-01-10', category: 'vaccine', status: 'completed', aiExplanation: 'Second MR dose strengthens long-term immunity against measles and rubella.' },
          { id: 'st2', title: 'DPT Booster', description: 'First booster dose', date: '2025-02-10', category: 'vaccine', status: 'upcoming', aiExplanation: 'Booster dose reinforces protection in toddler age when immunity can decline.' },
        ],
        growthRecords: [
          { date: '2022-08-10', height: 50, weight: 3.1, milestone: 'Birth' },
          { date: '2023-08-10', height: 74, weight: 8.9, milestone: 'Walks with support' },
          { date: '2024-08-10', height: 87, weight: 11.7, milestone: 'Speaks two-word phrases' },
        ],
      },
    ],
    medicines: [
      { id: 'sm1', name: 'Calcium Syrup', dosage: '5ml', frequency: 'Daily', forDependent: 'sd1', safety: 'safe', active: true, startDate: '2024-12-01', dosesTaken: 70, totalDoses: 120 },
    ],
    reminders: [
      { id: 'sr1', title: 'Harleen - DPT Booster', description: 'Visit immunization clinic', time: '2025-02-10 09:30', forDependent: 'sd1', done: false, category: 'vaccine' },
    ],
    healthCenters: [
      { id: 'sh1', name: 'Civil Hospital Amritsar', type: 'Hospital', distance: '2.9 km', openNow: true, phone: '+91-183-271-XXXX', address: 'Queens Road, Amritsar', specialties: ['Pediatrics', 'General Medicine'] },
    ],
    schemes: [
      { name: 'Universal Immunization Programme', description: 'Free child vaccination schedule', eligible: true },
    ],
  },
  {
    id: 'verma',
    name: 'Verma',
    language: 'Hindi',
    dependents: [
      {
        id: 'vd1',
        name: 'Saanvi Verma',
        relation: 'child',
        dob: '2019-05-12',
        gender: 'female',
        avatar: '🧒',
        timeline: [
          { id: 'vt1', title: 'School Health Screening', description: 'Annual vision and hearing check', date: '2025-01-18', category: 'checkup', status: 'due', aiExplanation: 'Routine school-age screenings help detect vision, hearing, and growth concerns early.' },
          { id: 'vt2', title: 'Deworming Dose', description: 'Biannual deworming tablet', date: '2025-03-01', category: 'medicine', status: 'upcoming', aiExplanation: 'Regular deworming improves nutrition absorption and supports healthy growth.' },
        ],
        growthRecords: [
          { date: '2023-05-12', height: 98, weight: 14.5, milestone: 'Preschool age check' },
          { date: '2024-05-12', height: 106, weight: 16.8, milestone: 'Started school' },
        ],
      },
    ],
    medicines: [
      { id: 'vm1', name: 'Iron Tonic', dosage: '5ml', frequency: 'Daily', forDependent: 'vd1', safety: 'safe', active: true, startDate: '2025-01-10', dosesTaken: 45, totalDoses: 90 },
    ],
    reminders: [
      { id: 'vr1', title: 'Saanvi - School Health Check', description: 'Vision, hearing, and dental screening', time: '2025-01-18 10:00', forDependent: 'vd1', done: false, category: 'checkup' },
      { id: 'vr2', title: 'Saanvi - Deworming', description: 'Biannual dose reminder', time: '2025-03-01 09:00', forDependent: 'vd1', done: false, category: 'medicine' },
    ],
    healthCenters: [
      { id: 'vh1', name: 'District Clinic Indore', type: 'Clinic', distance: '1.9 km', openNow: true, phone: '+91-731-276-XXXX', address: 'MG Road, Indore', specialties: ['Pediatrics', 'School Health'] },
    ],
    schemes: [
      { name: 'Rashtriya Bal Swasthya Karyakram', description: 'Child health screening and early intervention', eligible: true },
    ],
  },
];

const DEMO_PASSWORD = process.env.NEXT_PUBLIC_DEMO_PASSWORD || 'Vaxi Babu_demo_secure_2026';

export const demoLoginAccounts: DemoLoginAccount[] = [
  { familyId: 'sharma', familyName: 'Sharma Family', username: 'sharma', email: 'sharma@Vaxi Babu.demo', password: DEMO_PASSWORD },
  { familyId: 'patel', familyName: 'Patel Family', username: 'patel', email: 'patel@Vaxi Babu.demo', password: DEMO_PASSWORD },
  { familyId: 'kumar', familyName: 'Kumar Family', username: 'kumar', email: 'kumar@Vaxi Babu.demo', password: DEMO_PASSWORD },
  { familyId: 'singh', familyName: 'Singh Family', username: 'singh', email: 'singh@Vaxi Babu.demo', password: DEMO_PASSWORD },
  { familyId: 'verma', familyName: 'Verma Family', username: 'verma', email: 'verma@Vaxi Babu.demo', password: DEMO_PASSWORD },
];

export function getDemoLoginAccount(familyId: string): DemoLoginAccount | undefined {
  return demoLoginAccounts.find((account) => account.familyId === familyId);
}
