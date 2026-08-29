// screens/MyAppointmentsScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Linking } from 'react-native';
import { getMyAppointments, cancelAppointment } from '../api';

function getJoinStatus(dateStr, startTimeStr) {
  const scheduled = new Date(`${dateStr}T${startTimeStr}:00`);
  const now = new Date();
  const minutesUntilStart = (scheduled - now) / 1000 / 60;

  if (minutesUntilStart > 15) {
    return { canJoin: false, label: `Available 15 min before (${Math.round(minutesUntilStart)} min left)` };
  }
  if (minutesUntilStart < -60) {
    return { canJoin: false, label: 'Session time has passed' };
  }
  return { canJoin: true, label: 'Join Consultation' };
}

export default function MyAppointmentsScreen({ route }) {
  const { token, user } = route.params || {};
  const [appointments, setAppointments] = useState([]);
  const [message, setMessage] = useState('');
  const [confirmingId, setConfirmingId] = useState(null); // which card is showing "Are you sure?"
  const [joinErrorId, setJoinErrorId] = useState(null); // which card shows "no link" message

  const loadAppointments = useCallback(async () => {
    try {
      const response = await getMyAppointments(token);
      setAppointments(response.data.appointments);
    } catch (error) {
      console.error('Load appointments error:', error);
      setMessage('Could not load your appointments.');
    }
  }, [token]);

  useEffect(() => {
    loadAppointments();
    const interval = setInterval(loadAppointments, 30000);
    return () => clearInterval(interval);
  }, [loadAppointments]);

  const handleCancelConfirmed = async (appointment) => {
    setConfirmingId(null);
    try {
      await cancelAppointment(appointment._id, token);
      loadAppointments();
    } catch (error) {
      console.error('Cancel error:', error);
      setMessage('Could not cancel this appointment.');
    }
  };

  const handleJoin = (appointment) => {
    setJoinErrorId(null);
    if (appointment.zoomJoinUrl) {
      Linking.openURL(appointment.zoomJoinUrl);
    } else {
      setJoinErrorId(appointment._id);
    }
  };

  const otherPartyName = (appointment) => {
    const isParent = appointment.parent?._id === user?.id;
    return isParent ? appointment.specialist?.name : appointment.parent?.name;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Appointments</Text>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <FlatList
        data={appointments}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={<Text style={styles.empty}>No upcoming appointments.</Text>}
        renderItem={({ item }) => {
          const { canJoin, label } = getJoinStatus(item.date, item.startTime);
          const isConfirming = confirmingId === item._id;
          const showJoinError = joinErrorId === item._id;

          return (
            <View style={styles.card}>
              <Text style={styles.withText}>With: {otherPartyName(item) || 'Unknown'}</Text>
              <Text style={styles.dateText}>{item.date} — {item.startTime} to {item.endTime}</Text>
              <Text style={styles.typeTag}>{item.sessionType === 'onsite' ? '🏥 Onsite Visit' : '💻 Online (Zoom)'}</Text>
              {item.sessionType === 'onsite' && item.specialist?.hospitalCenter ? (
                <Text style={styles.addressText}>📍 {item.specialist.hospitalCenter}, {item.specialist.town}</Text>
              ) : null}
              {item.parentNote ? <Text style={styles.note}>Note: {item.parentNote}</Text> : null}

              {showJoinError ? (
                <Text style={styles.joinErrorText}>No video link is available for this appointment.</Text>
              ) : null}

              {isConfirming ? (
                <View style={styles.confirmRow}>
                  <Text style={styles.confirmText}>Cancel this appointment?</Text>
                  <View style={styles.confirmButtonRow}>
                    <TouchableOpacity style={styles.confirmNoButton} onPress={() => setConfirmingId(null)}>
                      <Text style={styles.confirmNoText}>No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.confirmYesButton} onPress={() => handleCancelConfirmed(item)}>
                      <Text style={styles.confirmYesText}>Yes, Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.buttonRow}>
                  {item.sessionType === 'onsite' ? (
                    <View style={styles.onsiteInfo}>
                      <Text style={styles.onsiteInfoText}>Visit your therapist at the listed hospital/center.</Text>
                    </View>
                  ) : (
                    <TouchableOpacity
                      style={[styles.joinButton, !canJoin && styles.joinButtonDisabled]}
                      onPress={() => canJoin && handleJoin(item)}
                      disabled={!canJoin}
                    >
                      <Text style={styles.joinButtonText}>{label}</Text>
                    </TouchableOpacity>
                  )}

                  <TouchableOpacity style={styles.cancelButton} onPress={() => setConfirmingId(item._id)}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 30 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 16 },
  message: { backgroundColor: '#FFE0E0', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  empty: { textAlign: 'center', color: '#666', marginTop: 40 },
  card: { backgroundColor: '#F5F5F5', borderRadius: 10, padding: 16, marginBottom: 12 },
  withText: { fontWeight: '700', fontSize: 15 },
  dateText: { color: '#444', marginTop: 4 },
  typeTag: { fontSize: 12, color: '#555', marginTop: 4, fontWeight: '600' },
  addressText: { fontSize: 12, color: '#555', marginTop: 2 },
  note: { color: '#666', fontStyle: 'italic', marginTop: 4, fontSize: 12 },
  joinErrorText: { color: '#B71C1C', fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  buttonRow: { flexDirection: 'row', marginTop: 12, justifyContent: 'space-between', alignItems: 'center' },
  joinButton: { backgroundColor: '#2E7D32', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 14, flex: 1, marginRight: 8 },
  joinButtonDisabled: { backgroundColor: '#B0B0B0' },
  joinButtonText: { color: '#fff', fontWeight: '700', fontSize: 12, textAlign: 'center' },
  onsiteInfo: { flex: 1, marginRight: 8, justifyContent: 'center' },
  onsiteInfoText: { fontSize: 11, color: '#555', fontStyle: 'italic' },
  cancelButton: { backgroundColor: '#E53935', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16 },
  cancelButtonText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  confirmRow: { marginTop: 12, backgroundColor: '#FFF3E0', borderRadius: 8, padding: 12 },
  confirmText: { fontSize: 13, fontWeight: '600', color: '#333', marginBottom: 10, textAlign: 'center' },
  confirmButtonRow: { flexDirection: 'row', justifyContent: 'space-between' },
  confirmNoButton: { flex: 1, backgroundColor: '#B0B0B0', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginRight: 8 },
  confirmNoText: { color: '#fff', fontWeight: '700', fontSize: 12 },
  confirmYesButton: { flex: 1, backgroundColor: '#E53935', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  confirmYesText: { color: '#fff', fontWeight: '700', fontSize: 12 },
});