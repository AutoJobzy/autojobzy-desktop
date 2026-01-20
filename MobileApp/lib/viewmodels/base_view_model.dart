import 'package:flutter/foundation.dart';

/// View State Enum
enum ViewState {
  idle,
  busy,
  error,
  success,
}

/// Base ViewModel for MVVM Pattern
/// All ViewModels should extend this class
abstract class BaseViewModel extends ChangeNotifier {
  ViewState _state = ViewState.idle;
  String? _errorMessage;
  String? _successMessage;

  /// Current view state
  ViewState get state => _state;

  /// Error message
  String? get errorMessage => _errorMessage;

  /// Success message
  String? get successMessage => _successMessage;

  /// Check if view is busy
  bool get isBusy => _state == ViewState.busy;

  /// Check if view has error
  bool get hasError => _state == ViewState.error;

  /// Check if view is idle
  bool get isIdle => _state == ViewState.idle;

  /// Check if view has success
  bool get hasSuccess => _state == ViewState.success;

  /// Set view state to busy (loading)
  void setBusy() {
    _state = ViewState.busy;
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();
  }

  /// Set view state to idle
  void setIdle() {
    _state = ViewState.idle;
    _errorMessage = null;
    _successMessage = null;
    notifyListeners();
  }

  /// Set view state to error with message
  void setError(String message) {
    _state = ViewState.error;
    _errorMessage = message;
    _successMessage = null;
    notifyListeners();
  }

  /// Set view state to success with optional message
  void setSuccess([String? message]) {
    _state = ViewState.success;
    _successMessage = message;
    _errorMessage = null;
    notifyListeners();
  }

  /// Clear error message
  void clearError() {
    _errorMessage = null;
    if (_state == ViewState.error) {
      _state = ViewState.idle;
    }
    notifyListeners();
  }

  /// Clear success message
  void clearSuccess() {
    _successMessage = null;
    if (_state == ViewState.success) {
      _state = ViewState.idle;
    }
    notifyListeners();
  }

  /// Execute async operation with automatic state management
  Future<T?> runBusyFuture<T>(
    Future<T> Function() future, {
    String? errorMessage,
    String? successMessage,
    bool setIdleOnComplete = true,
  }) async {
    setBusy();
    try {
      final result = await future();
      if (successMessage != null) {
        setSuccess(successMessage);
      } else if (setIdleOnComplete) {
        setIdle();
      }
      return result;
    } catch (e) {
      setError(errorMessage ?? e.toString());
      return null;
    }
  }

  /// Dispose resources
  @override
  void dispose() {
    super.dispose();
  }
}
