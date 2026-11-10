import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import type { ReportItem } from '../types/report';

interface Props {
  report: ReportItem;
  onSelect: (report: ReportItem) => void;
}

export const CustomMarker = ({ report, onSelect }: Props) => {
  if (Platform.OS === 'web') return null;

  const { Marker } = require('react-native-maps');

  const getBadgeColor = (severity: string) => {
    switch (severity) {
      case 'Tinggi': return '#ef4444';
      case 'Sedang': return '#f59e0b';
      default: return '#10b981';
    }
  };

  return (
    <Marker coordinate={report.coordinate} onPress={() => onSelect(report)}>
      <View style={[styles.badge, { backgroundColor: getBadgeColor(report.severity) }]}>
        <Text style={styles.icon}>{report.category === 'Bencana Alam' ? '⚠️' : '🛠️'}</Text>
      </View>
    </Marker>
  );
};

const styles = StyleSheet.create({
  badge: { padding: 8, borderRadius: 20, borderWidth: 2, borderColor: '#fff' },
  icon: { fontSize: 14 },
});