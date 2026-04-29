import 'package:flutter/widgets.dart';
import 'package:shared_preferences/shared_preferences.dart';

import 'app/bootstrap.dart';

Future<void> main() async {
  final sharedPreferences = await SharedPreferences.getInstance();
  await bootstrap(sharedPreferences);
}
