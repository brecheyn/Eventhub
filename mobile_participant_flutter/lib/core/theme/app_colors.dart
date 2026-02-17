import 'package:flutter/material.dart';

class AppColors {
  static const Color orange = Color(0xFFF97316);
  static const Color orangeLight = Color(0xFFFFEDD5);
  static const Color lightGreen = Color(0xFF84CC16);
  static const Color blue = Color(0xFF0EA5E9);
  static const Color blueDark = Color(0xFF0284C7);
  static const Color lightGreenDark = Color(0xFF65A30D);
  static const Color darkText = Color(0xFF0F172A);
  static const Color mutedText = Color(0xFF475569);
  static const Color surface = Color(0xFFFFFFFF);
  static const Color cardBlueTint = Color(0xFFEFF6FF);
  static const Color cardGreenTint = Color(0xFFF0FDF4);
  static const Color cardBorder = Color(0xFFE2E8F0);

  static const LinearGradient heroGradient = LinearGradient(
    colors: [blue, lightGreen],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient accentGradient = LinearGradient(
    colors: [blueDark, lightGreenDark],
    begin: Alignment.topCenter,
    end: Alignment.bottomCenter,
  );
}
