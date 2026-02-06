import 'package:flutter/material.dart';

class AppTheme {
  // Couleurs
  static const Color primaryBlack = Color(0xFF1a1a1a);
  static const Color primaryRed = Color(0xFFE63946);
  static const Color primaryWhite = Color(0xFFF5F5F5);
  static const Color darkGray = Color(0xFF2d2d2d);
  static const Color lightGray = Color(0xFFe0e0e0);

  // Gradients
  static final LinearGradient blackRedGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primaryBlack, primaryRed],
  );

  static final LinearGradient whiteRedGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primaryWhite, primaryRed],
  );

  static final LinearGradient redBlackGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primaryRed, primaryBlack],
  );

  static ThemeData lightTheme = ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    primaryColor: primaryRed,
    scaffoldBackgroundColor: primaryWhite,
    appBarTheme: AppBarTheme(
      backgroundColor: primaryBlack,
      foregroundColor: primaryWhite,
      elevation: 0,
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primaryRed,
        foregroundColor: primaryWhite,
        padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 12),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
    ),
    textButtonTheme: TextButtonThemeData(
      style: TextButton.styleFrom(
        foregroundColor: primaryRed,
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: lightGray,
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: lightGray),
      ),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: lightGray),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: primaryRed, width: 2),
      ),
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
    ),
  );

  static TextStyle headingLarge = const TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
    color: primaryBlack,
  );

  static TextStyle headingMedium = const TextStyle(
    fontSize: 24,
    fontWeight: FontWeight.bold,
    color: primaryBlack,
  );

  static TextStyle headingSmall = const TextStyle(
    fontSize: 18,
    fontWeight: FontWeight.w600,
    color: primaryBlack,
  );

  static TextStyle bodyLarge = const TextStyle(
    fontSize: 16,
    fontWeight: FontWeight.normal,
    color: primaryBlack,
  );

  static TextStyle bodyMedium = const TextStyle(
    fontSize: 14,
    fontWeight: FontWeight.normal,
    color: primaryBlack,
  );

  static TextStyle bodySmall = const TextStyle(
    fontSize: 12,
    fontWeight: FontWeight.normal,
    color: Color(0xFF666666),
  );
}