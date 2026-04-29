class AppConfig {
  const AppConfig._();

  static const String appName = 'Vaxi Babu';

  // API
  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'https://vaxi-babu.fastapicloud.dev/api/v1',
  );

  // Gemini (for mobile voice)
  static const String geminiApiKey = String.fromEnvironment(
    'GEMINI_API_KEY',
    defaultValue: '',
  );

  static const String geminiModel = String.fromEnvironment(
    'GEMINI_MODEL',
    defaultValue: 'gemini-3.1-flash-live-preview',
  );

  // Environment name
  static const String env = String.fromEnvironment(
    'ENV',
    defaultValue: 'production',
  );

  static bool get isDev => env == 'dev';

  static const Duration connectTimeout = Duration(seconds: 20);
  static const Duration receiveTimeout = Duration(seconds: 60);
}

