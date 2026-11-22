
import * as FileSystem from 'expo-file-system/legacy';

export const checkSavedFiles = async () => {
  try {
    const directory = FileSystem.documentDirectory;

    if (!directory) {
      console.log('Document directory tidak tersedia.');
      return;
    }

    const evidenceFolder = `${directory}evidence/`;

    console.log('========== CEK PENYIMPANAN ==========');
    console.log('Lokasi:', directory);

    const folderInfo = await FileSystem.getInfoAsync(evidenceFolder);

    if (!folderInfo.exists) {
      console.log('Folder evidence belum tersedia.');
      console.log('Ambil foto melalui aplikasi terlebih dahulu.');
      return;
    }

    const photos = await FileSystem.readDirectoryAsync(evidenceFolder);

    console.log('Daftar foto bukti:');

    photos.forEach((photo, index) => {
      console.log(`${index + 1}. ${photo}`);
    });

    console.log('Total foto:', photos.length);
    console.log('====================================');
  } catch (error) {
    console.error('Gagal memeriksa penyimpanan:', error);
  }
};
