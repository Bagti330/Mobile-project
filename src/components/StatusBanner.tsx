import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

interface StatusBannerProps {
  permissionError: string | null;
}

export const StatusBanner = ({ permissionError }: StatusBannerProps) => {
  const [isOffline, setIsOffline] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsOffline(state.isConnected === false);
    });
    return () => unsubscribe();
  }, []);

  if (!isOffline && !permissionError) return null;

  return (
    <View style={styles.container}>
      {isOffline && (
        <View style={[styles.banner, styles.offlineBanner]}>
          <Text style={styles.bannerText}>
            📡 Mode Offline: Data laporan akan disimpan sementara di perangkat.
          </Text>
        </View>
      )}

      {permissionError && (
        <View style={[styles.banner, styles.permissionBanner]}>
          <Text style={styles.bannerText}>⚠️ {permissionError}</Text>
          <TouchableOpacity onPress={() => Linking.openSettings()} style={styles.settingsBtn}>
            <Text style={styles.settingsText}>Buka Pengaturan</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 8,
    gap: 6,
  },
  banner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  offlineBanner: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
  },
  permissionBanner: {
    backgroundColor: '#fee2e2',
    borderWidth: 1,
    borderColor: '#ef4444',
  },
  bannerText: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '600',
    flex: 1,
  },
  settingsBtn: {
    backgroundColor: '#ef4444',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  settingsText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: 'bold',
  },
});