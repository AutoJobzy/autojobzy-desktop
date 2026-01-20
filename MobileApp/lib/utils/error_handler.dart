import 'package:dio/dio.dart';

/// Error Handler Utility
class ErrorHandler {
  /// Get user-friendly error message from exception
  static String getErrorMessage(dynamic error) {
    if (error is DioException) {
      return _getDioErrorMessage(error);
    } else if (error is Exception) {
      return error.toString().replaceAll('Exception: ', '');
    } else {
      return error.toString();
    }
  }

  /// Get error message from Dio exception
  static String _getDioErrorMessage(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
        return 'Connection timeout. Please check your internet connection.';

      case DioExceptionType.sendTimeout:
        return 'Request timeout. Please try again.';

      case DioExceptionType.receiveTimeout:
        return 'Server response timeout. Please try again.';

      case DioExceptionType.badResponse:
        return _handleBadResponse(error);

      case DioExceptionType.cancel:
        return 'Request cancelled.';

      case DioExceptionType.connectionError:
        return 'No internet connection. Please check your network.';

      case DioExceptionType.badCertificate:
        return 'Security error. Please try again later.';

      case DioExceptionType.unknown:
        return 'An unexpected error occurred. Please try again.';

      // ignore: unreachable_switch_default
      default:
        return 'An error occurred. Please try again.';
    }
  }

  /// Handle bad response from server
  static String _handleBadResponse(DioException error) {
    final statusCode = error.response?.statusCode;
    final data = error.response?.data;

    // Try to extract error message from response
    if (data is Map) {
      if (data['message'] != null) {
        return data['message'].toString();
      } else if (data['error'] != null) {
        if (data['error'] is String) {
          return data['error'].toString();
        } else if (data['error'] is Map && data['error']['message'] != null) {
          return data['error']['message'].toString();
        }
      }
    }

    // Return status code specific message
    switch (statusCode) {
      case 400:
        return 'Invalid request. Please check your input.';
      case 401:
        return 'Unauthorized. Please login again.';
      case 403:
        return 'Access denied. You don\'t have permission.';
      case 404:
        return 'Resource not found.';
      case 422:
        return 'Validation error. Please check your input.';
      case 429:
        return 'Too many requests. Please try again later.';
      case 500:
        return 'Server error. Please try again later.';
      case 502:
        return 'Bad gateway. Please try again later.';
      case 503:
        return 'Service unavailable. Please try again later.';
      default:
        return 'An error occurred. Please try again.';
    }
  }

  /// Check if error is network error
  static bool isNetworkError(dynamic error) {
    if (error is DioException) {
      return error.type == DioExceptionType.connectionError ||
          error.type == DioExceptionType.connectionTimeout;
    }
    return false;
  }

  /// Check if error is unauthorized
  static bool isUnauthorized(dynamic error) {
    if (error is DioException) {
      return error.response?.statusCode == 401;
    }
    return false;
  }

  /// Check if error is validation error
  static bool isValidationError(dynamic error) {
    if (error is DioException) {
      return error.response?.statusCode == 422;
    }
    return false;
  }

  /// Get validation errors map
  static Map<String, String>? getValidationErrors(dynamic error) {
    if (error is DioException && error.response?.statusCode == 422) {
      final data = error.response?.data;
      if (data is Map && data['errors'] is Map) {
        return Map<String, String>.from(
          (data['errors'] as Map).map(
            (key, value) => MapEntry(
              key.toString(),
              value is List ? value.first.toString() : value.toString(),
            ),
          ),
        );
      }
    }
    return null;
  }
}
