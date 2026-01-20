/// Job Settings Model
class JobSettingsModel {
  final String? id;
  final String userId;
  final String? fullName;
  final String? contactNumber;
  final String? naukriEmail;
  final String? naukriPassword;
  final bool credentialsVerified;
  final DateTime? lastVerified;
  final String targetRole;
  final String location;
  final String? currentCTC;
  final String? expectedCTC;
  final String noticePeriod;
  final String? searchKeywords;
  final int maxPages;
  final String availability;
  final String? resumeFileName;
  final String? resumeS3Url;
  final String? resumeS3Key;
  final String? resumeText;
  final int resumeScore;
  final int? yearsOfExperience;
  final DateTime? dob;
  final DateTime? scheduledTime;
  final String? scheduleStatus;
  final bool profileUpdateEnabled;
  final int? profileUpdateFrequency;
  final String? profileUpdateScheduleTime;
  final DateTime? profileUpdateNextRun;
  final String? profileUpdateLastStatus;
  final DateTime? lastProfileUpdate;
  final DateTime createdAt;
  final DateTime updatedAt;

  JobSettingsModel({
    this.id,
    required this.userId,
    this.fullName,
    this.contactNumber,
    this.naukriEmail,
    this.naukriPassword,
    required this.credentialsVerified,
    this.lastVerified,
    required this.targetRole,
    required this.location,
    this.currentCTC,
    this.expectedCTC,
    required this.noticePeriod,
    this.searchKeywords,
    required this.maxPages,
    required this.availability,
    this.resumeFileName,
    this.resumeS3Url,
    this.resumeS3Key,
    this.resumeText,
    required this.resumeScore,
    this.yearsOfExperience,
    this.dob,
    this.scheduledTime,
    this.scheduleStatus,
    required this.profileUpdateEnabled,
    this.profileUpdateFrequency,
    this.profileUpdateScheduleTime,
    this.profileUpdateNextRun,
    this.profileUpdateLastStatus,
    this.lastProfileUpdate,
    required this.createdAt,
    required this.updatedAt,
  });

  factory JobSettingsModel.fromJson(Map<String, dynamic> json) {
    return JobSettingsModel(
      id: json['id'] as String?,
      userId: json['userId'] as String,
      fullName: json['fullName'] as String?,
      contactNumber: json['contactNumber'] as String?,
      naukriEmail: json['naukriEmail'] as String?,
      naukriPassword: json['naukriPassword'] as String?,
      credentialsVerified: json['credentialsVerified'] ?? false,
      lastVerified: json['lastVerified'] != null
          ? DateTime.parse(json['lastVerified'])
          : null,
      targetRole: json['targetRole'] ?? 'Software Engineer',
      location: json['location'] ?? 'Bangalore',
      currentCTC: json['currentCTC'] as String?,
      expectedCTC: json['expectedCTC'] as String?,
      noticePeriod: json['noticePeriod'] ?? 'Immediate',
      searchKeywords: json['searchKeywords'] as String?,
      maxPages: json['maxPages'] ?? 5,
      availability: json['availability'] ?? 'Flexible',
      resumeFileName: json['resumeFileName'] as String?,
      resumeS3Url: json['resumeS3Url'] as String?,
      resumeS3Key: json['resumeS3Key'] as String?,
      resumeText: json['resumeText'] as String?,
      resumeScore: json['resumeScore'] ?? 0,
      yearsOfExperience: json['yearsOfExperience'] as int?,
      dob: json['dob'] != null ? DateTime.parse(json['dob']) : null,
      scheduledTime: json['scheduledTime'] != null
          ? DateTime.parse(json['scheduledTime'])
          : null,
      scheduleStatus: json['scheduleStatus'] as String?,
      profileUpdateEnabled: json['profileUpdateEnabled'] ?? false,
      profileUpdateFrequency: json['profileUpdateFrequency'] as int?,
      profileUpdateScheduleTime: json['profileUpdateScheduleTime'] as String?,
      profileUpdateNextRun: json['profileUpdateNextRun'] != null
          ? DateTime.parse(json['profileUpdateNextRun'])
          : null,
      profileUpdateLastStatus: json['profileUpdateLastStatus'] as String?,
      lastProfileUpdate: json['lastProfileUpdate'] != null
          ? DateTime.parse(json['lastProfileUpdate'])
          : null,
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
      if (fullName != null) 'fullName': fullName,
      if (contactNumber != null) 'contactNumber': contactNumber,
      if (naukriEmail != null) 'naukriEmail': naukriEmail,
      if (naukriPassword != null) 'naukriPassword': naukriPassword,
      'credentialsVerified': credentialsVerified,
      if (lastVerified != null) 'lastVerified': lastVerified!.toIso8601String(),
      'targetRole': targetRole,
      'location': location,
      if (currentCTC != null) 'currentCTC': currentCTC,
      if (expectedCTC != null) 'expectedCTC': expectedCTC,
      'noticePeriod': noticePeriod,
      if (searchKeywords != null) 'searchKeywords': searchKeywords,
      'maxPages': maxPages,
      'availability': availability,
      if (resumeFileName != null) 'resumeFileName': resumeFileName,
      if (resumeS3Url != null) 'resumeS3Url': resumeS3Url,
      if (resumeS3Key != null) 'resumeS3Key': resumeS3Key,
      if (resumeText != null) 'resumeText': resumeText,
      'resumeScore': resumeScore,
      if (yearsOfExperience != null) 'yearsOfExperience': yearsOfExperience,
      if (dob != null) 'dob': dob!.toIso8601String(),
      if (scheduledTime != null) 'scheduledTime': scheduledTime!.toIso8601String(),
      if (scheduleStatus != null) 'scheduleStatus': scheduleStatus,
      'profileUpdateEnabled': profileUpdateEnabled,
      if (profileUpdateFrequency != null) 'profileUpdateFrequency': profileUpdateFrequency,
      if (profileUpdateScheduleTime != null) 'profileUpdateScheduleTime': profileUpdateScheduleTime,
      if (profileUpdateNextRun != null) 'profileUpdateNextRun': profileUpdateNextRun!.toIso8601String(),
      if (profileUpdateLastStatus != null) 'profileUpdateLastStatus': profileUpdateLastStatus,
      if (lastProfileUpdate != null) 'lastProfileUpdate': lastProfileUpdate!.toIso8601String(),
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  JobSettingsModel copyWith({
    String? id,
    String? userId,
    String? fullName,
    String? contactNumber,
    String? naukriEmail,
    String? naukriPassword,
    bool? credentialsVerified,
    DateTime? lastVerified,
    String? targetRole,
    String? location,
    String? currentCTC,
    String? expectedCTC,
    String? noticePeriod,
    String? searchKeywords,
    int? maxPages,
    String? availability,
    String? resumeFileName,
    String? resumeS3Url,
    String? resumeS3Key,
    String? resumeText,
    int? resumeScore,
    int? yearsOfExperience,
    DateTime? dob,
    DateTime? scheduledTime,
    String? scheduleStatus,
    bool? profileUpdateEnabled,
    int? profileUpdateFrequency,
    String? profileUpdateScheduleTime,
    DateTime? profileUpdateNextRun,
    String? profileUpdateLastStatus,
    DateTime? lastProfileUpdate,
    DateTime? createdAt,
    DateTime? updatedAt,
  }) {
    return JobSettingsModel(
      id: id ?? this.id,
      userId: userId ?? this.userId,
      fullName: fullName ?? this.fullName,
      contactNumber: contactNumber ?? this.contactNumber,
      naukriEmail: naukriEmail ?? this.naukriEmail,
      naukriPassword: naukriPassword ?? this.naukriPassword,
      credentialsVerified: credentialsVerified ?? this.credentialsVerified,
      lastVerified: lastVerified ?? this.lastVerified,
      targetRole: targetRole ?? this.targetRole,
      location: location ?? this.location,
      currentCTC: currentCTC ?? this.currentCTC,
      expectedCTC: expectedCTC ?? this.expectedCTC,
      noticePeriod: noticePeriod ?? this.noticePeriod,
      searchKeywords: searchKeywords ?? this.searchKeywords,
      maxPages: maxPages ?? this.maxPages,
      availability: availability ?? this.availability,
      resumeFileName: resumeFileName ?? this.resumeFileName,
      resumeS3Url: resumeS3Url ?? this.resumeS3Url,
      resumeS3Key: resumeS3Key ?? this.resumeS3Key,
      resumeText: resumeText ?? this.resumeText,
      resumeScore: resumeScore ?? this.resumeScore,
      yearsOfExperience: yearsOfExperience ?? this.yearsOfExperience,
      dob: dob ?? this.dob,
      scheduledTime: scheduledTime ?? this.scheduledTime,
      scheduleStatus: scheduleStatus ?? this.scheduleStatus,
      profileUpdateEnabled: profileUpdateEnabled ?? this.profileUpdateEnabled,
      profileUpdateFrequency: profileUpdateFrequency ?? this.profileUpdateFrequency,
      profileUpdateScheduleTime: profileUpdateScheduleTime ?? this.profileUpdateScheduleTime,
      profileUpdateNextRun: profileUpdateNextRun ?? this.profileUpdateNextRun,
      profileUpdateLastStatus: profileUpdateLastStatus ?? this.profileUpdateLastStatus,
      lastProfileUpdate: lastProfileUpdate ?? this.lastProfileUpdate,
      createdAt: createdAt ?? this.createdAt,
      updatedAt: updatedAt ?? this.updatedAt,
    );
  }
}
