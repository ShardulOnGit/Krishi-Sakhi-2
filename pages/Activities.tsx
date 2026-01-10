import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle2, Circle, Plus, Trash2, Sparkles, Calendar, Loader2, Filter, X } from 'lucide-react';
import { ActivityLog, Crop } from '../types';
import { fetchWeatherData } from '../services/weatherService';
import { getSuggestedActivities } from '../services/geminiService';
import { useLanguage } from '../contexts/LanguageContext';

const Activities: React.FC = () => {
    const { t, language } = useLanguage();
    const [activities, setActivities] = useState<ActivityLog[]>([]);
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
    const [isGenerating, setIsGenerating] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // New Activity Form State
    const [newActivity, setNewActivity] = useState({
        title: '',
        description: '',
        type: 'other' as ActivityLog['type'],
        date: new Date().toISOString().split('T')[0]
    });

    // Load Data
    useEffect(() => {
        const saved = localStorage.getItem('krishi_activities');
        if (saved) {
            setActivities(JSON.parse(saved));
        } else {
            // Default mock data if empty
            const initial: ActivityLog[] = [
                { id: '1', date: new Date().toISOString().split('T')[0], title: 'Check Soil Moisture', description: 'Ensure soil is moist but not waterlogged.', type: 'water', status: 'pending' },
            ];
            setActivities(initial);
        }
    }, []);

    // Save Data
    const saveActivities = (updated: ActivityLog[]) => {
        setActivities(updated);
        localStorage.setItem('krishi_activities', JSON.stringify(updated));
    };

    const handleToggleStatus = (id: string) => {
        const updated = activities.map(act => 
            act.id === id ? { ...act, status: act.status === 'completed' ? 'pending' : 'completed' } : act
        ) as ActivityLog[];
        saveActivities(updated);
    };

    const handleDelete = (id: string) => {
        if(confirm("Delete this activity log?")) {
            const updated = activities.filter(act => act.id !== id);
            saveActivities(updated);
        }
    };

    const handleAddManual = () => {
        if(!newActivity.title) return;
        const activity: ActivityLog = {
            id: Date.now().toString(),
            title: newActivity.title,
            description: newActivity.description,
            type: newActivity.type,
            date: newActivity.date,
            status: 'pending'
        };
        saveActivities([activity, ...activities]);
        setIsModalOpen(false);
        setNewActivity({ title: '', description: '', type: 'other', date: new Date().toISOString().split('T')[0] });
    };

    const handleGenerateAI = async () => {
        setIsGenerating(true);
        try {
            // 1. Get Context
            const weather = await fetchWeatherData(9.5916, 76.5222); // Default coords
            const crops: Crop[] = JSON.parse(localStorage.getItem('krishi_crops') || '[]');

            if (weather) {
                // 2. Call AI
                const suggestions = await getSuggestedActivities(weather, crops, language);
                
                // 3. Merge (Avoid duplicates by title check logic if needed, simplistically just adding to top)
                saveActivities([...suggestions, ...activities]);
            }
        } catch (e) {
            console.error(e);
            alert("Failed to generate activities. Please try again.");
        } finally {
            setIsGenerating(false);
        }
    };

    const filteredActivities = activities.filter(a => a.status === activeTab);
    
    // Sort: Pending (Oldest first? or Newest first?), Completed (Newest first)
    // Let's do Newest First for all
    filteredActivities.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return (
        <div className="p-4 md:p-8 animate-fade-in max-w-4xl mx-auto space-y-6">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Activity className="text-blue-600" /> {t.activities_title}
                    </h1>
                    <p className="text-gray-500 mt-1">{t.activities_subtitle}</p>
                </div>
                
                <div className="flex gap-2 w-full md:w-auto">
                    <button 
                        onClick={handleGenerateAI}
                        disabled={isGenerating}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-70 flex-1 md:flex-none justify-center"
                    >
                        {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                        {isGenerating ? t.ai_planning : t.generate_plan}
                    </button>
                    <button 
                        onClick={() => setIsModalOpen(true)}
                        className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-bold hover:bg-gray-50 flex items-center gap-2 flex-1 md:flex-none justify-center"
                    >
                        <Plus size={18} /> {t.log_task}
                    </button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-3 gap-4">
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                    <p className="text-xs font-bold text-blue-400 uppercase">{t.pending_tasks}</p>
                    <p className="text-2xl font-bold text-blue-700">{activities.filter(a => a.status === 'pending').length}</p>
                </div>
                <div className="bg-green-50 p-4 rounded-xl border border-green-100">
                    <p className="text-xs font-bold text-green-400 uppercase">{t.history}</p>
                    <p className="text-2xl font-bold text-green-700">{activities.filter(a => a.status === 'completed').length}</p>
                </div>
                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <p className="text-xs font-bold text-purple-400 uppercase">{t.total_logged}</p>
                    <p className="text-2xl font-bold text-purple-700">{activities.length}</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
                <button 
                    onClick={() => setActiveTab('pending')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'pending' ? 'text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t.pending_tasks}
                    {activeTab === 'pending' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>}
                </button>
                <button 
                    onClick={() => setActiveTab('completed')}
                    className={`px-6 py-3 font-medium text-sm transition-colors relative ${activeTab === 'completed' ? 'text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                >
                    {t.history}
                    {activeTab === 'completed' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-green-600 rounded-t-full"></div>}
                </button>
            </div>

            {/* List */}
            <div className="space-y-4 min-h-[300px]">
                {filteredActivities.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                        <Calendar className="mx-auto text-gray-300 mb-2" size={32} />
                        <p className="text-gray-500">No {activeTab} activities found.</p>
                        {activeTab === 'pending' && <p className="text-sm text-blue-500 mt-2 cursor-pointer" onClick={handleGenerateAI}>Try generating a plan with AI</p>}
                    </div>
                ) : (
                    filteredActivities.map(act => (
                        <div key={act.id} className={`bg-white p-4 rounded-xl border shadow-sm transition-all group flex gap-4 items-start ${
                            act.status === 'completed' ? 'border-gray-100 bg-gray-50/50' : 'border-gray-200 hover:border-blue-300'
                        }`}>
                            <button 
                                onClick={() => handleToggleStatus(act.id)}
                                className={`mt-1 shrink-0 transition-colors ${
                                    act.status === 'completed' ? 'text-green-500' : 'text-gray-300 hover:text-blue-500'
                                }`}
                            >
                                {act.status === 'completed' ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                            </button>
                            
                            <div className="flex-1">
                                <div className="flex justify-between items-start">
                                    <h3 className={`font-bold text-lg ${act.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                                        {act.title}
                                    </h3>
                                    <span className="text-xs font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">{act.date}</span>
                                </div>
                                <p className={`text-sm mt-1 ${act.status === 'completed' ? 'text-gray-400' : 'text-gray-600'}`}>
                                    {act.description}
                                </p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                                        act.type === 'water' ? 'bg-blue-100 text-blue-700' :
                                        act.type === 'fertilizer' ? 'bg-orange-100 text-orange-700' :
                                        act.type === 'harvest' ? 'bg-green-100 text-green-700' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {act.type}
                                    </span>
                                    
                                    <button 
                                        onClick={() => handleDelete(act.id)}
                                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Add Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl animate-fade-in-up">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="font-bold text-gray-900">{t.log_task}</h3>
                            <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-full"><X size={20} /></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.task_title}</label>
                                <input 
                                    type="text" 
                                    value={newActivity.title}
                                    onChange={(e) => setNewActivity({...newActivity, title: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g. Apply Urea"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">{t.task_desc}</label>
                                <textarea 
                                    value={newActivity.description}
                                    onChange={(e) => setNewActivity({...newActivity, description: e.target.value})}
                                    className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 h-20"
                                    placeholder="Details about the activity..."
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.task_type}</label>
                                    <select 
                                        value={newActivity.type}
                                        onChange={(e) => setNewActivity({...newActivity, type: e.target.value as any})}
                                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                                    >
                                        <option value="other">General</option>
                                        <option value="water">Irrigation</option>
                                        <option value="fertilizer">Fertilizer</option>
                                        <option value="planting">Planting</option>
                                        <option value="harvest">Harvest</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.task_date}</label>
                                    <input 
                                        type="date" 
                                        value={newActivity.date}
                                        onChange={(e) => setNewActivity({...newActivity, date: e.target.value})}
                                        className="w-full border rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <button 
                                onClick={handleAddManual}
                                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-bold hover:bg-blue-700 transition-colors mt-2"
                            >
                                {t.save_activity}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default Activities;