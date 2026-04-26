import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/application/auth_controller.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/dependents/presentation/dependents_screen.dart';
import '../../features/navigation/presentation/app_shell.dart';
import '../../features/medicine/presentation/medicine_screen.dart';
import '../../features/reminders/presentation/reminders_screen.dart';
import '../../features/settings/presentation/settings_screen.dart';
import '../../features/splash/presentation/splash_screen.dart';
import '../../features/timeline/presentation/timeline_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final authState = ref.watch(authControllerProvider);

  return GoRouter(
    initialLocation: SplashScreen.routePath,
    redirect: (context, state) {
      final isCheckingSession = authState.isLoading;
      final isAuthenticated = authState.valueOrNull != null;
      final currentPath = state.uri.path;

      final isOnSplash = currentPath == SplashScreen.routePath;
      final isOnLogin = currentPath == LoginScreen.routePath;

      if (isCheckingSession) {
        return null;
      }

      if (!isAuthenticated) {
        return isOnLogin ? null : LoginScreen.routePath;
      }

      if (isOnSplash || isOnLogin) {
        return DashboardScreen.routePath;
      }

      return null;
    },
    routes: [
      GoRoute(
        path: SplashScreen.routePath,
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: LoginScreen.routePath,
        builder: (context, state) => const LoginScreen(),
      ),
      StatefulShellRoute.indexedStack(
        builder: (context, state, navigationShell) => AppShell(
          navigationShell: navigationShell,
        ),
        branches: [
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: DashboardScreen.routePath,
                builder: (context, state) => const DashboardScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: DependentsScreen.routePath,
                builder: (context, state) => const DependentsScreen(),
                routes: [
                  GoRoute(
                    path: ':dependentId/timeline',
                    builder: (context, state) => TimelineScreen(
                      dependentId: state.pathParameters['dependentId']!,
                    ),
                  ),
                ],
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: RemindersScreen.routePath,
                builder: (context, state) => const RemindersScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: SettingsScreen.routePath,
                builder: (context, state) => const SettingsScreen(),
              ),
            ],
          ),
          StatefulShellBranch(
            routes: [
              GoRoute(
                path: MedicineScreen.routePath,
                builder: (context, state) => const MedicineScreen(),
              ),
            ],
          ),
        ],
      ),
    ],
  );
});
