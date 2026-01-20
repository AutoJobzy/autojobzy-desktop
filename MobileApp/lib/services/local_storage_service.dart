import 'dart:convert';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';
import '../models/user_model.dart';

/// Local Storage Service using SharedPreferences
class LocalStorageService {
  static final LocalStorageService _instance = LocalStorageService._internal();
  factory LocalStorageService() => _instance;
  LocalStorageService._internal();

  SharedPreferences? _prefs;

  /// Initialize SharedPreferences
  Future<void> init() async {
    _prefs ??= await SharedPreferences.getInstance();
  }

  Future<SharedPreferences> get _preferences async {
    if (_prefs == null) {
      await init();
    }
    return _prefs!;
  }

  // ==================== TOKEN MANAGEMENT ====================

  /// Save auth token
  Future<bool> saveToken(String token) async {
    final prefs = await _preferences;
    return await prefs.setString(AppConstants.keyToken, token);
  }

  /// Get auth token
  Future<String?> getToken() async {
    final prefs = await _preferences;
    return prefs.getString(AppConstants.keyToken);
  }

  /// Clear auth token
  Future<bool> clearToken() async {
    final prefs = await _preferences;
    return await prefs.remove(AppConstants.keyToken);
  }

  /// Check if token exists
  Future<bool> hasToken() async {
    final token = await getToken();
    return token != null && token.isNotEmpty;
  }

  // ==================== USER MANAGEMENT ====================

  /// Save user data
  Future<bool> saveUser(UserModel user) async {
    final prefs = await _preferences;
    final userJson = jsonEncode(user.toJson());
    return await prefs.setString(AppConstants.keyUser, userJson);
  }

  /// Get user data
  Future<UserModel?> getUser() async {
    final prefs = await _preferences;
    final userJson = prefs.getString(AppConstants.keyUser);

    if (userJson != null) {
      try {
        final userMap = jsonDecode(userJson) as Map<String, dynamic>;
        return UserModel.fromJson(userMap);
      } catch (e) {
        print('Error parsing user data: $e');
        return null;
      }
    }
    return null;
  }

  /// Clear user data
  Future<bool> clearUser() async {
    final prefs = await _preferences;
    return await prefs.remove(AppConstants.keyUser);
  }

  // ==================== LOGIN STATE ====================

  /// Set login state
  Future<bool> setLoggedIn(bool value) async {
    final prefs = await _preferences;
    return await prefs.setBool(AppConstants.keyIsLoggedIn, value);
  }

  /// Check if user is logged in
  Future<bool> isLoggedIn() async {
    final prefs = await _preferences;
    return prefs.getBool(AppConstants.keyIsLoggedIn) ?? false;
  }

  // ==================== THEME ====================

  /// Save theme mode (light/dark)
  Future<bool> saveThemeMode(String themeMode) async {
    final prefs = await _preferences;
    return await prefs.setString(AppConstants.keyThemeMode, themeMode);
  }

  /// Get theme mode
  Future<String?> getThemeMode() async {
    final prefs = await _preferences;
    return prefs.getString(AppConstants.keyThemeMode);
  }

  // ==================== ONBOARDING ====================

  /// Set onboarding completed
  Future<bool> setOnboardingCompleted(bool value) async {
    final prefs = await _preferences;
    return await prefs.setBool(AppConstants.keyOnboardingCompleted, value);
  }

  /// Check if onboarding is completed
  Future<bool> isOnboardingCompleted() async {
    final prefs = await _preferences;
    return prefs.getBool(AppConstants.keyOnboardingCompleted) ?? false;
  }

  // ==================== GENERIC STORAGE ====================

  /// Save string value
  Future<bool> setString(String key, String value) async {
    final prefs = await _preferences;
    return await prefs.setString(key, value);
  }

  /// Get string value
  Future<String?> getString(String key) async {
    final prefs = await _preferences;
    return prefs.getString(key);
  }

  /// Save int value
  Future<bool> setInt(String key, int value) async {
    final prefs = await _preferences;
    return await prefs.setInt(key, value);
  }

  /// Get int value
  Future<int?> getInt(String key) async {
    final prefs = await _preferences;
    return prefs.getInt(key);
  }

  /// Save bool value
  Future<bool> setBool(String key, bool value) async {
    final prefs = await _preferences;
    return await prefs.setBool(key, value);
  }

  /// Get bool value
  Future<bool?> getBool(String key) async {
    final prefs = await _preferences;
    return prefs.getBool(key);
  }

  /// Save double value
  Future<bool> setDouble(String key, double value) async {
    final prefs = await _preferences;
    return await prefs.setDouble(key, value);
  }

  /// Get double value
  Future<double?> getDouble(String key) async {
    final prefs = await _preferences;
    return prefs.getDouble(key);
  }

  /// Save list of strings
  Future<bool> setStringList(String key, List<String> value) async {
    final prefs = await _preferences;
    return await prefs.setStringList(key, value);
  }

  /// Get list of strings
  Future<List<String>?> getStringList(String key) async {
    final prefs = await _preferences;
    return prefs.getStringList(key);
  }

  /// Remove a key
  Future<bool> remove(String key) async {
    final prefs = await _preferences;
    return await prefs.remove(key);
  }

  /// Clear all data
  Future<bool> clearAll() async {
    final prefs = await _preferences;
    return await prefs.clear();
  }

  /// Check if key exists
  Future<bool> containsKey(String key) async {
    final prefs = await _preferences;
    return prefs.containsKey(key);
  }

  // ==================== LOGOUT ====================

  /// Logout - Clear all user-related data
  Future<void> logout() async {
    await clearToken();
    await clearUser();
    await setLoggedIn(false);
  }
}
