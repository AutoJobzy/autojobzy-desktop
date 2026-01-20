/// App Configuration Constants
class AppConstants {
  // App Info
  static const String appName = 'AutoJobzy';
  static const String appVersion = '1.0.0';
  static const String appDescription = 'Automate Your Job Applications';

  // Storage Keys
  static const String keyToken = 'auth_token';
  static const String keyUser = 'user_data';
  static const String keyIsLoggedIn = 'is_logged_in';
  static const String keyThemeMode = 'theme_mode';
  static const String keyOnboardingCompleted = 'onboarding_completed';

  // Pagination
  static const int defaultPageSize = 20;
  static const int maxPageSize = 100;

  // File Upload
  static const int maxFileSizeMB = 5;
  static const int maxFileSizeBytes = maxFileSizeMB * 1024 * 1024; // 5MB

  // Allowed File Types
  static const List<String> allowedResumeExtensions = [
    'pdf',
    'doc',
    'docx',
    'txt'
  ];

  // Automation
  static const int defaultMaxPages = 5;
  static const int minMaxPages = 1;
  static const int maxMaxPages = 50;

  // Skills
  static const int maxSkillRating = 5;
  static const double skillRatingStep = 0.5;

  // Notice Period Options
  static const List<String> noticePeriodOptions = [
    'Immediate',
    '15 Days',
    '30 Days',
    '60 Days',
    '90 Days'
  ];

  // Availability Options
  static const List<String> availabilityOptions = [
    'Flexible',
    'Available',
    'Not Available',
    'Weekends Only',
    'After Work Hours'
  ];

  // Suggestion Types
  static const List<String> suggestionTypes = [
    'Feature Request',
    'Bug Report',
    'UX Improvement',
    'General Feedback'
  ];

  // Date Formats
  static const String dateFormat = 'dd/MM/yyyy';
  static const String dateTimeFormat = 'dd/MM/yyyy hh:mm a';
  static const String timeFormat = 'hh:mm a';

  // Razorpay
  static const String razorpayKeyId = 'rzp_live_YOUR_KEY_ID'; // Replace with actual key

  // Support
  static const String supportEmail = 'support@autojobzy.com';
  static const String supportPhone = '+91-XXXXXXXXXX';
  static const String websiteUrl = 'https://autojobzy.com';

  // Social Media
  static const String facebookUrl = 'https://facebook.com/autojobzy';
  static const String twitterUrl = 'https://twitter.com/autojobzy';
  static const String linkedinUrl = 'https://linkedin.com/company/autojobzy';
}
