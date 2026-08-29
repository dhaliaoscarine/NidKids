// screens/TestScreen.js
// A bare-minimum test screen — no validation, no animations, no toggles.
// Just: one button that calls the backend and shows exactly what happens.
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { registerUser } from '../api';

export default function TestScreen({ navigation }) {
  const [status, setStatus] = useState('Not tested yet');

  const runTest = async () => {
    setStatus('Sending request...');
    // Random suffix so we never hit "duplicate account" errors during testing
    const randomId = Math.floor(Math.random() * 1000000);

    try {
      const response = await registerUser({
        name: 'Test User',
        phone: `65500${randomId}`.slice(0, 9),
        password: '123456',
        confirmPassword: '123456',
        role: 'parent',
      });
      console.log('TEST SUCCESS:', response.data);
      setStatus(
        `✅ SUCCESS!\nToken: ${response.data.token.substring(0, 30)}...\nUser role: ${response.data.user.role}`
      );
    } catch (error) {
      console.error('TEST FAILURE:', error);
      const details = error.response
        ? `Status: ${error.response.status}\nData: ${JSON.stringify(error.response.data)}`
        : `No response received.\nMessage: ${error.message}`;
      setStatus(`❌ FAILED\n${details}`);
    }
  };

  const goToAddChild = () => {
    navigation.navigate('AddChild', { token: 'fake-test-token' });
  };

  const goToHome = () => {
    navigation.navigate('Home', { token: 'fake-test-token' });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 Test Screen</Text>

      <TouchableOpacity style={styles.button} onPress={runTest}>
        <Text style={styles.buttonText}>Test Register API Call</Text>
      </TouchableOpacity>

      <Text style={styles.status}>{status}</Text>

      <View style={styles.spacer} />

      <TouchableOpacity style={[styles.button, styles.navButton]} onPress={goToAddChild}>
        <Text style={styles.buttonText}>Go to AddChild (test navigation only)</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.navButton]} onPress={goToHome}>
        <Text style={styles.buttonText}>Go to Home (test navigation only)</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 60, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  button: {
    backgroundColor: '#E91E9F',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  navButton: { backgroundColor: '#4DD0E1' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  status: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    fontFamily: 'monospace',
    fontSize: 13,
  },
  spacer: { height: 20 },
});
