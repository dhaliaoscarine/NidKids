// screens/games/fineMotor/TraceGame.js
import React, { useState, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, PanResponder } from 'react-native';
import Svg, { Circle, Polyline } from 'react-native-svg';
import { useAudioPlayer } from 'expo-audio';
import { logGameSession } from '../../../api';

const winSound = require('../../../assets/sounds/mixkit-achievement-completed-2068.wav');

const CANVAS_SIZE = 280;
const CENTER = CANVAS_SIZE / 2;
const RADIUS = 100;

function getCirclePoints(numPoints) {
  const points = [];
  for (let i = 0; i < numPoints; i++) {
    const angle = (i / numPoints) * 2 * Math.PI;
    points.push({
      x: CENTER + RADIUS * Math.cos(angle),
      y: CENTER + RADIUS * Math.sin(angle),
    });
  }
  return points;
}

const GUIDE_POINTS = getCirclePoints(36);

export default function TraceGame({ navigation, route }) {
  const { token, game } = route.params || {};
  const [drawnPoints, setDrawnPoints] = useState([]);
  const [result, setResult] = useState(null);
  const startTimeRef = useRef(Date.now());
  const hasLoggedRef = useRef(false);
  const canvasRef = useRef(null);
  const canvasOffset = useRef({ x: 0, y: 0 });

  const winPlayer = useAudioPlayer(winSound);

  const handleCanvasLayout = () => {
    if (canvasRef.current) {
      canvasRef.current.measureInWindow((x, y) => {
        canvasOffset.current = { x, y };
      });
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (evt) => {
        const relativeX = evt.nativeEvent.pageX - canvasOffset.current.x;
        const relativeY = evt.nativeEvent.pageY - canvasOffset.current.y;
        setDrawnPoints((prev) => [...prev, { x: relativeX, y: relativeY }]);
      },
    })
  ).current;

  const handleClear = () => {
    setDrawnPoints([]);
    setResult(null);
  };

  const calculateCoverage = () => {
    if (drawnPoints.length === 0) return 0;
    const TOLERANCE = 35;

    let coveredCount = 0;
    GUIDE_POINTS.forEach((guidePoint) => {
      const wasNear = drawnPoints.some((dp) => {
        const dx = dp.x - guidePoint.x;
        const dy = dp.y - guidePoint.y;
        return Math.sqrt(dx * dx + dy * dy) <= TOLERANCE;
      });
      if (wasNear) coveredCount++;
    });

    return coveredCount / GUIDE_POINTS.length;
  };

  const handleFinish = () => {
    const coverage = calculateCoverage();

    let message = 'Nice try! Keep practicing!';
    let emojiKey = 'STRONG';
    if (coverage >= 0.6) {
      message = 'Amazing tracing!';
      emojiKey = 'STAR';
    } else if (coverage >= 0.25) {
      message = 'Great job tracing!';
      emojiKey = 'CLAP';
    }

    setResult({ message, emojiKey });
    winPlayer.seekTo(0);
    winPlayer.play();

    if (!hasLoggedRef.current) {
      hasLoggedRef.current = true;
      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      logGameSession(
        { gameId: game?._id, durationSeconds, score: Math.round(coverage * 100) },
        token
      ).catch((err) => console.error('Log session error:', err));
    }
  };

  const resetGame = () => {
    setDrawnPoints([]);
    setResult(null);
    hasLoggedRef.current = false;
    startTimeRef.current = Date.now();
  };

  const EMOJI_MAP = { STAR: '⭐', CLAP: '👏', STRONG: '💪' };

  if (result) {
    return (
      <View style={styles.container}>
        <Text style={styles.winEmoji}>{EMOJI_MAP[result.emojiKey]}</Text>
        <Text style={styles.winTitle}>{result.message}</Text>
        <TouchableOpacity style={styles.resetButtonTouchable} onPress={resetGame}>
          <Text style={styles.resetButtonText}>Trace Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Trace the Circle</Text>
      <Text style={styles.subtitle}>Use your finger to draw over the dashed line</Text>

      <View
        ref={canvasRef}
        onLayout={handleCanvasLayout}
        style={styles.canvas}
        {...panResponder.panHandlers}
      >
        <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
          <Circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS}
            stroke="#B0BEC5"
            strokeWidth={4}
            strokeDasharray="8,8"
            fill="none"
          />
          {drawnPoints.length > 1 && (
            <Polyline
              points={drawnPoints.map((p) => `${p.x},${p.y}`).join(' ')}
              stroke="#1E88E5"
              strokeWidth={6}
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}
        </Svg>
      </View>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.clearButton} onPress={handleClear}>
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.doneButton} onPress={handleFinish}>
          <Text style={styles.doneButtonText}>I'm Done!</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E3F2FD', padding: 20, paddingTop: 40, alignItems: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#555', marginBottom: 20, textAlign: 'center' },
  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#fff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonRow: { flexDirection: 'row', marginTop: 24 },
  clearButton: { backgroundColor: '#B0BEC5', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24, marginRight: 12 },
  clearButtonText: { color: '#fff', fontWeight: '700' },
  doneButton: { backgroundColor: '#43A047', borderRadius: 10, paddingVertical: 12, paddingHorizontal: 24 },
  doneButtonText: { color: '#fff', fontWeight: '700' },
  winEmoji: { fontSize: 60, marginBottom: 12 },
  winTitle: { fontSize: 26, fontWeight: '900', color: '#2E7D32', marginBottom: 24 },
  resetButtonTouchable: { backgroundColor: '#43A047', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 30 },
  resetButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});