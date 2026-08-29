// screens/games/cognitive/MemoryMatchGame.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { logGameSession } from '../../../api';

const EMOJIS = ['🐶', '🐱', '🐸', '🦁'];

const matchSound = require('../../../assets/sounds/mixkit-game-success-alert-2039.wav');
const winSound = require('../../../assets/sounds/mixkit-achievement-completed-2068.wav');
const wrongSound = require('../../../assets/sounds/mixkit-tech-break-fail-2947.wav');

function shuffleCards() {
  const pairs = [...EMOJIS, ...EMOJIS];
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }
  return pairs.map((emoji, index) => ({ id: index, emoji, isFlipped: false, isMatched: false }));
}

export default function MemoryMatchGame({ navigation, route }) {
  const { token, game } = route.params || {};
  const [cards, setCards] = useState(shuffleCards());
  const [flippedIds, setFlippedIds] = useState([]);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);
  const startTimeRef = useRef(Date.now());
  const hasLoggedRef = useRef(false);

  const matchPlayer = useAudioPlayer(matchSound);
  const winPlayer = useAudioPlayer(winSound);
  const wrongPlayer = useAudioPlayer(wrongSound);

  useEffect(() => {
    if (flippedIds.length === 2) {
      const [firstId, secondId] = flippedIds;
      const firstCard = cards.find((c) => c.id === firstId);
      const secondCard = cards.find((c) => c.id === secondId);
      setMoves((m) => m + 1);

      if (firstCard.emoji === secondCard.emoji) {
        matchPlayer.seekTo(0);
        matchPlayer.play();

        setCards((prev) => prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isMatched: true } : c)));
        setFlippedIds([]);
      } else {
        // Wrong guess -> play the "wrong" sound right away, then flip back after a short delay
        wrongPlayer.seekTo(0);
        wrongPlayer.play();

        setTimeout(() => {
          setCards((prev) => prev.map((c) => (c.id === firstId || c.id === secondId ? { ...c, isFlipped: false } : c)));
          setFlippedIds([]);
        }, 800);
      }
    }
  }, [flippedIds]);

  useEffect(() => {
    if (cards.every((c) => c.isMatched) && !hasLoggedRef.current) {
      hasLoggedRef.current = true;
      setWon(true);

      winPlayer.seekTo(0);
      winPlayer.play();

      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      logGameSession({ gameId: game?._id, durationSeconds, score: moves }, token).catch((err) =>
        console.error('Log session error:', err)
      );
    }
  }, [cards]);

  const resetGame = () => {
    setCards(shuffleCards());
    setFlippedIds([]);
    setMoves(0);
    setWon(false);
    hasLoggedRef.current = false;
    startTimeRef.current = Date.now();
  };

  const handleCardPress = (card) => {
    if (won || card.isMatched || card.isFlipped || flippedIds.length === 2) return;
    setCards((prev) => prev.map((c) => (c.id === card.id ? { ...c, isFlipped: true } : c)));
    setFlippedIds((prev) => [...prev, card.id]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Memory Match</Text>
      <Text style={styles.moves}>Moves: {moves}</Text>

      {won && (
        <View style={styles.winBanner}>
          <Text style={styles.winText}>🎉 Well done! You finished in {moves} moves!</Text>
        </View>
      )}

      <View style={styles.grid}>
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            style={[styles.card, (card.isFlipped || card.isMatched) && styles.cardFlipped]}
            onPress={() => handleCardPress(card)}
          >
            <Text style={styles.cardEmoji}>{card.isFlipped || card.isMatched ? card.emoji : '❓'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
        <Text style={styles.resetButtonText}>{won ? 'Play Again' : 'Restart'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF3E0', padding: 20, paddingTop: 30, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  moves: { fontSize: 14, color: '#666', marginBottom: 16 },
  winBanner: { backgroundColor: '#C8E6C9', borderRadius: 10, padding: 14, marginBottom: 16, width: 320 },
  winText: { color: '#2E7D32', fontWeight: '700', textAlign: 'center' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 320 },
  card: { width: 70, height: 70, margin: 6, borderRadius: 10, backgroundColor: '#C2185B', justifyContent: 'center', alignItems: 'center' },
  cardFlipped: { backgroundColor: '#fff', borderWidth: 2, borderColor: '#C2185B' },
  cardEmoji: { fontSize: 30 },
  resetButton: { marginTop: 20, backgroundColor: '#C2185B', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 24 },
  resetButtonText: { color: '#fff', fontWeight: '700' },
});