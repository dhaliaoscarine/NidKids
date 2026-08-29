// screens/games/cognitive/CountingGame.js
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { logGameSession } from '../../../api';

const correctSound = require('../../../assets/sounds/mixkit-game-success-alert-2039.wav');
const winSound = require('../../../assets/sounds/mixkit-achievement-completed-2068.wav');
const tryAgainSound = require('../../../assets/sounds/mixkit-tech-break-fail-2947.wav');

const OBJECTS = ['🍎', '🐝', '⭐', '🎈', '🍪'];
const TOTAL_ROUNDS = 5;
const MAX_COUNT = 5;

function generateRound() {
  const object = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];
  const correctCount = Math.floor(Math.random() * MAX_COUNT) + 1;

  const optionsSet = new Set([correctCount]);
  while (optionsSet.size < 4) {
    const distractor = Math.floor(Math.random() * MAX_COUNT) + 1;
    optionsSet.add(distractor);
  }
  const options = Array.from(optionsSet).sort(() => Math.random() - 0.5);

  return { object, correctCount, options };
}

export default function CountingGame({ navigation, route }) {
  const { token, game } = route.params || {};
  const [round, setRound] = useState(1);
  const [currentRound, setCurrentRound] = useState(generateRound());
  const [won, setWon] = useState(false);
  const [feedback, setFeedback] = useState('');
  const startTimeRef = useRef(Date.now());
  const hasLoggedRef = useRef(false);

  const correctPlayer = useAudioPlayer(correctSound);
  const winPlayer = useAudioPlayer(winSound);
  const tryAgainPlayer = useAudioPlayer(tryAgainSound);

  // Speaks the number out loud using the device's built-in text-to-speech.
  // No audio files needed — this works for ANY number, not just 1-5.
  const speakNumber = (number) => {
    Speech.speak(String(number), {
      language: 'en',
      pitch: 1.1,   // slightly higher pitch = friendlier, more kid-appropriate tone
      rate: 0.85,   // slightly slower than normal = easier to understand
    });
  };

  const handleNumberPress = (number) => {
    if (won) return;

    // Always speak the number that was tapped, regardless of right/wrong —
    // this reinforces "this shape/word = this number" every single time.
    speakNumber(number);

    if (number === currentRound.correctCount) {
      setFeedback('correct');
      correctPlayer.seekTo(0);
      correctPlayer.play();

      setTimeout(() => {
        if (round >= TOTAL_ROUNDS) {
          finishGame();
        } else {
          setRound((r) => r + 1);
          setCurrentRound(generateRound());
          setFeedback('');
        }
      }, 1200); // slightly longer delay now, to give the spoken number time to finish
    } else {
      setFeedback('tryAgain');
      tryAgainPlayer.seekTo(0);
      tryAgainPlayer.play();
      setTimeout(() => setFeedback(''), 600);
    }
  };

  const finishGame = () => {
    if (hasLoggedRef.current) return;
    hasLoggedRef.current = true;
    setWon(true);
    winPlayer.seekTo(0);
    winPlayer.play();

    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    logGameSession({ gameId: game?._id, durationSeconds, score: TOTAL_ROUNDS }, token).catch((err) =>
      console.error('Log session error:', err)
    );
  };

  const resetGame = () => {
    setRound(1);
    setCurrentRound(generateRound());
    setWon(false);
    setFeedback('');
    hasLoggedRef.current = false;
    startTimeRef.current = Date.now();
  };

  if (won) {
    return (
      <View style={styles.container}>
        <Text style={styles.winEmoji}>🎉🔢🎉</Text>
        <Text style={styles.winTitle}>Amazing counting!</Text>
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetButtonText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>Round {round} of {TOTAL_ROUNDS}</Text>
      <Text style={styles.prompt}>How many do you see?</Text>

      <View style={styles.objectsRow}>
        {Array.from({ length: currentRound.correctCount }).map((_, i) => (
          <Text key={i} style={styles.objectEmoji}>{currentRound.object}</Text>
        ))}
      </View>

      {feedback === 'correct' && <Text style={styles.feedbackText}>✅ Great!</Text>}
      {feedback === 'tryAgain' && <Text style={styles.feedbackText}>Try again!</Text>}

      <View style={styles.numberGrid}>
        {currentRound.options.map((number) => (
          <TouchableOpacity key={number} style={styles.numberButton} onPress={() => handleNumberPress(number)}>
            <Text style={styles.numberText}>{number}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E8F5E9', padding: 20, paddingTop: 40, alignItems: 'center' },
  progress: { fontSize: 14, color: '#666', marginBottom: 8 },
  prompt: { fontSize: 20, fontWeight: '700', color: '#333', marginBottom: 20 },
  objectsRow: {
    flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center',
    minHeight: 90, alignItems: 'center', marginBottom: 16, width: 280,
  },
  objectEmoji: { fontSize: 50, margin: 6 },
  feedbackText: { fontSize: 20, fontWeight: '700', color: '#2E7D32', marginBottom: 12 },
  numberGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 280 },
  numberButton: {
    width: 70, height: 70, borderRadius: 35, backgroundColor: '#43A047',
    justifyContent: 'center', alignItems: 'center', margin: 8,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  numberText: { color: '#fff', fontSize: 28, fontWeight: '900' },
  winEmoji: { fontSize: 60, marginBottom: 12 },
  winTitle: { fontSize: 26, fontWeight: '900', color: '#2E7D32', marginBottom: 24 },
  resetButton: { backgroundColor: '#43A047', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 30 },
  resetButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});