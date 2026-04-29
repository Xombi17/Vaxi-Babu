import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/config/app_config.dart';
import '../../navigation/presentation/voice_fab.dart';
import '../application/dashboard_overview_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  static const String routePath = '/dashboard';

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboardValue = ref.watch(dashboardOverviewProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Vaxi Babu'),
      ),
      body: RefreshIndicator(
        onRefresh: () async => ref.refresh(dashboardOverviewProvider.future),
        child: dashboardValue.when(
          data: (overview) => ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        overview.households.isEmpty
                            ? 'Welcome'
                            : overview.households.first.name,
                        style: Theme.of(context).textTheme.headlineSmall,
                      ),
                      const SizedBox(height: 8),
                      Text(
                        'Track upcoming vaccines, reminders, and family health milestones from one place.',
                        style: Theme.of(context).textTheme.bodyLarge,
                      ),
                      const SizedBox(height: 20),
                      Wrap(
                        spacing: 12,
                        runSpacing: 12,
                        children: [
                          _MetricChip(
                            label: 'Households',
                            value: overview.households.length.toString(),
                          ),
                          _MetricChip(
                            label: 'Dependents',
                            value: overview.dependents.length.toString(),
                          ),
                          _MetricChip(
                            label: 'Open reminders',
                            value: overview.reminders.length.toString(),
                          ),
                        ],
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Today\'s reminders',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 16),
                      if (overview.reminders.isEmpty)
                        const Text('No reminders are due right now.')
                      else
                        ...overview.reminders.take(5).map(
                              (reminder) => Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: _ReminderRow(
                                  eventName: reminder.eventName,
                                  dueDate: reminder.dueDate,
                                  status: reminder.status.name,
                                ),
                              ),
                            ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Card(
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Dependents overview',
                        style: Theme.of(context).textTheme.titleLarge,
                      ),
                      const SizedBox(height: 16),
                      if (overview.dependents.isEmpty)
                        const Text('No dependents have been added yet.')
                      else
                        ...overview.dependents.take(4).map(
                              (dependent) => Padding(
                                padding: const EdgeInsets.only(bottom: 12),
                                child: Row(
                                  children: [
                                    CircleAvatar(
                                      child: Text(_initialFor(dependent.name)),
                                    ),
                                    const SizedBox(width: 12),
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment: CrossAxisAlignment.start,
                                        children: [
                                          Text(
                                            dependent.name,
                                            style: Theme.of(context)
                                                .textTheme
                                                .titleMedium,
                                          ),
                                          Text(
                                            '${_capitalize(dependent.type.name)} • DOB ${_formatDate(dependent.dateOfBirth)}',
                                          ),
                                        ],
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                    ],
                  ),
                ),
              ),
            ],
          ),
          error: (error, _) => ListView(
            padding: const EdgeInsets.all(24),
            children: [
              const SizedBox(height: 120),
              const Icon(Icons.error_outline_rounded, size: 56),
              const SizedBox(height: 16),
              Text(
                error.toString(),
                textAlign: TextAlign.center,
              ),
            ],
          ),
          loading: () => const Center(child: CircularProgressIndicator()),
        ),
      ),
    );
  }
}

class _MetricChip extends StatelessWidget {
  const _MetricChip({
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.surfaceContainerHighest,
        borderRadius: BorderRadius.circular(18),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            value,
            style: Theme.of(context).textTheme.titleLarge,
          ),
          Text(label),
        ],
      ),
    );
  }
}

class _ReminderRow extends StatelessWidget {
  const _ReminderRow({
    required this.eventName,
    required this.dueDate,
    required this.status,
  });

  final String eventName;
  final DateTime dueDate;
  final String status;

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Icon(Icons.circle, size: 10),
        const SizedBox(width: 10),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                eventName,
                style: Theme.of(context).textTheme.titleMedium,
              ),
              Text('Due ${_formatDate(dueDate)} • ${_capitalize(status)}'),
            ],
          ),
        ),
      ],
    );
  }
}

String _formatDate(DateTime value) {
  final month = value.month.toString().padLeft(2, '0');
  final day = value.day.toString().padLeft(2, '0');
  return '$day/$month/${value.year}';
}

String _capitalize(String value) {
  if (value.isEmpty) {
    return value;
  }
  return '${value[0].toUpperCase()}${value.substring(1)}';
}

String _initialFor(String value) {
  if (value.isEmpty) {
    return '?';
  }
  return String.fromCharCode(value.runes.first).toUpperCase();
}
