import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import 'core/theme/app_theme.dart';
import 'features/auth/auth_controller.dart';
import 'features/home/home.dart';
import 'features/shell/home_shell.dart';

class EventHubParticipantApp extends ConsumerWidget {
  const EventHubParticipantApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final authState = ref.watch(authControllerProvider);

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'EventHub Participant',
      theme: AppTheme.lightTheme,
      home: switch (authState.status) {
        AuthStatus.loading => const _BootScreen(),
        AuthStatus.authenticated => const HomeShell(),
        AuthStatus.unauthenticated => const HomePage(),
      },
    );
  }
}

class _BootScreen extends StatelessWidget {
  const _BootScreen();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: CircularProgressIndicator()),
    );
  }
}
