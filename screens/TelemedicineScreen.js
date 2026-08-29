// screens/TelemedicineHomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function TelemedicineHomeScreen({ navigation, route }) {
  const { token, user } = route.params || {};
  const isTherapist = user?.role === 'therapist';

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Tele-Medicine</Text>

            {isTherapist ? (
        <>
          <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MyAvailability', { token })}>
            <Text style={styles.cardIcon}>🗓️</Text>
            <Text style={styles.cardText}>Manage My Availability</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.card}
            onPress={() => navigation.navigate('CompleteProfile', { token, user, isEditing: true })}
          >
            <Text style={styles.cardIcon}>✏️</Text>
            <Text style={styles.cardText}>Edit My Profile</Text>
          </TouchableOpacity>
        </>
      ) : (
        <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('BrowseSpecialists', { token })}>
          <Text style={styles.cardIcon}>🔍</Text>
          <Text style={styles.cardText}>Find a Therapist</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.card} onPress={() => navigation.navigate('MyAppointments', { token, user })}>
        <Text style={styles.cardIcon}>📋</Text>
        <Text style={styles.cardText}>My Appointments</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 50 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  card: { backgroundColor: '#D63FD6', borderRadius: 12, padding: 20, marginBottom: 16, alignItems: 'center' },
  cardIcon: { fontSize: 32, marginBottom: 8 },
  cardText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});