import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import VitalsDashboard from '../../components/vitals/VitalsDashboard';

export default function VitalsScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <VitalsDashboard />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
});
