import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRoot } from 'react-dom/client';
import './index.css';
import React from 'react';
import type { UUID } from '@elizaos/core';
import { Dashboard } from './components/Dashboard';

const queryClient = new QueryClient();

// Define the interface for the ELIZA_CONFIG
interface ElizaConfig {
  agentId: string;
  apiBase: string;
}

// Declare global window extension for TypeScript
declare global {
  interface Window {
    ELIZA_CONFIG?: ElizaConfig;
  }
}

/**
 * Main App component
 */
function App() {
  const config = window.ELIZA_CONFIG;
  const agentId = config?.agentId;

  // Apply dark mode to the root element
  React.useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  if (!agentId) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-red-500 text-xl font-bold mb-2">Error: Agent ID not found</div>
          <div className="text-gray-400">
            The server should inject the agent ID configuration.
          </div>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <Dashboard />
    </QueryClientProvider>
  );
}

// Initialize the application
const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}

// Define types for integration with agent UI system
export interface AgentPanel {
  name: string;
  path: string;
  component: React.ComponentType<any>;
  icon?: string;
  public?: boolean;
  shortLabel?: string;
}

// Export the Dashboard as a panel for the agent UI
export const panels: AgentPanel[] = [
  {
    name: 'Trading Dashboard',
    path: 'trading',
    component: Dashboard,
    icon: 'BarChart3',
    public: false,
    shortLabel: 'Trading',
  },
];

export * from './utils';
