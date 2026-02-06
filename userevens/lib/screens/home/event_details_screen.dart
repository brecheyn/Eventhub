import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:intl/intl.dart';
import '../../providers/auth_provider.dart';
import '../../providers/event_provider.dart';
import '../../theme/app_theme.dart';

class EventDetailsScreen extends StatefulWidget {
  final String eventId;

  const EventDetailsScreen({Key? key, required this.eventId}) : super(key: key);

  @override
  State<EventDetailsScreen> createState() => _EventDetailsScreenState();
}

class _EventDetailsScreenState extends State<EventDetailsScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      Provider.of<EventProvider>(context, listen: false)
          .getEventDetails(widget.eventId);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<EventProvider>(
        builder: (context, eventProvider, _) {
          final event = eventProvider.selectedEvent;

          if (eventProvider.isLoading) {
            return Scaffold(
              appBar: AppBar(),
              body: const Center(
                child: CircularProgressIndicator(color: AppTheme.primaryRed),
              ),
            );
          }

          if (event == null) {
            return Scaffold(
              appBar: AppBar(),
              body: Center(
                child: Text(
                  eventProvider.error ?? 'Événement non trouvé',
                  style: AppTheme.bodyMedium,
                ),
              ),
            );
          }

          return CustomScrollView(
            slivers: [
              SliverAppBar(
                expandedHeight: 250,
                pinned: true,
                flexibleSpace: FlexibleSpaceBar(
                  background: Container(
                    decoration: BoxDecoration(
                      gradient: AppTheme.blackRedGradient,
                      image: event.image.isNotEmpty
                          ? DecorationImage(
                        image: NetworkImage(event.image),
                        fit: BoxFit.cover,
                      )
                          : null,
                    ),
                  ),
                ),
                actions: [
                  IconButton(
                    icon: Icon(
                      event.isBookmarked ? Icons.bookmark : Icons.bookmark_border,
                      color: AppTheme.primaryRed,
                    ),
                    onPressed: () {
                      if (event.isBookmarked) {
                        eventProvider.removeBookmark(event.id);
                      } else {
                        eventProvider.bookmarkEvent(event.id);
                      }
                    },
                  ),
                ],
              ),
              SliverToBoxAdapter(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        event.title,
                        style: AppTheme.headingMedium,
                      ),
                      const SizedBox(height: 8),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 4,
                        ),
                        decoration: BoxDecoration(
                          gradient: AppTheme.redBlackGradient,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          event.category,
                          style: AppTheme.bodySmall.copyWith(
                            color: AppTheme.primaryWhite,
                          ),
                        ),
                      ),
                      const SizedBox(height: 16),
                      _buildInfoRow(
                        Icons.calendar_today,
                        DateFormat('dd MMM yyyy - HH:mm', 'fr_FR')
                            .format(event.startDate),
                      ),
                      const SizedBox(height: 12),
                      _buildInfoRow(
                        Icons.location_on,
                        event.location,
                      ),
                      const SizedBox(height: 12),
                      _buildInfoRow(
                        Icons.people,
                        '${event.participantsCount}/${event.capacity} participants',
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Description',
                        style: AppTheme.headingSmall,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        event.description,
                        style: AppTheme.bodyMedium,
                      ),
                      const SizedBox(height: 24),
                      Text(
                        'Organisateur',
                        style: AppTheme.headingSmall,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        event.organizer,
                        style: AppTheme.bodyMedium,
                      ),
                      const SizedBox(height: 32),
                      _buildActionButton(eventProvider, event.id, event.hasJoined),
                      const SizedBox(height: 16),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }

  Widget _buildInfoRow(IconData icon, String text) {
    return Row(
      children: [
        Icon(icon, color: AppTheme.primaryRed, size: 20),
        const SizedBox(width: 12),
        Expanded(
          child: Text(text, style: AppTheme.bodyMedium),
        ),
      ],
    );
  }

  Widget _buildActionButton(
      EventProvider eventProvider,
      String eventId,
      bool hasJoined,
      ) {
    return SizedBox(
      width: double.infinity,
      child: ElevatedButton(
        onPressed: () async {
          if (hasJoined) {
            await eventProvider.leaveEvent(eventId);
          } else {
            await eventProvider.joinEvent(eventId);
          }
        },
        style: ElevatedButton.styleFrom(
          backgroundColor: hasJoined ? AppTheme.lightGray : AppTheme.primaryRed,
          foregroundColor:
          hasJoined ? AppTheme.primaryBlack : AppTheme.primaryWhite,
          padding: const EdgeInsets.symmetric(vertical: 16),
        ),
        child: Text(
          hasJoined ? 'Quitter l\'événement' : 'Rejoindre l\'événement',
          style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
        ),
      ),
    );
  }
}