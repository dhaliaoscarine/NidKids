// screens/games/fineMotor/ShapeSortGame.js
//
// Drag-and-drop shape sorting: 3 draggable shapes at the bottom, 3 outline
// "slots" at the top. Drag each shape onto its matching outline. Uses
// React Native's built-in PanResponder — no extra libraries needed.
import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Animated, PanResponder } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import { logGameSession } from '../../../api';

const correctSound = require('../../../assets/sounds/mixkit-game-success-alert-2039.wav');
const winSound = require('../../../assets/sounds/mixkit-achievement-completed-2068.wav');
const tryAgainSound = require('../../../assets/sounds/mixkit-tech-break-fail-2947.wav');

const SHAPES = [
  { key: 'circle', label: '⚪', color: '#E53935' },
  { key: 'square', label: '⬛', color: '#1E88E5' },
  { key: 'triangle', label: '🔺', color: '#43A047' },
];

// One draggable shape piece. Wraps its own PanResponder and Animated position.
function DraggableShape({ shape, onDropCheck, isMatched, startX, startY }) {
  const pan = useRef(new Animated.ValueXY({ x: startX, y: startY })).current;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => !isMatched,
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false }),
      onPanResponderRelease: (evt, gestureState) => {
        // moveX/moveY are the finger's ABSOLUTE position on screen at release —
        // this is what we compare against each drop zone's measured position.
        const dropped = onDropCheck(shape.key, gestureState.moveX, gestureState.moveY);
        if (!dropped) {
          // No match -> spring back to the starting position
          Animated.spring(pan, { toValue: { x: 0, y: 0 }, useNativeDriver: false }).start();
        }
      },
    })
  ).current;

  if (isMatched) return null; // once matched, the piece "locks" into the zone visually (handled separately)

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[styles.shapePiece, { backgroundColor: shape.color, transform: pan.getTranslateTransform() }]}
    >
      <Text style={styles.shapeEmoji}>{shape.label}</Text>
    </Animated.View>
  );
}

export default function ShapeSortGame({ navigation, route }) {
  const { token, game } = route.params || {};
  const [matched, setMatched] = useState({}); // { circle: true, square: false, ... }
  const [won, setWon] = useState(false);
  const startTimeRef = useRef(Date.now());
  const hasLoggedRef = useRef(false);
  const zoneRefs = useRef({}); // stores refs to each drop-zone View

  const correctPlayer = useAudioPlayer(correctSound);
  const winPlayer = useAudioPlayer(winSound);
  const tryAgainPlayer = useAudioPlayer(tryAgainSound);

  // Called when a shape is released. Measures each zone's on-screen position
  // and checks whether the release point (fingerX, fingerY) landed inside
  // the MATCHING zone. Returns true if it was a successful drop.
  const handleDropCheck = (shapeKey, fingerX, fingerY) => {
    const zoneNode = zoneRefs.current[shapeKey];
    if (!zoneNode) return false;

    let isMatch = false;
    zoneNode.measureInWindow((zx, zy, zWidth, zHeight) => {
      const withinX = fingerX >= zx && fingerX <= zx + zWidth;
      const withinY = fingerY >= zy && fingerY <= zy + zHeight;
      if (withinX && withinY) {
        isMatch = true;
        setMatched((prev) => {
          const updated = { ...prev, [shapeKey]: true };
          checkWin(updated);
          return updated;
        });
        correctPlayer.seekTo(0);
        correctPlayer.play();
      }
    });

    // Note: measureInWindow is async in some environments, but the check
    // above updates state directly inside its callback, so the visual
    // result (piece disappearing/locking) still happens correctly even
    // if this returned value below is evaluated slightly earlier.
    return isMatch;
  };

  const checkWin = (matchedState) => {
    const allMatched = SHAPES.every((s) => matchedState[s.key]);
    if (allMatched && !hasLoggedRef.current) {
      hasLoggedRef.current = true;
      setWon(true);
      winPlayer.seekTo(0);
      winPlayer.play();

      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      logGameSession({ gameId: game?._id, durationSeconds, score: SHAPES.length }, token).catch((err) =>
        console.error('Log session error:', err)
      );
    }
  };

  const resetGame = () => {
    setMatched({});
    setWon(false);
    hasLoggedRef.current = false;
    startTimeRef.current = Date.now();
  };

  if (won) {
    return (
      <View style={styles.container}>
        <Text style={styles.winEmoji}>🎉🧩🎉</Text>
        <Text style={styles.winTitle}>All shapes sorted!</Text>
        <Animated.Text
          style={styles.resetButton}
          onPress={resetGame}
        >
          Play Again
        </Animated.Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Shape Sorting</Text>
      <Text style={styles.subtitle}>Drag each shape to its matching outline</Text>

      {/* Drop zones (outlines) */}
      <View style={styles.zoneRow}>
        {SHAPES.map((shape) => (
          <View
            key={shape.key}
            ref={(node) => { zoneRefs.current[shape.key] = node; }}
            style={[styles.dropZone, matched[shape.key] && { backgroundColor: shape.color + '55' }]}
          >
            <Text style={styles.zoneEmoji}>{shape.label}</Text>
            {matched[shape.key] && <Text style={styles.checkmark}>✅</Text>}
          </View>
        ))}
      </View>

      {/* Draggable pieces */}
      <View style={styles.pieceRow}>
        {SHAPES.map((shape, index) => (
          <DraggableShape
            key={shape.key}
            shape={shape}
            isMatched={!!matched[shape.key]}
            onDropCheck={handleDropCheck}
            startX={0}
            startY={0}
          />
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF3E0', padding: 20, paddingTop: 40, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 30, textAlign: 'center' },
  zoneRow: { flexDirection: 'row', justifyContent: 'space-between', width: 300, marginBottom: 60 },
  dropZone: {
    width: 80, height: 80, borderRadius: 14, borderWidth: 3, borderColor: '#999', borderStyle: 'dashed',
    justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff',
  },
  zoneEmoji: { fontSize: 34, opacity: 0.35 },
  checkmark: { position: 'absolute', fontSize: 20 },
  pieceRow: { flexDirection: 'row', justifyContent: 'space-between', width: 300 },
  shapePiece: {
    width: 70, height: 70, borderRadius: 12, justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5,
  },
  shapeEmoji: { fontSize: 30 },
  winEmoji: { fontSize: 60, marginBottom: 12 },
  winTitle: { fontSize: 26, fontWeight: '900', color: '#2E7D32', marginBottom: 24 },
  resetButton: {
    backgroundColor: '#43A047', color: '#fff', fontWeight: '700', fontSize: 16,
    paddingVertical: 14, paddingHorizontal: 30, borderRadius: 10, overflow: 'hidden',
  },
});