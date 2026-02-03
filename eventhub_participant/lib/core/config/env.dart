class Env {
  static const _fromDefine = String.fromEnvironment('API_BASE_URL', defaultValue: '');
  static const String _devBase = 'http://10.0.2.2:5000';
  static const String _prodBase = 'https://api.example.com';

  static String get apiBaseUrl {
    if (_fromDefine != null && _fromDefine.isNotEmpty) return _fromDefine;
    const isProd = bool.fromEnvironment('dart.vm.product');
    return isProd ? _prodBase : _devBase;
  }
}
