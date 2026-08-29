// screens/TherapyCategoryScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { getExercisesByCategory } from '../api';

const CARD_COLORS = ['#FF7043', '#26A69A', '#5C6BC0', '#EC407A'];

export default function TherapyCategoryScreen({ navigation, route }) {
  const { token, user, category } = route.params || {};
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadExercises();
  }, []);

  const loadExercises = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const response = await getExercisesByCategory(category, token);
      setExercises(response.data.exercises || []);
    } catch (error) {
      console.error('Load exercises error:', error);
      const message = error.response
        ? `Server error: ${error.response.data?.message || error.response.status}`
        : `Network error: ${error.message}`;
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{category}</Text>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadExercises}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <ActivityIndicator size="large" color="#FF7043" style={{ marginTop: 40 }} />
      ) : exercises.length === 0 ? (
        <Text style={styles.emptyText}>No exercises found in this category yet.</Text>
      ) : (
        <FlatList
          data={exercises}
          keyExtractor={(item) => item._id}
          numrows={2}
          rowWrapperStyle={styles.row}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[styles.card, { backgroundColor: CARD_COLORS[index % CARD_COLORS.length] }]}
              onPress={() => navigation.navigate('ExerciseDetail', { token, user, exercise: item })}
              activeOpacity={0.8}
            >
              <Text style={styles.thumbnailText}>🎯</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.tapHint}>Tap to View</Text>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF8E1', padding: 16, paddingTop: 30 },
  title: { fontSize: 22, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  errorBox: { backgroundColor: '#FFE0E0', borderRadius: 10, padding: 16, marginTop: 20 },
  errorText: { color: '#B71C1C', marginBottom: 12, textAlign: 'center' },
  retryButton: { backgroundColor: '#E53935', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  retryButtonText: { color: '#fff', fontWeight: '700' },
  emptyText: { textAlign: 'center', color: '#555', marginTop: 40 },
  row: { justifyContent: 'space-between' },
  card: {
    width: '47%', aspectRatio: 1, borderRadius: 20, marginBottom: 16,
    justifyContent: 'center', alignItems: 'center', padding: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 5, elevation: 6,
  },
  thumbnailText: { fontSize: 40, marginBottom: 8 },
  cardTitle: { color: '#fff', fontWeight: '900', fontSize: 14, textAlign: 'center', marginBottom: 4 },
  tapHint: { color: 'rgba(255,255,255,0.9)', fontSize: 11, fontWeight: '700' },
});