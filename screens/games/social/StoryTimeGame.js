// screens/games/social/StoryTimeGame.js
//
// A voice-narrated interactive story. Every line is SPOKEN aloud (no
// reading required). The child taps one big button per scene to make
// the story continue — modeling simple social dialogue (greetings,
// saying thank you, asking to play) and basic life skills through
// play rather than through a quiz/test format.
import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Speech from 'expo-speech';
import { useAudioPlayer } from 'expo-audio';
import { logGameSession } from '../../../api';

const winSound = require('../../../assets/sounds/mixkit-achievement-completed-2068.wav');
const tapSound = require('../../../assets/sounds/mixkit-game-success-alert-2039.wav');

// Each scene: a character, a spoken narration line, a spoken response
// line (what the character "says back"), and the button label/action.
const SCENES = [
  {
    emoji: '🐶',
    character: 'Buddy the Dog',
    narration: 'Buddy the dog is walking by. Let\'s say hello!',
    buttonLabel: 'Wave Hello 👋',
    response: 'Woof! Hi friend! Buddy is happy you said hello!',
  },
  {
    emoji: '🐰',
    character: 'Rosie the Rabbit',
    narration: 'Rosie the rabbit gives you a flower. What do we say?',
    buttonLabel: 'Say Thank You 💐',
    response: 'You\'re welcome! Rosie loves sharing with friends!',
  },
  {
    emoji: '🐻',
    character: 'Ben the Bear',
    narration: 'Ben the bear is playing with a ball all alone. Let\'s ask to join!',
    buttonLabel: 'Ask to Play 🎾',
    response: 'Yes! Let\'s play together! Ben is so happy to have a friend!',
  },
  {
    emoji: '🐱',
    character: 'Milo the Cat',
    narration: 'Milo the cat looks a little sad today. What can we do?',
    buttonLabel: 'Give a Hug 🤗',
    response: 'Purr! That made Milo feel so much better. Thank you for being kind!',
  },
];

export default function StoryTimeGame({ navigation, route }) {
  const { token, game } = route.params || {};
  const [sceneIndex, setSceneIndex] = useState(0);
  const [showResponse, setShowResponse] = useState(false);
  const [finished, setFinished] = useState(false);
  const startTimeRef = useRef(Date.now());
  const hasLoggedRef = useRef(false);

  const winPlayer = useAudioPlayer(winSound);
  const tapPlayer = useAudioPlayer(tapSound);

  const currentScene = SCENES[sceneIndex];

  // Speak the narration line automatically every time a new scene appears
  useEffect(() => {
    if (!finished) {
      Speech.speak(currentScene.narration, { language: 'en', pitch: 1.15, rate: 0.85 });
    }
  }, [sceneIndex]);

  const handleActionPress = () => {
    tapPlayer.seekTo(0);
    tapPlayer.play();

    setShowResponse(true);
    Speech.speak(currentScene.response, { language: 'en', pitch: 1.15, rate: 0.85 });
  };

  const handleNext = () => {
    if (sceneIndex >= SCENES.length - 1) {
      finishStory();
    } else {
      setSceneIndex((i) => i + 1);
      setShowResponse(false);
    }
  };

  const finishStory = () => {
    setFinished(true);
    if (!hasLoggedRef.current) {
      hasLoggedRef.current = true;
      winPlayer.seekTo(0);
      winPlayer.play();
      Speech.speak('You made so many new friends today! Great job!', { language: 'en', pitch: 1.15, rate: 0.85 });

      const durationSeconds = Math.round((Date.now() - startTimeRef.current) / 1000);
      logGameSession({ gameId: game?._id, durationSeconds, score: SCENES.length }, token).catch((err) =>
        console.error('Log session error:', err)
      );
    }
  };

  const resetGame = () => {
    setSceneIndex(0);
    setShowResponse(false);
    setFinished(false);
    hasLoggedRef.current = false;
    startTimeRef.current = Date.now();
  };

  const replayNarration = () => {
    const textToSpeak = showResponse ? currentScene.response : currentScene.narration;
    Speech.speak(textToSpeak, { language: 'en', pitch: 1.15, rate: 0.85 });
  };

  if (finished) {
    return (
      <View style={styles.container}>
        <Text style={styles.winEmoji}>🎉🐾🎉</Text>
        <Text style={styles.winTitle}>You made new friends today!</Text>
        <TouchableOpacity style={styles.resetButton} onPress={resetGame}>
          <Text style={styles.resetButtonText}>Play Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.progress}>Friend {sceneIndex + 1} of {SCENES.length}</Text>

      <Text style={styles.animalEmoji}>{currentScene.emoji}</Text>
      <Text style={styles.characterName}>{currentScene.character}</Text>

      <TouchableOpacity style={styles.speakerButton} onPress={replayNarration}>
        <Text style={styles.speakerIcon}>🔊</Text>
      </TouchableOpacity>

      {!showResponse ? (
        <TouchableOpacity style={styles.actionButton} onPress={handleActionPress}>
          <Text style={styles.actionButtonText}>{currentScene.buttonLabel}</Text>
        </TouchableOpacity>
      ) : (
        <>
          <View style={styles.responseBubble}>
            <Text style={styles.responseText}>{currentScene.response}</Text>
          </View>
          <TouchableOpacity style={styles.nextButton} onPress={handleNext}>
            <Text style={styles.nextButtonText}>
              {sceneIndex >= SCENES.length - 1 ? 'Finish! 🎉' : 'Next Friend ➡️'}
            </Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#E1F5FE', padding: 20, paddingTop: 40, alignItems: 'center' },
  progress: { fontSize: 14, color: '#666', marginBottom: 8 },
  animalEmoji: { fontSize: 90, marginBottom: 6 },
  characterName: { fontSize: 20, fontWeight: '800', color: '#01579B', marginBottom: 16 },
  speakerButton: {
    backgroundColor: '#0288D1', width: 56, height: 56, borderRadius: 28,
    justifyContent: 'center', alignItems: 'center', marginBottom: 20,
  },
  speakerIcon: { fontSize: 26 },
  actionButton: {
    backgroundColor: '#43A047', borderRadius: 16, paddingVertical: 20, paddingHorizontal: 34,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 4,
  },
  actionButtonText: { color: '#fff', fontWeight: '800', fontSize: 18 },
  responseBubble: {
    backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 20, width: 280,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  responseText: { fontSize: 16, color: '#333', textAlign: 'center', fontWeight: '600' },
  nextButton: { backgroundColor: '#0288D1', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 28 },
  nextButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  winEmoji: { fontSize: 60, marginBottom: 12 },
  winTitle: { fontSize: 24, fontWeight: '900', color: '#2E7D32', marginBottom: 24, textAlign: 'center' },
  resetButton: { backgroundColor: '#43A047', borderRadius: 10, paddingVertical: 14, paddingHorizontal: 30 },
  resetButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});