import { ICurrentWeather, ILocation } from '../views/HomePage/HomePage';
import { useHttp } from '../hooks/useHttp';
import { useCallback } from 'react';

const API_KEY = 'tPl3QGT9w9mLN2AF7bKcSc785t18btvO';
const BASE_URL = 'http://dataservice.accuweather.com';

export interface DailyForecast {
     date: string;
     minTemp: number;
     maxTemp: number;
     weatherText: string;
}

const useWeatherAction = () => {
     const { httpRequest } = useHttp();

     const getCurrentWeather = useCallback(
          async (locationKeys: string): Promise<ICurrentWeather[]> => {
               const res = await httpRequest(`${BASE_URL}/currentconditions/v1/${locationKeys}?apikey=${API_KEY}`);
               const currentWeather = res.map((weather: ICurrentWeather) => {
                    return {
                         WeatherText: weather.WeatherText,
                         Temperature: {
                              Metric: {
                                   Value: weather.Temperature.Metric.Value,
                              },
                         },
                    };
               });
               return currentWeather;
          },
          [httpRequest]
     );

     const searchLocationByName = useCallback(
          async (name: string): Promise<ILocation[]> => {
               const res = await httpRequest(`${BASE_URL}/locations/v1/cities/autocomplete?apikey=${API_KEY}&q=${encodeURIComponent(name)}`);
               return res.map((location: ILocation) => ({
                    Key: location.Key,
                    name: location.LocalizedName,
                    country: location.Country,
                    region: location.region,
               }));
          },
          [httpRequest]
     );

     const getDailyForecast = useCallback(
          async (locationKey: string): Promise<DailyForecast[]> => {
               const res = await httpRequest(
                    `${BASE_URL}/forecasts/v1/daily/5day/${locationKey}`,
                    'GET',
                    null,
                    {},
                    {
                         params: {
                              apikey: API_KEY,
                              metric: true,
                         },
                    }
               );
               return res.data.DailyForecasts.map((forecast: any) => ({
                    date: forecast.Date,
                    minTemp: forecast.Temperature.Minimum.Value,
                    maxTemp: forecast.Temperature.Maximum.Value,
                    weatherText: forecast.Day.IconPhrase,
               }));
          },
          [httpRequest]
     );

     const weatherForecast5DaysByCityName = useCallback(
          async (name: string): Promise<any> => {
               try {
                    const weatherByCityName = await searchLocationByName(name);
                    const fiveDaysForecast = await getDailyForecast(weatherByCityName as any);
                    return fiveDaysForecast;
               } catch (error) {
                    if (error instanceof Error) console.error(`Error fetching weather forecast: ${error.message}`);
                    throw new Error('Failed to fetch weather forecast');
               }
          },
          [getDailyForecast, searchLocationByName]
     );

     return { getDailyForecast, searchLocationByName, getCurrentWeather, weatherForecast5DaysByCityName };
};
export default useWeatherAction;