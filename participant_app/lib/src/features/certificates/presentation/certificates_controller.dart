import 'package:flutter/foundation.dart';

import '../../../core/network/api_exception.dart';
import '../data/certificate_service.dart';
import '../models/certificate_model.dart';

class CertificatesController extends ChangeNotifier {
  CertificatesController(this._service);

  final CertificateService _service;

  List<CertificateModel> _certificates = [];
  bool _isLoading = false;
  String? _error;

  List<CertificateModel> get certificates => _certificates;
  bool get isLoading => _isLoading;
  String? get error => _error;

  Future<void> loadMyCertificates() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      _certificates = await _service.getMyCertificates();
    } on ApiException catch (e) {
      _error = e.message;
    } catch (e) {
      _error = e.toString();
    }

    _isLoading = false;
    notifyListeners();
  }

  Future<CertificateModel?> requestCertificate(String eventId) async {
    _error = null;
    notifyListeners();

    try {
      final certificate = await _service.generateForEvent(eventId);
      _certificates = [certificate, ..._certificates];
      notifyListeners();
      return certificate;
    } on ApiException catch (e) {
      _error = e.message;
      notifyListeners();
      return null;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return null;
    }
  }
}
