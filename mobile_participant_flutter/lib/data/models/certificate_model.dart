import 'event_model.dart';

class CertificateModel {
  const CertificateModel({
    required this.id,
    required this.certificateNumber,
    required this.pdfUrl,
    required this.issuedDate,
    required this.eventId,
    required this.participantId,
    this.event,
  });

  final String id;
  final String certificateNumber;
  final String pdfUrl;
  final DateTime issuedDate;
  final String eventId;
  final String participantId;
  final EventModel? event;

  factory CertificateModel.fromJson(Map<String, dynamic> json) {
    return CertificateModel(
      id: json['id'] as String,
      certificateNumber: json['certificateNumber'] as String? ?? '',
      pdfUrl: json['pdfUrl'] as String? ?? '',
      issuedDate: DateTime.parse(json['issuedDate'] as String),
      eventId: json['eventId'] as String,
      participantId: json['participantId'] as String,
      event: json['event'] is Map<String, dynamic>
          ? EventModel.fromJson(json['event'] as Map<String, dynamic>)
          : null,
    );
  }
}

