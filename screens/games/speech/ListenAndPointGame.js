// screens/games/speech/ListenAndPointGame.js
//
// The device SPEAKS a word aloud, child taps the matching picture.
// Builds receptive vocabulary (understanding spoken words).
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Speech from 'expo-speech';
import { logGameSession } from '../../../api';

const correctSound = require('../../../assets/sounds/mixkit-game-success-alert-2039.wav');
const winSound = require('../../../assets/sounds/mixkit-achievement-completed-2068.wav');
const tryAgainSound = require('../../../assets/sounds/mixkit-tech-break-fail-2947.wav');

const WORDS = [
  { word: 'DOG', emoji: '🐶' },
  { word: 'CAT', emoji: '🐱' },
  { word: 'APPLE', emoji: '🍎' },
  { word: 'BALL', emoji: '⚽' },
  { word: 'CAR', emoji: '🚗' },
  { word: 'STAR', emoji: '⭐' },
];

const TOTAL_ROUNDS = 5;

function generateRound() {
  const target = WORDS[Math.floor(Math.random() * WORDS.length)];
  const distractors = WORDS.filter((w) => w.word !== target.word)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3);
  const options = [target, ...distractors].sort(() => Math.random() - 0.5);
  return { target, options };
}

export default function ListenAndPointGame({ navigation, route }) {
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

  const speakWord = (word) => {
    Speech.speak(word, { language: 'en', pitch: 1.1, rate: 0.8 });
  };

  const handlePlayWord = () => {
    speakWord(currentRound.target.word);
  };

  const handlePicturePress = (option) => {
    if (won) return;

    if (option.word === currentRound.target.word) {
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
      }, 900);
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
        <Text style={styles.winEmoji}>🎉👂🎉</Text>
        <Text style={styles.winTitle}>Great listening!</Text>
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetButtonText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>Round {round} of {TOTAL_ROUNDS}</Text>

      <TouchableOpacity style={styles.speakerButton} onPress={handlePlayWord}>
        <Text style={styles.speakerIcon}>🔊</Text>
        <Text style={styles.speakerLabel}>Tap to hear the word</Text>
      </TouchableOpacity>

      {feedback === 'correct' && <Text style={styles.feedbackText}>✅ Great!</Text>}
      {feedback === 'tryAgain' && <Text style={styles.feedbackText}>Try again!</Text>}

      <View style={styles.optionsGrid}>
        {currentRound.options.map((option) => (
          <TouchableOpacity
            key={option.word}
            style={styles.optionCard}
            onPress={() => handlePicturePress(option)}
          >
            <Text style={styles.optionEmoji}>{option.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F3E5F5', padding: 20, paddingTop: 40, alignItems: 'center' },
  progress: { fontSize: 14, color: '#666', marginBottom: 16 },
  speakerButton: {
    backgroundColor: '#8E24AA', borderRadius: 16, paddingVertical: 20, paddingHorizontal: 30,
    alignItems: 'center', marginBottom: 20,
  },
  speakerIcon: { fontSize: 40 },
  speakerLabel: { color: '#fff', fontWeight: '700', marginTop: 6 },
  feedbackText: { fontSize: 20, fontWeight: '700', color: '#2E7D32', marginBottom: 12 },
  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', width: 280 },
  optionCard: {
    width: 110, height: 110, borderRadius: 16, backgroundColor: '#fff', margin: 10,
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  optionEmoji: { fontSize: 50 },
  winEmoji: { fontSize: 60, marginBottom: 12 },
  winTitle: { fontSize: 26, fontWeight: '900', color: '#2E7D32', marginBottom: 24 },
  resetButton: { backgroundColor: '#8E24AA', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 30 },
  resetButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});