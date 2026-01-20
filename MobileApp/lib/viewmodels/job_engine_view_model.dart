import '../models/automation_log_model.dart';
import '../services/automation_service.dart';
import 'base_view_model.dart';

/// Job Engine ViewModel
class JobEngineViewModel extends BaseViewModel {
  final AutomationService _automationService = AutomationService();

  AutomationStatusModel? _status;
  List<AutomationLogModel> _logs = [];

  AutomationStatusModel? get status => _status;
  List<AutomationLogModel> get logs => _logs;
  bool get isRunning => _status?.isRunning ?? false;

  /// Start automation bot
  Future<bool> startAutomation({Map<String, dynamic>? filters}) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _automationService.startAutomation(
          filters: filters,
        );

        if (response.success) {
          // Reload status to get updated info
          await getStatus();
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to start automation');
        }
      },
      errorMessage: 'Failed to start automation',
      successMessage: 'Automation started successfully',
    );

    return result ?? false;
  }

  /// Stop automation bot
  Future<bool> stopAutomation() async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _automationService.stopAutomation();

        if (response.success) {
          // Reload status to get updated info
          await getStatus();
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to stop automation');
        }
      },
      errorMessage: 'Failed to stop automation',
      successMessage: 'Automation stopped successfully',
    );

    return result ?? false;
  }

  /// Get automation status
  Future<bool> getStatus() async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _automationService.getAutomationStatus();

        if (response.success && response.data != null) {
          _status = response.data;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to get automation status');
        }
      },
      errorMessage: 'Failed to get automation status',
    );

    return result ?? false;
  }

  /// Get automation logs
  Future<bool> getLogs({int limit = 100, int offset = 0}) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _automationService.getLogs(
          limit: limit,
          offset: offset,
        );

        if (response.success && response.data != null) {
          _logs = response.data!;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to load logs');
        }
      },
      errorMessage: 'Failed to load logs',
    );

    return result ?? false;
  }

  /// Schedule automation
  Future<bool> scheduleAutomation({
    required String scheduleTime,
    required bool enabled,
  }) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _automationService.scheduleAutomation(
          scheduleTime: scheduleTime,
          enabled: enabled,
        );

        if (response.success) {
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to schedule automation');
        }
      },
      errorMessage: 'Failed to schedule automation',
      successMessage: 'Schedule updated successfully',
    );

    return result ?? false;
  }

  /// Get schedule
  Future<bool> getSchedule() async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _automationService.getSchedule();

        if (response.success) {
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to get schedule');
        }
      },
      errorMessage: 'Failed to get schedule',
    );

    return result ?? false;
  }

  /// Refresh status and logs
  Future<bool> refresh() async {
    final result = await runBusyFuture<bool>(
      () async {
        await getStatus();
        await getLogs();
        return true;
      },
      errorMessage: 'Failed to refresh',
    );

    return result ?? false;
  }
}
