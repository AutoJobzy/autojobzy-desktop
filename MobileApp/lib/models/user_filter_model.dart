/// User Filter Model
class UserFilterModel {
  final String id;
  final String userId;
  final String name;
  final Map<String, dynamic> filters;
  final bool isActive;
  final DateTime createdAt;
  final DateTime updatedAt;

  UserFilterModel({
    required this.id,
    required this.userId,
    required this.name,
    required this.filters,
    required this.isActive,
    required this.createdAt,
    required this.updatedAt,
  });

  factory UserFilterModel.fromJson(Map<String, dynamic> json) {
    return UserFilterModel(
      id: json['id'].toString(),
      userId: json['userId'] as String,
      name: json['name'] as String,
      filters: json['filters'] as Map<String, dynamic>? ?? {},
      isActive: json['isActive'] ?? false,
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
      'userId': userId,
      'name': name,
      'filters': filters,
      'isActive': isActive,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }
}

/// Filter Option Model
class FilterOptionModel {
  final String key;
  final String label;
  final String type;
  final List<String>? options;
  final dynamic defaultValue;

  FilterOptionModel({
    required this.key,
    required this.label,
    required this.type,
    this.options,
    this.defaultValue,
  });

  factory FilterOptionModel.fromJson(Map<String, dynamic> json) {
    return FilterOptionModel(
      key: json['key'] as String,
      label: json['label'] as String,
      type: json['type'] as String,
      options: (json['options'] as List?)?.cast<String>(),
      defaultValue: json['defaultValue'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'key': key,
      'label': label,
      'type': type,
      if (options != null) 'options': options,
      if (defaultValue != null) 'defaultValue': defaultValue,
    };
  }
}
