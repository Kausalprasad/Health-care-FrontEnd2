import { useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import healthService from '../services/health/healthConnectService';
import { formatHealthData } from '../services/health/dataFormatters';

export default function useHealthData(date = new Date()) {
  const [data, setData] = useState({
    steps: 0,
    heartRate: 0,
    distance: 0,
    activeCalories: 0,
    sleep: 0,
    bloodOxygen: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [granted, setGranted] = useState(false);
  
  // Track if data has been fetched to prevent auto-refresh
  const hasFetchedData = useRef(false);
  const isCurrentlyFetching = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'android') {
      setLoading(false);
      return;
    }
    (async () => {
      try {
        await healthService.initialize();
        const perms = await healthService.requestPermissions();
        setGranted(perms.length > 0);
        setLoading(false);
      } catch (e) {
        setError(e.message);
        setLoading(false);
      }
    })();
  }, []);

  // Rate limiting helper function
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Retry helper function for quota exceeded errors
  const retryWithBackoff = async (fn, maxRetries = 3) => {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (error.message.includes('quota exceeded') && i < maxRetries - 1) {
          const waitTime = (i + 1) * 10000; // 10, 20, 30 seconds
          console.log(`Rate limit exceeded, waiting ${waitTime/1000} seconds...`);
          await delay(waitTime);
          continue;
        }
        throw error;
      }
    }
  };

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Prevent multiple simultaneous fetches
    if (isCurrentlyFetching.current) {
      console.log('Already fetching data, skipping...');
      return;
    }
    
    // Prevent auto-refresh unless forced
    if (hasFetchedData.current && !forceRefresh) {
      console.log('Data already fetched, use refresh button to update');
      return;
    }
    
    if (!granted) return;
    
    isCurrentlyFetching.current = true;
    setLoading(true);
    setError(null);
    
    const start = new Date(date.setHours(0,0,0,0)).toISOString();
    const end = new Date(date.setHours(23,59,59,999)).toISOString();
    const filter = { operator: 'between', startTime: start, endTime: end };

    try {
      console.log('Fetching health data with rate limiting...');
      
      const stepsR = await retryWithBackoff(() => 
        healthService.read('Steps', filter)
      );
      await delay(2000);
      
      const hrR = await retryWithBackoff(() => 
        healthService.read('HeartRate', filter)
      );
      await delay(2000);
      
      const distR = await retryWithBackoff(() => 
        healthService.read('Distance', filter)
      );
      await delay(2000);
      
      const calR = await retryWithBackoff(() => 
        healthService.read('ActiveCaloriesBurned', filter)
      );
      await delay(2000);
      
      const sleepR = await retryWithBackoff(() => 
        healthService.read('SleepSession', filter)
      );
      await delay(2000);
      
      const oxyR = await retryWithBackoff(() => 
        healthService.read('OxygenSaturation', filter)
      );

      setData({
        steps: formatHealthData.steps(stepsR),
        heartRate: formatHealthData.heartRate(hrR),
        distance: formatHealthData.distance(distR),
        activeCalories: formatHealthData.activeCalories(calR),
        sleep: formatHealthData.sleep(sleepR),
        bloodOxygen: formatHealthData.bloodOxygen(oxyR),
      });
      
      hasFetchedData.current = true; // Mark as fetched
      console.log('Health data fetched successfully!');
      
    } catch (e) {
      console.error('Health data fetch error:', e);
      if (e.message.includes('quota exceeded')) {
        setError('API rate limit exceeded. Please wait a moment and try again.');
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
      isCurrentlyFetching.current = false;
    }
  }, [date, granted]);

  // Manual refresh function
  const refreshData = useCallback(() => {
    console.log('Manual refresh triggered');
    hasFetchedData.current = false; // Reset the flag
    fetchData(true); // Force refresh
  }, [fetchData]);

  // Only fetch data once when granted becomes true
  useEffect(() => {
    if (granted && !hasFetchedData.current) {
      fetchData();
    }
  }, [granted]); // Remove fetchData from dependency array

  return {
    vitals: data,
    loading,
    error,
    granted,
    refresh: refreshData, // Use manual refresh function
    openSettings: healthService.openSettings,
  };
}
