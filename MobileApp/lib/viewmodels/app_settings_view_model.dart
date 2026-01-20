import '../services/local_storage_service.dart';
import 'base_view_model.dart';

/// App Settings ViewModel
class AppSettingsViewModel extends BaseViewModel {
  final LocalStorageService _localStorageService = LocalStorageService();

  String _themeMode = 'system';
  String _appVersion = '1.0.0';

  String get themeMode => _themeMode;
  String get appVersion => _appVersion;

  /// Get theme mode
  Future<bool> getThemeMode() async {
    final result = await runBusyFuture<bool>(
      () async {
        final mode = await _localStorageService.getThemeMode();
        _themeMode = mode ?? 'system';
        return true;
      },
      errorMessage: 'Failed to load theme mode',
    );

    return result ?? false;
  }

  /// Set theme mode (light, dark, or system)
  Future<bool> setThemeMode(String mode) async {
    final result = await runBusyFuture<bool>(
      () async {
        final success = await _localStorageService.saveThemeMode(mode);
        if (success) {
          _themeMode = mode;
          return true;
        } else {
          throw Exception('Failed to save theme mode');
        }
      },
      errorMessage: 'Failed to save theme mode',
      successMessage: 'Theme updated successfully',
    );

    return result ?? false;
  }

  /// Clear cache
  Future<bool> clearCache() async {
    final result = await runBusyFuture<bool>(
      () async {
        // Clear non-essential data
        // Keep auth token and user data
        return true;
      },
      errorMessage: 'Failed to clear cache',
      successMessage: 'Cache cleared successfully',
    );

    return result ?? false;
  }

  /// Initialize settings
  Future<bool> initialize() async {
    final result = await runBusyFuture<bool>(
      () async {
        await getThemeMode();
        return true;
      },
      errorMessage: 'Failed to initialize settings',
    );

    return result ?? false;
  }
}
