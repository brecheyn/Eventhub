import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import 'package:provider/provider.dart';

import '../../../core/network/api_client.dart';
import '../../certificates/presentation/certificates_controller.dart';
import '../../tickets/presentation/tickets_controller.dart';
import '../data/event_service.dart';
import 'events_controller.dart';

class EventDetailArgs {
  EventDetailArgs({required this.eventId});

  final String eventId;
}

class EventDetailScreen extends StatelessWidget {
  const EventDetailScreen({super.key, required this.args});

  static const routeName = '/event-detail';

  final EventDetailArgs args;

  @override
  Widget build(BuildContext context) {
    return ChangeNotifierProvider(
      create: (_) => EventsController(
        EventService(context.read<ApiClient>()),
      )..loadDetails(args.eventId),
      child: _EventDetailView(eventId: args.eventId),
    );
  }
}

class _EventDetailView extends StatelessWidget {
  const _EventDetailView({required this.eventId});

  final String eventId;

  @override
  Widget build(BuildContext context) {
    final ctrl = context.watch<EventsController>();
    final tickets = context.watch<TicketsController>();
    final certificates = context.watch<CertificatesController>();

    if (ctrl.isLoading && ctrl.selected == null) {
      return const Scaffold(body: Center(child: CircularProgressIndicator()));
    }

    if (ctrl.error != null && ctrl.selected == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Evenement')),
        body: Center(child: Text(ctrl.error!)),
      );
    }

    final event = ctrl.selected;
    if (event == null) {
      return const SizedBox.shrink();
    }

    final formatter = DateFormat('dd MMM yyyy - HH:mm');
    final isRegistered = tickets.hasTicketForEvent(eventId);

    return Scaffold(
      appBar: AppBar(title: const Text('Details evenement')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Text(
            event.title,
            style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w800),
          ),
          const SizedBox(height: 8),
          Text('${formatter.format(event.startDate)} - ${formatter.format(event.endDate)}'),
          Text(event.location),
          if ((event.venue ?? '').isNotEmpty) Text('Lieu: ${event.venue}'),
          const SizedBox(height: 14),
          if ((event.description ?? '').isNotEmpty)
            Text(event.description!)
          else
            const Text('Aucune description.'),
          const SizedBox(height: 20),
          Text('Places: ${event.currentCapacity}/${event.maxCapacity}'),
          const SizedBox(height: 10),
          if (tickets.error != null)
            Text(tickets.error!, style: const TextStyle(color: Colors.red)),
          ElevatedButton.icon(
            onPressed: isRegistered || event.isFull
                ? null
                : () async {
                    final ticket = await context.read<TicketsController>().enroll(event.id);
                    if (!context.mounted) {
                      return;
                    }
                    if (ticket != null) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                          content: Text('Inscription validee. Ticket genere.'),
                        ),
                      );
                    }
                  },
            icon: const Icon(Icons.confirmation_num_outlined),
            label: Text(isRegistered ? 'Deja inscrit' : 'S inscrire a cet evenement'),
          ),
          const SizedBox(height: 8),
          OutlinedButton.icon(
            onPressed: () async {
              final cert = await context.read<CertificatesController>().requestCertificate(event.id);
              if (!context.mounted) {
                return;
              }
              final message = cert == null
                  ? (certificates.error ?? 'Certificat indisponible pour le moment.')
                  : 'Certificat genere avec succes.';
              ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(message)));
            },
            icon: const Icon(Icons.workspace_premium_outlined),
            label: const Text('Generer mon certificat (apres check-in)'),
          ),
          const SizedBox(height: 18),
          const Text(
            'Sessions',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 8),
          if (event.sessions.isEmpty)
            const Text('Aucune session disponible.')
          else
            ...event.sessions.map(
              (session) => Card(
                child: ListTile(
                  title: Text(session.title),
                  subtitle: Text(
                    '${formatter.format(session.startTime)} - ${formatter.format(session.endTime)}',
                  ),
                ),
              ),
            ),
        ],
      ),
    );
  }
}
