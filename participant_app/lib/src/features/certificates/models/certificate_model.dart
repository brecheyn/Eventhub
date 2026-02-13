import '../../events/models/event_model.dart';

class CertificateModel {
  CertificateModel({
    required this.id,
    required this.certificateNumber,
    required this.issuedDate,
    required this.event,
    this.pdfUrl,
  });

  final String id;
  final String certificateNumber;
  final DateTime issuedDate;
  final EventModel event;
  final String? pdfUrl;

  factory CertificateModel.fromJson(Map<String, dynamic> json) {
    return CertificateModel(
      id: json['id'].toString(),
      certificateNumber: json['certificateNumber']?.toString() ?? '',
      issuedDate: DateTime.parse(json['issuedDate'].toString()),
      event: EventModel.fromJson(json['event'] as Map<String, dynamic>),
      pdfUrl: json['pdfUrl']?.toString(),
    );
  }
}
