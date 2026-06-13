import React, { useState } from 'react';

const SETTING_CATS = [
  { id: 'general', label: 'General Settings', icon: '' },
  { id: 'map', label: 'Map Settings', icon: '' },
  { id: 'alert', label: 'Alert Settings', icon: '' },
  { id: 'notification', label: 'Notification Settings', icon: '' },
  { id: 'system', label: 'System Preferences', icon: '' },
  { id: 'security', label: 'Security Settings', icon: '' },
  { id: 'language', label: 'Language Settings', icon: '' },
  { id: 'backup', label: 'Backup & Restore', icon: '' },
  { id: 'api', label: 'API Integrations', icon: '' },
];

const Toggle = ({ defaultOn = false }) => {
  const [on, setOn] = useState(defaultOn);
  return (
    <button onClick={() => setOn(!on)} className={`w-10 h-5 rounded-full transition-colors ${on ? 'bg-blue-600' : 'bg-gray-300'} relative`}>
      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} />
    </button>
  );
};

export default function Settings() {
  const [activeCat, setActiveCat] = useState('general');

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex p-4 gap-4 bg-[#f0f4f8]">
        {/* Left Nav */}
        <div className="w-52 bg-white rounded-xl shadow-card p-2">
          {SETTING_CATS.map(c => (
            <button
              key={c.id}
              onClick={() => setActiveCat(c.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left transition ${activeCat === c.id ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}
            >
              <span>{c.icon}</span>
              <span className="text-xs">{c.label}</span>
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            {/* General Settings */}
            <div className="bg-white rounded-xl shadow-card p-5">
              <h3 className="font-semibold text-sm text-gray-800 mb-4">General Settings</h3>
              <div className="space-y-4">
                {[
                  { label: 'Organization Name', value: 'Nepal Police' },
                  { label: 'Platform Name', value: 'SAJAG AI' },
                  { label: 'Time Zone', value: '(UTC+05:45) Kathmandu' },
                  { label: 'Date Format', value: 'May 23, 2025' },
                  { label: 'Time Format', value: '12 Hour (AM/PM)' },
                  { label: 'Default Language', value: 'English' },
                  { label: 'Items Per Page', value: '10' },
                ].map(f => (
                  <div key={f.label}>
                    <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                    <div className="flex items-center justify-between border border-gray-200 rounded-lg px-3 py-2">
                      <span className="text-sm text-gray-700">{f.value}</span>
                      <span className="text-gray-400 text-xs">▾</span>
                    </div>
                  </div>
                ))}
                <button className="w-full bg-[#1a3a6b] text-white text-sm py-2.5 rounded-lg hover:bg-[#0f2347] font-medium">
                  Save Settings
                </button>
              </div>
            </div>

            {/* Platform Settings */}
            <div className="bg-white rounded-xl shadow-card p-5">
              <h3 className="font-semibold text-sm text-gray-800 mb-4">Platform Settings</h3>
              <div className="space-y-3">
                {[
                  { label: 'Enable Real-time Updates', on: true },
                  { label: 'Enable Push Notifications', on: false },
                  { label: 'Enable Email Notifications', on: true },
                  { label: 'Enable SMS Alerts', on: false },
                  { label: 'Enable Offline Mode', on: true },
                  { label: 'Enable Data Analytics', on: true },
                  { label: 'Enable AI Predictions', on: true },
                  { label: 'Enable Auto Backup', on: true },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-1">
                    <span className="text-sm text-gray-700">{s.label}</span>
                    <Toggle defaultOn={s.on} />
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="font-semibold text-sm text-gray-800 mb-3">Data Retention</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Incident Data', value: '2 Years' },
                    { label: 'User Activity Logs', value: '1 Year' },
                    { label: 'System Logs', value: '6 Months' },
                  ].map(f => (
                    <div key={f.label} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">{f.label}</span>
                      <div className="flex items-center gap-2 border border-gray-200 rounded-lg px-3 py-1.5">
                        <span className="text-sm text-gray-700">{f.value}</span>
                        <span className="text-gray-400 text-xs">▾</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button className="w-full mt-4 bg-orange-600 text-white text-sm py-2.5 rounded-lg hover:bg-orange-700 font-medium">
                  Update Retention
                </button>
              </div>
            </div>

            {/* API Integrations */}
            <div className="col-span-2 bg-white rounded-xl shadow-card p-5">
              <h3 className="font-semibold text-sm text-gray-800 mb-4">API Integrations</h3>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { name: 'AI Engine API', desc: 'Connect your AI prediction engine', endpoint: 'REACT_APP_AI_API_URL', status: 'Not Connected' },
                  { name: 'SOS Alert API', desc: 'Receive live SOS alerts from citizens', endpoint: 'REACT_APP_SOS_API_URL', status: 'Not Connected' },
                  { name: 'Weather API', desc: 'Real-time weather data for predictions', endpoint: 'REACT_APP_WEATHER_API_URL', status: 'Not Connected' },
                  { name: 'Maps API', desc: 'OpenStreetMap / Google Maps integration', endpoint: 'REACT_APP_MAPS_API_KEY', status: 'Connected' },
                  { name: 'SMS Gateway', desc: 'Send SMS alerts to citizens', endpoint: 'REACT_APP_SMS_API_URL', status: 'Not Connected' },
                  { name: 'Satellite Data', desc: 'Satellite imagery for heatmaps', endpoint: 'REACT_APP_SAT_API_URL', status: 'Not Connected' },
                ].map(api => (
                  <div key={api.name} className={`border rounded-xl p-4 ${api.status === 'Connected' ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-semibold text-gray-800">{api.name}</p>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${api.status === 'Connected' ? 'text-green-600 bg-green-100' : 'text-gray-500 bg-gray-100'}`}>{api.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mb-2">{api.desc}</p>
                    <code className="text-[10px] bg-gray-100 px-2 py-1 rounded text-blue-600 block truncate">{api.endpoint}</code>
                    <button className={`mt-2 w-full text-xs py-1.5 rounded-lg transition font-medium ${api.status === 'Connected' ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}>
                      {api.status === 'Connected' ? 'Disconnect' : 'Connect'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
