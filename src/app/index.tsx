import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Platform,
  TouchableOpacity,
  ScrollView,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';

import { useReportStore } from '../store/useReportStore';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { CustomMarker } from '../components/CustomMarker';
import { ReportDetailCard } from '../components/ReportDetailCard';
import { AddReportModal } from '../components/AddReportModal';
import { StatusBanner } from '../components/StatusBanner';
import { ReportCategory, SeverityLevel, ReportItem } from '../types/report';

const isWeb = Platform.OS === 'web';

export default function HomeScreen() {
  const { width, height } = useWindowDimensions();
  const { reports, selectedReport, setSelectedReport, addReport } = useReportStore();
  const { location, errorMsg } = useLocationTracking();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const currentLat = location ? location.coords.latitude : -7.96662;
  const currentLon = location ? location.coords.longitude : 112.63263;

  const initialRegion = {
    latitude: currentLat,
    longitude: currentLon,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

  const handleAddReport = async (
    title: string,
    category: ReportCategory,
    severity: SeverityLevel,
    description: string,
    nik: string,
    photoUri?: string
  ) => {
    if (!isWeb) {
      await SecureStore.setItemAsync('user_reporter_nik', nik);
    }

    const newReport: ReportItem = {
      id: Date.now().toString(),
      title,
      category,
      severity,
      description,
      timestamp: 'Baru saja',
      reporterNik: nik,
      photoUri,
      coordinate: {
        latitude: currentLat,
        longitude: currentLon,
      },
    };

    addReport(newReport);
  };

  // =========================================================================
  // 1. TAMPILAN BROWSER WEB (localhost:8081)
  // =========================================================================
  if (isWeb) {
    if (!isMounted) {
      return <SafeAreaView style={styles.container} />;
    }

    const mapHeight = Math.max(height * 0.55, 320);
    const osmUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${
      currentLon - 0.02
    }%2C${currentLat - 0.02}%2C${currentLon + 0.02}%2C${
      currentLat + 0.02
    }&layer=mapnik&marker=${currentLat}%2C${currentLon}`;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.headerContainer}>
          <Text style={styles.headerTitle}>Civic Pulse 🚨 (Web Preview)</Text>
          <Text style={styles.headerSubtitle}>Pantau & Laporkan Infrastruktur Kota</Text>
          <StatusBanner permissionError={errorMsg} />
        </View>

        <View style={styles.webContentWrapper}>
          <View style={{ width: '100%', height: mapHeight, overflow: 'hidden' }}>
            <iframe
              src={osmUrl}
              width={width}
              height={mapHeight}
              style={{
                width: '100%',
                height: '100%',
                border: 'none',
                display: 'block',
              }}
              title="Civic Pulse Web Map"
            />
          </View>

          <View style={styles.webListSection}>
            <Text style={styles.webListTitle}>
              📋 Daftar Laporan Masuk ({reports.length})
            </Text>
            <ScrollView showsVerticalScrollIndicator={false}>
              {reports.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => setSelectedReport(item)}
                  style={styles.webListItem}
                >
                  <View>
                    <Text style={styles.webItemTitle}>{item.title}</Text>
                    <Text style={styles.webItemSub}>
                      {item.category} • {item.timestamp}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.severityBadge,
                      item.severity === 'Tinggi'
                        ? styles.bgRed
                        : item.severity === 'Sedang'
                        ? styles.bgOrange
                        : styles.bgGreen,
                    ]}
                  >
                    <Text style={styles.severityText}>{item.severity}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

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

        <ReportDetailCard
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
        <AddReportModal
          visible={isModalVisible}
          onClose={() => setIsModalVisible(false)}
          onSubmit={handleAddReport}
        />
      </SafeAreaView>
    );
  }

  // =========================================================================
  // 2. TAMPILAN PERANGKAT SELULER (Android / iOS via Expo Go)
  // =========================================================================
  const MapView = require('react-native-maps').default;
  const PROVIDER_DEFAULT = require('react-native-maps').PROVIDER_DEFAULT;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Civic Pulse 🚨</Text>
        <Text style={styles.headerSubtitle}>Pantau & Laporkan Infrastruktur Kota</Text>
        <StatusBanner permissionError={errorMsg} />
      </View>

      <MapView
        provider={PROVIDER_DEFAULT}
        style={{ width, height }}
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
          onPress={() => setIsModalVisible(true)}
        >
          <Text style={styles.fabIcon}>+</Text>
          <Text style={styles.fabText}>Buat Laporan</Text>
        </TouchableOpacity>
      )}

      <ReportDetailCard
        report={selectedReport}
        onClose={() => setSelectedReport(null)}
      />
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
    top: Platform.OS === 'web' ? 16 : 50,
    left: 16,
    right: 16,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
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
  webContentWrapper: {
    flex: 1,
    marginTop: 95,
  },
  webListSection: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderColor: '#e2e8f0',
  },
  webListTitle: {
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 10,
    color: '#0f172a',
  },
  webListItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderColor: '#f1f5f9',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  webItemTitle: {
    fontWeight: '600',
    fontSize: 14,
    color: '#1e293b',
  },
  webItemSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  severityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  bgRed: { backgroundColor: '#ef4444' },
  bgOrange: { backgroundColor: '#f59e0b' },
  bgGreen: { backgroundColor: '#10b981' },
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
    zIndex: 20,
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