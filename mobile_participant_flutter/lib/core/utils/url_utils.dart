import '../config/app_config.dart';

class UrlUtils {
  static String resolve(String rawUrl) {
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      return rawUrl;
    }

    final normalizedBase = AppConfig.apiBaseUrl.replaceAll(RegExp(r'/$'), '');
    final normalizedPath = rawUrl.startsWith('/') ? rawUrl : '/$rawUrl';
    return '$normalizedBase$normalizedPath';
  }
}

