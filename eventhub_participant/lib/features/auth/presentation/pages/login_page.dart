import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import 'register_page.dart';

class LoginPage extends ConsumerStatefulWidget {
  const LoginPage({Key? key}) : super(key: key);

  @override
  ConsumerState<LoginPage> createState() => _LoginPageState();
}

class _LoginPageState extends ConsumerState<LoginPage> {
  final _formKey = GlobalKey<FormState>();
  String _email = '';
  String _password = '';

  @override
  void initState() {
    super.initState();
    ref.listen<AuthState>(authNotifierProvider, (prev, next) {
      if (next.status == AuthStatus.error && next.message != null) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(next.message!)));
      }
    });
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    _formKey.currentState!.save();
    await ref.read(authNotifierProvider.notifier).login(_email, _password);
  }

  @override
  Widget build(BuildContext context) {
    final authState = ref.watch(authNotifierProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Connexion')),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Email'),
                  onSaved: (v) => _email = v?.trim() ?? '',
                  validator: (v) => (v == null || v.isEmpty) ? 'Requis' : null,
                  keyboardType: TextInputType.emailAddress,
                ),
                const SizedBox(height: 12),
                TextFormField(
                  decoration: const InputDecoration(labelText: 'Mot de passe'),
                  onSaved: (v) => _password = v ?? '',
                  validator: (v) => (v == null || v.isEmpty) ? 'Requis' : null,
                  obscureText: true,
                ),
                const SizedBox(height: 20),
                ElevatedButton(
                  onPressed: authState.status == AuthStatus.loading ? null : _submit,
                  child: authState.status == AuthStatus.loading
                      ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2))
                      : const Text('Se connecter'),
                ),
                const SizedBox(height: 12),
                TextButton(
                  onPressed: () {
                    Navigator.of(context).push(MaterialPageRoute(builder: (_) => const RegisterPage()));
                  },
                  child: const Text('Créer un compte'),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
