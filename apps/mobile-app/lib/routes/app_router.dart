import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../features/splash/splash_screen.dart';
import '../features/auth/login_screen.dart';
import '../features/home/home_screen.dart';

final appRouter = GoRouter(
  initialLocation: '/splash',
  debugLogDiagnostics: true,
  routes: [
    GoRoute(
      path: '/splash',
      name: 'splash',
      builder: (context, state) => const SplashScreen(),
    ),
    GoRoute(
      path: '/login',
      name: 'login',
      builder: (context, state) => const LoginScreen(),
    ),
    GoRoute(
      path: '/home',
      name: 'home',
      builder: (context, state) => const HomeScreen(),
    ),
    GoRoute(
      path: '/cameras',
      name: 'cameras',
      builder: (context, state) => const Scaffold(
        body: Center(child: Text('قائمة الكاميرات - قيد التطوير')),
      ),
    ),
    GoRoute(
      path: '/alerts',
      name: 'alerts',
      builder: (context, state) => const Scaffold(
        body: Center(child: Text('التنبيهات - قيد التطوير')),
      ),
    ),
    GoRoute(
      path: '/analytics',
      name: 'analytics',
      builder: (context, state) => const Scaffold(
        body: Center(child: Text('التحليلات - قيد التطوير')),
      ),
    ),
    GoRoute(
      path: '/settings',
      name: 'settings',
      builder: (context, state) => const Scaffold(
        body: Center(child: Text('الإعدادات - قيد التطوير')),
      ),
    ),
  ],
  errorBuilder: (context, state) => Scaffold(
    body: Center(
      child: Text('الصفحة غير موجودة: ${state.uri}'),
    ),
  ),
);
