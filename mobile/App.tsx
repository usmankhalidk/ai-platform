import { StatusBar } from 'expo-status-bar';
import React from 'react';
import ApproveRejectScreen from './src/screens/ApproveRejectScreen';

export default function App(): React.JSX.Element {
  return (
    <>
      {/* style="light" → white icons/text on the dark zinc-950 background */}
      <StatusBar style="light" backgroundColor="#09090B" />
      <ApproveRejectScreen />
    </>
  );
}
