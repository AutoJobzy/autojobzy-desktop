/// Skill Model
class SkillModel {
  final String? id;
  final String userId;
  final String skillName;
  final String displayName;
  final double rating;
  final int outOf;
  final String? experience;
  final DateTime createdAt;
  final DateTime updatedAt;

  SkillModel({
    this.id,
    required this.userId,
    required this.skillName,
    required this.displayName,
    required this.rating,
    required this.outOf,
    this.experience,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SkillModel.fromJson(Map<String, dynamic> json) {
    return SkillModel(
      id: json['id'] as String?,
      userId: json['userId'] as String,
      skillName: json['skillName'] as String,
      displayName: json['displayName'] as String,
      rating: (json['rating'] as num).toDouble(),
      outOf: json['outOf'] ?? 5,
      experience: json['experience'] as String?,
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
      if (id != null) 'id': id,
      'userId': userId,
      'skillName': skillName,
      'displayName': displayName,
      'rating': rating,
      'outOf': outOf,
      if (experience != null) 'experience': experience,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  String get ratingDisplay => '$rating/$outOf';

  SkillModel copyWith({
    String? id,
    String? userId,
    String? skillName,
    String? displayName,
    double? rating,
    int? outOf,
    String? experience,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return SkillModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      skillName: skillName ?? this.skillName,
      displayName: displayName ?? this.displayName,
      rating: rating ?? this.rating,
      outOf: outOf ?? this.outOf,
      experience: experience ?? this.experience,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
