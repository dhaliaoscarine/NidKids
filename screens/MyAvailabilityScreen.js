// screens/MyAvailabilityScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { publishSlot, getMySlots, deleteSlot } from '../api';

export default function MyAvailabilityScreen({ route }) {
  const { token } = route.params || {};
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [sessionType, setSessionType] = useState('online');
  const [slots, setSlots] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadMySlots();
  }, []);

  const loadMySlots = async () => {
    try {
      const response = await getMySlots(token);
      setSlots(response.data.slots);
    } catch (error) {
      console.error('Load my slots error:', error);
    }
  };

  const handlePublish = async () => {
    setMessage('');
    if (!date || !startTime || !endTime) {
      setMessage('Please fill in date, start time, and end time.');
      return;
    }
    setLoading(true);
    try {
      await publishSlot({ date, startTime, endTime, sessionType }, token);
      setMessage('✅ Slot published!');
      setDate('');
      setStartTime('');
      setEndTime('');
      loadMySlots();
    } catch (error) {
      console.error('Publish slot error:', error);
      setMessage(error.response?.data?.message || 'Could not publish slot.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (slotId) => {
    try {
      await deleteSlot(slotId, token);
      loadMySlots();
    } catch (error) {
      console.error('Delete slot error:', error);
      setMessage(error.response?.data?.message || 'Could not delete slot.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Availability</Text>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Text style={styles.label}>Add a new slot:</Text>
      <TextInput style={styles.input} placeholder="Date (YYYY-MM-DD)" value={date} onChangeText={setDate} />
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="Start (HH:MM)"
          value={startTime}
          onChangeText={setStartTime}
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          placeholder="End (HH:MM)"
          value={endTime}
          onChangeText={setEndTime}
        />
      </View>

      <View style={styles.typeRow}>
        <TouchableOpacity
          style={[styles.typeButton, sessionType === 'online' && styles.typeButtonSelected]}
          onPress={() => setSessionType('online')}
        >
          <Text style={[styles.typeText, sessionType === 'online' && styles.typeTextSelected]}>💻 Online</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.typeButton, sessionType === 'onsite' && styles.typeButtonSelected]}
          onPress={() => setSessionType('onsite')}
        >
          <Text style={[styles.typeText, sessionType === 'onsite' && styles.typeTextSelected]}>🏥 Onsite</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.publishButton} onPress={handlePublish} disabled={loading}>
        <Text style={styles.publishButtonText}>{loading ? 'Publishing...' : 'Publish Slot'}</Text>
      </TouchableOpacity>

      <Text style={[styles.label, { marginTop: 24 }]}>My published slots:</Text>
      <FlatList
        data={slots}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.empty}>No slots published yet.</Text>}
        renderItem={({ item }) => (
          <View style={styles.slotRow}>
            <View>
              <Text style={styles.slotDate}>{item.date} — {item.startTime} to {item.endTime}</Text>
              <Text style={styles.slotTypeTag}>{item.sessionType === 'onsite' ? '🏥 Onsite' : '💻 Online'}</Text>
              <Text style={item.isBooked ? styles.bookedTag : styles.openTag}>
                {item.isBooked ? 'Booked' : 'Open'}
              </Text>
            </View>
            {!item.isBooked && (
              <TouchableOpacity onPress={() => handleDelete(item._id)}>
                <Text style={styles.deleteText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 30 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  message: { backgroundColor: '#fff3cd', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  label: { fontWeight: '700', marginBottom: 8 },
  input: { backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: '#ddd' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  halfInput: { width: '48%' },
  typeRow: { flexDirection: 'row', marginBottom: 14 },
  typeButton: {
    flex: 1, borderWidth: 1.5, borderColor: '#D63FD6', borderRadius: 8,
    paddingVertical: 10, alignItems: 'center', marginRight: 8,
  },
  typeButtonSelected: { backgroundColor: '#D63FD6' },
  typeText: { color: '#D63FD6', fontWeight: '600' },
  typeTextSelected: { color: '#fff' },
  publishButton: { backgroundColor: '#D63FD6', borderRadius: 8, padding: 14, alignItems: 'center', marginTop: 6 },
  publishButtonText: { color: '#fff', fontWeight: '700' },
  empty: { color: '#666', textAlign: 'center', marginTop: 12 },
  slotRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, marginBottom: 8,
  },
  slotDate: { fontWeight: '600' },
  slotTypeTag: { fontSize: 11, color: '#666', marginTop: 2 },
  openTag: { color: '#2E7D32', fontSize: 12, marginTop: 2 },
  bookedTag: { color: '#B71C1C', fontSize: 12, marginTop: 2 },
  deleteText: { color: '#E53935', fontWeight: '600' },
});