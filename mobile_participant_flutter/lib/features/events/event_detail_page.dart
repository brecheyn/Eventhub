import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/network/api_exception.dart';
import '../../core/theme/app_colors.dart';
import '../../core/utils/url_utils.dart';
import '../../data/models/event_model.dart';
import '../auth/auth_controller.dart';

class EventDetailPage extends ConsumerStatefulWidget {
  const EventDetailPage({super.key, required this.eventId});

  final String eventId;

  @override
  ConsumerState<EventDetailPage> createState() => _EventDetailPageState();
}

class _EventDetailPageState extends ConsumerState<EventDetailPage> {
  bool _joining = false;
  late Future<EventModel> _eventFuture;

  @override
  void initState() {
    super.initState();
    _eventFuture = ref.read(eventServiceProvider).getEventById(widget.eventId);
  }

  Future<void> _joinEvent() async {
    setState(() => _joining = true);
    try {
      await ref.read(ticketServiceProvider).registerToEvent(widget.eventId);
      ref.invalidate(ticketsProvider);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Inscription validée. Ticket généré.')),
        );
      }
    } on ApiException catch (error) {
      if (mounted) {
        ScaffoldMessenger.of(context)
            .showSnackBar(SnackBar(content: Text(error.message)));
      }
    } finally {
      if (mounted) {
        setState(() => _joining = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Détail événement')),
      body: FutureBuilder<EventModel>(
        future: _eventFuture,
        builder: (context, snapshot) {
          if (snapshot.connectionState == ConnectionState.waiting) {
            return const Center(child: CircularProgressIndicator());
          }

          if (snapshot.hasError) {
            return Center(child: Text('Erreur: ${snapshot.error}'));
          }

          final event = snapshot.data;
          if (event == null) {
            return const Center(child: Text('Événement introuvable'));
          }

          final dateRange =
              '${DateFormat('dd MMM yyyy, HH:mm').format(event.startDate)} - ${DateFormat('dd MMM yyyy, HH:mm').format(event.endDate)}';

          return ListView(
            padding: const EdgeInsets.all(16),
            children: [
              Container(
                decoration: BoxDecoration(
                  color: AppColors.orange,
                  borderRadius: BorderRadius.circular(18),
                ),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      event.title,
                      style: Theme.of(context)
                          .textTheme
                          .titleLarge
                          ?.copyWith(color: Colors.white),
                    ),
                    const SizedBox(height: 8),
                    Text(dateRange, style: const TextStyle(color: Colors.white)),
                    const SizedBox(height: 4),
                    Text(event.location, style: const TextStyle(color: Colors.white)),
                  ],
                ),
              ),
              if (event.imageUrl != null) ...[
                const SizedBox(height: 14),
                ClipRRect(
                  borderRadius: BorderRadius.circular(16),
                  child: Image.network(
                    UrlUtils.resolve(event.imageUrl!),
                    height: 220,
                    fit: BoxFit.cover,
                  ),
                ),
              ],
              const SizedBox(height: 14),
              Text(event.description ?? 'Aucune description'),
              const SizedBox(height: 14),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(14),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text('Informations',
                          style: Theme.of(context).textTheme.titleMedium),
                      const SizedBox(height: 8),
                      Text('Type: ${event.eventType}'),
                      Text('Statut: ${event.status}'),
                      Text(
                          'Capacité: ${event.currentCapacity}/${event.maxCapacity}'),
                      Text(event.isFree
                          ? 'Tarif: Gratuit'
                          : 'Tarif: ${event.ticketPrice} FCFA'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                child: FilledButton(
                  onPressed: _joining ? null : _joinEvent,
                  child: _joining
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2),
                        )
                      : const Text("S'inscrire à l'événement"),
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'La génération du certificat se fait dans l’onglet "Certificats" après check-in.',
                style: Theme.of(context).textTheme.bodySmall,
              ),
              if (event.sessions.isNotEmpty) ...[
                const SizedBox(height: 16),
                Text('Sessions',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 8),
                ...event.sessions.map(
                  (session) => Card(
                    child: ListTile(
                      title: Text(session.title),
                      subtitle: Text(
                        '${DateFormat('HH:mm').format(session.startTime)} - ${DateFormat('HH:mm').format(session.endTime)}\n${session.speaker ?? 'Speaker non défini'}',
                      ),
                    ),
                  ),
                ),
              ],
            ],
          );
        },
      ),
    );
  }
}
