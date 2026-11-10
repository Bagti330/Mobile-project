import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { ReportItem } from '../types/report';

interface Props {
  report: ReportItem | null;
  onClose: () => void;
}

export const ReportDetailCard = ({ report, onClose }: Props) => {
  if (!report) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.category}>{report.category}</Text>
        <TouchableOpacity onPress={onClose}><Text style={styles.close}>✕</Text></TouchableOpacity>
      </View>
      <Text style={styles.title}>{report.title}</Text>
      <Text style={styles.desc}>{report.description}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { position: 'absolute', bottom: 20, left: 16, right: 16, backgroundColor: '#fff', padding: 16, borderRadius: 16, elevation: 5 },
  header: { flexDirection: 'row', justifyContent: 'space-between' },
  category: { color: '#0284c7', fontWeight: 'bold' },
  close: { fontSize: 16, color: '#94a3b8' },
  title: { fontSize: 16, fontWeight: 'bold', marginTop: 8 },
  desc: { fontSize: 14, color: '#475569', marginTop: 4 },
});