import 'package:flutter/material.dart';

/// Color Constants for AutoJobzy App Theme
class ColorConstants {
  // Primary Colors
  static const Color primaryBlue = Color(0xFF00F3FF); // Neon Blue
  static const Color primaryPurple = Color(0xFF9333EA); // Neon Purple
  static const Color primaryDark = Color(0xFF1A1A2E);
  static const Color primaryLight = Color(0xFFF8F9FA);

  // Gradient Colors
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [primaryBlue, primaryPurple],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  // Background Colors
  static const Color backgroundDark = Color(0xFF0F0F23);
  static const Color backgroundLight = Color(0xFFFFFFFF);
  static const Color cardDark = Color(0xFF1F1F3A);
  static const Color cardLight = Color(0xFFF5F5F5);

  // Text Colors
  static const Color textPrimary = Color(0xFF000000);
  static const Color textSecondary = Color(0xFF6B7280);
  static const Color textLight = Color(0xFFFFFFFF);
  static const Color textDark = Color(0xFF111827);

  // Status Colors
  static const Color success = Color(0xFF10B981);
  static const Color error = Color(0xFFEF4444);
  static const Color warning = Color(0xFFF59E0B);
  static const Color info = Color(0xFF3B82F6);

  // Match Score Colors
  static const Color matchGood = Color(0xFF10B981); // Green
  static const Color matchPoor = Color(0xFFEF4444); // Red

  // Application Status Colors
  static const Color statusApplied = Color(0xFF10B981);
  static const Color statusSkipped = Color(0xFF6B7280);
  static const Color statusFailed = Color(0xFFEF4444);

  // Button Colors
  static const Color buttonPrimary = primaryBlue;
  static const Color buttonSecondary = primaryPurple;
  static const Color buttonDisabled = Color(0xFFD1D5DB);

  // Border Colors
  static const Color borderLight = Color(0xFFE5E7EB);
  static const Color borderDark = Color(0xFF374151);

  // Shimmer Colors
  static const Color shimmerBase = Color(0xFFE0E0E0);
  static const Color shimmerHighlight = Color(0xFFF5F5F5);

  // Chart Colors
  static const List<Color> chartColors = [
    Color(0xFF00F3FF), // Neon Blue
    Color(0xFF9333EA), // Purple
    Color(0xFFEC4899), // Pink
    Color(0xFFF59E0B), // Orange
    Color(0xFF10B981), // Green
    Color(0xFFEF4444), // Red
  ];

  // Suggestion Type Colors
  static const Color featureRequestColor = Color(0xFFF59E0B); // Orange
  static const Color bugReportColor = Color(0xFFEF4444); // Red
  static const Color uxImprovementColor = Color(0xFF9333EA); // Purple
  static const Color generalFeedbackColor = Color(0xFF3B82F6); // Blue

  // Subscription Plan Colors
  static const Color planBasic = Color(0xFF6366F1);
  static const Color planPro = Color(0xFFEC4899);
  static const Color planEnterprise = Color(0xFFF59E0B);

  // Overlay Colors
  static Color overlayLight = Colors.black.withOpacity(0.3);
  static Color overlayDark = Colors.black.withOpacity(0.7);

  // Shadow Colors
  static Color shadowLight = Colors.black.withOpacity(0.1);
  static Color shadowDark = Colors.black.withOpacity(0.3);
}
