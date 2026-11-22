
import { useState, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';

const DEFAULT_MALANG_LATITUDE = -7.9666;
const DEFAULT_MALANG_LONGITUDE = 112.6326;

const createFallbackLocation = (): Location.LocationObject => ({
  coords: {
    latitude: DEFAULT_MALANG_LATITUDE,
    longitude: DEFAULT_MALANG_LONGITUDE,
    altitude: null,
    accuracy: 100,
    altitudeAccuracy: null,
    heading: null,
    speed: null,
  },
  timestamp: Date.now(),
});

export const useLocationTracking = () => {
  const [location, setLocation] =
    useState<Location.LocationObject | null>(
      createFallbackLocation()
    );

  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const requestLocation = async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setErrorMsg(null);

      if (Platform.OS === 'web') {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 60000,
              }
            );
          }
        );

        setLocation({
          coords: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude,
            accuracy: position.coords.accuracy,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
          },
          timestamp: position.timestamp,
        });

        return true;
      }

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        setErrorMsg('Izin akses lokasi ditolak.');
        return false;
      }

      const currentLocation =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

      setLocation(currentLocation);
      return true;

    } catch (error) {
      console.error('Location error:', error);
      setErrorMsg('Gagal mengakses lokasi perangkat.');
      return false;

    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    requestLocation();
  }, []);

  return {
    location,
    errorMsg,
    requestLocation,
    isLoading,
  };
};
