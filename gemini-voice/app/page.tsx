'use client';

import { useState } from 'react';
import { useLiveAPI } from '@/hooks/use-live-api';
import { Mic, MicOff, Activity, Shield, User, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'motion/react';

export default function Page() {
  const { isConnected, isConnecting, connect, disconnect, transcript, activeRecords, error } = useLiveAPI();

  return (
    <div className="min-h-screen bg-[#f5f5f5] text-gray-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-sm">
              <Activity className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">Data Health Assistant</h1>
              <p className="text-sm text-gray-500">Voice-enabled patient record consultancy</p>
            </div>
          </div>
          
          <button
            onClick={isConnected ? disconnect : connect}
            disabled={isConnecting}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
              isConnected 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
            } disabled:opacity-50`}
          >
            {isConnecting ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isConnected ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5" />
            )}
            {isConnecting ? 'Connecting...' : isConnected ? 'End Session' : 'Start Voice Session'}
          </button>
        </header>

        {error && (
          <div className="bg-red-50 text-red-700 p-4 rounded-2xl text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Transcript & Status */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm h-[600px] flex flex-col">
              <h2 className="text-lg font-medium mb-4 flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`} />
                Live Conversation
              </h2>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-2">
                {transcript.length === 0 && !isConnected && (
                  <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4">
                    <Mic className="w-12 h-12 opacity-20" />
                    <p className="text-sm text-center">Click &quot;Start Voice Session&quot; to begin talking with the assistant.</p>
                  </div>
                )}
                
                {transcript.map((msg, idx) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={idx} 
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                      msg.role === 'user' 
                        ? 'bg-blue-600 text-white rounded-tr-sm' 
                        : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    }`}>
                      {msg.text}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Patient Records */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-3xl p-6 shadow-sm min-h-[600px]">
              <h2 className="text-lg font-medium mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-gray-400" />
                Active Patient Records
              </h2>

              {activeRecords.length === 0 ? (
                <div className="h-[400px] flex flex-col items-center justify-center text-gray-400 space-y-4">
                  <Activity className="w-16 h-16 opacity-10" />
                  <p className="text-sm text-center max-w-sm">
                    No records currently active. Ask the assistant to look up a patient by name (e.g., &quot;Emma Johnson&quot; or &quot;Liam&quot;) to view their details here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeRecords.map(record => (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      key={record.id} 
                      className="border border-gray-100 rounded-2xl p-5 space-y-4 bg-gray-50/50"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-lg">{record.name}</h3>
                          <p className="text-sm text-gray-500">
                            {record.age} years old • {record.type === 'child' ? 'Child' : 'Adult'}
                          </p>
                        </div>
                        <span className="text-xs font-medium px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full">
                          {record.id}
                        </span>
                      </div>

                      {record.parentName && (
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">Parent/Guardian:</span> {record.parentName}
                        </div>
                      )}

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium flex items-center gap-1.5">
                          <Shield className="w-4 h-4 text-gray-400" />
                          Vaccinations
                        </h4>
                        <div className="space-y-2">
                          {record.vaccinations.map((vax, i) => (
                            <div key={i} className="flex items-center justify-between text-sm bg-white p-2 rounded-xl border border-gray-100">
                              <span className="font-medium text-gray-700">{vax.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-400">{vax.date}</span>
                                <span className={`w-2 h-2 rounded-full ${
                                  vax.status === 'completed' ? 'bg-green-500' :
                                  vax.status === 'pending' ? 'bg-yellow-500' : 'bg-red-500'
                                }`} title={vax.status} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-gray-100">
                        <h4 className="text-sm font-medium flex items-center gap-1.5">
                          <Activity className="w-4 h-4 text-gray-400" />
                          General Health
                        </h4>
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {record.generalHealth}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center gap-1.5 text-xs text-gray-400">
                        <Calendar className="w-3.5 h-3.5" />
                        Last consultation: {record.lastConsultation}
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
