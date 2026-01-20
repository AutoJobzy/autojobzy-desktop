import '../services/profile_update_service.dart';
import 'base_view_model.dart';

/// Auto Profile Update ViewModel
class AutoProfileUpdateViewModel extends BaseViewModel {
  final ProfileUpdateService _profileUpdateService = ProfileUpdateService();

  Map<String, dynamic>? _schedulerConfig;
  Map<String, dynamic>? _updateResult;

  Map<String, dynamic>? get schedulerConfig => _schedulerConfig;
  Map<String, dynamic>? get updateResult => _updateResult;

  /// Update Naukri profile
  Future<bool> updateProfile() async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _profileUpdateService.updateNaukriProfile();

        if (response.success && response.data != null) {
          _updateResult = response.data;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to update profile');
        }
      },
      errorMessage: 'Failed to update profile',
      successMessage: 'Profile updated successfully',
    );

    return result ?? false;
  }

  /// Configure scheduler
  Future<bool> configureScheduler({
    required bool enabled,
    required String frequency,
    String? time,
  }) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _profileUpdateService.configureScheduler(
          enabled: enabled,
          frequency: frequency,
          time: time,
        );

        if (response.success && response.data != null) {
          _schedulerConfig = response.data;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to configure scheduler');
        }
      },
      errorMessage: 'Failed to configure scheduler',
      successMessage: 'Scheduler configured successfully',
    );

    return result ?? false;
  }

  /// Get scheduler status
  Future<bool> getSchedulerStatus() async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _profileUpdateService.getSchedulerStatus();

        if (response.success && response.data != null) {
          _schedulerConfig = response.data;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to get scheduler status');
        }
      },
      errorMessage: 'Failed to get scheduler status',
    );

    return result ?? false;
  }

  /// Get update result
  Future<bool> getUpdateResult() async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _profileUpdateService.getUpdateResult();

        if (response.success && response.data != null) {
          _updateResult = response.data;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to get update result');
        }
      },
      errorMessage: 'Failed to get update result',
    );

    return result ?? false;
  }

  /// Initialize - Load scheduler status and update result
  Future<bool> initialize() async {
    final result = await runBusyFuture<bool>(
      () async {
        await getSchedulerStatus();
        await getUpdateResult();
        return true;
      },
      errorMessage: 'Failed to initialize',
    );

    return result ?? false;
  }
}
