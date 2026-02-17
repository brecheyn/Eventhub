class UserModel {
  const UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone,
    this.organization,
    required this.isActive,
  });

  final String id;
  final String name;
  final String email;
  final String role;
  final String? phone;
  final String? organization;
  final bool isActive;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      name: json['name'] as String? ?? '',
      email: json['email'] as String? ?? '',
      role: json['role'] as String? ?? 'participant',
      phone: json['phone'] as String?,
      organization: json['organization'] as String?,
      isActive: json['isActive'] as bool? ?? true,
    );
  }
}

