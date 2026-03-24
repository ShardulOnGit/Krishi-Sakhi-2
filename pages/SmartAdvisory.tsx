import React, { useEffect, useState } from 'react';
import { AlertTriangle, Droplets, Thermometer, Activity, Leaf, Sprout, CheckCircle, Loader2, Wind, Volume2, StopCircle, RefreshCw } from 'lucide-react';
import { fetchWeatherData } from '../services/weatherService';
import { generateSmartAdvisory, SmartAdvisoryResponse } from '../services/geminiService';
import { Crop } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const SmartAdvisory: React.FC = () => {
    const { t, language } = useLanguage();
    const [loading, setLoading] = useState(true);
    const [weatherData, setWeatherData] = useState<{temp: number, humidity: number} | null>(null);
    const [advisory, setAdvisory] = useState<SmartAdvisoryResponse | null>(null);
    const [isSpeaking, setIsSpeaking] = useState(false);

    const loadData = async () => {
        setLoading(true);
        // Stop any ongoing speech when reloading
        if (window.speechSynthesis) window.speechSynthesis.cancel();
        setIsSpeaking(false);

        try {
            // 1. Fetch Weather (Defaulting to Kottayam, Kerala for demo)
            const weather = await fetchWeatherData(9.5916, 76.5222);
            
            // 2. Fetch Crops from Local Storage
            const savedCrops = localStorage.getItem('krishi_crops');
            const crops: Crop[] = savedCrops ? JSON.parse(savedCrops) : [];

            if (weather) {
                setWeatherData({
                    temp: Math.round(weather.current.temp),
                    humidity: weather.current.humidity
                });

                // 3. Generate AI Advisory
                const aiResponse = await generateSmartAdvisory(weather, crops, language);
                setAdvisory(aiResponse);
            }
        } catch (error) {
            console.error("Failed to load advisory data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
        return () => {
            // Cleanup speech on unmount
            if (window.speechSynthesis) window.speechSynthesis.cancel();
        };
    }, [language]);

    const speakAdvisory = () => {
        if (!advisory || !window.speechSynthesis) return;

        // Cancel previous utterances
        window.speechSynthesis.cancel();

        // Construct the text to read based on structure
        let textToRead = `${t.pest_disease_forecast}. ${advisory.pestForecast.condition}. ${advisory.pestForecast.description}. ${t.recommended_action}: ${advisory.pestForecast.action}. `;
        
        if (advisory.cropManagement.length > 0) {
            textToRead += `${t.crop_management}. `;
            advisory.cropManagement.forEach(item => {
                textToRead += `For ${item.cropName}, ${item.advice}. `;
            });
        }

        const utterance = new SpeechSynthesisUtterance(textToRead);
        
        // Map app language code to BCP 47 tag for TTS
        const langMap: Record<string, string> = {
            'en': 'en-IN',
            'hi': 'hi-IN',
            'mr': 'mr-IN'
        };
        utterance.lang = langMap[language] || 'en-IN';
        utterance.rate = 0.9; // Slightly slower for better clarity

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
    };

    const stopSpeaking = () => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
        }
    };

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center flex-col gap-4">
                <Loader2 className="animate-spin text-green-600" size={40} />
                <p className="text-gray-500 font-medium animate-pulse">{t.ai_thinking}</p>
            </div>
        );
    }

    const pest = advisory?.pestForecast;
    const isHighRisk = pest?.riskLevel === 'High';
    const isMediumRisk = pest?.riskLevel === 'Medium';

    return (
        <div className="p-4 md:p-8 space-y-8 animate-fade-in max-w-6xl mx-auto">
            {/* Top Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                        <Sprout className="text-green-600" />
                        {t.advisory_title}
                    </h2>
                    <p className="text-gray-500">{t.advisory_subtitle}</p>
                </div>
                
                <div className="flex gap-2">
                    {/* TTS Controls */}
                    {isSpeaking ? (
                        <button 
                            onClick={stopSpeaking}
                            className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors animate-pulse"
                        >
                            <StopCircle size={18} /> {t.stop_reading}
                        </button>
                    ) : (
                        <button 
                            onClick={speakAdvisory}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-bold hover:bg-blue-200 transition-colors"
                        >
                            <Volume2 size={18} /> {t.read_aloud}
                        </button>
                    )}

                    {/* Regenerate Button */}
                    <button 
                        onClick={loadData}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg font-bold hover:bg-gray-50 transition-colors"
                        disabled={loading}
                    >
                        <RefreshCw size={18} className={loading ? 'animate-spin' : ''} /> {t.regenerate}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Section - Alert/Notification Panel */}
                <div className={`border rounded-xl p-6 relative overflow-hidden shadow-sm transition-colors ${
                    isHighRisk ? 'bg-red-50 border-red-100' : 
                    isMediumRisk ? 'bg-yellow-50 border-yellow-100' : 'bg-green-50 border-green-100'
                }`}>
                    <div className="flex justify-between items-start mb-4">
                        <h3 className={`text-lg font-bold flex items-center gap-2 ${
                            isHighRisk ? 'text-red-900' : isMediumRisk ? 'text-yellow-900' : 'text-green-900'
                        }`}>
                            {isHighRisk || isMediumRisk ? <AlertTriangle className={isHighRisk ? "text-red-600" : "text-yellow-600"} /> : <CheckCircle className="text-green-600" />}
                            {t.pest_disease_forecast}
                        </h3>
                        <span className={`text-white text-xs px-2 py-1 rounded font-bold uppercase tracking-wider ${
                            isHighRisk ? 'bg-red-600' : isMediumRisk ? 'bg-yellow-600' : 'bg-green-600'
                        }`}>
                            {pest?.riskLevel} {t.risk}
                        </span>
                    </div>
                    
                    <div className="bg-white/60 rounded-lg p-4 mb-3 border border-white/50 shadow-sm backdrop-blur-sm">
                        <p className={`font-bold flex items-center gap-2 text-sm mb-2 ${
                            isHighRisk ? 'text-red-800' : isMediumRisk ? 'text-yellow-800' : 'text-green-800'
                        }`}>
                            {pest?.condition}
                        </p>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            {pest?.description}
                            <br/><br/>
                            <strong>{t.recommended_action}:</strong> {pest?.action}
                        </p>
                    </div>
                </div>

                {/* Right Section - Guidance/Recommendation Panel */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 shadow-sm flex flex-col">
                     <div className="flex justify-between items-start mb-4">
                        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                            <Leaf className="text-blue-600" />
                            {t.crop_management}
                        </h3>
                        <span className="text-blue-600 text-xs font-bold px-2 py-1 bg-blue-100 rounded border border-blue-200">{t.ai_generated}</span>
                    </div>
                    <div className="space-y-4 flex-1 overflow-y-auto max-h-[250px] pr-2 custom-scrollbar">
                        {advisory?.cropManagement && advisory.cropManagement.length > 0 ? (
                            advisory.cropManagement.map((advice, index) => (
                                <div key={index} className="flex gap-4 items-start bg-white p-3 rounded-lg border border-blue-100 shadow-sm">
                                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold shrink-0 text-sm">
                                        {advice.cropName.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-gray-800 text-sm">{advice.cropName}</h4>
                                            <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 rounded">{advice.stage}</span>
                                        </div>
                                        <p className="text-gray-600 text-xs mt-1 leading-relaxed">{advice.advice}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                             <p className="text-gray-500 text-sm italic">{t.no_crops}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Bottom Section - Live Sensor Dashboard (Simulated based on weather) */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-800 text-lg">{t.field_conditions}</h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Sensor Node #04
                    </span>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {/* Soil Moisture */}
                    <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm flex items-center justify-between group hover:border-blue-300 transition-colors">
                        <div>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{t.soil_moisture}</p>
                            {/* Heuristic: Higher humidity ~ higher soil moisture for demo */}
                            <p className="text-2xl font-bold text-blue-600">{weatherData ? Math.max(30, Math.min(90, weatherData.humidity - 10)) : '--'}%</p>
                        </div>
                        <div className="bg-blue-50 p-2.5 rounded-full text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-colors"><Droplets size={20} /></div>
                    </div>
                    {/* Soil Temp */}
                    <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm flex items-center justify-between group hover:border-orange-300 transition-colors">
                        <div>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{t.soil_temp}</p>
                            {/* Heuristic: Soil temp slightly lower than air temp usually */}
                            <p className="text-2xl font-bold text-orange-600">{weatherData ? weatherData.temp - 1 : '--'}°C</p>
                        </div>
                        <div className="bg-orange-50 p-2.5 rounded-full text-orange-500 group-hover:bg-orange-600 group-hover:text-white transition-colors"><Thermometer size={20} /></div>
                    </div>
                    {/* Soil pH */}
                    <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm flex items-center justify-between group hover:border-green-300 transition-colors">
                        <div>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{t.soil_ph}</p>
                            <p className="text-2xl font-bold text-green-600">6.5</p>
                        </div>
                        <div className="bg-green-50 p-2.5 rounded-full text-green-500 group-hover:bg-green-600 group-hover:text-white transition-colors"><Activity size={20} /></div>
                    </div>
                    {/* Wind Impact */}
                    <div className="bg-white p-4 rounded-xl border border-purple-100 shadow-sm flex items-center justify-between group hover:border-purple-300 transition-colors">
                        <div>
                            <p className="text-gray-500 text-[10px] font-bold uppercase tracking-wider">{t.wind_stress}</p>
                            <p className="text-2xl font-bold text-purple-600">Low</p>
                        </div>
                        <div className="bg-purple-50 p-2.5 rounded-full text-purple-500 group-hover:bg-purple-600 group-hover:text-white transition-colors"><Wind size={20} /></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SmartAdvisory;