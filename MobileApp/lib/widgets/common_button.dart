import 'package:flutter/material.dart';
import '../constants/color_constants.dart';

/// Common Button Widget
class CommonButton extends StatelessWidget {
  final String text;
  final VoidCallback? onPressed;
  final bool isLoading;
  final bool isEnabled;
  final Color? color;
  final Color? textColor;
  final double? width;
  final double height;
  final double borderRadius;
  final EdgeInsetsGeometry? padding;
  final Widget? icon;
  final bool isOutlined;

  const CommonButton({
    Key? key,
    required this.text,
    this.onPressed,
    this.isLoading = false,
    this.isEnabled = true,
    this.color,
    this.textColor,
    this.width,
    this.height = 50.0,
    this.borderRadius = 12.0,
    this.padding,
    this.icon,
    this.isOutlined = false,
  }) : super(key: key);

  @override
  Widget build(BuildContext context) {
    final buttonColor = color ?? ColorConstants.primaryBlue;
    final effectiveTextColor = textColor ??
        (isOutlined ? buttonColor : ColorConstants.textLight);

    return SizedBox(
      width: width,
      height: height,
      child: isOutlined
          ? OutlinedButton(
              onPressed: isEnabled && !isLoading ? onPressed : null,
              style: OutlinedButton.styleFrom(
                foregroundColor: effectiveTextColor,
                side: BorderSide(
                  color: isEnabled
                      ? buttonColor
                      : ColorConstants.buttonDisabled,
                  width: 2,
                ),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(borderRadius),
                ),
                padding: padding ?? const EdgeInsets.symmetric(horizontal: 24),
              ),
              child: _buildButtonChild(effectiveTextColor),
            )
          : ElevatedButton(
              onPressed: isEnabled && !isLoading ? onPressed : null,
              style: ElevatedButton.styleFrom(
                backgroundColor:
                    isEnabled ? buttonColor : ColorConstants.buttonDisabled,
                foregroundColor: effectiveTextColor,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(borderRadius),
                ),
                padding: padding ?? const EdgeInsets.symmetric(horizontal: 24),
                elevation: isEnabled ? 2 : 0,
              ),
              child: _buildButtonChild(effectiveTextColor),
            ),
    );
  }

  Widget _buildButtonChild(Color textColor) {
    if (isLoading) {
      return SizedBox(
        height: 20,
        width: 20,
        child: CircularProgressIndicator(
          strokeWidth: 2,
          valueColor: AlwaysStoppedAnimation<Color>(textColor),
        ),
      );
    }

    if (icon != null) {
      return Row(
        mainAxisSize: MainAxisSize.min,
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          icon!,
          const SizedBox(width: 8),
          Text(
            text,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
              color: textColor,
            ),
          ),
        ],
      );
    }

    return Text(
      text,
      style: TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: textColor,
      ),
    );
  }
}
