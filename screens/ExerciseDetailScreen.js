// screens/ExerciseDetailScreen.js
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Linking } from 'react-native';
import { WebView } from 'react-native-webview';
import { completeExercise } from '../api';

function getYoutubeEmbedId(url) {
  if (!url) return null;
  const watchMatch = url.match(/[?&]v=([^&]+)/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([^?]+)/);
  if (shortMatch) return shortMatch[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return null;
}

export default function ExerciseDetailScreen({ route }) {
  const { token, exercise } = route.params || {};
  const [completed, setCompleted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const videoId = getYoutubeEmbedId(exercise?.youtubeUrl);
  const embedUrl = videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : null;

  const handleMarkComplete = async () => {
    setLoading(true);
    setMessage('');
    try {
      await completeExercise({ exerciseId: exercise._id }, token);
      setCompleted(true);
      setMessage('✅ Great work! This session has been logged.');
    } catch (error) {
      console.error('Complete exercise error:', error);
      setMessage('Could not log this session. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{exercise?.title}</Text>
      {exercise?.description ? <Text style={styles.description}>{exercise.description}</Text> : null}

      {message ? <Text style={styles.message}>{message}</Text> : null}

      {embedUrl ? (
        Platform.OS === 'web' ? (
          <View style={styles.videoWrapper}>
            <iframe
              src={embedUrl}
              style={{ width: '100%', height: '100%', border: 'none', borderRadius: 12 }}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </View>
        ) : (
          <View style={styles.videoWrapper}>
            <WebView source={{ uri: embedUrl }} style={styles.webview} allowsFullscreenVideo />
          </View>
        )
      ) : (
        <View style={styles.videoMissing}>
          <Text style={styles.videoMissingText}>Video not available for this exercise.</Text>
        </View>
      )}

      {videoId && (
        <TouchableOpacity
          style={styles.watchOnYoutubeButton}
          onPress={() => Linking.openURL(`https://www.youtube.com/watch?v=${videoId}`)}
        >
          <Text style={styles.watchOnYoutubeText}>▶️ Watch on YouTube</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.completeButton, completed && styles.completeButtonDone]}
        onPress={handleMarkComplete}
        disabled={loading || completed}
      >
        <Text style={styles.completeButtonText}>
          {completed ? '✅ Marked as Done' : loading ? 'Saving...' : 'Mark as Done'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 6, color: '#1A1A1A' },
  description: { fontSize: 14, color: '#666', marginBottom: 20 },
  message: { backgroundColor: '#E8F5E9', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center', color: '#2E7D32' },
  videoWrapper: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12, overflow: 'hidden', backgroundColor: '#000', marginBottom: 12 },
  webview: { flex: 1 },
  videoMissing: {
    width: '100%', aspectRatio: 16 / 9, borderRadius: 12, backgroundColor: '#F0F0F0',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  videoMissingText: { color: '#888' },
  watchOnYoutubeButton: {
    backgroundColor: '#FF0000', borderRadius: 8, paddingVertical: 10, alignItems: 'center', marginBottom: 20,
  },
  watchOnYoutubeText: { color: '#fff', fontWeight: '700', fontSize: 14 },
  completeButton: { backgroundColor: '#43A047', borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  completeButtonDone: { backgroundColor: '#8BC34A' },
  completeButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});