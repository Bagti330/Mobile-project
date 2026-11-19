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
  const [location, setLocation] = useState<Location.LocationObject | null>(
    Platform.OS === 'web' ? createFallbackLocation() : null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    let subscription: Location.LocationSubscription | null = null;

    if (Platform.OS === 'web') {
      if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
        if (isMounted) {
          setLocation(createFallbackLocation());
        }
        return () => {
          isMounted = false;
        };
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          if (!isMounted) return;
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
          setErrorMsg(null);
        },
        () => {
          if (!isMounted) return;
          setLocation(createFallbackLocation());
        },
        {
          enableHighAccuracy: false,
          timeout: 8000,
          maximumAge: 60000,
        }
      );

      return () => {
        isMounted = false;
      };
    }

    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          if (isMounted) {
            setErrorMsg('Izin akses lokasi ditolak');
          }
          return;
        }

        const currentLocation = await Location.getCurrentPositionAsync({});
        if (isMounted) {
          setLocation(currentLocation);
        }

        subscription = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.High,
            distanceInterval: 10,
          },
          (newLocation) => {
            if (isMounted) {
              setLocation(newLocation);
            }
          }
        );
      } catch {
        if (isMounted) {
          setErrorMsg('Gagal mengakses lokasi perangkat');
        }
      }
    })();

    return () => {
      isMounted = false;
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  return { location, errorMsg };
};
