// screens/SpecialistSlotsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, TextInput } from 'react-native';
import { getSpecialistSlots, bookAppointment } from '../api';

export default function SpecialistSlotsScreen({ route }) {
  const { token, specialist } = route.params || {};
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState('');
  const [note, setNote] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    loadSlots();
  }, []);

  const loadSlots = async () => {
    setLoading(true);
    try {
      const response = await getSpecialistSlots(specialist._id, token);
      setSlots(response.data.slots);
    } catch (error) {
      console.error('Load slots error:', error);
      setMessage('Could not load available times.');
    } finally {
      setLoading(false);
    }
  };

  const handleBook = async (slot) => {
    setBooking(true);
    setMessage('');
    try {
      await bookAppointment({ slotId: slot._id, parentNote: note }, token);
      setMessage('✅ Appointment booked! Check "My Appointments" for details.');
      setSelectedSlot(null);
      setNote('');
      loadSlots();
    } catch (error) {
      console.error('Book error:', error);
      setMessage(error.response?.data?.message || 'Could not book this slot.');
    } finally {
      setBooking(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{specialist.name}</Text>
      <Text style={styles.subtitle}>Available time slots</Text>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#D63FD6" style={{ marginTop: 40 }} />
      ) : slots.length === 0 ? (
        <Text style={styles.empty}>No open slots right now. Check back later.</Text>
      ) : (
        <FlatList
          data={slots}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <View style={styles.slotCard}>
              <View>
                <Text style={styles.slotDate}>{item.date}</Text>
                <Text style={styles.slotTime}>{item.startTime} - {item.endTime}</Text>
                <Text style={styles.slotTypeTag}>{item.sessionType === 'onsite' ? '🏥 Onsite' : '💻 Online'}</Text>
              </View>

              {selectedSlot === item._id ? (
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <TextInput
                    style={styles.noteInput}
                    placeholder="Optional note"
                    value={note}
                    onChangeText={setNote}
                  />
                  <TouchableOpacity style={styles.confirmButton} onPress={() => handleBook(item)} disabled={booking}>
                    <Text style={styles.confirmButtonText}>{booking ? 'Booking...' : 'Confirm Booking'}</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.bookButton} onPress={() => setSelectedSlot(item._id)}>
                  <Text style={styles.bookButtonText}>Book</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 30 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 },
  message: { backgroundColor: '#fff3cd', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  empty: { textAlign: 'center', color: '#666', marginTop: 40 },
  slotCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F5F5F5', borderRadius: 10, padding: 14, marginBottom: 12,
  },
  slotDate: { fontWeight: '700', fontSize: 14 },
  slotTime: { color: '#666', marginTop: 2 },
  slotTypeTag: { fontSize: 11, color: '#666', marginTop: 2, fontWeight: '600' },
  bookButton: { backgroundColor: '#D63FD6', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 18 },
  bookButtonText: { color: '#fff', fontWeight: '700' },
  noteInput: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#ccc', borderRadius: 6,
    padding: 8, fontSize: 12, marginBottom: 6,
  },
  confirmButton: { backgroundColor: '#4DD0E1', borderRadius: 6, padding: 8, alignItems: 'center' },
  confirmButtonText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});