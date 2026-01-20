import '../models/job_result_stats_model.dart';
import '../services/job_results_service.dart';
import 'base_view_model.dart';

/// My Activity ViewModel
class MyActivityViewModel extends BaseViewModel {
  final JobResultsService _jobResultsService = JobResultsService();

  JobResultStatsModel? _stats;

  JobResultStatsModel? get stats => _stats;

  /// Load statistics
  Future<bool> loadStats({String? startDate, String? endDate}) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _jobResultsService.getStats(
          startDate: startDate,
          endDate: endDate,
        );

        if (response.success && response.data != null) {
          _stats = response.data;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to load statistics');
        }
      },
      errorMessage: 'Failed to load statistics',
    );

    return result ?? false;
  }

  /// Refresh statistics
  Future<bool> refreshStats({String? startDate, String? endDate}) async {
    final result = await runBusyFuture<bool>(
      () async {
        final response = await _jobResultsService.getStats(
          startDate: startDate,
          endDate: endDate,
        );

        if (response.success && response.data != null) {
          _stats = response.data;
          return true;
        } else {
          throw Exception(response.error ?? 'Failed to refresh statistics');
        }
      },
      errorMessage: 'Failed to refresh statistics',
      successMessage: 'Statistics refreshed',
    );

    return result ?? false;
  }
}
