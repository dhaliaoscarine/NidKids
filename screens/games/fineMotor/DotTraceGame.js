// screens/games/fineMotor/DotTraceGame.js

// Simplified "tracing": numbered dots outline a shape. Child taps them
// in order (1, 2, 3...) to trace the shape's outline. Builds sequencing
// + precise tapping — a reliable alternative to freehand tracing, which
// is much harder to detect/grade accurately in an app.
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Svg, Line } from 'react-native';
import Svg2, { Line as SvgLine } from 'react-native-svg';
import { useAudioPlayer } from 'expo-audio';
import { logGameSession } from '../../../api';

const correctSound = require('../../../assets/sounds/mixkit-game-success-alert-2039.wav');
const winSound = require('../../../assets/sounds/mixkit-achievement-completed-2068.wav');
const tryAgainSound = require('../../../assets/sounds/mixkit-tech-break-fail-2947.wav');

// A simple 5-point star shape, defined as dot coordinates in order.
// Coordinates are relative to a 260x260 drawing area.
const STAR_DOTS = [
  { id: 1, x: 130, y: 10 },
  { id: 2, x: 160, y: 95 },
  { id: 3, x: 250, y: 95 },
  { id: 4, x: 178, y: 150 },
  { id: 5, x: 205, y: 240 },
  { id: 6, x: 130, y: 185 },
  { id: 7, x: 55, y: 240 },
  { id: 8, x: 82, y: 150 },
  { id: 9, x: 10, y: 95 },
  { id: 10, x: 100, y: 95 },
];

export default function DotTraceGame({ navigation, route }) {
  const { token, game } = route.params || {};
  const [nextDot, setNextDot] = useState(1); // which dot number comes next
  const [won, setWon] = useState(false);
  const startTimeRef = useRef(Date.now());
  const hasLoggedRef = useRef(false);

  const correctPlayer = useAudioPlayer(correctSound);
  const winPlayer = useAudioPlayer(winSound);
  const tryAgainPlayer = useAudioPlayer(tryAgainSound);

  const handleDotPress = (dot) => {
    if (won) return;

    if (dot.id === nextDot) {
      correctPlayer.seekTo(0);
      correctPlayer.play();

      if (dot.id === STAR_DOTS.length) {
        finishGame();
      } else {
        setNextDot(dot.id + 1);
      }
    } else {
      tryAgainPlayer.seekTo(0);
      tryAgainPlayer.play();
    }
  };

  const finishGame = () => {
    if (hasLoggedRef.current) return;
    hasLoggedRef.current = true;
    setWon(true);
    winPlayer.seekTo(0);
    winPlayer.play();

    const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
    logGameSession({ gameId: game?._id, durationSeconds, score: STAR_DOTS.length }, token).catch((err) =>
      console.error('Log session error:', err)
    );
  };

  const resetGame = () => {
    setNextDot(1);
    setWon(false);
    hasLoggedRef.current = false;
    startTimeRef.current = Date.now();
  };

  // Lines connecting already-completed dots, so the shape "draws itself" progressively
  const completedLines = [];
  for (let i = 1; i < nextDot; i++) {
    const from = STAR_DOTS.find((d) => d.id === i);
    const to = STAR_DOTS.find((d) => d.id === i + 1);
    if (from && to) completedLines.push({ from, to });
  }

  if (won) {
    return (
      <View style={styles.container}>
        <Text style={styles.winEmoji}>🎉⭐🎉</Text>
        <Text style={styles.winTitle}>You traced the star!</Text>
        <TouchableOpacity style={styles.resetButtonTouchable} onPress={resetGame}>
          <Text style={styles.resetButtonText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trace the Star</Text>
      <Text style={styles.subtitle}>Tap the dots in order: {nextDot}</Text>

      <View style={styles.drawArea}>
        <Svg2 width={260} height={260} style={StyleSheet.absoluteFill}>
          {completedLines.map((line, index) => (
            <SvgLine
              key={index}
              x1={line.from.x} y1={line.from.y}
              x2={line.to.x} y2={line.to.y}
              stroke="#43A047" strokeWidth={4}
            />
          ))}
        </Svg2>

        {STAR_DOTS.map((dot) => {
          const isDone = dot.id < nextDot;
          const isNext = dot.id === nextDot;
          return (
            <TouchableOpacity
              key={dot.id}
              style={[
                styles.dot,
                { left: dot.x - 18, top: dot.y - 18 },
                isDone && styles.dotDone,
                isNext && styles.dotNext,
              ]}
              onPress={() => handleDotPress(dot)}
            >
              <Text style={styles.dotText}>{dot.id}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD', padding: 20, paddingTop: 40, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#333', marginBottom: 20, fontWeight: '600' },
  drawArea: { width: 260, height: 260, position: 'relative' },
  dot: {
    position: 'absolute', width: 36, height: 36, borderRadius: 18, backgroundColor: '#90A4AE',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 2, elevation: 3,
  },
  dotDone: { backgroundColor: '#43A047' },
  dotNext: { backgroundColor: '#1E88E5' },
  dotText: { color: '#fff', fontWeight: '900', fontSize: 14 },
  winEmoji: { fontSize: 60, marginBottom: 12 },
  winTitle: { fontSize: 24, fontWeight: '900', color: '#2E7D32', marginBottom: 24 },
  resetButtonTouchable: { backgroundColor: '#43A047', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 30 },
  resetButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});