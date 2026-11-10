import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Coordinate, MarkerData, useMapStore } from '@/store/useMapStore';
import { calculateDistance } from '@/utils/haversine';

export interface InteractiveMapProps {
  onMarkerPress?: (marker: MarkerData) => void;
  enableAddMarkerOnPress?: boolean;
}

export function InteractiveMap({
  onMarkerPress,
  enableAddMarkerOnPress = true,
}: InteractiveMapProps) {
  const currentLocation = useMapStore((state) => state.currentLocation);
  const markers = useMapStore((state) => state.markers);
  const addMarker = useMapStore((state) => state.addMarker);

  const centerLat = currentLocation?.latitude ?? -6.2088;
  const centerLon = currentLocation?.longitude ?? 106.8456;

  const mapEmbedUrl = useMemo(() => {
    const bboxDelta = 0.02;
    const minLon = centerLon - bboxDelta;
    const minLat = centerLat - bboxDelta;
    const maxLon = centerLon + bboxDelta;
    const maxLat = centerLat + bboxDelta;

    return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon}%2C${minLat}%2C${maxLon}%2C${maxLat}&layer=mapnik&marker=${centerLat}%2C${centerLon}`;
  }, [centerLat, centerLon]);

  const handleSimulateAddMarker = () => {
    if (!enableAddMarkerOnPress) return;

    const offsetLat = (Math.random() - 0.5) * 0.01;
    const offsetLon = (Math.random() - 0.5) * 0.01;

    const coordinate: Coordinate = {
      latitude: centerLat + offsetLat,
      longitude: centerLon + offsetLon,
    };

    const newMarker: MarkerData = {
      id: `marker-${Date.now()}`,
      coordinate,
      timestamp: Date.now(),
    };

    addMarker(newMarker);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iframeContainer}>
        <iframe
          src={mapEmbedUrl}
          style={{
            border: 'none',
            width: '100%',
            height: '100%',
          }}
          title="OpenStreetMap Civic Pulse"
        />
      </View>

      <View style={styles.overlayPanel}>
        <View style={styles.headerRow}>
          <Text style={styles.panelTitle}>Marker Laporan ({markers.length})</Text>
          {enableAddMarkerOnPress && (
            <TouchableOpacity
              style={styles.addBtn}
              onPress={handleSimulateAddMarker}>
              <Text style={styles.addBtnText}>+ Tambah Titik</Text>
            </TouchableOpacity>
          )}
        </View>

        {markers.length === 0 ? (
          <Text style={styles.emptyText}>
            Belum ada marker laporan. Klik "+ Tambah Titik" untuk simulasi penambahan laporan.
          </Text>
        ) : (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.markerList}>
            {markers.map((marker, index) => {
              const distance = currentLocation
                ? calculateDistance(currentLocation, marker.coordinate)
                : null;

              return (
                <TouchableOpacity
                  key={marker.id}
                  style={styles.markerCard}
                  onPress={() => onMarkerPress?.(marker)}>
                  <Text style={styles.markerCardTitle}>Laporan #{index + 1}</Text>
                  <Text style={styles.markerCardCoord}>
                    {marker.coordinate.latitude.toFixed(4)}, {marker.coordinate.longitude.toFixed(4)}
                  </Text>
                  {distance !== null && (
                    <Text style={styles.markerCardDistance}>
                      📍 {distance < 1000 ? `${Math.round(distance)} m` : `${(distance / 1000).toFixed(2)} km`}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#E5E7EB',
  },
  iframeContainer: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlayPanel: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  panelTitle: {
    fontWeight: '700',
    fontSize: 14,
    color: '#111827',
  },
  addBtn: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  emptyText: {
    fontSize: 12,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  markerList: {
    flexDirection: 'row',
    marginTop: 4,
  },
  markerCard: {
    backgroundColor: '#F3F4F6',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
    minWidth: 120,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  markerCardTitle: {
    fontWeight: '700',
    fontSize: 12,
    color: '#1F2937',
  },
  markerCardCoord: {
    fontSize: 11,
    color: '#6B7280',
    marginVertical: 2,
  },
  markerCardDistance: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0284C7',
  },
});
