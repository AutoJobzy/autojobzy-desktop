/// Job Application Result Model
class JobApplicationResultModel {
  final int? id;
  final String userId;
  final DateTime datetime;
  final int pageNumber;
  final String? jobNumber;
  final String? companyUrl;
  final bool earlyApplicant;
  final bool keySkillsMatch;
  final bool locationMatch;
  final bool experienceMatch;
  final int matchScore;
  final int matchScoreTotal;
  final String matchStatus;
  final String applyType;
  final String applicationStatus;
  final String? jobTitle;
  final String? companyName;
  final String? experienceRequired;
  final String? salary;
  final String? location;
  final String? postedDate;
  final String? openings;
  final String? applicants;
  final String? keySkills;
  final String? role;
  final String? industryType;
  final String? employmentType;
  final String? roleCategory;
  final String? companyRating;
  final String? jobHighlights;
  final DateTime createdAt;
  final DateTime updatedAt;

  JobApplicationResultModel({
    this.id,
    required this.userId,
    required this.datetime,
    required this.pageNumber,
    this.jobNumber,
    this.companyUrl,
    required this.earlyApplicant,
    required this.keySkillsMatch,
    required this.locationMatch,
    required this.experienceMatch,
    required this.matchScore,
    required this.matchScoreTotal,
    required this.matchStatus,
    required this.applyType,
    required this.applicationStatus,
    this.jobTitle,
    this.companyName,
    this.experienceRequired,
    this.salary,
    this.location,
    this.postedDate,
    this.openings,
    this.applicants,
    this.keySkills,
    this.role,
    this.industryType,
    this.employmentType,
    this.roleCategory,
    this.companyRating,
    this.jobHighlights,
    required this.createdAt,
    required this.updatedAt,
  });

  factory JobApplicationResultModel.fromJson(Map<String, dynamic> json) {
    return JobApplicationResultModel(
      id: json['id'] as int?,
      userId: json['userId'] as String,
      datetime: DateTime.parse(json['datetime']),
      pageNumber: json['pageNumber'] ?? 1,
      jobNumber: json['jobNumber'] as String?,
      companyUrl: json['companyUrl'] as String?,
      earlyApplicant: json['earlyApplicant'] ?? false,
      keySkillsMatch: json['keySkillsMatch'] ?? false,
      locationMatch: json['locationMatch'] ?? false,
      experienceMatch: json['experienceMatch'] ?? false,
      matchScore: json['matchScore'] ?? 0,
      matchScoreTotal: json['matchScoreTotal'] ?? 5,
      matchStatus: json['matchStatus'] ?? 'Poor Match',
      applyType: json['applyType'] ?? 'Direct Apply',
      applicationStatus: json['applicationStatus'] ?? 'Skipped',
      jobTitle: json['jobTitle'] as String?,
      companyName: json['companyName'] as String?,
      experienceRequired: json['experienceRequired'] as String?,
      salary: json['salary'] as String?,
      location: json['location'] as String?,
      postedDate: json['postedDate'] as String?,
      openings: json['openings'] as String?,
      applicants: json['applicants'] as String?,
      keySkills: json['keySkills'] as String?,
      role: json['role'] as String?,
      industryType: json['industryType'] as String?,
      employmentType: json['employmentType'] as String?,
      roleCategory: json['roleCategory'] as String?,
      companyRating: json['companyRating'] as String?,
      jobHighlights: json['jobHighlights'] as String?,
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
      'datetime': datetime.toIso8601String(),
      'pageNumber': pageNumber,
      if (jobNumber != null) 'jobNumber': jobNumber,
      if (companyUrl != null) 'companyUrl': companyUrl,
      'earlyApplicant': earlyApplicant,
      'keySkillsMatch': keySkillsMatch,
      'locationMatch': locationMatch,
      'experienceMatch': experienceMatch,
      'matchScore': matchScore,
      'matchScoreTotal': matchScoreTotal,
      'matchStatus': matchStatus,
      'applyType': applyType,
      'applicationStatus': applicationStatus,
      if (jobTitle != null) 'jobTitle': jobTitle,
      if (companyName != null) 'companyName': companyName,
      if (experienceRequired != null) 'experienceRequired': experienceRequired,
      if (salary != null) 'salary': salary,
      if (location != null) 'location': location,
      if (postedDate != null) 'postedDate': postedDate,
      if (openings != null) 'openings': openings,
      if (applicants != null) 'applicants': applicants,
      if (keySkills != null) 'keySkills': keySkills,
      if (role != null) 'role': role,
      if (industryType != null) 'industryType': industryType,
      if (employmentType != null) 'employmentType': employmentType,
      if (roleCategory != null) 'roleCategory': roleCategory,
      if (companyRating != null) 'companyRating': companyRating,
      if (jobHighlights != null) 'jobHighlights': jobHighlights,
      'createdAt': createdAt.toIso8601String(),
      'updatedAt': updatedAt.toIso8601String(),
    };
  }

  int get matchPercentage =>
      ((matchScore / matchScoreTotal) * 100).round();

  bool get isGoodMatch => matchStatus == 'Good Match';

  bool get wasApplied => applicationStatus == 'Applied';
}
