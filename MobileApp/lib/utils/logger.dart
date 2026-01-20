import 'package:flutter/foundation.dart';

/// Logger Utility
class Logger {
  static const String _prefix = '[AutoJobzy]';

  /// Log debug message
  static void debug(String message, [dynamic data]) {
    if (kDebugMode) {
      print('$_prefix [DEBUG] $message');
      if (data != null) {
        print('$_prefix [DATA] $data');
      }
    }
  }

  /// Log info message
  static void info(String message, [dynamic data]) {
    if (kDebugMode) {
      print('$_prefix [INFO] $message');
      if (data != null) {
        print('$_prefix [DATA] $data');
      }
    }
  }

  /// Log warning message
  static void warning(String message, [dynamic data]) {
    if (kDebugMode) {
      print('$_prefix [WARNING] $message');
      if (data != null) {
        print('$_prefix [DATA] $data');
      }
    }
  }

  /// Log error message
  static void error(String message, [dynamic error, StackTrace? stackTrace]) {
    if (kDebugMode) {
      print('$_prefix [ERROR] $message');
      if (error != null) {
        print('$_prefix [ERROR DETAILS] $error');
      }
      if (stackTrace != null) {
        print('$_prefix [STACK TRACE]\n$stackTrace');
      }
    }
  }

  /// Log API request
  static void apiRequest(String method, String endpoint, [dynamic data]) {
    if (kDebugMode) {
      print('$_prefix [API REQUEST] $method $endpoint');
      if (data != null) {
        print('$_prefix [REQUEST DATA] $data');
      }
    }
  }

  /// Log API response
  static void apiResponse(String endpoint, int statusCode, [dynamic data]) {
    if (kDebugMode) {
      print('$_prefix [API RESPONSE] $endpoint - Status: $statusCode');
      if (data != null) {
        print('$_prefix [RESPONSE DATA] $data');
      }
    }
  }

  /// Log navigation
  static void navigation(String from, String to) {
    if (kDebugMode) {
      print('$_prefix [NAVIGATION] $from → $to');
    }
  }

  /// Log state change
  static void stateChange(String viewModel, String state) {
    if (kDebugMode) {
      print('$_prefix [STATE] $viewModel: $state');
    }
  }
}
