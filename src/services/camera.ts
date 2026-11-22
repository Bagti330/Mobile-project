
import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";

import { requestCameraPermission } from "./permissions";
import { saveEvidencePhoto } from "./fileStorage";

export async function takeEvidencePhoto(): Promise<string | null> {
  try {
    const hasPermission = await requestCameraPermission();

    if (!hasPermission) {
      return null;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) {
      return null;
    }

    const savedUri = await saveEvidencePhoto(
      result.assets[0].uri
    );

    Alert.alert("Berhasil", "Foto bukti berhasil disimpan.");

    return savedUri;
  } catch (error) {
    console.error("Camera error:", error);

    Alert.alert("Gagal", "Tidak dapat mengambil atau menyimpan foto.");

    return null;
  }
}
