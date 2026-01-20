/// Automation Log Model
class AutomationLogModel {
  final String id;
  final String userId;
  final String type;
  final String message;
  final String level;
  final Map<String, dynamic>? metadata;
  final DateTime timestamp;

  AutomationLogModel({
    required this.id,
    required this.userId,
    required this.type,
    required this.message,
    required this.level,
    this.metadata,
    required this.timestamp,
  });

  factory AutomationLogModel.fromJson(Map<String, dynamic> json) {
    return AutomationLogModel(
      id: json['id'].toString(),
      userId: json['userId'] as String,
      type: json['type'] as String,
      message: json['message'] as String,
      level: json['level'] ?? 'info',
      metadata: json['metadata'] as Map<String, dynamic>?,
      timestamp: json['timestamp'] != null
          ? DateTime.parse(json['timestamp'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'userId': userId,
      'type': type,
      'message': message,
      'level': level,
      if (metadata != null) 'metadata': metadata,
      'timestamp': timestamp.toIso8601String(),
    };
  }

  bool get isError => level == 'error';
  bool get isWarning => level == 'warning';
  bool get isInfo => level == 'info';
  bool get isSuccess => level == 'success';

  String get timeAgo {
    final now = DateTime.now();
    final difference = now.difference(timestamp);

    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes}m ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours}h ago';
    } else {
      return '${difference.inDays}d ago';
    }
  }
}

/// Automation Status Model
class AutomationStatusModel {
  final bool isRunning;
  final DateTime? startedAt;
  final DateTime? lastRunAt;
  final int totalJobs;
  final int appliedJobs;
  final int failedJobs;
  final String? currentStatus;

  AutomationStatusModel({
    required this.isRunning,
    this.startedAt,
    this.lastRunAt,
    required this.totalJobs,
    required this.appliedJobs,
    required this.failedJobs,
    this.currentStatus,
  });

  factory AutomationStatusModel.fromJson(Map<String, dynamic> json) {
    return AutomationStatusModel(
      isRunning: json['isRunning'] ?? false,
      startedAt: json['startedAt'] != null
          ? DateTime.parse(json['startedAt'])
          : null,
      lastRunAt: json['lastRunAt'] != null
          ? DateTime.parse(json['lastRunAt'])
          : null,
      totalJobs: json['totalJobs'] ?? 0,
      appliedJobs: json['appliedJobs'] ?? 0,
      failedJobs: json['failedJobs'] ?? 0,
      currentStatus: json['currentStatus'] as String?,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'isRunning': isRunning,
      if (startedAt != null) 'startedAt': startedAt!.toIso8601String(),
      if (lastRunAt != null) 'lastRunAt': lastRunAt!.toIso8601String(),
      'totalJobs': totalJobs,
      'appliedJobs': appliedJobs,
      'failedJobs': failedJobs,
      if (currentStatus != null) 'currentStatus': currentStatus,
    };
  }
}
