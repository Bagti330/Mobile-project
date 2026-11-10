import React from 'react';
import { StyleSheet, View, Text, Dimensions, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useReportStore } from '../store/useReportStore';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { CustomMarker } from '../components/CustomMarker';
import { ReportDetailCard } from '../components/ReportDetailCard';

const isWeb = Platform.OS === 'web';

export default function HomeScreen() {
  const { reports, selectedReport, setSelectedReport } = useReportStore();
  const { location, errorMsg } = useLocationTracking();

  const initialRegion = {
    latitude: location ? location.coords.latitude : -7.96662,
    longitude: location ? location.coords.longitude : 112.63263,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Jika dibuka di Browser Web, tampilkan tampilan aman (Fallback)
  if (isWeb) {
    return (
      <SafeAreaView style={styles.webFallbackContainer}>
        <Text style={styles.webFallbackTitle}>📱 Mode Aplikasi Seluler</Text>
        <Text style={styles.webFallbackText}>
          Fitur Peta Interaktif & GPS memerlukan perangkat keras HP. Silakan buka aplikasi menggunakan **Expo Go** di HP Android Anda.
        </Text>
      </SafeAreaView>
    );
  }

  // Load react-native-maps secara dynamic HANYA untuk Android/iOS
  const MapView = require('react-native-maps').default;
  const PROVIDER_DEFAULT = require('react-native-maps').PROVIDER_DEFAULT;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Civic Pulse 🚨</Text>
        <Text style={styles.headerSubtitle}>Pantau & Laporkan Infrastruktur Kota</Text>
        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      </View>

      <MapView
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        region={initialRegion}
        showsUserLocation={true}
        showsMyLocationButton={true}
        onPress={() => setSelectedReport(null)}
      >
        {reports.map((report) => (
          <CustomMarker
            key={report.id}
            report={report}
            onSelect={(item) => setSelectedReport(item)}
          />
        ))}
      </MapView>

      {!selectedReport && (
        <TouchableOpacity
          style={styles.fabButton}
          activeOpacity={0.8}
          onPress={() => console.log('Buka Modal Form Pelaporan')}
        >
          <Text style={styles.fabIcon}>+</Text>
          <Text style={styles.fabText}>Buat Laporan</Text>
        </TouchableOpacity>
      )}

      <ReportDetailCard
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  headerContainer: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: 14,
    borderRadius: 12,
    elevation: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  errorText: {
    color: '#ef4444',
    fontSize: 11,
    marginTop: 4,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  webFallbackContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#f1f5f9',
  },
  webFallbackTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
  },
  webFallbackText: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 20,
  },
  fabButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284c7',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 30,
    elevation: 6,
  },
  fabIcon: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 6,
  },
  fabText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});