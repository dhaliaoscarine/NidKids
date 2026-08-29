// screens/AddChildScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { addChild } from '../api';

const DIAGNOSES = ['ASD', 'CP', 'Down Syndrome'];

export default function AddChildScreen({ navigation, route }) {
  const { token, user } = route.params || {};
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [diagnosis, setDiagnosis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSave = async () => {
    setMessage('');
    if (!name || !age || !diagnosis) {
      setMessage('Please fill in name, age, and diagnosis.');
      return;
    }
    setLoading(true);
    try {
      await addChild({ name, age: Number(age), diagnosis }, token);
      navigation.replace('Home', { token, user });
    } catch (error) {
      if (error.response) {
        setMessage(`Server says: ${error.response.data?.message || 'Could not save'}`);
      } else {
        setMessage('Could not reach the server. Check backend is running and IP is correct.');
      }
      console.error('Add child error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.title}>Add Your Child</Text>
        <Text style={styles.subtitle}>This helps us personalize content</Text>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TextInput style={styles.input} placeholder="Child's name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Age" value={age} onChangeText={setAge} keyboardType="number-pad" />

        <Text style={styles.label}>Diagnosis:</Text>
        <View style={styles.roleRow}>
          {DIAGNOSES.map((d) => (
            <TouchableOpacity
              key={d}
              style={[styles.roleButton, diagnosis === d && styles.roleButtonSelected]}
              onPress={() => setDiagnosis(d)}
            >
              <Text style={[styles.roleText, diagnosis === d && styles.roleTextSelected]}>{d}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSave} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Saving...' : 'Save and Continue'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: '#4DD0E1' },
  container: { padding: 24, paddingTop: 50 },
  title: { fontSize: 26, fontWeight: 'bold', textAlign: 'center', marginBottom: 6 },
  subtitle: { textAlign: 'center', marginBottom: 16 },
  message: { backgroundColor: '#fff3cd', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#ccc' },
  label: { fontWeight: '600', marginBottom: 8, fontSize: 15 },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  roleButton: { flex: 1, marginHorizontal: 4, paddingVertical: 12, borderRadius: 8, borderWidth: 2, borderColor: '#E91E9F', alignItems: 'center', backgroundColor: '#fff' },
  roleButtonSelected: { backgroundColor: '#E91E9F' },
  roleText: { color: '#E91E9F', fontSize: 12, fontWeight: '700', textAlign: 'center' },
  roleTextSelected: { color: '#fff' },
  button: { backgroundColor: '#E91E9F', borderRadius: 8, padding: 16, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
});