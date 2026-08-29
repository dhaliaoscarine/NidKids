// screens/games/GameCategoryScreen.js
//
// Redesigned to match the Home dashboard's visual language: big, square,
// colorful, tappable cards instead of small text + a tiny "Start" pill.
// Bigger touch targets are especially important for children with motor
// difficulties (e.g. Cerebral Palsy), where precise small taps are harder.
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator, Alert } from 'react-native';
import { getGamesByCategory } from '../../api';

// Assigns a bright, friendly color to each game card in rotation
const CARD_COLORS = ['#EF5350', '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#26C6DA'];

export default function GameCategoryScreen({ navigation, route }) {
  const { token, user, category } = route.params || {};
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      if (!token) {
        setErrorMessage('No login token found. Please sign in again.');
        setLoading(false);
        return;
      }
      const response = await getGamesByCategory(category, token);
      setGames(response.data.games || []);
    } catch (error) {
      console.error('Load games error:', error);
      const message = error.response
        ? `Server error: ${error.response.data?.message || error.response.status}`
        : `Network error: ${error.message}`;
      setErrorMessage(message);
    } finally {
      setLoading(false);
    }
  };

  const handleStart = (game) => {
    if (game.isPlayable && game.gameKey === 'memoryMatch') {
      navigation.navigate('MemoryMatchGame', { token, user, game });
    } else if (game.isPlayable && game.gameKey === 'countingGame') {
      navigation.navigate('CountingGame', { token, user, game });
    } else if (game.isPlayable && game.gameKey === 'shapeSort') {
      navigation.navigate('ShapeSortGame', { token, user, game });
    } else if (game.isPlayable && game.gameKey === 'dotTrace') {
      navigation.navigate('DotTraceGame', { token, user, game });
    } else if (game.isPlayable && game.gameKey === 'freehandTrace') {
      navigation.navigate('FreehandTraceGame', { token, user, game });
    } else if (game.isPlayable && game.gameKey === 'listenAndPoint') {
      navigation.navigate('ListenAndPointGame', { token, user, game });
    } else if (game.isPlayable && game.gameKey === 'namePicture') {
      navigation.navigate('NameThePictureGame', { token, user, game });
    } else if (game.isPlayable && game.gameKey === 'feelingsCheckIn') {
      navigation.navigate('FeelingsCheckInGame', { token, user, game });
    } else if (game.isPlayable && game.gameKey === 'storyTime') {
      navigation.navigate('StoryTimeGame', { token, user, game });
    } else {
      Alert.alert(game.title, 'This game is coming soon!');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{category || 'Games'}</Text>

      {errorMessage ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{errorMessage}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadGames}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : loading ? (
        <ActivityIndicator size="large" color="#7E57C2" style={{ marginTop: 40 }} />
      ) : games.length === 0 ? (
        <Text style={styles.emptyText}>No games found in this category yet.</Text>
      ) : (
        <FlatList
          data={games}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          renderItem={({ item, index }) => (
            <TouchableOpacity
              style={[
                styles.gameCard,
                { backgroundColor: item.isPlayable ? CARD_COLORS[index % CARD_COLORS.length] : '#B0BEC5' },
              ]}
              onPress={() => handleStart(item)}
              activeOpacity={0.8}
            >
              <Text style={styles.thumbnailText}>{item.isPlayable ? '🎮' : '🔒'}</Text>
              <Text style={styles.gameTitle}>{item.title}</Text>
              {item.isPlayable && <Text style={styles.tapHint}>Tap to Play!</Text>}
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#B3E5FC', padding: 16, paddingTop: 30 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  errorBox: { backgroundColor: '#FFE0E0', borderRadius: 10, padding: 16, marginTop: 20 },
  errorText: { color: '#B71C1C', marginBottom: 12, textAlign: 'center' },
  retryButton: { backgroundColor: '#E53935', borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  retryButtonText: { color: '#fff', fontWeight: '700' },
  emptyText: { textAlign: 'center', color: '#555', marginTop: 40 },
  row: { justifyContent: 'space-between' },
  gameCard: {
    width: '47%',
    aspectRatio: 1,
    borderRadius: 20,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
  },
  thumbnailText: { fontSize: 46, marginBottom: 8 },
  gameTitle: { color: '#fff', fontWeight: '900', fontSize: 16, textAlign: 'center', marginBottom: 4 },
  tapHint: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '700' },
});