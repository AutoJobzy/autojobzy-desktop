import 'package:intl/intl.dart';

/// Date Formatter Utility
class DateFormatter {
  /// Format date to readable string (e.g., "Jan 15, 2024")
  static String formatDate(DateTime date) {
    return DateFormat('MMM dd, yyyy').format(date);
  }

  /// Format date to short string (e.g., "15 Jan")
  static String formatShortDate(DateTime date) {
    return DateFormat('dd MMM').format(date);
  }

  /// Format time to string (e.g., "10:30 AM")
  static String formatTime(DateTime date) {
    return DateFormat('hh:mm a').format(date);
  }

  /// Format date and time (e.g., "Jan 15, 2024 10:30 AM")
  static String formatDateTime(DateTime date) {
    return DateFormat('MMM dd, yyyy hh:mm a').format(date);
  }

  /// Format date to ISO 8601 for API
  static String formatIso(DateTime date) {
    return date.toIso8601String();
  }

  /// Parse ISO 8601 date string
  static DateTime? parseIso(String? dateString) {
    if (dateString == null) return null;
    try {
      return DateTime.parse(dateString);
    } catch (e) {
      return null;
    }
  }

  /// Get relative time (e.g., "2 hours ago", "Yesterday")
  static String getRelativeTime(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inSeconds < 60) {
      return 'Just now';
    } else if (difference.inMinutes < 60) {
      return '${difference.inMinutes} ${difference.inMinutes == 1 ? 'minute' : 'minutes'} ago';
    } else if (difference.inHours < 24) {
      return '${difference.inHours} ${difference.inHours == 1 ? 'hour' : 'hours'} ago';
    } else if (difference.inDays == 1) {
      return 'Yesterday';
    } else if (difference.inDays < 7) {
      return '${difference.inDays} days ago';
    } else if (difference.inDays < 30) {
      final weeks = (difference.inDays / 7).floor();
      return '$weeks ${weeks == 1 ? 'week' : 'weeks'} ago';
    } else if (difference.inDays < 365) {
      final months = (difference.inDays / 30).floor();
      return '$months ${months == 1 ? 'month' : 'months'} ago';
    } else {
      final years = (difference.inDays / 365).floor();
      return '$years ${years == 1 ? 'year' : 'years'} ago';
    }
  }

  /// Format date for API query parameter (YYYY-MM-DD)
  static String formatForApi(DateTime date) {
    return DateFormat('yyyy-MM-dd').format(date);
  }

  /// Get date range string (e.g., "Jan 1 - Jan 31, 2024")
  static String formatDateRange(DateTime start, DateTime end) {
    if (start.year == end.year) {
      if (start.month == end.month) {
        return '${DateFormat('MMM dd').format(start)} - ${DateFormat('dd, yyyy').format(end)}';
      } else {
        return '${DateFormat('MMM dd').format(start)} - ${DateFormat('MMM dd, yyyy').format(end)}';
      }
    } else {
      return '${formatDate(start)} - ${formatDate(end)}';
    }
  }

  /// Get day of week (e.g., "Monday")
  static String getDayOfWeek(DateTime date) {
    return DateFormat('EEEE').format(date);
  }

  /// Get short day of week (e.g., "Mon")
  static String getShortDayOfWeek(DateTime date) {
    return DateFormat('EEE').format(date);
  }

  /// Check if date is today
  static bool isToday(DateTime date) {
    final now = DateTime.now();
    return date.year == now.year &&
        date.month == now.month &&
        date.day == now.day;
  }

  /// Check if date is yesterday
  static bool isYesterday(DateTime date) {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return date.year == yesterday.year &&
        date.month == yesterday.month &&
        date.day == yesterday.day;
  }

  /// Get start of day
  static DateTime startOfDay(DateTime date) {
    return DateTime(date.year, date.month, date.day);
  }

  /// Get end of day
  static DateTime endOfDay(DateTime date) {
    return DateTime(date.year, date.month, date.day, 23, 59, 59, 999);
  }
}
