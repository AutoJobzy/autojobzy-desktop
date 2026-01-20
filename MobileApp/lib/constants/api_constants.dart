/// API Constants for AutoJobzy Backend
class ApiConstants {
  // Base URL
  static const String baseUrl = 'https://api.autojobzy.com/api';

  // Timeouts
  static const Duration connectTimeout = Duration(seconds: 30);
  static const Duration receiveTimeout = Duration(seconds: 30);

  // Authentication Endpoints
  static const String authLogin = '/auth/login';
  static const String authSignup = '/auth/signup';
  static const String authSignupWithPayment = '/auth/signup-with-payment';
  static const String authCompleteOnboarding = '/auth/complete-onboarding';
  static const String authVerifyNaukriCredentials = '/auth/verify-naukri-credentials';

  // Job Settings Endpoints
  static const String jobSettings = '/job-settings';
  static const String jobSettingsResume = '/job-settings/resume';
  static const String jobSettingsResumeText = '/job-settings/resume-text';
  static const String jobSettingsAnswersData = '/job-settings/answers-data';
  static const String jobSettingsNaukriCredentials = '/job-settings/naukri-credentials';

  // Skills Endpoints
  static const String skills = '/skills';
  static const String skillsBulk = '/skills/bulk';
  static String skillsDelete(String skillId) => '/skills/$skillId';

  // Automation Endpoints
  static const String automationRunBot = '/automation/run-bot';
  static const String automationStart = '/automation/start';
  static const String automationStop = '/automation/stop';
  static const String automationLogs = '/automation/logs';
  static const String automationStatus = '/automation/status';
  static const String automationClearLogs = '/automation/clear-logs';
  static const String automationReset = '/automation/reset';
  static const String automationSchedule = '/automation/schedule';
  static const String automationCancelSchedule = '/automation/cancel-schedule';
  static const String automationScheduleStatus = '/automation/schedule-status';
  static const String automationRunFilter = '/automation/run-filter';
  static const String automationFilterLogs = '/automation/filter-logs';
  static const String automationStopFilter = '/automation/stop-filter';

  // Job Results Endpoints
  static const String jobResults = '/job-results';
  static const String jobResultsStats = '/job-results/stats';
  static const String jobResultsExport = '/job-results/export';

  // Filters Endpoints
  static const String filtersAll = '/filters/all';
  static const String filtersUser = '/filters/user';
  static String filtersType(String type) => '/filters/$type';

  // Subscription Endpoints
  static const String subscriptionPlans = '/subscription/plans';
  static String subscriptionPlan(String planId) => '/subscription/plan/$planId';
  static const String subscriptionCreateOrder = '/subscription/create-order';
  static const String subscriptionCreateGuestOrder = '/subscription/create-guest-order';
  static const String subscriptionVerifyPayment = '/subscription/verify-payment';
  static const String subscriptionStatus = '/subscription/status';
  static const String subscriptionCurrent = '/subscription/current';
  static const String subscriptionHistory = '/subscription/history';
  static const String subscriptionCancel = '/subscription/cancel';
  static const String subscriptionApplyCoupon = '/subscription/apply-coupon';

  // Plans Endpoints
  static const String plans = '/plans';
  static String plan(String planId) => '/plans/$planId';

  // Profile Update Endpoints
  static const String profileUpdateNaukriUpdate = '/profile-update/naukri/update-resume';
  static const String profileUpdateResult = '/profile-update/result';
  static const String profileUpdateSchedulerConfigure = '/profile-update/scheduler/configure';
  static const String profileUpdateSchedulerStatus = '/profile-update/scheduler/status';

  // Suggestions Endpoints
  static const String suggestions = '/suggestions';
  static const String suggestionsStats = '/suggestions/stats/summary';

  // Credentials Endpoints
  static const String credentialsSet = '/credentials/set';
  static const String credentialsCheck = '/credentials/check';
  static const String credentialsClear = '/credentials/clear';

  // Health Check
  static const String health = '/health';
}
