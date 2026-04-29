// Contact information for Vaxi Babu mobile app
// Use this file when continuing development on another device

class AppContacts {
  AppContacts._();

  // ===== Emergency Helplines (India) =====
  static const ambulance = '102';
  static const emergencyNumber = '112';
  static const police = '100';
  static const fire = '101';
  static const womenHelpline = '1091';
  static const childHelpline = '1098';
  static const healthMinistry = '1075';

  // ===== Medical & Health Services =====
  static const medicalEmergency = '102';
  static const nationalHealthMission = '1800-180-1104';
  static const ayushmanBharat = '14555';
  static const covidHelpline = '1075';
  static const mentalHealthHelpline = '9152987821'; // Vandrevala Foundation
  static const poisonControl = '1066';

  // ===== Pregnancy & Maternal Health =====
  static const pregnancyHelpline = '104';
  static const maternalHealthHelp = '1800-180-1104';

  // ===== Developer & Support =====
  static const developerEmail = 'varad@example.com'; // Update with actual email
  static const supportEmail = 'support@vaxibabu.com'; // Update with actual
  static const githubRepo = 'https://github.com/varad/Hackathons/WellSyncAI';
  static const projectLead = 'Varad Joshi';

  // ===== API Endpoints =====
  static const backendBaseUrl = 'http://localhost:8080';
  static const apiBasePath = '/api/v1';
  static const fullApiBase = '$backendBaseUrl$apiBasePath';

  // ===== Key API Routes =====
  static const householdsEndpoint = '$apiBasePath/households';
  static const loginEndpoint = '$apiBasePath/auth/login';
  static const pregnancyEndpoint = '$apiBasePath/pregnancy';
  static const growthEndpoint = '$apiBasePath/growth';
  static const dependentsEndpoint = '$apiBasePath/dependents';
  static const timelineEndpoint = '$apiBasePath/timeline';
  static const remindersEndpoint = '$apiBasePath/reminders';
  static const voiceEndpoint = '$apiBasePath/voice';

  // ===== Gemini AI (Voice Integration) =====
  static const geminiApiBase = 'https://generativelanguage.googleapis.com';
  static const geminiModel = 'gemini-2.0-flash-live-001';

  // ===== Database (Supabase/PostgreSQL) =====
  static const databaseHost = 'localhost';
  static const databasePort = 5432;
  static const databaseName = 'wellsyncai';

  // ===== Quick Reference Numbers =====
  static const Map<String, String> emergencyContacts = {
    'Ambulance': ambulance,
    'Emergency': emergencyNumber,
    'Police': police,
    'Fire': fire,
    'Women Helpline': womenHelpline,
    'Child Helpline': childHelpline,
    'Health Ministry': healthMinistry,
    'Medical Emergency': medicalEmergency,
    'Pregnancy Helpline': pregnancyHelpline,
    'Mental Health': mentalHealthHelpline,
    'Poison Control': poisonControl,
  };

  // ===== Support Channels =====
  static const Map<String, String> supportContacts = {
    'Developer': developerEmail,
    'Support': supportEmail,
    'GitHub': githubRepo,
    'Project Lead': projectLead,
  };
}
