class UserModel {
  UserModel({
    required this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone,
    this.organization,
  });

  final String id;
  final String name;
  final String email;
  final String role;
  final String? phone;
  final String? organization;

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'].toString(),
      name: json['name']?.toString() ?? '',
      email: json['email']?.toString() ?? '',
      role: json['role']?.toString() ?? 'participant',
      phone: json['phone']?.toString(),
      organization: json['organization']?.toString(),
    );
  }
}
