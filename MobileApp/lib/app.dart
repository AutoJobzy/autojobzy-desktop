import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'constants/color_constants.dart';
import 'constants/string_constants.dart';
import 'routes/app_routes.dart';
import 'routes/route_generator.dart';
import 'viewmodels/auth_view_model.dart';
import 'viewmodels/job_profile_view_model.dart';
import 'viewmodels/job_engine_view_model.dart';
import 'viewmodels/my_activity_view_model.dart';
import 'viewmodels/application_history_view_model.dart';
import 'viewmodels/my_plan_view_model.dart';
import 'viewmodels/auto_profile_update_view_model.dart';
import 'viewmodels/suggest_earn_view_model.dart';
import 'viewmodels/app_settings_view_model.dart';

/// Main App Widget
class AutoJobzyApp extends StatelessWidget {
  const AutoJobzyApp({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        // Authentication
        ChangeNotifierProvider(create: (_) => AuthViewModel()),

        // Job Profile
        ChangeNotifierProvider(create: (_) => JobProfileViewModel()),

        // Job Engine/Automation
        ChangeNotifierProvider(create: (_) => JobEngineViewModel()),

        // Activity/Statistics
        ChangeNotifierProvider(create: (_) => MyActivityViewModel()),

        // Application History
        ChangeNotifierProvider(create: (_) => ApplicationHistoryViewModel()),

        // Subscription/Plans
        ChangeNotifierProvider(create: (_) => MyPlanViewModel()),

        // Profile Update
        ChangeNotifierProvider(create: (_) => AutoProfileUpdateViewModel()),

        // Suggestions/Feedback
        ChangeNotifierProvider(create: (_) => SuggestEarnViewModel()),

        // App Settings
        ChangeNotifierProvider(create: (_) => AppSettingsViewModel()),
      ],
      child: MaterialApp(
        title: StringConstants.appName,
        debugShowCheckedModeBanner: false,

        // Theme
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: ColorConstants.primaryBlue,
            brightness: Brightness.light,
          ),
          scaffoldBackgroundColor: ColorConstants.backgroundLight,
          appBarTheme: const AppBarTheme(
            backgroundColor: ColorConstants.backgroundLight,
            elevation: 0,
            centerTitle: true,
            iconTheme: IconThemeData(color: ColorConstants.textDark),
            titleTextStyle: TextStyle(
              color: ColorConstants.textDark,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
          cardTheme: CardThemeData(
            elevation: 2,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
          elevatedButtonTheme: ElevatedButtonThemeData(
            style: ElevatedButton.styleFrom(
              backgroundColor: ColorConstants.primaryBlue,
              foregroundColor: Colors.white,
              elevation: 2,
              padding: const EdgeInsets.symmetric(
                horizontal: 24,
                vertical: 12,
              ),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
          ),
          inputDecorationTheme: InputDecorationTheme(
            filled: true,
            fillColor: ColorConstants.backgroundLight,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: ColorConstants.borderLight,
              ),
            ),
            enabledBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: ColorConstants.borderLight,
              ),
            ),
            focusedBorder: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
              borderSide: const BorderSide(
                color: ColorConstants.primaryBlue,
                width: 2,
              ),
            ),
          ),
        ),

        // Dark Theme
        darkTheme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: ColorConstants.primaryBlue,
            brightness: Brightness.dark,
          ),
          scaffoldBackgroundColor: ColorConstants.backgroundDark,
          appBarTheme: const AppBarTheme(
            backgroundColor: ColorConstants.backgroundDark,
            elevation: 0,
            centerTitle: true,
            iconTheme: IconThemeData(color: ColorConstants.textLight),
            titleTextStyle: TextStyle(
              color: ColorConstants.textLight,
              fontSize: 18,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),

        // Theme Mode
        themeMode: ThemeMode.system,

        // Initial Route
        initialRoute: AppRoutes.splash,

        // Route Generator
        onGenerateRoute: RouteGenerator.generateRoute,
      ),
    );
  }
}
