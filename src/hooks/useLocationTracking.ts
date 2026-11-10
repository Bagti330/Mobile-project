import { useState, useEffect } from 'react';
import * as Location from 'expo-location';

export const useLocationTracking = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Izin akses lokasi ditolak');
        return;
      }

      // Dapatkan lokasi awal
      const currentLocation = await Location.getCurrentPositionAsync({});
      setLocation(currentLocation);

      // Lacak pergerakan dengan distanceInterval adaptif (misal per 10 meter)
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          distanceInterval: 10,
        },
        (newLocation) => {
          setLocation(newLocation);
        }
      );
    })();

    // Cleanup subscription untuk Zero Memory Leak
    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return { location, errorMsg };
};