// screens/HomeScreen.js
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const gamesImage = require('../assets/images/interactivegames.jpeg');
const therapyImage = require('../assets/images/therapyexercise.jpeg');
const telemedicineImage = require('../assets/images/telemedcine.jpg');
const communityImage = require('../assets/images/community.jpeg');

const DASHBOARD_CARDS = [
  { key: 'games', label: 'EDUCATIONAL\nGAMES', color: '#F5B93D', image: gamesImage, screen: 'Games' },
  { key: 'therapy', label: 'THERAPY\nEXERCISES', color: '#4DD0E1', image: therapyImage, screen: 'Therapy' },
  { key: 'telemedicine', label: 'TELE\nMEDICINE', color: '#D63FD6', image: telemedicineImage, screen: 'Telemedicine' },
  { key: 'community', label: 'COMMUNITY\nSUPPORT', color: '#C9A227', image: communityImage, screen: 'Community' },
];

export default function HomeScreen({ navigation, route }) {
  const { token, user } = route?.params || {};

    const handleCardPress = (card) => {
    if (card.screen === 'Telemedicine') {
      navigation.navigate('Telemedicine', { token, user });
    } else if (card.screen === 'Games') {
      navigation.navigate('Games', { token, user });
    } else if (card.screen === 'Therapy') {
      navigation.navigate('Therapy', { token, user });
    } else if (card.screen === 'Community') {
      navigation.navigate('Community', { token, user });
    } else {
      Alert.alert(card.label.replace('\n', ' '), 'This screen is coming soon!');
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('nidkids_token');
    await AsyncStorage.removeItem('nidkids_user');
    navigation.replace('SignIn');
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.headerRow}>
        <Text style={styles.logo}>NidKids</Text>
        <Text style={styles.tagline}>TO LEARN AND GROW SPECIAL</Text>
      </View>

      <View style={styles.grid}>
        {DASHBOARD_CARDS.map((card) => (
          <TouchableOpacity
            key={card.key}
            style={[styles.card, { backgroundColor: card.color }]}
            onPress={() => handleCardPress(card)}
            activeOpacity={0.7}
          >
            <Text style={styles.cardLabel} pointerEvents="none">{card.label}</Text>
            <View style={styles.imagePlaceholder} pointerEvents="none">
              <Image source={card.image} style={styles.cardImage} resizeMode="cover" />
            </View>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.bottomRow}>
        <TouchableOpacity style={styles.settingsButton} onPress={() => Alert.alert('Settings', 'Coming soon!')}>
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Log out</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: '#D7B8F5', padding: 20, paddingTop: 50 },
  headerRow: { alignItems: 'center', marginBottom: 24 },
  logo: { fontSize: 28, fontWeight: 'bold', color: '#1A1A1A' },
  tagline: { fontSize: 12, color: '#333', marginTop: 2 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '47%', aspectRatio: 1, borderRadius: 16, padding: 14, marginBottom: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  cardLabel: { color: '#fff', fontWeight: '800', fontSize: 14, textAlign: 'center', marginBottom: 10 },
  imagePlaceholder: {
    flex: 1, backgroundColor: 'rgba(255,255,255,0.35)', borderRadius: 10,
    justifyContent: 'center', alignItems: 'center', minHeight: 80, overflow: 'hidden',
  },
  cardImage: { width: '100%', height: '100%' },
  bottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  settingsButton: { padding: 10 },
  settingsIcon: { fontSize: 28 },
  logoutButton: { backgroundColor: '#E53935', borderRadius: 8, paddingVertical: 8, paddingHorizontal: 14 },
  logoutText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});