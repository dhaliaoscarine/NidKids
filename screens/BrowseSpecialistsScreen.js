// screens/BrowseSpecialistsScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Image } from 'react-native';
import { getSpecialists } from '../api';

export default function BrowseSpecialistsScreen({ navigation, route }) {
  const { token } = route.params || {};
  const [specialists, setSpecialists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSpecialists();
  }, []);

  const loadSpecialists = async () => {
    setLoading(true);
    try {
      const response = await getSpecialists(token);
      setSpecialists(response.data.specialists);
    } catch (error) {
      console.error('Load specialists error:', error);
      setMessage('Could not load specialists. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Choose a Therapist</Text>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#D63FD6" style={{ marginTop: 40 }} />
      ) : specialists.length === 0 ? (
        <Text style={styles.empty}>No therapists available yet.</Text>
      ) : (
        <FlatList
          data={specialists}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.specialistCard}
              onPress={() => navigation.navigate('SpecialistSlots', { token, specialist: item })}
            >
              <View style={styles.photoContainer}>
                {item.photoBase64 ? (
                  <Image source={{ uri: item.photoBase64 }} style={styles.photo} />
                ) : (
                  <Text style={styles.photoPlaceholder}>👤</Text>
                )}
              </View>
              <View style={styles.infoContainer}>
                <Text style={styles.specialistName}>{item.name}</Text>
                <Text style={styles.specialistSpecialty}>{item.specialty}</Text>
                <Text style={styles.specialistDetail}>📍 {item.town}</Text>
                <Text style={styles.specialistDetail}>🏥 {item.hospitalCenter}</Text>
                {item.bio ? <Text style={styles.specialistBio} numberOfLines={2}>{item.bio}</Text> : null}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20, paddingTop: 30 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  message: { backgroundColor: '#FFE0E0', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  empty: { textAlign: 'center', color: '#666', marginTop: 40 },
  specialistCard: {
    flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, marginBottom: 12,
    borderLeftWidth: 4, borderLeftColor: '#D63FD6',
  },
  photoContainer: {
    width: 60, height: 60, borderRadius: 30, backgroundColor: '#E0E0E0', marginRight: 12,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden',
  },
  photo: { width: '100%', height: '100%' },
  photoPlaceholder: { fontSize: 28 },
  infoContainer: { flex: 1 },
  specialistName: { fontSize: 16, fontWeight: '700', color: '#1A1A1A' },
  specialistSpecialty: { fontSize: 13, color: '#D63FD6', fontWeight: '600', marginTop: 2 },
  specialistDetail: { fontSize: 12, color: '#666', marginTop: 2 },
  specialistBio: { fontSize: 12, color: '#555', marginTop: 6, fontStyle: 'italic' },
});