
import * as FileSystem from "expo-file-system/legacy";

export async function saveEvidencePhoto(
  sourceUri: string
): Promise<string> {
  const documentDirectory = FileSystem.documentDirectory;

  if (!documentDirectory) {
    throw new Error("Document directory tidak tersedia.");
  }

  const folder = `${documentDirectory}evidence/`;

  const folderInfo = await FileSystem.getInfoAsync(folder);

  if (!folderInfo.exists) {
    await FileSystem.makeDirectoryAsync(folder, {
      intermediates: true,
    });
  }

  const fileName = `evidence_${Date.now()}.jpg`;
  const destination = `${folder}${fileName}`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destination,
  });

  return destination;
}
