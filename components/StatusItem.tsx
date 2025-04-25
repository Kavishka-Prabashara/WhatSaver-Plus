import React from 'react';
import { View, Image, Button, Text } from 'react-native';
import RNFS from 'react-native-fs';

interface Props {
  path: string;
}

const StatusItem: React.FC<Props> = ({ path }) => {
  const filename = path.split('/').pop();

  const download = async () => {
    const dest = `${RNFS.DownloadDirectoryPath}/${filename}`;
    await RNFS.copyFile(path, dest);
    alert(`Downloaded to ${dest}`);
  };

  return (
    <View style={{ margin: 10, borderBottomWidth: 1, paddingBottom: 10 }}>
      {path.endsWith('.jpg') && (
        <Image source={{ uri: 'file://' + path }} style={{ width: '100%', height: 200 }} />
      )}
      <Button title="Download" onPress={download} />
    </View>
  );
};

export default StatusItem;
