// screens/AddPostScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { createPost } from '../api';

export default function AddPostScreen({ navigation, route }) {
  const { token, onPostCreated } = route.params || {};
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async () => {
    setMessage('');
    if (!title || !content) {
      setMessage('Please fill in both title and content.');
      return;
    }
    setLoading(true);
    try {
      await createPost({ title, content }, token);
      if (onPostCreated) onPostCreated();
      navigation.goBack();
    } catch (error) {
      console.error('Create post error:', error);
      setMessage(error.response?.data?.message || 'Could not create post.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Post</Text>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <Text style={styles.label}>Title</Text>
      <TextInput style={styles.input} placeholder="e.g. Useful tips" value={title} onChangeText={setTitle} />

      <Text style={styles.label}>Content</Text>
      <TextInput
        style={[styles.input, styles.contentInput]}
        placeholder="Share your thoughts, tips, or experiences..."
        value={content}
        onChangeText={setContent}
        multiline
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit} disabled={loading}>
        <Text style={styles.submitButtonText}>{loading ? 'Posting...' : 'Send Post'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24, paddingTop: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  message: { backgroundColor: '#fff3cd', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  label: { fontWeight: '600', marginBottom: 8, fontSize: 14 },
  input: {
    backgroundColor: '#F5F5F5', borderRadius: 8, padding: 12, marginBottom: 18,
    borderWidth: 1, borderColor: '#ddd', fontSize: 14,
  },
  contentInput: { minHeight: 120, textAlignVertical: 'top' },
  submitButton: { backgroundColor: '#00ACC1', borderRadius: 10, paddingVertical: 16, alignItems: 'center' },
  submitButtonText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});