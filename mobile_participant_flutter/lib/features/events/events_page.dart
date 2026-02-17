import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:intl/intl.dart';

import '../../core/theme/app_colors.dart';
import '../../core/utils/url_utils.dart';
import '../auth/auth_controller.dart';
import 'event_detail_page.dart';

class EventsPage extends ConsumerWidget {
  const EventsPage({super.key});

  Widget _orangeChip(String label) {
    return Chip(
      backgroundColor: AppColors.orange,
      side: BorderSide.none,
      label: Text(
        label,
        style: const TextStyle(
          color: Colors.white,
          fontWeight: FontWeight.w500,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final events = ref.watch(eventsProvider);

    return Scaffold(
      backgroundColor: AppColors.orange,
      appBar: AppBar(title: const Text('Événements')),
      body: RefreshIndicator(
        onRefresh: () async => ref.invalidate(eventsProvider),
        child: events.when(
          data: (items) {
            if (items.isEmpty) {
              return const Center(child: Text('Aucun événement disponible.'));
            }
            return ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: items.length,
              itemBuilder: (context, index) {
                final event = items[index];
                final dateLabel =
                    DateFormat('dd MMM yyyy, HH:mm').format(event.startDate);
                return Card(
                  margin: const EdgeInsets.only(bottom: 14),
                  color: Colors.white,
                  child: InkWell(
                    borderRadius: BorderRadius.circular(18),
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(
                          builder: (_) => EventDetailPage(eventId: event.id),
                        ),
                      );
                    },
                    child: Padding(
                      padding: const EdgeInsets.all(14),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (event.imageUrl != null)
                            ClipRRect(
                              borderRadius: BorderRadius.circular(12),
                              child: Image.network(
                                UrlUtils.resolve(event.imageUrl!),
                                height: 160,
                                width: double.infinity,
                                fit: BoxFit.cover,
                                errorBuilder: (context, error, stackTrace) =>
                                    Container(
                                  height: 160,
                                  decoration: BoxDecoration(
                                    borderRadius: BorderRadius.circular(12),
                                    gradient: AppColors.accentGradient,
                                  ),
                                ),
                              ),
                            ),
                          const SizedBox(height: 10),
                          Text(
                            event.title,
                            style: Theme.of(context).textTheme.titleMedium,
                          ),
                          const SizedBox(height: 6),
                          Text('${event.location} • $dateLabel'),
                          const SizedBox(height: 6),
                          Wrap(
                            spacing: 8,
                            children: [
                              _orangeChip(event.eventType),
                              _orangeChip(
                                event.isFree
                                    ? 'Gratuit'
                                    : '${event.ticketPrice} FCFA',
                              ),
                              _orangeChip(
                                '${event.currentCapacity}/${event.maxCapacity}',
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              },
            );
          },
          error: (error, _) => ListView(
            children: [
              const SizedBox(height: 120),
              Center(child: Text('Erreur: $error')),
            ],
          ),
          loading: () => const Center(child: CircularProgressIndicator()),
        ),
      ),
    );
  }
}
