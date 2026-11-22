
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { Alert } from "react-native";

export async function requestCameraPermission(): Promise<boolean> {
  const permission =
    await ImagePicker.requestCameraPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      "Izin Kamera Ditolak",
      "Izinkan akses kamera untuk mengambil foto bukti laporan."
    );
    return false;
  }

  return true;
}

export async function requestLocationPermission(): Promise<boolean> {
  const permission =
    await Location.requestForegroundPermissionsAsync();

  if (!permission.granted) {
    Alert.alert(
      "Izin Lokasi Ditolak",
      "Izinkan akses lokasi untuk mendapatkan koordinat laporan."
    );
    return false;
  }

  return true;
}
