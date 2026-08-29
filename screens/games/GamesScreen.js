// screens/GamesScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CATEGORIES = [
  { key: 'Cognitive', color: '#C2185B', icon: '🧩' },
  { key: 'Fine Motor', color: '#F57C00', icon: '✋' },
  { key: 'Speech', color: '#43A047', icon: '💬' },
  { key: 'Social', color: '#7E57C2', icon: '🧑‍🤝‍🧑' },
];

export default function GamesScreen({ navigation, route }) {
  const { token, user } = route.params || {};

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Games</Text>
      <View style={styles.grid}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.key}
            style={[styles.card, { backgroundColor: cat.color }]}
            onPress={() => navigation.navigate('GameCategory', { token, user, category: cat.key })}
          >
            <Text style={styles.icon}>{cat.icon}</Text>
            <Text style={styles.cardText}>{cat.key.toUpperCase()}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#B3E5FC', padding: 20, paddingTop: 30 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20, color: '#1A1A1A' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '47%', aspectRatio: 1, borderRadius: 16, marginBottom: 16,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  icon: { fontSize: 40, marginBottom: 10 },
  cardText: { color: '#fff', fontWeight: '800', fontSize: 15, textAlign: 'center' },
});