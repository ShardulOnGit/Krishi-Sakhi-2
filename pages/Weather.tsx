import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSun, Sun, Wind, Droplets, MapPin, Loader2, CloudLightning, CloudFog, CloudDrizzle, Sunrise, Sunset, Umbrella, CheckCircle2, XCircle, Droplet, Clock, Sprout } from 'lucide-react';
import { fetchWeatherData, getWeatherDescription } from '../services/weatherService';
import { WeatherData } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

const WeatherIcon = ({ code, className }: { code: number, className?: string }) => {
    const { icon } = getWeatherDescription(code);
    switch (icon) {
        case 'Sun': return <Sun className={`text-yellow-500 ${className}`} />;
        case 'CloudSun': return <CloudSun className={`text-yellow-400 ${className}`} />;
        case 'CloudFog': return <CloudFog className={`text-gray-400 ${className}`} />;
        case 'CloudDrizzle': return <CloudDrizzle className={`text-blue-400 ${className}`} />;
        case 'CloudRain': return <CloudRain className={`text-blue-600 ${className}`} />;
        case 'CloudLightning': return <CloudLightning className={`text-purple-600 ${className}`} />;
        default: return <Cloud className={`text-gray-400 ${className}`} />;
    }
};

const Weather: React.FC = () => {
    const { t } = useLanguage();
    const [weather, setWeather] = useState<WeatherData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Default coordinates for Kottayam, Kerala
        fetchWeatherData(9.5916, 76.5222).then(data => {
            setWeather(data);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="animate-spin text-green-600" size={40} />
            </div>
        );
    }

    if (!weather) {
        return <div className="p-8 text-center text-red-500">Failed to load weather data. Please check your connection.</div>;
    }

    const currentDesc = getWeatherDescription(weather.current.conditionCode);
    const today = weather.daily[0];

    // Farming Suitability Logic
    const isSprayingSuitable = weather.current.windSpeed < 15 && weather.current.humidity < 85 && today.rainProb < 30;
    const isHarvestSuitable = today.rainProb < 20;
    const isIrrigationNeeded = today.rainProb < 40 && weather.current.humidity < 80;

    return (
        <div className="p-4 md:p-8 animate-fade-in space-y-8 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CloudSun className="text-blue-500" /> {t.weather_title}
            </h1>

            {/* Current Weather Card */}
            <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-4 text-blue-100 bg-white/10 w-fit px-4 py-1.5 rounded-full backdrop-blur-sm">
                            <MapPin size={16} />
                            <span className="font-medium text-sm">{weather.location}</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <h2 className="text-7xl font-bold tracking-tight">{Math.round(weather.current.temp)}°</h2>
                            <div>
                                <p className="text-2xl font-medium opacity-90">{currentDesc.label}</p>
                                <p className="text-sm mt-1 text-blue-100 opacity-75">
                                     {t.feels_like} {Math.round(weather.current.temp + 2)}°C
                                </p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                            <div className="flex items-center gap-2 mb-2 text-blue-100">
                                <Wind size={18} /> <span className="text-sm font-medium">{t.wind}</span>
                            </div>
                            <p className="text-2xl font-bold">{weather.current.windSpeed} <span className="text-sm font-normal">km/h</span></p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                            <div className="flex items-center gap-2 mb-2 text-blue-100">
                                <Droplets size={18} /> <span className="text-sm font-medium">{t.humidity}</span>
                            </div>
                            <p className="text-2xl font-bold">{weather.current.humidity}<span className="text-sm font-normal">%</span></p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                            <div className="flex items-center gap-2 mb-2 text-yellow-300">
                                <Sunrise size={18} /> <span className="text-sm font-medium text-blue-100">{t.sunrise}</span>
                            </div>
                            <p className="text-xl font-bold">{new Date(today.sunrise).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10 hover:bg-white/20 transition-colors">
                            <div className="flex items-center gap-2 mb-2 text-orange-300">
                                <Sunset size={18} /> <span className="text-sm font-medium text-blue-100">{t.sunset}</span>
                            </div>
                            <p className="text-xl font-bold">{new Date(today.sunset).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                    </div>
                </div>
                {/* Background Decor */}
                <div className="absolute -top-20 -right-20 w-80 h-80 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
                <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            </div>

            {/* Farming Conditions Guide */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Sprout size={20} className="text-green-600" /> {t.farming_conditions}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Spraying Card */}
                    <div className={`p-5 rounded-xl border flex flex-col justify-between ${
                        isSprayingSuitable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-full ${isSprayingSuitable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    <Umbrella size={20} />
                                </div>
                                <span className="font-bold text-gray-800">{t.spraying}</span>
                            </div>
                            {isSprayingSuitable ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-red-600" />}
                        </div>
                        <p className={`text-sm font-medium ${isSprayingSuitable ? 'text-green-700' : 'text-red-700'}`}>
                            {isSprayingSuitable ? t.suitable : t.not_suitable}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Wind: {weather.current.windSpeed}km/h | Rain: {today.rainProb}%
                        </p>
                    </div>

                    {/* Harvest Card */}
                    <div className={`p-5 rounded-xl border flex flex-col justify-between ${
                        isHarvestSuitable ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                    }`}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-full ${isHarvestSuitable ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                    <Sun size={20} />
                                </div>
                                <span className="font-bold text-gray-800">{t.harvest}</span>
                            </div>
                            {isHarvestSuitable ? <CheckCircle2 className="text-green-600" /> : <XCircle className="text-red-600" />}
                        </div>
                        <p className={`text-sm font-medium ${isHarvestSuitable ? 'text-green-700' : 'text-red-700'}`}>
                            {isHarvestSuitable ? t.suitable : t.not_suitable}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Rain Probability: {today.rainProb}%
                        </p>
                    </div>

                    {/* Irrigation Card */}
                    <div className={`p-5 rounded-xl border flex flex-col justify-between ${
                        isIrrigationNeeded ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'
                    }`}>
                        <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-full ${isIrrigationNeeded ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'}`}>
                                    <Droplet size={20} />
                                </div>
                                <span className="font-bold text-gray-800">{t.irrigation}</span>
                            </div>
                            {isIrrigationNeeded && <CheckCircle2 className="text-blue-600" />}
                        </div>
                        <p className={`text-sm font-medium ${isIrrigationNeeded ? 'text-blue-700' : 'text-gray-600'}`}>
                            {isIrrigationNeeded ? 'Recommended' : 'Not Needed'}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                            Soil Moisture: {isIrrigationNeeded ? 'Low' : 'Adequate'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Hourly Forecast */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    <Clock size={20} className="text-purple-600" /> {t.hourly_forecast}
                </h3>
                <div className="flex overflow-x-auto gap-3 pb-4 scrollbar-hide">
                    {weather.hourly.map((hour, idx) => {
                        const date = new Date(hour.time);
                        const isNow = idx === 0;
                        return (
                            <div key={idx} className={`min-w-[80px] p-3 rounded-xl border flex flex-col items-center justify-center text-center transition-all ${
                                isNow ? 'bg-blue-600 text-white border-blue-600 shadow-lg scale-105' : 'bg-white border-gray-100 text-gray-600'
                            }`}>
                                <span className="text-xs font-medium mb-2 opacity-80">
                                    {isNow ? 'Now' : date.toLocaleTimeString([], {hour: '2-digit', hour12: true})}
                                </span>
                                <div className="mb-2">
                                    <WeatherIcon code={hour.conditionCode} className={isNow ? "text-white w-6 h-6" : "w-6 h-6"} />
                                </div>
                                <span className="font-bold text-lg mb-1">{Math.round(hour.temp)}°</span>
                                <div className="flex items-center gap-0.5 text-[10px] opacity-70">
                                    <Droplets size={8} /> {hour.rainProb}%
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 7 Day Forecast */}
            <div>
                <h3 className="text-lg font-bold text-gray-800 mb-4">{t.forecast_7_days}</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                    {weather.daily.map((day, idx) => {
                        const date = new Date(day.date);
                        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                        const isToday = idx === 0;

                        return (
                            <div key={day.date} className={`p-4 rounded-xl border flex flex-col items-center justify-center text-center transition-transform hover:-translate-y-1 ${isToday ? 'bg-blue-50 border-blue-200 shadow-sm' : 'bg-white border-gray-100'}`}>
                                <span className={`text-sm font-medium mb-2 ${isToday ? 'text-blue-700' : 'text-gray-500'}`}>
                                    {isToday ? t.today : dayName}
                                </span>
                                <WeatherIcon code={day.conditionCode} className="w-8 h-8 mb-3" />
                                <div className="flex items-center gap-2">
                                    <span className="font-bold text-gray-800">{Math.round(day.maxTemp)}°</span>
                                    <span className="text-sm text-gray-400">{Math.round(day.minTemp)}°</span>
                                </div>
                                <div className="mt-2 flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                                    <Droplets size={10} /> {day.rainProb}%
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Weather;