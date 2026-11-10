import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import MapView, { Marker, Circle, Callout, Region, MapPressEvent } from 'react-native-maps';
import { Coordinate, MarkerData, useMapStore } from '@/store/useMapStore';
import { calculateDistance } from '@/utils/haversine';

export interface InteractiveMapProps {
  onMarkerPress?: (marker: MarkerData) => void;
  enableAddMarkerOnPress?: boolean;
}

const DEFAULT_REGION: Region = {
  latitude: -6.2088,
  longitude: 106.8456,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

export function InteractiveMap({
  onMarkerPress,
  enableAddMarkerOnPress = true,
}: InteractiveMapProps) {
  const mapRef = useRef<MapView | null>(null);

  const currentLocation = useMapStore((state) => state.currentLocation);
  const markers = useMapStore((state) => state.markers);
  const addMarker = useMapStore((state) => state.addMarker);

  useEffect(() => {
    if (currentLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.015,
          longitudeDelta: 0.015,
        },
        800
      );
    }
  }, [currentLocation?.latitude, currentLocation?.longitude]);

  const handleMapPress = (e: MapPressEvent) => {
    if (!enableAddMarkerOnPress) return;

    const coordinate: Coordinate = e.nativeEvent.coordinate;
    const newMarker: MarkerData = {
      id: `marker-${Date.now()}`,
      coordinate,
      timestamp: Date.now(),
    };
    addMarker(newMarker);
  };

  const initialRegion: Region = currentLocation
    ? {
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        latitudeDelta: 0.02,
        longitudeDelta: 0.02,
      }
    : DEFAULT_REGION;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onPress={handleMapPress}>
        {currentLocation && (
          <Circle
            center={currentLocation}
            radius={25}
            strokeColor="rgba(32, 138, 239, 0.8)"
            fillColor="rgba(32, 138, 239, 0.2)"
          />
        )}

        {markers.map((marker, index) => {
          const distance = currentLocation
            ? calculateDistance(currentLocation, marker.coordinate)
            : null;

          return (
            <Marker
              key={marker.id}
              coordinate={marker.coordinate}
              pinColor="#E53935"
              onPress={() => onMarkerPress?.(marker)}>
              <Callout>
                <View style={styles.calloutContainer}>
                  <Text style={styles.calloutTitle}>Laporan #{index + 1}</Text>
                  <Text style={styles.calloutCoord}>
                    {marker.coordinate.latitude.toFixed(5)},{' '}
                    {marker.coordinate.longitude.toFixed(5)}
                  </Text>
                  {distance !== null && (
                    <Text style={styles.calloutDistance}>
                      Jarak: {distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(2)} km`}
                    </Text>
                  )}
                  <Text style={styles.calloutTime}>
                    {new Date(marker.timestamp).toLocaleTimeString('id-ID')}
                  </Text>
                </View>
              </Callout>
            </Marker>
          );
        })}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  calloutContainer: {
    padding: 8,
    minWidth: 140,
  },
  calloutTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#111827',
    marginBottom: 2,
  },
  calloutCoord: {
    fontSize: 12,
    color: '#4B5563',
  },
  calloutDistance: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
    marginTop: 2,
  },
  calloutTime: {
    fontSize: 10,
    color: '#9CA3AF',
    marginTop: 4,
  },
});
