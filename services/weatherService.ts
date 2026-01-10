import { WeatherData } from '../types';

export const fetchWeatherData = async (lat: number, lon: number): Promise<WeatherData | null> => {
  try {
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&timezone=auto&forecast_days=7`
    );
    const data = await response.json();

    if (!data || !data.current || !data.daily) {
        throw new Error("Invalid weather data");
    }

    return {
      current: {
        temp: data.current.temperature_2m,
        humidity: data.current.relative_humidity_2m,
        windSpeed: data.current.wind_speed_10m,
        conditionCode: data.current.weather_code,
        isDay: data.current.is_day === 1
      },
      daily: data.daily.time.map((time: string, index: number) => ({
        date: time,
        maxTemp: data.daily.temperature_2m_max[index],
        minTemp: data.daily.temperature_2m_min[index],
        conditionCode: data.daily.weather_code[index],
        rainProb: data.daily.precipitation_probability_max[index]
      })),
      location: "Kottayam, Kerala" // Default for now, can be updated with reverse geocoding
    };
  } catch (error) {
    console.error("Weather fetch error:", error);
    return null;
  }
};

export const getWeatherDescription = (code: number): { label: string; icon: string } => {
  // WMO Weather interpretation codes (https://open-meteo.com/en/docs)
  if (code === 0) return { label: 'Clear Sky', icon: 'Sun' };
  if (code >= 1 && code <= 3) return { label: 'Partly Cloudy', icon: 'CloudSun' };
  if (code >= 45 && code <= 48) return { label: 'Foggy', icon: 'CloudFog' };
  if (code >= 51 && code <= 55) return { label: 'Drizzle', icon: 'CloudDrizzle' };
  if (code >= 61 && code <= 67) return { label: 'Rainy', icon: 'CloudRain' };
  if (code >= 80 && code <= 82) return { label: 'Heavy Rain', icon: 'CloudLightning' };
  if (code >= 95) return { label: 'Thunderstorm', icon: 'CloudLightning' };
  return { label: 'Cloudy', icon: 'Cloud' };
};
