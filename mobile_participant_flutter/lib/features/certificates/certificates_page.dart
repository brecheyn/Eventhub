import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';
import 'package:url_launcher/url_launcher.dart';

import '../../core/network/api_exception.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/url_utils.dart';
import '../../data/models/certificate_model.dart';
import '../../data/models/ticket_model.dart';
import '../auth/auth_controller.dart';

class CertificatesPage extends ConsumerStatefulWidget {
  const CertificatesPage({super.key});

  @override
  ConsumerState<CertificatesPage> createState() => _CertificatesPageState();
}

class _CertificatesPageState extends ConsumerState<CertificatesPage> {
  String? _generatingEventId;

  Future<void> _openFile(BuildContext context, String pdfUrl) async {
    final resolved = UrlUtils.resolve(pdfUrl);
    final uri = Uri.parse(resolved);
    final launched = await launchUrl(uri, mode: LaunchMode.externalApplication);

    if (!launched && context.mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
            content: Text('Impossible de télécharger le certificat.')),
      );
    }
  }

  Future<void> _generateCertificate(String eventId) async {
    setState(() => _generatingEventId = eventId);

    try {
      await ref.read(certificateServiceProvider).generateCertificate(eventId);
      ref.invalidate(certificatesProvider);

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Certificat généré avec succès !')),
        );
      }
    } on ApiException catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(error.message)),
        );
      }
    } finally {
      if (mounted) {
        setState(() => _generatingEventId = null);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final certificatesAsync = ref.watch(certificatesProvider);
    final ticketsAsync = ref.watch(ticketsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Mes certificats')),
      body: RefreshIndicator(
        onRefresh: () async {
          ref.invalidate(certificatesProvider);
          ref.invalidate(ticketsProvider);
        },
        child: certificatesAsync.when(
          loading: () => const Center(child: CircularProgressIndicator()),
          error: (error, _) => ListView(
            children: [
              const SizedBox(height: 120),
              Center(child: Text('Erreur: $error')),
            ],
          ),
          data: (certificates) {
            return ticketsAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (error, _) => ListView(
                children: [
                  const SizedBox(height: 120),
                  Center(child: Text('Erreur: $error')),
                ],
              ),
              data: (tickets) => _buildContent(context, certificates, tickets),
            );
          },
        ),
      ),
    );
  }

  Widget _buildContent(
    BuildContext context,
    List<CertificateModel> certificates,
    List<TicketModel> tickets,
  ) {
    final certificateEventIds = certificates.map((c) => c.eventId).toSet();
    final eligibleTickets = tickets
        .where((t) => t.checkedIn && !certificateEventIds.contains(t.eventId))
        .toList();

    final hasNoCertificatesAndNoEligible =
        certificates.isEmpty && eligibleTickets.isEmpty;

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        _HeaderCard(
          certCount: certificates.length,
          eligibleCount: eligibleTickets.length,
        ),
        const SizedBox(height: 12),
        const _InfoCard(),
        const SizedBox(height: 16),
        if (eligibleTickets.isNotEmpty) ...[
          _SectionTitle(
            icon: Icons.add_circle_outline,
            title: 'Certificats à générer (${eligibleTickets.length})',
            color: AppColors.lightGreenDark,
          ),
          const SizedBox(height: 10),
          ...eligibleTickets.map(
            (ticket) => _EligibleCertificateCard(
              ticket: ticket,
              loading: _generatingEventId == ticket.eventId,
              onGenerate: () => _generateCertificate(ticket.eventId),
            ),
          ),
          const SizedBox(height: 8),
        ],
        if (certificates.isNotEmpty) ...[
          _SectionTitle(
            icon: Icons.verified_outlined,
            title: 'Mes certificats (${certificates.length})',
            color: AppColors.blueDark,
          ),
          const SizedBox(height: 10),
          ...certificates.map(
            (cert) => _CertificateCard(
              certificate: cert,
              onDownload: () => _openFile(context, cert.pdfUrl),
            ),
          ),
        ],
        if (hasNoCertificatesAndNoEligible) const _EmptyCertificatesState(),
      ],
    );
  }
}

class _HeaderCard extends StatelessWidget {
  const _HeaderCard({required this.certCount, required this.eligibleCount});

  final int certCount;
  final int eligibleCount;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.orange,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.workspace_premium, color: Colors.white),
              const SizedBox(width: 8),
              Text(
                'Mes Certificats',
                style: Theme.of(context)
                    .textTheme
                    .titleLarge
                    ?.copyWith(color: Colors.white),
              ),
            ],
          ),
          const SizedBox(height: 8),
          const Text(
            'Téléchargez vos certificats de participation',
            style: TextStyle(color: Colors.white),
          ),
          const SizedBox(height: 12),
          Wrap(
            spacing: 8,
            runSpacing: 8,
            children: [
              _CountBadge(label: 'Certificats générés', value: certCount),
              _CountBadge(label: 'Événements éligibles', value: eligibleCount),
            ],
          ),
        ],
      ),
    );
  }
}

class _CountBadge extends StatelessWidget {
  const _CountBadge({required this.label, required this.value});

  final String label;
  final int value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.2),
        borderRadius: BorderRadius.circular(999),
      ),
      child: Text(
        '$label: $value',
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w600,
        ),
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  const _InfoCard();

  @override
  Widget build(BuildContext context) {
    return const Card(
      color: AppColors.cardBlueTint,
      child: Padding(
        padding: EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Icon(Icons.info_outline, color: AppColors.blueDark),
                SizedBox(width: 8),
                Text(
                  'Comment obtenir un certificat ?',
                  style: TextStyle(fontWeight: FontWeight.w700),
                ),
              ],
            ),
            SizedBox(height: 10),
            Text('1. Inscrivez-vous à un événement'),
            Text('2. Participez et faites valider votre présence (check-in)'),
            Text('3. Après le check-in, générez votre certificat ci-dessous'),
          ],
        ),
      ),
    );
  }
}

class _SectionTitle extends StatelessWidget {
  const _SectionTitle({
    required this.icon,
    required this.title,
    required this.color,
  });

  final IconData icon;
  final String title;
  final Color color;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Icon(icon, color: color),
        const SizedBox(width: 8),
        Text(title, style: Theme.of(context).textTheme.titleMedium),
      ],
    );
  }
}

class _EligibleCertificateCard extends StatelessWidget {
  const _EligibleCertificateCard({
    required this.ticket,
    required this.loading,
    required this.onGenerate,
  });

  final TicketModel ticket;
  final bool loading;
  final VoidCallback onGenerate;

  @override
  Widget build(BuildContext context) {
    final event = ticket.event;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      color: AppColors.cardGreenTint,
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.workspace_premium,
                    color: AppColors.lightGreenDark),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    event?.title ?? 'Événement',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.lightGreen.withValues(alpha: 0.22),
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Text(
                    'Présent',
                    style: TextStyle(
                        color: AppColors.lightGreenDark,
                        fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text('Ticket: ${ticket.ticketNumber}'),
            const SizedBox(height: 4),
            Text(_eventDateAndLocation(event?.startDate, event?.location)),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: loading ? null : onGenerate,
                icon: loading
                    ? const SizedBox(
                        width: 16,
                        height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.workspace_premium),
                label:
                    Text(loading ? 'Génération...' : 'Générer mon certificat'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CertificateCard extends StatelessWidget {
  const _CertificateCard({
    required this.certificate,
    required this.onDownload,
  });

  final CertificateModel certificate;
  final VoidCallback onDownload;

  @override
  Widget build(BuildContext context) {
    final event = certificate.event;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      child: Padding(
        padding: const EdgeInsets.all(12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.verified, color: AppColors.blueDark),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    event?.title ?? 'Événement',
                    style: Theme.of(context).textTheme.titleMedium,
                  ),
                ),
                Container(
                  padding:
                      const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: AppColors.cardBlueTint,
                    borderRadius: BorderRadius.circular(999),
                  ),
                  child: const Text(
                    'Certifié',
                    style: TextStyle(
                        color: AppColors.blueDark, fontWeight: FontWeight.w600),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 8),
            Text(_eventDateAndLocation(event?.startDate, event?.location)),
            const SizedBox(height: 8),
            Text('N° ${certificate.certificateNumber}'),
            Text(
                'Émis le ${DateFormat('dd/MM/yyyy').format(certificate.issuedDate)}'),
            const SizedBox(height: 12),
            SizedBox(
              width: double.infinity,
              child: FilledButton.icon(
                onPressed: onDownload,
                icon: const Icon(Icons.download),
                label: const Text('Télécharger le PDF'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _EmptyCertificatesState extends StatelessWidget {
  const _EmptyCertificatesState();

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.only(top: 40),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 28),
        child: Column(
          children: [
            Icon(Icons.workspace_premium,
                size: 56, color: Colors.grey.shade400),
            const SizedBox(height: 12),
            Text(
              'Aucun certificat disponible',
              style: Theme.of(context).textTheme.titleMedium,
            ),
            const SizedBox(height: 8),
            const Text(
              'Participez à des événements et faites valider votre présence pour obtenir des certificats.',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

String _eventDateAndLocation(DateTime? startDate, String? location) {
  final date = startDate != null
      ? DateFormat('dd/MM/yyyy').format(startDate)
      : 'Date non définie';
  final place =
      (location == null || location.isEmpty) ? 'Lieu non défini' : location;
  return '$date • $place';
}
