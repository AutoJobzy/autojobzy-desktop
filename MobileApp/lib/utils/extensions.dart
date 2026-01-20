import 'package:flutter/material.dart';

/// String Extensions
extension StringExtensions on String {
  /// Capitalize first letter
  String capitalize() {
    if (isEmpty) return this;
    return '${this[0].toUpperCase()}${substring(1)}';
  }

  /// Capitalize each word
  String capitalizeWords() {
    if (isEmpty) return this;
    return split(' ').map((word) => word.capitalize()).join(' ');
  }

  /// Check if string is email
  bool get isEmail {
    final emailRegex = RegExp(
      r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$',
    );
    return emailRegex.hasMatch(this);
  }

  /// Check if string is phone number
  bool get isPhoneNumber {
    final phoneRegex = RegExp(r'^[0-9]{10}$');
    return phoneRegex.hasMatch(this);
  }

  /// Truncate string with ellipsis
  String truncate(int maxLength) {
    if (length <= maxLength) return this;
    return '${substring(0, maxLength)}...';
  }

  /// Remove all whitespace
  String removeWhitespace() {
    return replaceAll(RegExp(r'\s+'), '');
  }

  /// Check if string is numeric
  bool get isNumeric {
    return double.tryParse(this) != null;
  }
}

/// BuildContext Extensions
extension BuildContextExtensions on BuildContext {
  /// Get screen width
  double get screenWidth => MediaQuery.of(this).size.width;

  /// Get screen height
  double get screenHeight => MediaQuery.of(this).size.height;

  /// Get safe area padding
  EdgeInsets get safeAreaPadding => MediaQuery.of(this).padding;

  /// Check if device is in dark mode
  bool get isDarkMode => Theme.of(this).brightness == Brightness.dark;

  /// Get theme colors
  ColorScheme get colors => Theme.of(this).colorScheme;

  /// Get text theme
  TextTheme get textTheme => Theme.of(this).textTheme;

  /// Show snackbar
  void showSnackBar(
    String message, {
    Color? backgroundColor,
    Duration duration = const Duration(seconds: 3),
  }) {
    ScaffoldMessenger.of(this).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: backgroundColor,
        duration: duration,
      ),
    );
  }

  /// Show error snackbar
  void showErrorSnackBar(String message) {
    showSnackBar(
      message,
      backgroundColor: Colors.red,
      duration: const Duration(seconds: 4),
    );
  }

  /// Show success snackbar
  void showSuccessSnackBar(String message) {
    showSnackBar(
      message,
      backgroundColor: Colors.green,
      duration: const Duration(seconds: 2),
    );
  }

  /// Hide keyboard
  void hideKeyboard() {
    FocusScope.of(this).unfocus();
  }
}

/// DateTime Extensions
extension DateTimeExtensions on DateTime {
  /// Check if date is in the past
  bool get isPast => isBefore(DateTime.now());

  /// Check if date is in the future
  bool get isFuture => isAfter(DateTime.now());

  /// Check if date is today
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  /// Check if date is yesterday
  bool get isYesterday {
    final yesterday = DateTime.now().subtract(const Duration(days: 1));
    return year == yesterday.year &&
        month == yesterday.month &&
        day == yesterday.day;
  }

  /// Check if date is tomorrow
  bool get isTomorrow {
    final tomorrow = DateTime.now().add(const Duration(days: 1));
    return year == tomorrow.year &&
        month == tomorrow.month &&
        day == tomorrow.day;
  }

  /// Get start of day
  DateTime get startOfDay {
    return DateTime(year, month, day);
  }

  /// Get end of day
  DateTime get endOfDay {
    return DateTime(year, month, day, 23, 59, 59, 999);
  }

  /// Add days
  DateTime addDays(int days) {
    return add(Duration(days: days));
  }

  /// Subtract days
  DateTime subtractDays(int days) {
    return subtract(Duration(days: days));
  }
}

/// List Extensions
extension ListExtensions<T> on List<T> {
  /// Check if list is null or empty
  bool get isNullOrEmpty => isEmpty;

  /// Check if list is not null and not empty
  bool get isNotNullOrEmpty => isNotEmpty;

  /// Get first element or null
  T? get firstOrNull => isEmpty ? null : first;

  /// Get last element or null
  T? get lastOrNull => isEmpty ? null : last;
}

/// Number Extensions
extension IntExtensions on int {
  /// Format as currency (₹)
  String get toCurrency => '₹$this';

  /// Format with thousand separators
  String get formatted {
    return toString().replaceAllMapped(
      RegExp(r'(\d{1,3})(?=(\d{3})+(?!\d))'),
      (Match m) => '${m[1]},',
    );
  }

  /// Convert to abbreviated string (e.g., 1000 -> 1K)
  String get abbreviated {
    if (this < 1000) return toString();
    if (this < 1000000) return '${(this / 1000).toStringAsFixed(1)}K';
    if (this < 1000000000) return '${(this / 1000000).toStringAsFixed(1)}M';
    return '${(this / 1000000000).toStringAsFixed(1)}B';
  }
}

extension DoubleExtensions on double {
  /// Format as currency (₹)
  String get toCurrency => '₹${toStringAsFixed(2)}';

  /// Format as percentage
  String get toPercentage => '${toStringAsFixed(1)}%';

  /// Round to decimal places
  double roundToDecimal(int places) {
    final mod = 10.0 * places;
    return ((this * mod).round().toDouble() / mod);
  }
}
