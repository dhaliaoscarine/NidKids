// screens/games/social/FeelingsCheckInGame.js
//
// No right or wrong answers. The child taps whatever face matches how
// they feel right now, and hears a warm, validating spoken response —
// building emotional vocabulary and self-expression without any test
// or scoring pressure. Can tap as many feelings as they like.
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { useAudioPlayer } from 'expo-audio';
import { logGameSession } from '../../../api';

const tapSound = require('../../../assets/sounds/mixkit-game-success-alert-2039.wav');
const winSound = require('../../../assets/sounds/mixkit-achievement-completed-2068.wav');

// Every response is warm and validating — there is no "wrong" feeling.
const FEELINGS = [
  { emoji: '😄', label: 'Happy', response: 'Yay! It\'s wonderful to feel happy! Keep smiling!' },
  { emoji: '🤩', label: 'Excited', response: 'Wow, excited is such a fun feeling! What are you excited about?' },
  { emoji: '😌', label: 'Calm', response: 'Feeling calm is so nice and peaceful. Great job noticing that!' },
  { emoji: '😢', label: 'Sad', response: 'It\'s okay to feel sad sometimes. Everyone feels sad sometimes, and that\'s okay.' },
  { emoji: '😴', label: 'Tired', response: 'Feeling tired means your body wants some rest. That\'s okay too!' },
  { emoji: '🤪', label: 'Silly', response: 'Haha, silly is a fun feeling! Being silly is great!' },
];

export default function FeelingsCheckInGame({ navigation, route }) {
  const { token, game } = route.params || {};
  const [selectedFeeling, setSelectedFeeling] = useState(null);
  const [tapCount, setTapCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const startTimeRef = useRef(Date.now());
  const hasLoggedRef = useRef(false);

  const tapPlayer = useAudioPlayer(tapSound);
  const winPlayer = useAudioPlayer(winSound);

  const handleFeelingPress = (feeling) => {
    tapPlayer.seekTo(0);
    tapPlayer.play();

    setSelectedFeeling(feeling);
    setTapCount((c) => c + 1);
    Speech.speak(feeling.response, { language: 'en', pitch: 1.15, rate: 0.85 });
  };

  const handleDone = () => {
    setFinished(true);
    if (!hasLoggedRef.current) {
      hasLoggedRef.current = true;
      winPlayer.seekTo(0);
      winPlayer.play();
      Speech.speak('Thank you for sharing how you feel! Great job!', { language: 'en', pitch: 1.15, rate: 0.85 });

      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      logGameSession({ gameId: game?._id, durationSeconds, score: tapCount }, token).catch((err) =>
        console.error('Log session error:', err)
      );
    }
  };

  const resetGame = () => {
    setSelectedFeeling(null);
    setTapCount(0);
    setFinished(false);
    hasLoggedRef.current = false;
    startTimeRef.current = Date.now();
  };

  if (finished) {
    return (
      <View style={styles.container}>
        <Text style={styles.winEmoji}>💛🌈💛</Text>
        <Text style={styles.winTitle}>Thanks for sharing!</Text>
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetButtonText}>Check In Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How do you feel today?</Text>
      <Text style={styles.subtitle}>Tap the face that matches how you feel</Text>

      {selectedFeeling && (
        <View style={styles.responseBubble}>
          <Text style={styles.responseEmoji}>{selectedFeeling.emoji}</Text>
          <Text style={styles.responseText}>{selectedFeeling.response}</Text>
        </View>
      )}

      <View style={styles.feelingsGrid}>
        {FEELINGS.map((feeling) => (
          <TouchableOpacity
            key={feeling.label}
            style={[
              styles.feelingCard,
              selectedFeeling?.label === feeling.label && styles.feelingCardSelected,
            ]}
            onPress={() => handleFeelingPress(feeling)}
          >
            <Text style={styles.feelingEmoji}>{feeling.emoji}</Text>
            <Text style={styles.feelingLabel}>{feeling.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={styles.doneButton} onPress={handleDone}>
        <Text style={styles.doneButtonText}>All Done ✅</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF3E0', padding: 20, paddingTop: 40, alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '800', color: '#333', marginBottom: 4, textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#666', marginBottom: 16, textAlign: 'center' },
  responseBubble: {
    backgroundColor: '#fff', borderRadius: 16, padding: 14, marginBottom: 16, width: 290, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  responseEmoji: { fontSize: 40, marginBottom: 6 },
  responseText: { fontSize: 14, color: '#333', textAlign: 'center', fontWeight: '600' },
  feelingsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 300, marginBottom: 20 },
  feelingCard: {
    width: 85, height: 85, borderRadius: 16, backgroundColor: '#fff', margin: 6,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 3, elevation: 3,
  },
  feelingCardSelected: { backgroundColor: '#FFE0B2', borderWidth: 2, borderColor: '#F57C00' },
  feelingEmoji: { fontSize: 32 },
  feelingLabel: { fontSize: 11, fontWeight: '700', color: '#555', marginTop: 4 },
  doneButton: { backgroundColor: '#43A047', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 30 },
  doneButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  winEmoji: { fontSize: 60, marginBottom: 12 },
  winTitle: { fontSize: 24, fontWeight: '900', color: '#2E7D32', marginBottom: 24, textAlign: 'center' },
  resetButton: { backgroundColor: '#43A047', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 30 },
  resetButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});