import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWidget from './components/ChatWidget';
import Dashboard from './pages/Dashboard';
import SmartAdvisory from './pages/SmartAdvisory';
import DiseaseCheck from './pages/DiseaseCheck';
import Weather from './pages/Weather';
import MyCrops from './pages/MyCrops';
import Community from './pages/Community';
import Schemes from './pages/Schemes';
import Quests from './pages/Quests';
import Activities from './pages/Activities';
import Profile from './pages/Profile';
import FarmerConnect from './pages/FarmerConnect';
import AnimalMart from './pages/AnimalMart';
import MachineryMart from './pages/MachineryMart';
import { Page } from './types';
import { Menu, Sprout, Trophy } from 'lucide-react';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

// Leaderboard Component
const Leaderboard = () => (
    <div className="p-8 animate-fade-in max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">🏆 Sustainability Leaderboard</h2>
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8 flex justify-between items-center shadow-sm">
            <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-green-200 rounded-full flex items-center justify-center text-green-800 font-bold text-xl border-4 border-white shadow">
                    You
                </div>
                <div>
                    <h3 className="font-bold text-xl">Shardul Kolekar</h3>
                    <p className="text-gray-600">Village, Kottayam</p>
                </div>
            </div>
            <div className="text-right">
                <p className="text-3xl font-bold text-green-700">1,250</p>
                <p className="text-xs text-green-600 font-bold uppercase tracking-wider">Rank #42</p>
            </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
             <div className="p-4 bg-gray-50 border-b font-medium text-gray-500 flex justify-between">
                <span>Rank / Farmer</span>
                <span>Points</span>
             </div>
             {['Rasika Patil', 'Atharv Kavitake', 'Raman Nair', 'Priya S', 'John D'].map((name, i) => (
                 <div key={i} className="p-4 border-b border-gray-50 flex justify-between items-center hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                        <span className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                            i === 0 ? 'bg-yellow-100 text-yellow-700' :
                            i === 1 ? 'bg-gray-100 text-gray-700' :
                            i === 2 ? 'bg-orange-100 text-orange-700' : 'text-gray-400'
                        }`}>
                            {i+1}
                        </span>
                        <span className="font-medium text-gray-800">{name}</span>
                    </div>
                    <span className="font-bold text-gray-600">{(5000 - i*850).toLocaleString()} pts</span>
                 </div>
             ))}
        </div>
    </div>
);

// Inner App Component to use the hook
const KrishiApp = () => {
  const [activePage, setActivePage] = useState<Page>(Page.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { t } = useLanguage();

  const renderContent = () => {
    switch (activePage) {
      case Page.DASHBOARD: return <Dashboard setPage={setActivePage} />;
      case Page.ADVISORY: return <SmartAdvisory />;
      case Page.DISEASE_CHECK: return <DiseaseCheck />;
      case Page.WEATHER: return <Weather />;
      case Page.CROPS: return <MyCrops />;
      case Page.COMMUNITY: return <Community />;
      case Page.SCHEMES: return <Schemes />;
      case Page.QUESTS: return <Quests />;
      case Page.ACTIVITIES: return <Activities />;
      case Page.PROFILE: return <Profile />;
      case Page.CONNECT: return <FarmerConnect setPage={setActivePage} />;
      case Page.ANIMAL_MART: return <AnimalMart />;
      case Page.MACHINERY: return <MachineryMart />;
      case Page.LEADERBOARD: return <Leaderboard />;
      default: return <Dashboard setPage={setActivePage} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F8F2] flex flex-col md:flex-row">
      {/* Mobile Header */}
      <div className="md:hidden bg-white p-4 flex items-center justify-between border-b shadow-sm sticky top-0 z-30">
        <div className="flex items-center gap-2">
            <div className="bg-green-600 p-1.5 rounded-lg text-white">
                <Sprout size={20} />
            </div>
            <span className="font-bold text-green-900 text-lg">{t.app_name}</span>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Menu />
        </button>
      </div>

      <Sidebar 
        activePage={activePage} 
        setPage={(page) => {
            setActivePage(page);
            setIsSidebarOpen(false);
        }} 
        isOpen={isSidebarOpen} 
      />
      
      <main className="flex-1 md:ml-64 min-h-screen pb-20 md:pb-0 overflow-x-hidden">
        {renderContent()}
      </main>

      <ChatWidget />
      
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
            onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <KrishiApp />
    </LanguageProvider>
  );
}

export default App;
