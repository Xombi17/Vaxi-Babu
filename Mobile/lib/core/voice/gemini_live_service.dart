import 'dart:async';
import 'dart:convert';
import 'dart:typed_data';

import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:web_socket_channel/web_socket_channel.dart';
import 'package:record/record.dart';
import 'package:just_audio/just_audio.dart';
import 'package:permission_handler/permission_handler.dart';

import '../config/app_config.dart';
import '../network/api_client.dart';
import '../network/dio_provider.dart';
import '../network/api_endpoints.dart';
import '../../features/auth/application/auth_controller.dart';

final geminiLiveServiceProvider = Provider<GeminiLiveService>((ref) {
  return GeminiLiveService(ref);
});

class GeminiLiveService {
  GeminiLiveService(this._ref);

  final Ref _ref;
  WebSocketChannel? _channel;
  final _audioRecorder = AudioRecorder();
  final _audioPlayer = AudioPlayer();
  
  StreamSubscription? _recorderSubscription;
  StreamSubscription? _channelSubscription;

  bool _isConnected = false;
  bool get isConnected => _isConnected;

  final _statusController = StreamController<String>.broadcast();
  Stream<String> get statusStream => _statusController.stream;

  final _transcriptController = StreamController<String>.broadcast();
  Stream<String> get transcriptStream => _transcriptController.stream;

  Future<void> connect() async {
    if (_isConnected) return;

    final apiKey = AppConfig.geminiApiKey;
    final model = AppConfig.geminiModel;
    final baseUrl = 'wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1alpha.GenerativeService.BidiGenerateContent?key=$apiKey';

    try {
      _statusController.add('Connecting...');
      _channel = WebSocketChannel.connect(Uri.parse(baseUrl));
      _isConnected = true;

      // Tool declarations
      final tools = [
        {
          'function_declarations': [
            {
              'name': 'get_household_dependents',
              'description': 'Fetches the list of all children/dependents linked to the user\'s household.',
              'parameters': {
                'type': 'OBJECT',
                'properties': {
                  'household_id': {
                    'type': 'STRING',
                    'description': 'The unique ID of the household.',
                  },
                },
                'required': ['household_id'],
              },
            },
            {
              'name': 'get_child_vaccination_status',
              'description': 'Fetches detailed vaccination status for a specific child.',
              'parameters': {
                'type': 'OBJECT',
                'properties': {
                  'household_id': {
                    'type': 'STRING',
                    'description': 'The unique ID of the household.',
                  },
                  'dependent_id': {
                    'type': 'STRING',
                    'description': 'The unique ID of the child/dependent.',
                  },
                },
                'required': ['household_id', 'dependent_id'],
              },
            },
          ]
        }
      ];

      // Send setup message
      final setupMessage = {
        'setup': {
          'model': 'models/$model',
          'generation_config': {
            'response_modalities': ['audio'],
          },
          'tools': tools,
        }
      };
      _channel!.sink.add(jsonEncode(setupMessage));

      _channelSubscription = _channel!.stream.listen(
        _handleMessage,
        onDone: _handleDisconnect,
        onError: (error) {
          debugPrint('Gemini Live WebSocket Error: $error');
          _handleDisconnect();
        },
      );

      _statusController.add('Connected');
    } catch (e) {
      debugPrint('Failed to connect to Gemini Live: $e');
      _handleDisconnect();
    }
  }

  void _handleMessage(dynamic message) {
    String textMessage;
    if (message is Uint8List) {
      textMessage = utf8.decode(message);
    } else {
      textMessage = message as String;
    }
    final data = jsonDecode(textMessage);

    if (data['setupComplete'] != null) {
      _statusController.add('Ready');
      _startInitialPrompt();
    }

    if (data['serverContent'] != null) {
      final serverContent = data['serverContent'];
      if (serverContent['modelTurn'] != null) {
        final parts = serverContent['modelTurn']['parts'];
        for (final part in parts) {
          if (part['inlineData'] != null && part['inlineData']['mimeType'].startsWith('audio/')) {
            final audioData = base64Decode(part['inlineData']['data'] as String);
            _playAudio(audioData);
          }
          if (part['text'] != null) {
            _transcriptController.add(part['text'] as String);
          }
        }
      }
    }

    if (data['toolCall'] != null) {
      _handleToolCall(data['toolCall']);
    }
  }

  Future<void> _startInitialPrompt() async {
    final session = _ref.read(authControllerProvider).valueOrNull;
    final id = session?.householdId ?? 'unknown';
    
    final promptMessage = {
      'clientContent': {
        'turns': [
          {
            'role': 'user',
            'parts': [
              {
                'text': 'Hello! My household ID is $id. I am using the Vaxi Babu app. Please greet me and ask how you can help with my family health memory today. You can use tools to look up my children if needed.'
              }
            ]
          }
        ],
        'turnComplete': true,
      }
    };
    _channel!.sink.add(jsonEncode(promptMessage));
  }

  Future<void> startListening() async {
    if (!_isConnected) await connect();

    final hasPermission = await Permission.microphone.request().isGranted;
    if (!hasPermission) {
      _statusController.add('Microphone permission denied');
      return;
    }

    try {
      final config = const RecordConfig(
        encoder: AudioEncoder.pcm16bits,
        sampleRate: 16000,
        numChannels: 1,
      );

      final stream = await _audioRecorder.startStream(config);
      _statusController.add('Listening...');

      _recorderSubscription = stream.listen((data) {
        final base64Data = base64Encode(data);
        final message = {
          'realtimeInput': {
            'mediaChunks': [
              {
                'mimeType': 'audio/pcm',
                'data': base64Data,
              }
            ]
          }
        };
        _channel?.sink.add(jsonEncode(message));
      });
    } catch (e) {
      debugPrint('Error starting audio recording: $e');
    }
  }

  Future<void> stopListening() async {
    await _recorderSubscription?.cancel();
    _recorderSubscription = null;
    await _audioRecorder.stop();
    _statusController.add('Processing...');
  }

  Future<void> _playAudio(Uint8List audioData) async {
    try {
      await _audioPlayer.setAudioSource(MyCustomSource(audioData));
      _audioPlayer.play();
    } catch (e) {
      debugPrint('Error playing audio: $e');
    }
  }

  void _handleToolCall(dynamic toolCall) async {
    final functionCalls = toolCall['functionCalls'] as List;
    final responses = [];
    final apiClient = _ref.read(apiClientProvider);

    for (final call in functionCalls) {
      final name = call['name'];
      final args = call['args'];
      final id = call['id'];

      dynamic result;
      try {
        if (name == 'get_household_dependents') {
          final response = await apiClient.post<dynamic>(
            '${ApiEndpoints.voice}/tools/get-household-dependents',
            data: args,
            decoder: (data) => data,
          );
          result = response;
        } else if (name == 'get_child_vaccination_status') {
          final response = await apiClient.post<dynamic>(
            '${ApiEndpoints.voice}/tools/get-child-vaccination-status',
            data: args,
            decoder: (data) => data,
          );
          result = response;
        } else {
          result = {'error': 'Unknown tool: $name'};
        }
      } catch (e) {
        result = {'error': 'Failed to execute tool: $e'};
      }

      responses.add({
        'name': name,
        'id': id,
        'response': result,
      });
    }

    final responseMessage = {
      'toolResponse': {
        'functionResponses': responses,
      }
    };
    _channel?.sink.add(jsonEncode(responseMessage));
  }

  void _handleDisconnect() {
    _isConnected = false;
    _channelSubscription?.cancel();
    _recorderSubscription?.cancel();
    _statusController.add('Disconnected');
  }

  void dispose() {
    _handleDisconnect();
    _statusController.close();
    _transcriptController.close();
    _audioRecorder.dispose();
    _audioPlayer.dispose();
  }
}

class MyCustomSource extends StreamAudioSource {
  final Uint8List _buffer;

  MyCustomSource(this._buffer) : super(tag: 'GeminiAudio');

  @override
  Future<StreamAudioResponse> request([int? start, int? end]) async {
    start ??= 0;
    end ??= _buffer.length;
    return StreamAudioResponse(
      sourceLength: _buffer.length,
      contentLength: end - start,
      offset: start,
      stream: Stream.value(_buffer.sublist(start, end)),
      contentType: 'audio/wav',
    );
  }
}
