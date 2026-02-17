import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_controller.dart';

class ProfilePage extends ConsumerWidget {
  const ProfilePage({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);
    final user = authState.user;

    return Scaffold(
      appBar: AppBar(title: const Text('Profil')),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(user?.name ?? '-', style: Theme.of(context).textTheme.titleMedium),
                  const SizedBox(height: 6),
                  Text(user?.email ?? '-'),
                  const SizedBox(height: 6),
                  Text('Rôle: ${user?.role ?? '-'}'),
                  if (user?.phone != null) ...[
                    const SizedBox(height: 6),
                    Text('Téléphone: ${user!.phone}'),
                  ],
                  if (user?.organization != null) ...[
                    const SizedBox(height: 6),
                    Text('Organisation: ${user!.organization}'),
                  ],
                ],
              ),
            ),
          ),
          const SizedBox(height: 12),
          FilledButton.tonalIcon(
            onPressed: () => ref.read(authControllerProvider.notifier).logout(),
            icon: const Icon(Icons.logout),
            label: const Text('Se déconnecter'),
          ),
        ],
      ),
    );
  }
}

