import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 1. Import Store, Hook, dan Komponen Internal
import { useReportStore } from '../store/useReportStore';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { CustomMarker } from '../components/CustomMarker';
import { ReportDetailCard } from '../components/ReportDetailCard';
import { AddReportModal } from '../components/AddReportModal';
import { ReportCategory, SeverityLevel, ReportItem } from '../types/report';

// 2. Deteksi Platform Web
const isWeb = Platform.OS === 'web';

export default function HomeScreen() {
  // Global State dari Zustand Store (Anggota 1)
  const { reports, selectedReport, setSelectedReport, addReport } = useReportStore();
  
  // Custom Hook Lokasi (Anggota 3)
  const { location, errorMsg } = useLocationTracking();

  // Local State untuk Kontrol Modal Form (Anggota 2)
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  // Koordinat Default jika lokasi GPS belum didapat
  const initialRegion = {
    latitude: location ? location.coords.latitude : -7.96662,
    longitude: location ? location.coords.longitude : 112.63263,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  // Handler untuk menyimpan Laporan Baru ke Zustand Store
  const handleAddReport = (
    title: string,
    category: ReportCategory,
    severity: SeverityLevel,
    description: string
  ) => {
    const newReport: ReportItem = {
      id: Date.now().toString(),
      title,
      category,
      severity,
      description,
      timestamp: 'Baru saja',
      coordinate: location
        ? {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          }
        : {
            latitude: -7.96662,
            longitude: 112.63263,
          },
    };

    addReport(newReport);
  };

  // Tampilan khusus jika dibuka di Browser Web (Mencegah Crash Native Module)
  if (isWeb) {
    return (
      <SafeAreaView style={styles.webFallbackContainer}>
        <Text style={styles.webFallbackTitle}>📱 Mode Aplikasi Seluler</Text>
        <Text style={styles.webFallbackText}>
          Fitur Peta Interaktif & GPS memerlukan perangkat keras HP. Silakan buka aplikasi menggunakan **Expo Go** di HP Android / iOS Anda.
        </Text>
      </SafeAreaView>
    );
  }

  // Dynamic import modul Peta Native (Hanya aktif di Android/iOS)
  const MapView = require('react-native-maps').default;
  const PROVIDER_DEFAULT = require('react-native-maps').PROVIDER_DEFAULT;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* 1. Header Overlay App */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Civic Pulse 🚨</Text>
        <Text style={styles.headerSubtitle}>Pantau & Laporkan Infrastruktur Kota</Text>
        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      </View>

      {/* 2. Layer Peta Interaktif */}
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

      {/* 3. Floating Action Button (FAB) + Buat Laporan */}
      {!selectedReport && (
        <TouchableOpacity
          style={styles.fabButton}
          activeOpacity={0.8}
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.fabIcon}>+</Text>
          <Text style={styles.fabText}>Buat Laporan</Text>
        </TouchableOpacity>
      )}

      {/* 4. Sheet Card Detail Laporan (Muncul saat Marker diklik) */}
      <ReportDetailCard
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />

      {/* 5. Modal Form Pelaporan Baru (Muncul saat FAB diklik) */}
      <AddReportModal
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSubmit={handleAddReport}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
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
    shadowColor: '#0284c7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
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