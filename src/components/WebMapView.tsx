import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import type { ReportItem, SeverityLevel } from '../types/report';
import { calculateDistanceInKm, type Coordinate } from '../utils/haversine';

const DEFAULT_COORDINATE: Coordinate = {
  latitude: -7.9666,
  longitude: 112.6326,
};

interface WebMapViewProps {
  reports: ReportItem[];
  selectedReport: ReportItem | null;
  userLocation: Coordinate | null;
  onSelectReport: (report: ReportItem) => void;
}

const getSeverityColor = (severity: SeverityLevel): string => {
  switch (severity) {
    case 'Tinggi':
      return '#ef4444';
    case 'Sedang':
      return '#f59e0b';
    default:
      return '#10b981';
  }
};

const buildOpenStreetMapEmbedUrl = (center: Coordinate): string => {
  const delta = 0.015;
  const minLon = center.longitude - delta;
  const minLat = center.latitude - delta;
  const maxLon = center.longitude + delta;
  const maxLat = center.latitude + delta;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${minLon},${minLat},${maxLon},${maxLat}&layer=mapnik&marker=${center.latitude},${center.longitude}`;
};

export const WebMapView = ({
  reports,
  selectedReport,
  userLocation,
  onSelectReport,
}: WebMapViewProps) => {
  const originCoordinate = userLocation ?? DEFAULT_COORDINATE;
  const centerCoordinate = selectedReport ? selectedReport.coordinate : originCoordinate;
  const mapUrl = buildOpenStreetMapEmbedUrl(centerCoordinate);

  return (
    <View style={styles.container}>
      <View style={styles.mapFrameWrapper}>
        <iframe
          title="Civic Pulse OpenStreetMap"
          src={mapUrl}
          style={{
            width: '100%',
            height: '100%',
            border: 0,
          }}
          loading="lazy"
        />
      </View>

      <View style={styles.panel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>Daftar Laporan Sekitar</Text>
          <Text style={styles.panelCount}>{reports.length} Laporan</Text>
        </View>

        <ScrollView
          style={styles.reportList}
          contentContainerStyle={styles.reportListContent}
          showsVerticalScrollIndicator={false}
        >
          {reports.map((report) => {
            const distanceKm = calculateDistanceInKm(originCoordinate, report.coordinate);
            const isSelected = selectedReport?.id === report.id;
            const severityColor = getSeverityColor(report.severity);

            return (
              <TouchableOpacity
                key={report.id}
                style={[styles.reportItem, isSelected && styles.reportItemSelected]}
                activeOpacity={0.8}
                onPress={() => onSelectReport(report)}
              >
                <View style={styles.reportItemTop}>
                  <View style={styles.severityRow}>
                    <View style={[styles.severityDot, { backgroundColor: severityColor }]} />
                    <Text style={[styles.severityLabel, { color: severityColor }]}>
                      {report.severity}
                    </Text>
                  </View>
                  <Text style={styles.distanceText}>{distanceKm} km</Text>
                </View>

                <Text style={styles.reportTitle} numberOfLines={1}>
                  {report.title}
                </Text>
                <Text style={styles.reportMeta} numberOfLines={1}>
                  {report.category} - {report.timestamp}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#e2e8f0',
  },
  mapFrameWrapper: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  panel: {
    position: 'absolute',
    top: 136,
    left: 16,
    width: 320,
    maxWidth: '90%',
    maxHeight: '46%',
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.14,
    shadowRadius: 8,
    elevation: 6,
  },
  panelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  panelTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  panelCount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284c7',
  },
  reportList: {
    flexGrow: 0,
  },
  reportListContent: {
    gap: 8,
  },
  reportItem: {
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  reportItemSelected: {
    backgroundColor: '#e0f2fe',
    borderColor: '#0284c7',
  },
  reportItemTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  severityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  severityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  severityLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  reportTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  reportMeta: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
});
