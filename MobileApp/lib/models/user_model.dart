/// User Model
class UserModel {
  final String id;
  final String email;
  final String? firstName;
  final String? lastName;
  final String? phone;
  final bool isActive;
  final String role;
  final String? instituteId;
  final bool onboardingCompleted;
  final DateTime createdAt;
  final DateTime updatedAt;

  UserModel({
    required this.id,
    required this.email,
    this.firstName,
    this.lastName,
    this.phone,
    required this.isActive,
    required this.role,
    this.instituteId,
    required this.onboardingCompleted,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id: json['id'] as String,
      email: json['email'] as String,
      firstName: json['firstName'] as String?,
      lastName: json['lastName'] as String?,
      phone: json['phone'] as String?,
      isActive: json['isActive'] ?? true,
      role: json['role'] ?? 'user',
      instituteId: json['instituteId'] as String?,
      onboardingCompleted: json['onboardingCompleted'] ?? false,
      createdAt: json['createdAt'] != null
          ? DateTime.parse(json['createdAt'])
          : DateTime.now(),
      updatedAt: json['updatedAt'] != null
          ? DateTime.parse(json['updatedAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      if (firstName != null) 'firstName': firstName,
      if (lastName != null) 'lastName': lastName,
      if (phone != null) 'phone': phone,
      'isActive': isActive,
      'role': role,
      if (instituteId != null) 'instituteId': instituteId,
      'onboardingCompleted': onboardingCompleted,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  String get fullName => '${firstName ?? ''} ${lastName ?? ''}'.trim();

  UserModel copyWith({
    String? id,
    String? email,
    String? firstName,
    String? lastName,
    String? phone,
    bool? isActive,
    String? role,
    String? instituteId,
    bool? onboardingCompleted,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return UserModel(
      id: id ?? this.id,
      email: email ?? this.email,
      firstName: firstName ?? this.firstName,
      lastName: lastName ?? this.lastName,
      phone: phone ?? this.phone,
      isActive: isActive ?? this.isActive,
      role: role ?? this.role,
      instituteId: instituteId ?? this.instituteId,
      onboardingCompleted: onboardingCompleted ?? this.onboardingCompleted,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
