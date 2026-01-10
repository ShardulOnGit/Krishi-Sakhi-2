import React from 'react';
import { 
  LayoutDashboard, 
  Sprout, 
  Award, 
  Trophy, 
  User, 
  Wheat, 
  Activity, 
  CloudSun, 
  Users, 
  ScanLine,
  ScrollText,
  Globe,
  ShoppingBag,
  Tractor
} from 'lucide-react';
import { Page } from '../types';
import { useLanguage, Language } from '../contexts/LanguageContext';

interface SidebarProps {
  activePage: Page;
  setPage: (page: Page) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, setPage, isOpen }) => {
  const { language, setLanguage, t } = useLanguage();
  
  const menuItems = [
    { id: Page.DASHBOARD, label: t.menu_dashboard, icon: LayoutDashboard },
    { id: Page.ADVISORY, label: t.menu_advisory, icon: Sprout },
    { id: Page.DISEASE_CHECK, label: t.menu_disease, icon: ScanLine },
    { id: Page.ANIMAL_MART, label: t.menu_mart, icon: ShoppingBag },
    { id: Page.MACHINERY, label: t.menu_machinery, icon: Tractor },
    { id: Page.QUESTS, label: t.menu_quests, icon: Award },
    { id: Page.LEADERBOARD, label: t.menu_leaderboard, icon: Trophy },
    { id: Page.SCHEMES, label: t.menu_schemes, icon: ScrollText },
    { id: Page.PROFILE, label: t.menu_profile, icon: User },
    { id: Page.CROPS, label: t.menu_crops, icon: Wheat },
    { id: Page.ACTIVITIES, label: t.menu_activities, icon: Activity },
    { id: Page.WEATHER, label: t.menu_weather, icon: CloudSun },
    { id: Page.COMMUNITY, label: t.menu_community, icon: Users },
    { id: Page.CONNECT, label: t.menu_connect, icon: Globe },
  ];

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLanguage(e.target.value as Language);
  };

  return (
    <aside 
      className={`fixed top-0 left-0 z-40 w-64 h-screen transition-transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 bg-white border-r border-gray-200 shadow-sm flex flex-col`}
    >
      <div className="flex-1 px-3 py-4 overflow-y-auto custom-scrollbar">
        <div className="flex items-center ps-2.5 mb-8 mt-2">
          <div className="bg-green-600 p-2 rounded-lg text-white mr-3">
             <Sprout size={24} />
          </div>
          <div className="flex flex-col">
            <span className="self-center text-xl font-bold whitespace-nowrap text-green-900">{t.app_name}</span>
            <span className="text-xs text-green-600 font-medium">{t.subtitle}</span>
          </div>
        </div>
        
        <ul className="space-y-2 font-medium">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => setPage(item.id)}
                className={`flex items-center w-full p-3 rounded-lg group transition-colors duration-200 ${
                  activePage === item.id 
                    ? 'bg-green-50 text-green-700 font-semibold border-l-4 border-green-600' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <item.icon 
                  className={`w-5 h-5 transition duration-75 ${
                    activePage === item.id ? 'text-green-600' : 'text-gray-500 group-hover:text-gray-900'
                  }`} 
                />
                <span className="ms-3">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Functional Language Switcher */}
      <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
              <Globe size={18} className="text-gray-500" />
              <select 
                value={language} 
                onChange={handleLanguageChange}
                className="bg-transparent border-none text-sm font-medium text-gray-700 focus:ring-0 w-full outline-none cursor-pointer"
              >
                  <option value="en">English</option>
                  <option value="mr">मराठी (Marathi)</option>
                  <option value="hi">हिंदी (Hindi)</option>
              </select>
          </div>
      </div>
    </aside>
  );
};

export default Sidebar;
