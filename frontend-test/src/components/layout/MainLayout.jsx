import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Dashboard from '../../pages/Dashboard';
import LiveMap from '../../pages/LiveMap';
import Incidents from '../../pages/Incidents';
import SosAlerts from '../../pages/SosAlerts';
import RescueTeams from '../../pages/RescueTeams';
import Operations from '../../pages/Operations';
import AIHeatmaps from '../../pages/AIHeatmaps';
import CrowdAnalytics from '../../pages/CrowdAnalytics';
import TrafficAnalytics from '../../pages/TrafficAnalytics';
import Reports from '../../pages/Reports';
import Communications from '../../pages/Communications';
import Users from '../../pages/Users';
import Settings from '../../pages/Settings';
import Profile from '../../pages/Profile';

const PAGE_COMPONENTS = {
  'dashboard': Dashboard,
  'live-map': LiveMap,
  'incidents': Incidents,
  'sos-alerts': SosAlerts,
  'rescue-teams': RescueTeams,
  'operations': Operations,
  'ai-heatmaps': AIHeatmaps,
  'crowd-analytics': CrowdAnalytics,
  'traffic-analytics': TrafficAnalytics,
  'reports': Reports,
  'communications': Communications,
  'users': Users,
  'settings': Settings,
  'profile': Profile,
};

const PAGE_TITLES = {
  'dashboard': { title: 'Dashboard', subtitle: 'Overview of all system activity and alerts' },
  'live-map': { title: 'Live Map', subtitle: 'Real-time geographic monitoring across all zones' },
  'incidents': { title: 'Incidents', subtitle: 'Manage and track all reported incidents' },
  'sos-alerts': { title: 'SOS Alerts', subtitle: 'Emergency alerts requiring immediate response' },
  'rescue-teams': { title: 'Rescue Teams', subtitle: 'Coordinate and manage rescue operations' },
  'operations': { title: 'Operations', subtitle: 'Active operations and mission control' },
  'ai-heatmaps': { title: 'AI Heatmaps', subtitle: 'AI-generated risk heatmaps and predictions' },
  'crowd-analytics': { title: 'Crowd Analytics', subtitle: 'Crowd density analysis and monitoring' },
  'traffic-analytics': { title: 'Traffic Analytics', subtitle: 'Traffic flow analysis and congestion insights' },
  'reports': { title: 'Reports', subtitle: 'Generate and view system reports' },
  'communications': { title: 'Communications', subtitle: 'Inter-agency communication hub' },
  'users': { title: 'Users', subtitle: 'Manage user accounts and permissions' },
  'settings': { title: 'Settings', subtitle: 'System configuration and preferences' },
  'profile': { title: 'My Profile', subtitle: 'Your account information and activity' },
};

export default function MainLayout() {
  const [activePage, setActivePage] = useState('dashboard');
  const PageComponent = PAGE_COMPONENTS[activePage] || Dashboard;
  const pageInfo = PAGE_TITLES[activePage] || { title: 'SAJAG AI', subtitle: '' };

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0f4f8]">
      <Sidebar activePage={activePage} onNavigate={setActivePage} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Topbar title={pageInfo.title} subtitle={pageInfo.subtitle} />
        <div className="flex-1 overflow-y-auto p-6 shadow-[inset_0_2px_8px_rgba(0,0,0,0.04)]">
          <div className="page-enter">
            <PageComponent onNavigate={setActivePage} />
          </div>
        </div>
      </div>
    </div>
  );
}