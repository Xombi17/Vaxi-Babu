import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../core/network/api_exception.dart';
import '../application/pregnancy_controller.dart';
import '../data/models/pregnancy_profile.dart';

class PregnancyScreen extends ConsumerStatefulWidget {
  const PregnancyScreen({super.key, required this.householdId});

  static const String routePath = '/pregnancy';
  final String householdId;

  @override
  ConsumerState<PregnancyScreen> createState() => _PregnancyScreenState();
}

class _PregnancyScreenState extends ConsumerState<PregnancyScreen> {
  final _lmpController = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  @override
  void initState() {
    super.initState();
    // Load existing pregnancy profile when screen is initialized
    ref.read(pregnancyControllerProvider.notifier).loadPregnancyProfile(widget.householdId);

    // Set default LMP to today if not already set via deep linking or navigation
    if (_lmpController.text.isEmpty) {
      _lmpController.text = DateTime.now().toIso8601String().split('T')[0];
    }
  }

  @override
  void dispose() {
    _lmpController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    final lmpDate = DateTime.parse(_lmpController.text);

    await ref.read(pregnancyControllerProvider.notifier).createPregnancyProfile(
          householdId: widget.householdId,
          lmpDate: lmpDate,
        );
  }

  @override
  Widget build(BuildContext context) {
    final pregnancyState = ref.watch(pregnancyControllerProvider);
    final errorMessage = pregnancyState.error;
    final profile = pregnancyState.profile;

    return Scaffold(
      appBar: AppBar(
        title: profile != null
            ? const Text('Pregnancy Tracking')
            : const Text('Add Pregnancy Profile'),
        actions: [
          if (profile != null)
            IconButton(
              icon: const Icon(Icons.refresh),
              tooltip: 'Refresh',
              onPressed: () {
                ref.read(pregnancyControllerProvider.notifier)
                    .loadPregnancyProfile(widget.householdId);
              },
            ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (profile != null) ...[
                _buildProfileCard(profile),
                const SizedBox(height: 24),
                _buildUpdateSection(pregnancyState),
              ] else ...[
                _buildAddPregnancyForm(pregnancyState),
              ],
              if (errorMessage != null) ...[
                const SizedBox(height: 24),
                _ErrorBanner(message: errorMessage),
              ],
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildProfileCard(PregnancyProfile profile) {
    final weeksPregnant = _calculateWeeksPregnant(profile.lmpDate);
    final daysUntilDue = profile.expectedDueDate.difference(DateTime.now()).inDays;

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Pregnancy Profile',
              style: Theme.of(context).textTheme.titleLarge,
            ),
            const SizedBox(height: 16),
            InfoRow(
              label: 'Last Menstrual Period (LMP)',
              value: _formatDate(profile.lmpDate),
            ),
            InfoRow(
              label: 'Expected Due Date',
              value: _formatDate(profile.expectedDueDate),
            ),
            InfoRow(
              label: 'Weeks Pregnant',
              value: weeksPregnant >= 0 ? '$weeksPregnant weeks' : 'Not yet pregnant',
            ),
            InfoRow(
              label: 'Days Until Due',
              value: daysUntilDue > 0
                  ? '$daysUntilDue days'
                  : daysUntilDue == 0
                      ? 'Due today!'
                      : '${-daysUntilDue} days overdue',
            ),
            if (profile.highRiskFlags != null && profile.highRiskFlags!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                'High Risk Flags:',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 4),
              Text(
                profile.highRiskFlags!,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
            if (profile.notes != null && profile.notes!.isNotEmpty) ...[
              const SizedBox(height: 12),
              Text(
                'Notes:',
                style: Theme.of(context).textTheme.titleMedium,
              ),
              const SizedBox(height: 4),
              Text(
                profile.notes!,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildAddPregnancyForm(PregnancyState pregnancyState) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Add Pregnancy Profile',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 16),
        Text(
          'Enter the first day of your last menstrual period (LMP) to track your pregnancy.',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        const SizedBox(height: 24),
        Form(
          key: _formKey,
          child: Column(
            children: [
              TextFormField(
                controller: _lmpController,
                decoration: const InputDecoration(
                  labelText: 'LMP Date (YYYY-MM-DD)',
                  hintText: 'Enter the first day of your last period',
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.calendar_today),
                ),
                keyboardType: TextInputType.datetime,
                validator: (value) {
                  if (value == null || value.trim().isEmpty) {
                    return 'Please enter LMP date.';
                  }
                  try {
                    final date = DateTime.parse(value);
                    // Basic validation: not too far in past or future
                    final now = DateTime.now();
                    final maxPast = now.subtract(const Duration(days: 365 * 2)); // 2 years max
                    final maxFuture = now.add(const Duration(days: 365)); // 1 year future

                    if (date.isBefore(maxPast)) {
                      return 'Date is too far in the past.';
                    }
                    if (date.isAfter(maxFuture)) {
                      return 'Date is too far in the future.';
                    }
                  } catch (e) {
                    return 'Please enter a valid date (YYYY-MM-DD format).';
                  }
                  return null;
                },
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        FilledButton.icon(
          onPressed: pregnancyState.isLoading ? null : _submit,
          icon: pregnancyState.isLoading
              ? SizedBox(
                  width: 20,
                  height: 20,
                  child: CircularProgressIndicator(strokeWidth: 2),
                )
              : const Icon(Icons.add),
          label: Text(pregnancyState.isLoading ? 'Saving...' : 'Create Pregnancy Profile'),
        ),
      ],
    );
  }

  Widget _buildUpdateSection(PregnancyState pregnancyState) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          'Update Pregnancy Profile',
          style: Theme.of(context).textTheme.titleLarge,
        ),
        const SizedBox(height: 16),
        const Text(
          'Mark as completed when pregnancy has ended or update risk flags.',
          style: Theme.of(context).textTheme.bodyMedium,
        ),
        const SizedBox(height: 24),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: pregnancyState.isLoading ? null : () => _updateProfile(completed: true),
                icon: const Icon(Icons.check_circle_outline),
                label: const Text('Mark as Completed'),
              ),
            ),
            const SizedBox(width: 16),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: pregnancyState.isLoading ? null : () => _showRiskFlagsDialog(),
                icon: const Icon(Icons.warning_amber_outlined),
                label: const Text('Update Risk Flags'),
              ),
            ),
          ],
        ),
      ],
    );
  }

  Future<void> _updateProfile({bool? completed, String? highRiskFlags}) async {
    await ref.read(pregnancyControllerProvider.notifier).updatePregnancyProfile(
          householdId: widget.householdId,
          completed: completed,
          highRiskFlags: highRiskFlags,
        );
  }

  Future<void> _showRiskFlagsDialog() async {
    final TextEditingController controller = TextEditingController(
      text: ref.read(pregnancyControllerProvider).profile?.highRiskFlags ?? '',
    );

    await showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Update High Risk Flags'),
        content: SingleChildScrollView(
          child: ListBody(
            children: [
              const Text(
                'Enter any high risk factors (comma-separated):\n'
                'Examples: hypertension, diabetes, previous C-section, multiples',
              ),
              const SizedBox(height: 16),
              TextField(
                controller: controller,
                decoration: const InputDecoration(
                  labelText: 'High Risk Flags',
                  hintText: 'hypertension, diabetes, etc.',
                  border: OutlineInputBorder(),
                ),
                maxLines: 3,
              ),
            ],
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.of(context).pop();
              _updateProfile(highRiskFlags: controller.text.trim());
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  int _calculateWeeksPregnant(DateTime lmpDate) {
    final now = DateTime.now();
    if (lmpDate.isAfter(now)) {
      return -1; // Not yet pregnant
    }
    final difference = now.difference(lmpDate);
    return (difference.inDays / 7).floor();
  }

  String _formatDate(DateTime date) {
    return '${date.day}/${date.month}/${date.year}';
  }
}

class InfoRow extends StatelessWidget {
  const InfoRow({
    super.key,
    required this.label,
    required this.value,
  });

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(
            label,
            style: Theme.of(context).textTheme.bodyMedium,
          ),
          Text(
            value,
            style: Theme.of(context).textTheme.titleMedium,
          ),
        ],
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  const _ErrorBanner({required this.message});

  final String message;

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Theme.of(context).colorScheme.errorContainer,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Text(
        message,
        style: TextStyle(
          color: Theme.of(context).colorScheme.onErrorContainer,
        ),
      ),
    );
  }
}