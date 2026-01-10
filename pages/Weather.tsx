import React, { useEffect, useState } from 'react';
import { Cloud, CloudRain, CloudSun, Sun, Wind, Droplets, MapPin, Loader2, CloudLightning, CloudFog, CloudDrizzle } from 'lucide-react';
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

    return (
        <div className="p-4 md:p-8 animate-fade-in space-y-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <CloudSun className="text-blue-500" /> {t.weather_title}
            </h1>

            {/* Current Weather Card */}
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
                <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                    <div>
                        <div className="flex items-center gap-2 mb-2 text-blue-100">
                            <MapPin size={18} />
                            <span className="font-medium">{weather.location}</span>
                        </div>
                        <h2 className="text-6xl font-bold mb-2">{Math.round(weather.current.temp)}°C</h2>
                        <p className="text-xl font-medium opacity-90">{currentDesc.label}</p>
                        <p className="text-sm mt-1 text-blue-100">
                             {t.feels_like} {Math.round(weather.current.temp + 2)}°C
                        </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-1 text-blue-100">
                                <Wind size={16} /> <span className="text-sm">{t.wind}</span>
                            </div>
                            <p className="text-xl font-bold">{weather.current.windSpeed} km/h</p>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm p-4 rounded-xl">
                            <div className="flex items-center gap-2 mb-1 text-blue-100">
                                <Droplets size={16} /> <span className="text-sm">{t.humidity}</span>
                            </div>
                            <p className="text-xl font-bold">{weather.current.humidity}%</p>
                        </div>
                    </div>
                </div>
                <CloudSun size={300} className="absolute -right-10 -bottom-10 opacity-10" />
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