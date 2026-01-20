/// Suggestion/Feedback Model
class SuggestionModel {
  final String id;
  final String userId;
  final String title;
  final String description;
  final String category;
  final String status;
  final String? response;
  final int? rewardPoints;
  final DateTime createdAt;
  final DateTime updatedAt;

  SuggestionModel({
    required this.id,
    required this.userId,
    required this.title,
    required this.description,
    required this.category,
    required this.status,
    this.response,
    this.rewardPoints,
    required this.createdAt,
    required this.updatedAt,
  });

  factory SuggestionModel.fromJson(Map<String, dynamic> json) {
    return SuggestionModel(
      id: json['id'].toString(),
      userId: json['userId'] as String,
      title: json['title'] as String,
      description: json['description'] as String,
      category: json['category'] ?? 'general',
      status: json['status'] ?? 'pending',
      response: json['response'] as String?,
      rewardPoints: json['rewardPoints'] as int?,
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
      'title': title,
      'description': description,
      'category': category,
      'status': status,
      if (response != null) 'response': response,
      if (rewardPoints != null) 'rewardPoints': rewardPoints,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  bool get isPending => status == 'pending';
  bool get isUnderReview => status == 'under_review';
  bool get isImplemented => status == 'implemented';
  bool get isRejected => status == 'rejected';

  String get statusDisplay {
    switch (status) {
      case 'pending':
        return 'Pending';
      case 'under_review':
        return 'Under Review';
      case 'implemented':
        return 'Implemented';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  }
}
