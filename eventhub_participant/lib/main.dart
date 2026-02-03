import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'core/security/secure_storage.dart';
import 'core/network/dio_client.dart';
import 'features/auth/data/datasources/auth_remote_data_source.dart';
import 'features/auth/presentation/providers/auth_provider.dart';
import 'features/auth/presentation/pages/login_page.dart';
import 'features/events/presentation/pages/events_list_page.dart';
import 'core/theme/app_theme.dart';

void main() {
  runApp(const ProviderScope(child: AppEntry()));
}

final secureStorageProvider = Provider<SecureStorage>((ref) => SecureStorage());

final dioClientProvider = Provider<DioClient>((ref) {
  final secure = ref.read(secureStorageProvider);
  Future<void> logoutCallback() async {
    // noop; AuthNotifier handles state & navigation in app
  }
  return DioClient(secureStorage: secure, logoutCallback: logoutCallback);
});

final authRemoteProvider = Provider<AuthRemoteDataSource>((ref) {
  final client = ref.read(dioClientProvider);
  return AuthRemoteDataSource(client: client);
});

final authNotifierProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final remote = ref.read(authRemoteProvider);
  final secure = ref.read(secureStorageProvider);
  Future<void> onLogoutCallback() async {}
  return AuthNotifier(remote: remote, secureStorage: secure, onLogoutCallback: onLogoutCallback);
});

class AppEntry extends ConsumerWidget {
  const AppEntry({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final theme = AppTheme.light();
    return MaterialApp(
      title: 'EventHub Participant',
      theme: theme,
      home: const SafeArea(
        child: Scaffold(
          body: EventsFlowRouter(),
        ),
      ),
      debugShowCheckedModeBanner: false,
    );
  }
}

class EventsFlowRouter extends ConsumerWidget {
  const EventsFlowRouter({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authNotifierProvider);
    switch (auth.status) {
      case AuthStatus.loading:
        return const Center(child: CircularProgressIndicator());
      case AuthStatus.authenticated:
        return const EventsListPage();
      case AuthStatus.unauthenticated:
      case AuthStatus.initial:
      case AuthStatus.error:
      default:
        return const LoginPage();
    }
  }
}
