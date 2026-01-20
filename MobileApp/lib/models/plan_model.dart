/// Plan Model
class PlanModel {
  final String id;
  final String name;
  final String? description;
  final String? subtitle;
  final double price;
  final int durationDays;
  final bool isActive;
  final bool isPopular;
  final bool comingSoon;
  final int sortOrder;
  final List<PlanFeatureModel> features;
  final DateTime createdAt;
  final DateTime updatedAt;

  PlanModel({
    required this.id,
    required this.name,
    this.description,
    this.subtitle,
    required this.price,
    required this.durationDays,
    required this.isActive,
    required this.isPopular,
    required this.comingSoon,
    required this.sortOrder,
    required this.features,
    required this.createdAt,
    required this.updatedAt,
  });

  factory PlanModel.fromJson(Map<String, dynamic> json) {
    return PlanModel(
      id: json['id'].toString(),
      name: json['name'] as String,
      description: json['description'] as String?,
      subtitle: json['subtitle'] as String?,
      price: (json['price'] as num).toDouble(),
      durationDays: json['durationDays'] ?? 30,
      isActive: json['isActive'] ?? true,
      isPopular: json['isPopular'] ?? false,
      comingSoon: json['comingSoon'] ?? false,
      sortOrder: json['sortOrder'] ?? 0,
      features: (json['features'] as List?)
              ?.map((f) => PlanFeatureModel.fromJson(f))
              .toList() ??
          [],
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
      'name': name,
      if (description != null) 'description': description,
      if (subtitle != null) 'subtitle': subtitle,
      'price': price,
      'durationDays': durationDays,
      'isActive': isActive,
      'isPopular': isPopular,
      'comingSoon': comingSoon,
      'sortOrder': sortOrder,
      'features': features.map((f) => f.toJson()).toList(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  String get priceFormatted => '₹${price.toStringAsFixed(0)}';
  String get duration => '$durationDays days';
}

/// Plan Feature Model
class PlanFeatureModel {
  final String id;
  final String key;
  final String value;
  final String label;

  PlanFeatureModel({
    required this.id,
    required this.key,
    required this.value,
    required this.label,
  });

  factory PlanFeatureModel.fromJson(Map<String, dynamic> json) {
    return PlanFeatureModel(
      id: json['id'].toString(),
      key: json['key'] as String,
      value: json['value'] as String,
      label: json['label'] as String,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'key': key,
      'value': value,
      'label': label,
    };
  }
}
