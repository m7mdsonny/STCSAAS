class Env {
  static const String apiUrl = String.fromEnvironment(
    'API_URL',
    defaultValue: 'http://localhost:8000/api/v1',
  );

  static const String appName = 'STC AI-VAP';
  static const String appVersion = '1.0.0';

  static const bool enableOfflineMode = true;
  static const bool enableDebugMode = false;
}
