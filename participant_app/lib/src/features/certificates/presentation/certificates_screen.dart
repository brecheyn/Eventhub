import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../../core/config/app_config.dart';
import '../models/certificate_model.dart';
import 'certificates_controller.dart';

class CertificatesScreen extends StatefulWidget {
  const CertificatesScreen({super.key});

  @override
  State<CertificatesScreen> createState() => _CertificatesScreenState();
}

class _CertificatesScreenState extends State<CertificatesScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() => context.read<CertificatesController>().loadMyCertificates());
  }

  @override
  Widget build(BuildContext context) {
    final ctrl = context.watch<CertificatesController>();

    return RefreshIndicator(
      onRefresh: ctrl.loadMyCertificates,
      child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const Text(
            'Mes certificats',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 4),
          const Text('Telechargez vos certificats apres validation check-in.'),
          const SizedBox(height: 16),
          if (ctrl.isLoading && ctrl.certificates.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 80),
              child: Center(child: CircularProgressIndicator()),
            )
          else if (ctrl.error != null && ctrl.certificates.isEmpty)
            Padding(
              padding: const EdgeInsets.only(top: 80),
              child: Center(child: Text(ctrl.error!)),
            )
          else if (ctrl.certificates.isEmpty)
            const Padding(
              padding: EdgeInsets.only(top: 80),
              child: Center(child: Text('Aucun certificat disponible.')),
            )
          else
            ...ctrl.certificates.map((certificate) => _CertificateCard(certificate: certificate)),
        ],
      ),
    );
  }
}

class _CertificateCard extends StatelessWidget {
  const _CertificateCard({required this.certificate});

  final CertificateModel certificate;

  @override
  Widget build(BuildContext context) {
    final issued = DateFormat('dd MMM yyyy').format(certificate.issuedDate);

    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Card(
        child: ListTile(
          contentPadding: const EdgeInsets.all(14),
          title: Text(
            certificate.event.title,
            style: const TextStyle(fontWeight: FontWeight.w700),
          ),
          subtitle: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 6),
              Text('Certificat #: ${certificate.certificateNumber}'),
              Text('Delivre le: $issued'),
            ],
          ),
          trailing: IconButton(
            icon: const Icon(Icons.download_outlined),
            onPressed: () => _download(context),
            tooltip: 'Telecharger',
          ),
        ),
      ),
    );
  }

  Future<void> _download(BuildContext context) async {
    final raw = certificate.pdfUrl;
    if (raw == null || raw.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Lien PDF indisponible.')),
      );
      return;
    }

    final uri = Uri.parse(AppConfig.resolveBackendFileUrl(raw));

    if (!await launchUrl(uri, mode: LaunchMode.externalApplication) && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Impossible d ouvrir le fichier PDF.')),
      );
    }
  }
}
