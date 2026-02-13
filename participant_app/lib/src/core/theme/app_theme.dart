import 'package:flutter/material.dart';

class AppTheme {
  static const Color orange = Color(0xFFFF7A00);
  static const Color lightGreen = Color(0xFF9EE86F);
  static const Color blue = Color(0xFF0E6BA8);
  static const Color ink = Color(0xFF12263A);

  static ThemeData light() {
    final base = ThemeData(
      useMaterial3: true,
      colorScheme: ColorScheme.fromSeed(
        seedColor: orange,
        brightness: Brightness.light,
      ).copyWith(
        primary: orange,
        secondary: lightGreen,
        tertiary: blue,
      ),
    );

    return base.copyWith(
      scaffoldBackgroundColor: const Color(0xFFF6FAFF),
      appBarTheme: const AppBarTheme(
        backgroundColor: Colors.transparent,
        foregroundColor: ink,
        elevation: 0,
        centerTitle: false,
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        color: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(18),
          side: const BorderSide(color: Color(0xFFDDE8F2)),
        ),
      ),
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(14),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: orange,
          foregroundColor: Colors.white,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          padding: const EdgeInsets.symmetric(vertical: 14, horizontal: 18),
        ),
      ),
    );
  }

  static BoxDecoration pageGradient() {
    return const BoxDecoration(
      gradient: LinearGradient(
        colors: [
          Color(0xFFFFF0E1),
          Color(0xFFEFFFF3),
        ],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
    );
  }
}
