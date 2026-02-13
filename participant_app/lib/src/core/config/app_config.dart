import 'package:flutter/foundation.dart';

class AppConfig {
  static const _defaultWeb = 'http://localhost:5000/api';
  static const _defaultAndroidEmulator = 'http://10.0.2.2:5000/api';

  static String get baseApiUrl {
    const fromDefine = String.fromEnvironment('API_BASE_URL');
    if (fromDefine.isNotEmpty) {
      return _normalize(fromDefine);
    }

    if (kIsWeb) {
      return _defaultWeb;
    }

    return _defaultAndroidEmulator;
  }

  static String resolveBackendFileUrl(String rawPath) {
    if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
      return rawPath;
    }

    final origin = baseApiUrl.replaceFirst(RegExp(r'/api/?$'), '');
    final normalized = rawPath.startsWith('/') ? rawPath : '/$rawPath';
    return '$origin$normalized';
  }

  static String _normalize(String value) {
    if (value.endsWith('/')) {
      return value.substring(0, value.length - 1);
    }
    return value;
  }
}
