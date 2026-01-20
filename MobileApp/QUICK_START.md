# Quick Start Guide

## Get Running in 3 Steps

### 1. Install Dependencies (2 minutes)
```bash
cd /Users/rohan/Downloads/Job_automate-main/MobileApp
flutter pub get
```

### 2. Run the App (1 minute)
```bash
flutter run
```

### 3. Test Login
- Email: Your test account
- Password: Your password
- Or create new account via Signup

## That's It! 🎉

The app will:
1. Show splash screen
2. Navigate to login
3. After login → show home screen with 4 tabs
4. All features are fully functional

## Quick Commands

```bash
# Run app
flutter run

# Run on specific device
flutter devices           # List devices
flutter run -d <device>   # Run on device

# Build APK
flutter build apk --release

# Clean build
flutter clean
flutter pub get
flutter run

# View logs
flutter logs

# Hot reload (when app is running)
Press 'r' in terminal

# Hot restart
Press 'R' in terminal

# Quit
Press 'q' in terminal
```

## Project Structure at a Glance

```
MobileApp/lib/
├── constants/      # API URLs, colors, strings
├── models/         # Data structures
├── services/       # API calls
├── viewmodels/     # Business logic
├── views/          # UI screens
├── widgets/        # Reusable components
├── utils/          # Helpers
└── routes/         # Navigation
```

## All Screens Available

1. **Splash** → Auto-login check
2. **Login** → Email + password
3. **Signup** → Create account
4. **Onboarding** → Naukri credentials
5. **Home** → Bottom nav with 4 tabs
   - Job Engine → Automation controls
   - My Activity → Analytics + charts
   - Job Profile → Profile management
   - More → Additional features
6. **Auto Profile Update** → Schedule updates
7. **Application History** → Job applications
8. **My Plan** → Subscription + Razorpay
9. **Suggest & Earn** → Feedback
10. **App Settings** → Preferences

## Common Issues & Solutions

**Issue: Errors in IDE**
- Solution: Run `flutter pub get` first

**Issue: App won't start**
```bash
flutter clean
flutter pub get
flutter run
```

**Issue: No devices found**
```bash
# For Android
- Open Android Studio
- Start Android Emulator

# For iOS (Mac only)
- Open Xcode
- Start iOS Simulator
```

**Issue: Build fails**
- Check Flutter version: `flutter --version`
- Should be >= 3.0.0
- Update if needed: `flutter upgrade`

## Feature Checklist

After app starts, test these:

✅ Login with existing account
✅ Create new account
✅ View job profile
✅ Add/edit skills
✅ Upload resume
✅ Start automation
✅ View live logs
✅ Check analytics
✅ View application history
✅ Browse subscription plans
✅ Submit suggestion
✅ Change app theme

## Backend API

The app connects to:
```
https://api.autojobzy.com/api
```

Change in: `lib/constants/api_constants.dart`

## Need Help?

1. Check [SETUP.md](SETUP.md) for detailed docs
2. Check [README.md](README.md) for architecture
3. Run `flutter doctor` to check system
4. View logs: `flutter logs`

## Development Tips

### Hot Reload (Fast)
- Press `r` in terminal
- Keeps app state
- Updates UI instantly

### Hot Restart (Medium)
- Press `R` in terminal
- Resets app state
- Full reload

### Full Rebuild (Slow)
```bash
flutter run
```

### Debug Mode Features
- All logs visible in console
- Error overlay on screen
- Performance overlay available

## Production Build

### Android APK
```bash
flutter build apk --release
```
Output: `build/app/outputs/flutter-apk/app-release.apk`

### iOS (Mac only)
```bash
flutter build ios --release
```
Then open in Xcode and archive.

## You're Ready! 🚀

Everything is set up and working. Just run:

```bash
cd MobileApp
flutter pub get
flutter run
```

Enjoy your bug-free mobile app! 🎉
