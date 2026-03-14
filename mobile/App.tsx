import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import ApproveRejectScreen from './src/screens/ApproveRejectScreen';

export default function App(): React.JSX.Element {
  return (
    <View style={styles.container}>
      <StatusBar style="light" backgroundColor="#09090B" />
      <ApproveRejectScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#09090B',
  },
});
