import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Dimensions,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useReportStore } from '../store/useReportStore';
import { useAuthStore } from '../store/useAuthStore';
import { useLocationTracking } from '../hooks/useLocationTracking';
import { CustomMarker } from '../components/CustomMarker';
import { ReportDetailCard } from '../components/ReportDetailCard';
import { AddReportModal } from '../components/AddReportModal';
import { WebMapView } from '../components/WebMapView';
import { ReportCategory, SeverityLevel, ReportItem } from '../types/report';

const isWeb = Platform.OS === 'web';

export default function HomeScreen() {
  const { reports, selectedReport, setSelectedReport, addReport } = useReportStore();
  const { location, errorMsg } = useLocationTracking();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const hydrateAuth = useAuthStore((state) => state.hydrateAuth);

  useEffect(() => {
    void hydrateAuth();
  }, [hydrateAuth]);

  const userCoordinate = location
    ? {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }
    : null;

  const initialRegion = {
    latitude: userCoordinate ? userCoordinate.latitude : -7.96662,
    longitude: userCoordinate ? userCoordinate.longitude : 112.63263,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  };

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
      coordinate: userCoordinate ?? {
        latitude: -7.96662,
        longitude: 112.63263,
      },
    };

    addReport(newReport);
  };

  const renderMapLayer = () => {
    if (isWeb) {
      return (
        <WebMapView
          reports={reports}
          selectedReport={selectedReport}
          userLocation={userCoordinate}
          onSelectReport={(item) => setSelectedReport(item)}
        />
      );
    }

    const MapView = require('react-native-maps').default;
    const PROVIDER_DEFAULT = require('react-native-maps').PROVIDER_DEFAULT;

    return (
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
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>Civic Pulse</Text>
        <Text style={styles.headerSubtitle}>Pantau & Laporkan Infrastruktur Kota</Text>
        {errorMsg && <Text style={styles.errorText}>{errorMsg}</Text>}
      </View>

      {renderMapLayer()}

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
