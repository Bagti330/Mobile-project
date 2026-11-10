import { useCallback, useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { useMapStore } from '@/store/useMapStore';

export interface UseLocationTrackingOptions {
  autoStart?: boolean;
  distanceInterval?: number;
  timeInterval?: number;
  accuracy?: Location.Accuracy;
}

export function useLocationTracking(options: UseLocationTrackingOptions = {}) {
  const {
    autoStart = true,
    distanceInterval = 10,
    timeInterval = 5000,
    accuracy = Location.Accuracy.High,
  } = options;

  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentLocation = useMapStore((state) => state.currentLocation);
  const hasLocationPermission = useMapStore((state) => state.hasLocationPermission);
  const setCurrentLocation = useMapStore((state) => state.setCurrentLocation);
  const setLocationPermission = useMapStore((state) => state.setLocationPermission);

  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const isMountedRef = useRef(true);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      setError(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      const isGranted = status === Location.PermissionStatus.GRANTED;

      setLocationPermission(isGranted);
      return isGranted;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal meminta izin lokasi.';
      setError(message);
      setLocationPermission(false);
      return false;
    }
  }, [setLocationPermission]);

  const stopTracking = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.remove();
      subscriptionRef.current = null;
    }
    if (isMountedRef.current) {
      setIsTracking(false);
    }
  }, []);

  const startTracking = useCallback(async () => {
    try {
      setError(null);

      let granted = hasLocationPermission;
      if (granted === null) {
        granted = await requestPermission();
      }

      if (!granted) {
        setError('Izin akses lokasi ditolak.');
        return;
      }

      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }

      const initialPosition = await Location.getCurrentPositionAsync({
        accuracy,
      });

      if (isMountedRef.current) {
        setCurrentLocation({
          latitude: initialPosition.coords.latitude,
          longitude: initialPosition.coords.longitude,
        });
      }

      const subscription = await Location.watchPositionAsync(
        {
          accuracy,
          distanceInterval,
          timeInterval,
        },
        (location) => {
          if (isMountedRef.current) {
            setCurrentLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
            });
          }
        }
      );

      subscriptionRef.current = subscription;
      if (isMountedRef.current) {
        setIsTracking(true);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Gagal memulai pelacakan lokasi.';
      if (isMountedRef.current) {
        setError(message);
        setIsTracking(false);
      }
    }
  }, [
    accuracy,
    distanceInterval,
    hasLocationPermission,
    requestPermission,
    setCurrentLocation,
    timeInterval,
  ]);

  useEffect(() => {
    isMountedRef.current = true;

    if (autoStart) {
      startTracking();
    }

    return () => {
      isMountedRef.current = false;
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    };
  }, [autoStart, startTracking]);

  return {
    currentLocation,
    hasLocationPermission,
    isTracking,
    error,
    requestPermission,
    startTracking,
    stopTracking,
  };
}
