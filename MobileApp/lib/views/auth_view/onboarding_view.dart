import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../constants/color_constants.dart';
import '../../constants/route_constants.dart';
import '../../viewmodels/auth_view_model.dart';
import '../../widgets/common_button.dart';
import '../../widgets/common_text_field.dart';
import '../../utils/validators.dart';

/// Onboarding Screen - Naukri Credentials Setup
class OnboardingView extends StatefulWidget {
  const OnboardingView({Key? key}) : super(key: key);

  @override
  State<OnboardingView> createState() => _OnboardingViewState();
}

class _OnboardingViewState extends State<OnboardingView> {
  final _formKey = GlobalKey<FormState>();
  final _naukriUsernameController = TextEditingController();
  final _naukriPasswordController = TextEditingController();
  bool _obscurePassword = true;
  bool _isVerifying = false;

  @override
  void dispose() {
    _naukriUsernameController.dispose();
    _naukriPasswordController.dispose();
    super.dispose();
  }

  Future<void> _handleVerifyAndComplete() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isVerifying = true;
    });

    final authViewModel = context.read<AuthViewModel>();

    // First verify Naukri credentials
    final verifySuccess = await authViewModel.verifyNaukriCredentials(
      username: _naukriUsernameController.text.trim(),
      password: _naukriPasswordController.text,
    );

    if (!verifySuccess) {
      setState(() {
        _isVerifying = false;
      });

      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authViewModel.errorMessage ?? 'Invalid Naukri credentials'),
          backgroundColor: ColorConstants.error,
        ),
      );
      return;
    }

    // Then complete onboarding
    final completeSuccess = await authViewModel.completeOnboarding();

    setState(() {
      _isVerifying = false;
    });

    if (!mounted) return;

    if (completeSuccess) {
      // Navigate to home
      Navigator.pushReplacementNamed(context, RouteConstants.home);
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(authViewModel.errorMessage ?? 'Failed to complete setup'),
          backgroundColor: ColorConstants.error,
        ),
      );
    }
  }

  void _handleSkip() {
    // Skip onboarding for now
    Navigator.pushReplacementNamed(context, RouteConstants.home);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const SizedBox(height: 20),

                // Progress Indicator
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 4,
                        decoration: BoxDecoration(
                          gradient: ColorConstants.primaryGradient,
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 30),

                // Illustration
                Center(
                  child: Container(
                    width: 120,
                    height: 120,
                    decoration: BoxDecoration(
                      color: ColorConstants.primaryBlue.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(30),
                    ),
                    child: const Icon(
                      Icons.assignment_ind_outlined,
                      size: 60,
                      color: ColorConstants.primaryBlue,
                    ),
                  ),
                ),
                const SizedBox(height: 30),

                // Title
                const Text(
                  'Connect Your Naukri Account',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.bold,
                    color: ColorConstants.textDark,
                  ),
                ),
                const SizedBox(height: 12),

                // Description
                Text(
                  'To automate your job applications, we need your Naukri.com credentials. Your data is encrypted and secure.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontSize: 14,
                    color: Colors.grey.shade600,
                    height: 1.5,
                  ),
                ),
                const SizedBox(height: 40),

                // Info Card
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: ColorConstants.info.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: ColorConstants.info.withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.info_outline,
                        color: ColorConstants.info,
                        size: 24,
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Text(
                          'We\'ll verify your credentials to ensure seamless automation',
                          style: TextStyle(
                            fontSize: 13,
                            color: Colors.grey.shade700,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 30),

                // Naukri Username
                CommonTextField(
                  controller: _naukriUsernameController,
                  labelText: 'Naukri Username/Email',
                  hintText: 'Enter your Naukri username or email',
                  prefixIcon: const Icon(Icons.person_outline),
                  keyboardType: TextInputType.emailAddress,
                  textInputAction: TextInputAction.next,
                  validator: (value) => Validators.required(value, fieldName: 'Naukri username'),
                ),
                const SizedBox(height: 16),

                // Naukri Password
                CommonTextField(
                  controller: _naukriPasswordController,
                  labelText: 'Naukri Password',
                  hintText: 'Enter your Naukri password',
                  prefixIcon: const Icon(Icons.lock_outline),
                  obscureText: _obscurePassword,
                  suffixIcon: IconButton(
                    icon: Icon(
                      _obscurePassword ? Icons.visibility_off : Icons.visibility,
                    ),
                    onPressed: () {
                      setState(() {
                        _obscurePassword = !_obscurePassword;
                      });
                    },
                  ),
                  textInputAction: TextInputAction.done,
                  onFieldSubmitted: (_) => _handleVerifyAndComplete(),
                  validator: (value) => Validators.required(value, fieldName: 'Naukri password'),
                ),
                const SizedBox(height: 30),

                // Verify and Continue Button
                CommonButton(
                  text: 'Verify and Continue',
                  onPressed: _handleVerifyAndComplete,
                  isLoading: _isVerifying,
                ),
                const SizedBox(height: 16),

                // Skip Button
                CommonButton(
                  text: 'Skip for Now',
                  onPressed: _handleSkip,
                  isOutlined: true,
                ),
                const SizedBox(height: 20),

                // Security Note
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Icon(
                      Icons.lock_outline,
                      size: 16,
                      color: Colors.grey.shade600,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'Your credentials are encrypted and secure',
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
