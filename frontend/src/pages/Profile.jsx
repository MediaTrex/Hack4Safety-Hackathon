import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const TABS = ['Profile Details', 'Security', 'Preferences', 'Notification Settings'];

export default function Profile() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('Profile Details');
  const [form, setForm] = useState({
    name: 'Inspector Sharma',
    role: 'Administrator',
    dept: 'Butwal Police Office',
    team: 'Control Room',
    email: 'inspector.sharma@nepalpolice.gov.np',
    phone: '9841234567',
    address: 'Butwal, Rupandehi, Nepal',
    joined: 'Jan 15, 2024',
    lastLogin: 'May 23, 2025 10:24 AM',
    location: 'Butwal, Rupandehi, Nepal',
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 p-4 bg-[#f0f4f8]">
        <div className="grid grid-cols-3 gap-4">
          {/* Left: Profile Card */}
          <div className="bg-white rounded-xl shadow-card p-5 flex flex-col items-center text-center">
            {/* Avatar */}
            <div className="relative mb-3">
              <div className="w-24 h-24 rounded-full bg-amber-700 flex items-center justify-center text-white text-3xl font-bold border-4 border-white shadow-lg">
                IS
              </div>
              <span className="absolute bottom-1 right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white" />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">Inspector Sharma</h3>
            <span className="text-xs px-3 py-1 bg-purple-100 text-purple-700 rounded-full font-medium mt-1">Administrator</span>
            <p className="text-xs text-gray-500 mt-1">Butwal Police Office</p>
            <p className="text-[10px] text-gray-400 mt-0.5">● Online</p>
            <p className="text-[10px] text-gray-400 mt-1">User ID: USR-001</p>

            <div className="w-full mt-4 pt-4 border-t space-y-2 text-left">
              <p className="text-xs font-semibold text-gray-600 mb-2">Contact Information</p>
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <span>📞</span> <span>9841234567</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 break-all">
                <span>✉️</span> <span className="text-[10px]">inspector.sharma@nepalpolice.gov.np</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>📍</span> <span>Butwal, Rupandehi, Nepal</span>
              </div>
            </div>
          </div>

          {/* Center: Profile Form */}
          <div className="bg-white rounded-xl shadow-card overflow-hidden">
            {/* Tabs */}
            <div className="flex border-b">
              {TABS.map(t => (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex-1 py-2.5 text-[11px] font-medium transition border-b-2 ${activeTab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="p-4 space-y-3">
              {activeTab === 'Profile Details' && (
                <>
                  {[
                    { label: 'Full Name', key: 'name', type: 'text' },
                    { label: 'Email', key: 'email', type: 'email' },
                    { label: 'Phone', key: 'phone', type: 'tel' },
                    { label: 'Address', key: 'address', type: 'text' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{f.label}</label>
                      <input
                        type={f.type}
                        value={form[f.key]}
                        onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  ))}
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">User Role</label>
                      <select className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none bg-white">
                        <option>Administrator</option>
                        <option>Rescue Team</option>
                        <option>Citizen</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Department</label>
                      <input value={form.dept} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50" readOnly />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Team / Unit</label>
                      <input value={form.team} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50" readOnly />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Date Joined</label>
                      <input value={form.joined} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50" readOnly />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Last Login</label>
                    <input value={form.lastLogin} className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-gray-50 text-gray-500" readOnly />
                  </div>
                </>
              )}
              {activeTab === 'Security' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">Update your password and security settings.</p>
                  {['Current Password','New Password','Confirm New Password'].map(l => (
                    <div key={l}>
                      <label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>
                      <input type="password" placeholder="••••••••" className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500" />
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-2 border border-gray-100 rounded-lg">
                    <span className="text-xs text-gray-700">Two Factor Authentication</span>
                    <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-0.5 rounded-full">Enabled</span>
                  </div>
                </div>
              )}
              {activeTab !== 'Profile Details' && activeTab !== 'Security' && (
                <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
                  Settings coming soon
                </div>
              )}
            </div>

            <div className="flex gap-2 p-4 border-t">
              <button className="flex-1 border border-gray-200 text-gray-600 text-sm py-2.5 rounded-lg hover:bg-gray-50">Cancel</button>
              <button className="flex-1 bg-[#1a3a6b] text-white text-sm py-2.5 rounded-lg hover:bg-[#0f2347] font-medium">Save Changes</button>
            </div>
          </div>

          {/* Right: My Statistics + Account Status */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-card p-4">
              <h3 className="font-semibold text-sm text-gray-800 mb-3">My Statistics</h3>
              <div className="space-y-3">
                {[
                  { icon: '', label: 'Operations Managed', value: 128 },
                  { icon: '', label: 'Teams Supervised', value: 12 },
                  { icon: '', label: 'Incidents Handled', value: 342 },
                  { icon: '', label: 'Active Alerts', value: 18 },
                  { icon: '', label: 'Response Time (Avg)', value: '12 min' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="text-base">{s.icon}</span>
                      <span className="text-xs text-gray-600">{s.label}</span>
                    </div>
                    <span className="text-sm font-bold text-gray-800">{s.value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-card p-4">
              <h3 className="font-semibold text-sm text-gray-800 mb-3">Account Status</h3>
              <div className="space-y-2">
                {[
                  { label: 'Status', value: 'Active', color: 'text-green-600' },
                  { label: 'Two Factor Auth', value: 'Enabled', color: 'text-green-600' },
                  { label: 'Last Password Change', value: 'Apr 20, 2025', color: 'text-gray-600' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">{s.label}</span>
                    <span className={`text-xs font-medium ${s.color}`}>{s.value}</span>
                  </div>
                ))}
              </div>
              <button className="w-full mt-3 border border-orange-200 text-orange-600 text-sm py-2 rounded-lg hover:bg-orange-50 font-medium">
                Change Password
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
