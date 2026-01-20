/// Job Application Statistics Model
class JobResultStatsModel {
  final int totalApplications;
  final int successfulApplications;
  final int failedApplications;
  final int todayApplications;
  final int weekApplications;
  final int monthApplications;
  final double successRate;
  final double averageMatchScore;
  final List<DailyStatsModel> dailyStats;

  JobResultStatsModel({
    required this.totalApplications,
    required this.successfulApplications,
    required this.failedApplications,
    required this.todayApplications,
    required this.weekApplications,
    required this.monthApplications,
    required this.successRate,
    required this.averageMatchScore,
    required this.dailyStats,
  });

  factory JobResultStatsModel.fromJson(Map<String, dynamic> json) {
    return JobResultStatsModel(
      totalApplications: json['totalApplications'] ?? 0,
      successfulApplications: json['successfulApplications'] ?? 0,
      failedApplications: json['failedApplications'] ?? 0,
      todayApplications: json['todayApplications'] ?? 0,
      weekApplications: json['weekApplications'] ?? 0,
      monthApplications: json['monthApplications'] ?? 0,
      successRate: (json['successRate'] ?? 0).toDouble(),
      averageMatchScore: (json['averageMatchScore'] ?? 0).toDouble(),
      dailyStats: (json['dailyStats'] as List?)
              ?.map((e) => DailyStatsModel.fromJson(e))
              .toList() ??
          [],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'totalApplications': totalApplications,
      'successfulApplications': successfulApplications,
      'failedApplications': failedApplications,
      'todayApplications': todayApplications,
      'weekApplications': weekApplications,
      'monthApplications': monthApplications,
      'successRate': successRate,
      'averageMatchScore': averageMatchScore,
      'dailyStats': dailyStats.map((e) => e.toJson()).toList(),
    };
  }
}

/// Daily Statistics Model
class DailyStatsModel {
  final String date;
  final int applications;
  final int successful;
  final int failed;

  DailyStatsModel({
    required this.date,
    required this.applications,
    required this.successful,
    required this.failed,
  });

  factory DailyStatsModel.fromJson(Map<String, dynamic> json) {
    return DailyStatsModel(
      date: json['date'] as String,
      applications: json['applications'] ?? 0,
      successful: json['successful'] ?? 0,
      failed: json['failed'] ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'date': date,
      'applications': applications,
      'successful': successful,
      'failed': failed,
    };
  }
}
