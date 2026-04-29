import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// ignore: unused_import
// ignore: unused_import
import '../../../core/network/api_exception.dart';
import '../application/growth_controller.dart';
import '../data/models/growth_record.dart';

class GrowthScreen extends ConsumerStatefulWidget {
  const GrowthScreen({super.key, required this.dependentId, required this.householdId});

  static const String routePath = '/growth/:dependentId';
  final String dependentId;
  final String householdId;

  @override
  ConsumerState<GrowthScreen> createState() => _GrowthScreenState();
}

class _GrowthScreenState extends ConsumerState<GrowthScreen> {
  final _formKey = GlobalKey<FormState>();
  final _heightController = TextEditingController();
  final _weightController = TextEditingController();
  final _headCircumferenceController = TextEditingController();
  final _milestoneController = TextEditingController();
  final _notesController = TextEditingController();
  DateTime _recordedDate = DateTime.now();

  @override
  void initState() {
    super.initState();
    Future.microtask(() =>
        ref.read(growthRecordsProvider(widget.dependentId).notifier).refresh());
  }

  @override
  void dispose() {
    _heightController.dispose();
    _weightController.dispose();
    _headCircumferenceController.dispose();
    _milestoneController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;

    await ref.read(growthControllerProvider.notifier).createGrowthRecord(
          dependentId: widget.dependentId,
          householdId: widget.householdId,
          recordedDate: _recordedDate,
          heightCm: double.tryParse(_heightController.text),
          weightKg: double.tryParse(_weightController.text),
          headCircumferenceCm: double.tryParse(_headCircumferenceController.text),
          milestoneAchieved: _milestoneController.text.trim().isEmpty
              ? null
              : _milestoneController.text.trim(),
          notes: _notesController.text.trim().isEmpty
              ? null
              : _notesController.text.trim(),
        );

    if (ref.read(growthControllerProvider).error == null) {
      _heightController.clear();
      _weightController.clear();
      _headCircumferenceController.clear();
      _milestoneController.clear();
      _notesController.clear();
    }
  }

  @override
  Widget build(BuildContext context) {
    final growthState = ref.watch(growthControllerProvider);
    final records = ref.watch(growthRecordsProvider(widget.dependentId));
    final isSubmitting = growthState.isLoading;
    final errorMessage = growthState.error;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Growth Tracking'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh),
            tooltip: 'Refresh',
            onPressed: () => ref
                .read(growthRecordsProvider(widget.dependentId).notifier)
                .refresh(),
          ),
        ],
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Text(
                'Add Growth Record',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 16),
              Form(
                key: _formKey,
                child: Column(
                  children: [
                    Row(
                      children: [
                        Expanded(
                          child: TextFormField(
                            controller: _heightController,
                            keyboardType:
                                const TextInputType.numberWithOptions(decimal: true),
                            decoration: const InputDecoration(
                              labelText: 'Height (cm)',
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: TextFormField(
                            controller: _weightController,
                            keyboardType:
                                const TextInputType.numberWithOptions(decimal: true),
                            decoration: const InputDecoration(
                              labelText: 'Weight (kg)',
                              border: OutlineInputBorder(),
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _headCircumferenceController,
                      keyboardType:
                          const TextInputType.numberWithOptions(decimal: true),
                      decoration: const InputDecoration(
                        labelText: 'Head Circumference (cm)',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _milestoneController,
                      decoration: const InputDecoration(
                        labelText: 'Milestone Achieved (optional)',
                        hintText: 'e.g., First steps, Says mama',
                        border: OutlineInputBorder(),
                      ),
                    ),
                    const SizedBox(height: 12),
                    TextFormField(
                      controller: _notesController,
                      maxLines: 3,
                      decoration: const InputDecoration(
                        labelText: 'Notes (optional)',
                        border: OutlineInputBorder(),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 16),
              FilledButton.icon(
                onPressed: isSubmitting ? null : _submit,
                icon: isSubmitting
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2),
                      )
                    : const Icon(Icons.add),
                label: Text(isSubmitting ? 'Saving...' : 'Add Record'),
              ),
              if (errorMessage != null) ...[
                const SizedBox(height: 16),
                _ErrorBanner(message: errorMessage),
              ],
              const SizedBox(height: 32),
              Text(
                'Growth History',
                style: Theme.of(context).textTheme.titleLarge,
              ),
              const SizedBox(height: 12),
              if (records.isEmpty)
                const Padding(
                  padding: EdgeInsets.all(24),
                  child: Text(
                    'No growth records yet. Add one above.',
                    textAlign: TextAlign.center,
                  ),
                )
              else
                ListView.separated(
                  shrinkWrap: true,
                  physics: const NeverScrollableScrollPhysics(),
                  itemCount: records.length,
                  separatorBuilder: (_, __) => const SizedBox(height: 8),
                  itemBuilder: (context, index) {
                    final record = records[index];
                    return _GrowthRecordCard(record: record);
                  },
                ),
            ],
          ),
        ),
      ),
    );
  }
}

class _GrowthRecordCard extends StatelessWidget {
  const _GrowthRecordCard({required this.record});

  final GrowthRecord record;

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  '${record.recordedDate.day}/${record.recordedDate.month}/${record.recordedDate.year}',
                  style: Theme.of(context).textTheme.titleMedium,
                ),
              ],
            ),
            const SizedBox(height: 8),
            if (record.heightCm != null)
              _DetailRow(label: 'Height', value: '${record.heightCm} cm'),
            if (record.weightKg != null)
              _DetailRow(label: 'Weight', value: '${record.weightKg} kg'),
            if (record.headCircumferenceCm != null)
              _DetailRow(
                  label: 'Head Circumference',
                  value: '${record.headCircumferenceCm} cm'),
            if (record.milestoneAchieved != null) ...[
              const SizedBox(height: 4),
              Text(
                'Milestone: ${record.milestoneAchieved}',
                style: Theme.of(context).textTheme.bodyMedium,
              ),
            ],
            if (record.notes != null) ...[
              const SizedBox(height: 4),
              Text(
                'Notes: ${record.notes}',
                style: Theme.of(context).textTheme.bodySmall,
              ),
            ],
          ],
        ),
      ),
    );
  }
}

class _DetailRow extends StatelessWidget {
  const _DetailRow({required this.label, required this.value});

  final String label;
  final String value;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: Theme.of(context).textTheme.bodyMedium),
          Text(value, style: Theme.of(context).textTheme.bodyMedium),
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
