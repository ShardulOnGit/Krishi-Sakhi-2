import React from 'react';
import { CloudSun, Sprout, Users, ScanLine } from 'lucide-react';
import { Page } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface DashboardProps {
    setPage: (page: Page) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ setPage }) => {
  const { t } = useLanguage();
  const date = new Date();
  const month = date.toLocaleString('default', { month: 'long' });

  const actions = [
    { icon: Sprout, label: t.add_crop, sub: t.add_crop_sub, action: () => setPage(Page.CROPS), color: 'bg-green-500' },
    { icon: CloudSun, label: t.check_weather, sub: t.check_weather_sub, action: () => setPage(Page.WEATHER), color: 'bg-blue-500' },
    { icon: Users, label: t.ask_community, sub: t.ask_community_sub, action: () => setPage(Page.COMMUNITY), color: 'bg-purple-500' },
    { icon: ScanLine, label: t.disease_check, sub: t.disease_check_sub, action: () => setPage(Page.DISEASE_CHECK), color: 'bg-red-500' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{t.welcome}, Shardul Kolekar!</h1>
        <p className="text-gray-500 mt-2">{t.welcome_sub}</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((item, index) => (
          <div 
            key={index} 
            onClick={item.action}
            className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow cursor-pointer border border-gray-100 flex flex-col items-start"
          >
            <div className={`${item.color} p-3 rounded-xl text-white mb-4 shadow-sm`}>
              <item.icon size={24} />
            </div>
            <h3 className="font-bold text-gray-800 text-lg">{item.label}</h3>
            <p className="text-sm text-gray-500 mt-1">{item.sub}</p>
          </div>
        ))}
      </div>

      {/* Daily Advice Card */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100 rounded-xl p-6 md:p-8 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-green-600 text-white p-1.5 rounded-lg"><Sprout size={20} /></span>
            <h2 className="text-xl font-bold text-gray-900">{t.daily_advice}</h2>
          </div>
          <p className="text-gray-700 leading-relaxed max-w-3xl">
            In {month}, Kerala's climate is favorable for cultivating a variety of vegetables. Here are some practical tips for your 4-acre farm: 
            <br/><br/>
            1. <strong className="text-green-800">Plant Cool-Season Vegetables:</strong> Ideal time for brinjal, spinach, bitter gourd, and tomato.
            <br/>
            2. <strong className="text-green-800">Prepare Soil:</strong> Ensure well-draining soil rich in organic matter. Use compost regularly.
            <br/>
            3. <strong className="text-green-800">Irrigation:</strong> Weather is dry, so monitor soil moisture closely.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none">
           <Sprout size={200} className="text-green-600 transform translate-x-10 translate-y-10" />
        </div>
      </div>

      {/* Split Section: Recent Crops & Community */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Crops */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2">
                <Sprout className="text-yellow-600" />
                <h3 className="font-bold text-lg">{t.recent_crops}</h3>
             </div>
             <button onClick={() => setPage(Page.CROPS)} className="text-sm text-green-600 font-medium hover:underline">+ {t.add_crop}</button>
           </div>
           
           <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-700 font-bold text-xl">R</div>
                   <div>
                      <h4 className="font-bold text-gray-900">Rice</h4>
                      <p className="text-xs text-gray-500">Planted: Nov 1, 2025</p>
                   </div>
                </div>
                <div className="text-right">
                   <p className="font-bold text-gray-900">4 acres</p>
                   <span className="inline-block px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mt-1">Germination</span>
                </div>
             </div>
           </div>
        </div>

        {/* Community Activity */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-6">
             <div className="flex items-center gap-2">
                <Users className="text-purple-600" />
                <h3 className="font-bold text-lg">{t.community_activity}</h3>
             </div>
             <button onClick={() => setPage(Page.COMMUNITY)} className="text-sm text-gray-500 font-medium hover:text-green-600">{t.view_all}</button>
           </div>
           
           <div className="p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setPage(Page.COMMUNITY)}>
              <h4 className="font-bold text-gray-900 mb-1">भात पिकासाठी कोणतं खत वापरावं?</h4>
              <p className="text-gray-500 text-sm mb-3">Looking for fertilizer recommendations for Rice crop...</p>
              <div className="flex gap-2">
                 <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">fertilizer</span>
                 <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">rice</span>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;