'use client';

import StatusHeader from './components/StatusHeader';
import ImplementedFeatures from './components/ImplementedFeatures';
import ServerProcessing from './components/ServerProcessing';
import ProblemSolved from './components/ProblemSolved';
import InDevelopment from './components/InDevelopment';
import CurrentFunctionality from './components/CurrentFunctionality';

export default function SystemStatus() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        <StatusHeader />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna Izquierda */}
          <div className="space-y-6">
            <ImplementedFeatures />
            <ServerProcessing />
            <ProblemSolved />
          </div>

          {/* Columna Derecha */}
          <div className="space-y-6">
            <InDevelopment />
            <CurrentFunctionality />
          </div>
        </div>
      </div>
    </div>
  );
}
