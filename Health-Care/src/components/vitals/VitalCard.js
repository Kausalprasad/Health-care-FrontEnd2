import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';

export default function VitalCard({ title, icon, value, unit, color }) {
  return (
    <Card style={[styles.card, { borderLeftColor: color }]}>
      <Card.Content>
        <Text style={styles.header}>{icon} {title}</Text>
        <Text style={styles.value}>{value} {unit}</Text>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginVertical: 6,
    borderLeftWidth: 4,
    elevation: 2,
  },
  header: {
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 4,
  },
});
