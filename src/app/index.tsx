import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocationTracking } from '@/hooks/useLocationTracking';
import { useMapStore } from '@/store/useMapStore';
import { InteractiveMap } from '@/components/InteractiveMap';
import { calculateDistance } from '@/utils/haversine';

export default function HomeScreen() {
  const {
    currentLocation,
    hasLocationPermission,
    isTracking,
    error,
    requestPermission,
    startTracking,
    stopTracking,
  } = useLocationTracking({ autoStart: true });

  const markers = useMapStore((state) => state.markers);
  const addMarker = useMapStore((state) => state.addMarker);

  const nearestMarkerInfo = useMemo(() => {
    if (!currentLocation || markers.length === 0) return null;

    let nearest = markers[0];
    let minDistance = calculateDistance(currentLocation, markers[0].coordinate);

    for (let i = 1; i < markers.length; i++) {
      const dist = calculateDistance(currentLocation, markers[i].coordinate);
      if (dist < minDistance) {
        minDistance = dist;
        nearest = markers[i];
      }
    }

    return { marker: nearest, distance: minDistance };
  }, [currentLocation, markers]);

  const handleAddSampleReport = () => {
    const baseLat = currentLocation?.latitude ?? -6.2088;
    const baseLon = currentLocation?.longitude ?? 106.8456;

    const randomOffsetLat = (Math.random() - 0.5) * 0.006;
    const randomOffsetLon = (Math.random() - 0.5) * 0.006;

    addMarker({
      id: `report-${Date.now()}`,
      coordinate: {
        latitude: baseLat + randomOffsetLat,
        longitude: baseLon + randomOffsetLon,
      },
      timestamp: Date.now(),
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <View>
          <Text style={styles.appTitle}>Civic Pulse</Text>
          <Text style={styles.appSubtitle}>LBS & Spatial Incident Engine</Text>
        </View>

        <View
          style={[
            styles.statusPill,
            hasLocationPermission === true
              ? styles.statusPillSuccess
              : hasLocationPermission === false
              ? styles.statusPillDanger
              : styles.statusPillWarning,
          ]}>
          <View
            style={[
              styles.statusDot,
              hasLocationPermission === true
                ? styles.statusDotSuccess
                : hasLocationPermission === false
                ? styles.statusDotDanger
                : styles.statusDotWarning,
            ]}
          />
          <Text style={styles.statusPillText}>
            {hasLocationPermission === true
              ? isTracking
                ? 'GPS Aktif'
                : 'GPS Terjeda'
              : hasLocationPermission === false
              ? 'Izin Ditolak'
              : 'Memeriksa GPS...'}
          </Text>
        </View>
      </View>

      <View style={styles.mapContainer}>
        <InteractiveMap enableAddMarkerOnPress={true} />

        {hasLocationPermission === false && (
          <View style={styles.permissionBanner}>
            <Text style={styles.permissionText}>
              Izin lokasi diperlukan untuk melacak koordinat secara realtime.
            </Text>
            <TouchableOpacity
              style={styles.permissionButton}
              onPress={() => requestPermission()}>
              <Text style={styles.permissionButtonText}>Berikan Izin</Text>
            </TouchableOpacity>
          </View>
        )}

        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        )}
      </View>

      <View style={styles.dashboardCard}>
        <View style={styles.infoRow}>
          <View style={styles.infoCol}>
            <Text style={styles.infoLabel}>Koordinat Anda</Text>
            {currentLocation ? (
              <Text style={styles.infoValue}>
                {currentLocation.latitude.toFixed(5)},{' '}
                {currentLocation.longitude.toFixed(5)}
              </Text>
            ) : (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color="#0284C7" />
                <Text style={styles.infoSubtext}> Mengunci satelit GPS...</Text>
              </View>
            )}
          </View>

          <View style={styles.infoColRight}>
            <Text style={styles.infoLabel}>Total Laporan</Text>
            <Text style={styles.infoValueHighlight}>{markers.length} Titik</Text>
          </View>
        </View>

        {nearestMarkerInfo && (
          <View style={styles.nearestContainer}>
            <Text style={styles.nearestLabel}>
              📍 Laporan Terdekat (Formula Haversine):
            </Text>
            <Text style={styles.nearestValue}>
              {nearestMarkerInfo.distance < 1000
                ? `${Math.round(nearestMarkerInfo.distance)} meter`
                : `${(nearestMarkerInfo.distance / 1000).toFixed(2)} km`}{' '}
              dari posisi Anda
            </Text>
          </View>
        )}

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={handleAddSampleReport}>
            <Text style={styles.primaryBtnText}>+ Buat Pin Laporan</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryBtn, isTracking ? styles.stopBtn : styles.startBtn]}
            onPress={isTracking ? stopTracking : startTracking}>
            <Text style={styles.secondaryBtnText}>
              {isTracking ? 'Jeda GPS' : 'Mulai GPS'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    backgroundColor: '#FFFFFF',
  },
  appTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusPillSuccess: {
    backgroundColor: '#DCFCE7',
  },
  statusPillDanger: {
    backgroundColor: '#FEE2E2',
  },
  statusPillWarning: {
    backgroundColor: '#FEF3C7',
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  statusDotSuccess: {
    backgroundColor: '#16A34A',
  },
  statusDotDanger: {
    backgroundColor: '#DC2626',
  },
  statusDotWarning: {
    backgroundColor: '#D97706',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1F2937',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  permissionBanner: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(239, 68, 68, 0.95)',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  permissionText: {
    color: '#FFFFFF',
    fontSize: 12,
    flex: 1,
    marginRight: 8,
    fontWeight: '500',
  },
  permissionButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  permissionButtonText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 12,
  },
  errorBanner: {
    position: 'absolute',
    top: 60,
    left: 12,
    right: 12,
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    padding: 8,
    borderRadius: 8,
  },
  errorText: {
    fontSize: 12,
    color: '#92400E',
  },
  dashboardCard: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoCol: {
    flex: 1,
  },
  infoColRight: {
    alignItems: 'flex-end',
  },
  infoLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
    fontVariant: ['tabular-nums'],
  },
  infoValueHighlight: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0284C7',
  },
  infoSubtext: {
    fontSize: 12,
    color: '#64748B',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  nearestContainer: {
    backgroundColor: '#F0F9FF',
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  nearestLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0369A1',
  },
  nearestValue: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0C4A6E',
    marginTop: 1,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryBtn: {
    flex: 2,
    backgroundColor: '#0284C7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  startBtn: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
  },
  stopBtn: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
  },
  secondaryBtnText: {
    fontWeight: '600',
    fontSize: 13,
    color: '#374151',
  },
});
