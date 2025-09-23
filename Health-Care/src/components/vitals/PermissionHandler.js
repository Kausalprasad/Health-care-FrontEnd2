import React from 'react';
import { StyleSheet } from 'react-native';
import { Card, Text, Button } from 'react-native-paper';

export default function PermissionHandler({ onOpenSettings }) {
  return (
    <Card style={styles.card}>
      <Card.Content>
        <Text style={styles.title}>Permissions Needed</Text>
        <Text style={styles.desc}>
          Grant Health Connect access to read your vitals data.
        </Text>
      </Card.Content>
      <Card.Actions>
        <Button mode="contained" onPress={onOpenSettings}>
          Open Settings
        </Button>
      </Card.Actions>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: 16,
    padding: 12,
  },
  title: {
    fontSize: 18,
    marginBottom: 8,
  },
  desc: {
    fontSize: 14,
    color: '#666',
  },
});
