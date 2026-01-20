# AutoJobzy Mobile App

Flutter mobile application for AutoJobzy - Job Automation Platform

## 📱 Project Overview

This is the mobile version of the AutoJobzy desktop application, built using Flutter with MVVM (Model-View-ViewModel) architecture pattern. The app provides job seekers with an automated way to apply for jobs on Naukri.com directly from their mobile devices.

## 🏗️ Architecture

**Pattern**: MVVM (Model-View-ViewModel)
**State Management**: Provider
**Navigation**: Material Page Route with Named Routes

### Folder Structure

```
MobileApp/
├── lib/
│   ├── main.dart                 # App entry point
│   ├── app.dart                  # App configuration
│   │
│   ├── constants/                # App constants
│   │   ├── api_constants.dart    # API endpoints
│   │   ├── app_constants.dart    # App configuration
│   │   ├── color_constants.dart  # Theme colors
│   │   ├── string_constants.dart # UI strings
│   │   └── route_constants.dart  # Route paths
│   │
│   ├── models/                   # Data models
│   │   ├── api_response_model.dart
│   │   ├── user_model.dart
│   │   ├── auth_response_model.dart
│   │   ├── job_settings_model.dart
│   │   ├── skill_model.dart
│   │   ├── job_application_result_model.dart
│   │   ├── plan_model.dart
│   │   └── subscription_model.dart
│   │
│   ├── services/                 # API & Business logic
│   │   ├── api_service.dart
│   │   ├── local_storage_service.dart
│   │   ├── auth_service.dart
│   │   ├── job_settings_service.dart
│   │   ├── automation_service.dart
│   │   ├── skill_service.dart
│   │   └── ... (more services to be added)
│   │
│   ├── viewmodels/               # Business logic layer
│   │   ├── base_view_model.dart
│   │   └── ... (view models for each screen)
│   │
│   ├── views/                    # UI screens
│   │   ├── auth_view/
│   │   ├── job_engine_view/
│   │   ├── my_activity_view/
│   │   ├── job_profile_view/
│   │   ├── auto_profile_update_view/
│   │   ├── application_history_view/
│   │   ├── my_plan_view/
│   │   ├── suggest_earn_view/
│   │   └── app_settings_view/
│   │
│   ├── widgets/                  # Reusable widgets
│   │   ├── common_button.dart
│   │   ├── common_text_field.dart
│   │   ├── loading_widget.dart
│   │   ├── error_widget.dart
│   │   └── empty_state_widget.dart
│   │
│   ├── utils/                    # Helper utilities
│   │   ├── validators.dart
│   │   ├── date_formatter.dart
│   │   ├── error_handler.dart
│   │   └── extensions.dart
│   │
│   └── routes/                   # Navigation
│       ├── app_routes.dart
│       └── route_generator.dart
│
├── assets/                       # Static assets
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── test/                         # Tests
│   ├── unit_tests/
│   ├── widget_tests/
│   └── integration_tests/
│
├── pubspec.yaml                  # Dependencies
└── README.md
```

## 🚀 Features

### Core Screens

1. **Job Engine** - Automation control interface
   - Start/Stop automation
   - Real-time logs
   - Filter configuration
   - Scheduling

2. **My Activity** - Analytics dashboard
   - Application statistics
   - Match rate charts
   - Daily trends

3. **Job Profile** - Profile management
   - Personal information
   - Skills management
   - Resume upload
   - Naukri credentials

4. **Auto Profile Update** - Profile freshness
   - Automatic updates
   - Schedule configuration
   - Update history

5. **Application History** - Job tracking
   - Paginated list
   - Filter options
   - Export functionality

6. **My Plan** - Subscription management
   - Current plan status
   - Available plans
   - Payment integration (Razorpay)

7. **Suggest & Earn** - Feedback system
   - Submit suggestions
   - Track status
   - Earn rewards

8. **App Settings** - Preferences
   - Theme selection
   - Notifications
   - Account management

## 📦 Dependencies

### Core
- **flutter_sdk** - Flutter framework
- **provider** (^6.1.1) - State management

### Networking
- **dio** (^5.4.0) - HTTP client
- **http** (^1.2.0) - Additional HTTP support

### Storage
- **shared_preferences** (^2.2.2) - Key-value storage
- **hive** (^2.2.3) - NoSQL database
- **hive_flutter** (^1.1.0) - Hive Flutter integration

### UI Components
- **google_fonts** (^6.1.0) - Custom fonts
- **flutter_svg** (^2.0.9) - SVG support
- **cached_network_image** (^3.3.1) - Image caching
- **shimmer** (^3.0.0) - Loading effects
- **lottie** (^3.0.0) - Animations

### Forms & Validation
- **flutter_form_builder** (^9.1.1) - Form management
- **form_builder_validators** (^9.1.0) - Validators

### Charts
- **fl_chart** (^0.66.0) - Charts and graphs

### Files
- **file_picker** (^6.1.1) - File selection
- **path_provider** (^2.1.2) - Path access

### Payment
- **razorpay_flutter** (^1.3.6) - Payment gateway

### Utilities
- **intl** (^0.19.0) - Internationalization
- **timeago** (^3.6.0) - Time formatting
- **url_launcher** (^6.2.4) - Launch URLs

## 🛠️ Setup Instructions

### Prerequisites
- Flutter SDK (>= 3.0.0)
- Dart SDK (>= 3.0.0)
- Android Studio / VS Code
- Android SDK / Xcode (for iOS)

### Installation

1. **Navigate to MobileApp directory**
   ```bash
   cd MobileApp
   ```

2. **Install dependencies**
   ```bash
   flutter pub get
   ```

3. **Run code generation (if using build_runner)**
   ```bash
   flutter pub run build_runner build --delete-conflicting-outputs
   ```

4. **Run the app**
   ```bash
   flutter run
   ```

### Build APK (Android)
```bash
flutter build apk --release
```

### Build iOS
```bash
flutter build ios --release
```

## 🌐 API Configuration

The app connects to the AutoJobzy backend API.

**Base URL**: `https://api.autojobzy.com/api`

Configure in: `lib/constants/api_constants.dart`

## 📱 Development Phases

### Phase 1: Foundation ✅
- [x] Project structure setup
- [x] Constants configuration
- [x] Base models
- [x] API service with Dio
- [x] Local storage service
- [x] Base ViewModel
- [x] Common widgets
- [x] Navigation setup
- [x] Entry points

### Phase 2: Authentication 🚧
- [ ] Login screen
- [ ] Signup screen
- [ ] Onboarding flow
- [ ] Auth ViewModel
- [ ] Token management

### Phase 3: Core Features 📋
- [ ] Job Profile screen
- [ ] Job Engine screen
- [ ] My Activity screen
- [ ] Application History screen

### Phase 4: Advanced Features 📋
- [ ] My Plan screen
- [ ] Auto Profile Update screen
- [ ] Suggest & Earn screen
- [ ] App Settings screen

### Phase 5: Polish 📋
- [ ] Error handling
- [ ] Loading states
- [ ] Empty states
- [ ] Testing
- [ ] Performance optimization

## 🎨 Design System

### Colors
- **Primary Blue**: #00F3FF (Neon Blue)
- **Primary Purple**: #9333EA
- **Success**: #10B981
- **Error**: #EF4444
- **Warning**: #F59E0B
- **Info**: #3B82F6

### Typography
- Font Family: Poppins
- Sizes: 12, 14, 16, 18, 20, 24

### Spacing
- XS: 4px
- S: 8px
- M: 16px
- L: 24px
- XL: 32px

## 🧪 Testing

### Unit Tests
```bash
flutter test
```

### Widget Tests
```bash
flutter test test/widget_tests
```

### Integration Tests
```bash
flutter test integration_test
```

## 📝 Naming Conventions

- **Folders**: snake_case (e.g., `job_engine_view`)
- **Files**: snake_case (e.g., `job_engine_view.dart`)
- **Classes**: PascalCase (e.g., `JobEngineView`)
- **Variables**: camelCase (e.g., `isLoading`)
- **Constants**: SCREAMING_SNAKE_CASE (e.g., `API_BASE_URL`)

## 🔐 Security

- API tokens stored securely in SharedPreferences
- Sensitive data encrypted
- HTTPS only communication
- No hardcoded credentials

## 📄 License

This project is part of AutoJobzy platform.

## 👥 Team

- **Architecture**: MVVM with Provider
- **Backend**: Node.js + Express
- **Database**: MySQL
- **Payment**: Razorpay

## 📞 Support

For issues and questions:
- Email: support@autojobzy.com
- Website: https://autojobzy.com

## 🚀 Next Steps

1. Implement authentication screens
2. Create all view screens
3. Integrate all API endpoints
4. Add payment gateway
5. Implement push notifications
6. Add offline support
7. Performance optimization
8. Release to Play Store & App Store

---

**Note**: This mobile app is independent of the main desktop application and connects to the same backend API. No changes have been made to the existing desktop code.
