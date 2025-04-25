import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as MediaLibrary from 'expo-media-library';
import { Video } from 'expo-av';
import { Image } from 'expo-image';

const STATUS_DIR = Platform.OS === 'android'
  ? '/storage/emulated/0/Android/media/com.whatsapp/accounts/1003/WhatsApp/Media/.Statuses'
  : '';

interface StatusItemProps {
  path: string;
}

const StatusItem: React.FC<StatusItemProps> = ({ path }) => {
  const isVideo = path.endsWith('.mp4');

  const handleDownload = async () => {
    try {
      const fileName = path.split('/').pop();
      const dest = FileSystem.documentDirectory + fileName;

      await FileSystem.copyAsync({
        from: path,
        to: dest,
      });

      const asset = await MediaLibrary.createAssetAsync(dest);
      await MediaLibrary.createAlbumAsync('WhatsApp Statuses', asset, false);

      Alert.alert('Downloaded', 'Status saved successfully.');
    } catch (error: any) {
      console.error('Download error:', error);
      Alert.alert('Error', error.message || 'Something went wrong');
    }
  };

  return (
    <View style={styles.item}>
      {isVideo ? (
        <Video
          source={{ uri: `file://${path}` }}
          style={styles.media}
          useNativeControls
          resizeMode="contain"
          isLooping
        />
      ) : (
        <Image
          style={styles.media}
          source={{ uri: `file://${path}` }}
          contentFit="cover"
        />
      )}
      <TouchableOpacity style={styles.button} onPress={handleDownload}>
        <Text style={styles.buttonText}>Download</Text>
      </TouchableOpacity>
    </View>
  );
};

export default function HomeScreen() {
  const [statuses, setStatuses] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'We need access to your media to show WhatsApp statuses.');
        return;
      }

      try {
        const dirInfo = await FileSystem.getInfoAsync(STATUS_DIR);
        if (!dirInfo.exists) {
          Alert.alert('Not Found', 'WhatsApp statuses folder not found. Make sure to view some statuses first.');
          return;
        }

        const files = await FileSystem.readDirectoryAsync(STATUS_DIR);
        const media = files
          .filter(f => f.endsWith('.jpg') || f.endsWith('.mp4'))
          .map(f => `${STATUS_DIR}/${f}`);
        setStatuses(media);
      } catch (err: any) {
        console.error(err);
        Alert.alert('Error', err.message || 'Unable to read statuses');
      }
    })();
  }, []);

  return (
    <View style={styles.container}>
      {statuses.length > 0 ? (
        <FlatList
          data={statuses}
          keyExtractor={(item) => item}
          renderItem={({ item }) => <StatusItem path={item} />}
          numColumns={2}
        />
      ) : (
        <Text style={styles.message}>No statuses found.</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
    backgroundColor: '#fff',
  },
  item: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  media: {
    width: '100%',
    height: 200,
  },
  button: {
    padding: 10,
    backgroundColor: '#4CAF50',
    width: '100%',
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
  },
  message: {
    marginTop: 50,
    textAlign: 'center',
    fontSize: 16,
    color: 'gray',
  },
});
