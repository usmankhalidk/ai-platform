import { StatusBar } from 'expo-status-bar';
import React from 'react';
import ApproveRejectScreen from './src/screens/ApproveRejectScreen';

export default function App(): React.JSX.Element {
  return (
    <>
      <StatusBar style="dark" />
      <ApproveRejectScreen />
    </>
  );
}
