// screens/CommunityScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { getPosts, likePost, getResources } from '../api';

export default function CommunityScreen({ navigation, route }) {
  const { token, user } = route.params || {};
  const [activeTab, setActiveTab] = useState('posts'); // 'posts' or 'resources'
  const [posts, setPosts] = useState([]);
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const loadPosts = useCallback(async () => {
    try {
      const response = await getPosts(token);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Load posts error:', error);
      setMessage('Could not load posts.');
    }
  }, [token]);

  const loadResources = useCallback(async () => {
    try {
      const response = await getResources(token);
      setResources(response.data.resources || []);
    } catch (error) {
      console.error('Load resources error:', error);
      setMessage('Could not load resources.');
    }
  }, [token]);

  useEffect(() => {
    setLoading(true);
    setMessage('');
    const loadFn = activeTab === 'posts' ? loadPosts : loadResources;
    loadFn().finally(() => setLoading(false));
  }, [activeTab]);

  const handleLike = async (postId) => {
    try {
      await likePost(postId, token);
      loadPosts();
    } catch (error) {
      console.error('Like error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabRow}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'posts' && styles.tabButtonActive]}
          onPress={() => setActiveTab('posts')}
        >
          <Text style={[styles.tabText, activeTab === 'posts' && styles.tabTextActive]}>Posts</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === 'resources' && styles.tabButtonActive]}
          onPress={() => setActiveTab('resources')}
        >
          <Text style={[styles.tabText, activeTab === 'resources' && styles.tabTextActive]}>Resources</Text>
        </TouchableOpacity>
      </View>

      {message ? <Text style={styles.errorMessage}>{message}</Text> : null}

      {loading ? (
        <ActivityIndicator size="large" color="#00ACC1" style={{ marginTop: 40 }} />
      ) : activeTab === 'posts' ? (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No posts yet. Be the first to share!</Text>}
          renderItem={({ item }) => (
            <View style={styles.postCard}>
              <Text style={styles.postAuthor}>{item.author?.name || 'Anonymous'}</Text>
              <Text style={styles.postDate}>{new Date(item.createdAt).toLocaleDateString()}</Text>
              <Text style={styles.postTitle}>{item.title}</Text>
              <Text style={styles.postContent}>{item.content}</Text>
              <TouchableOpacity style={styles.likeButton} onPress={() => handleLike(item._id)}>
                <Text style={styles.likeButtonText}>👍 {item.likes}</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <FlatList
          data={resources}
          keyExtractor={(item) => item._id}
          ListEmptyComponent={<Text style={styles.empty}>No resources available yet.</Text>}
          renderItem={({ item }) => (
            <View style={styles.resourceCard}>
              <Text style={styles.resourceIcon}>{item.type === 'book' ? '📚' : '🎥'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.resourceTitle}>{item.title}</Text>
                <Text style={styles.resourceDescription}>{item.description}</Text>
              </View>
            </View>
          )}
        />
      )}

      {activeTab === 'posts' && (
        <TouchableOpacity
          style={styles.addPostButton}
          onPress={() => navigation.navigate('AddPost', { token, user, onPostCreated: loadPosts })}
        >
          <Text style={styles.addPostButtonText}>+</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 16, paddingTop: 20 },
  tabRow: { flexDirection: 'row', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  tabButton: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabButtonActive: { borderBottomColor: '#00ACC1' },
  tabText: { fontSize: 15, color: '#888', fontWeight: '600' },
  tabTextActive: { color: '#00ACC1' },
  errorMessage: { backgroundColor: '#FFE0E0', padding: 12, borderRadius: 8, marginBottom: 12, textAlign: 'center' },
  empty: { textAlign: 'center', color: '#666', marginTop: 40 },
  postCard: {
    backgroundColor: '#F5F5F5', borderRadius: 12, padding: 16, marginBottom: 14,
  },
  postAuthor: { fontWeight: '700', fontSize: 15 },
  postDate: { fontSize: 11, color: '#888', marginBottom: 8 },
  postTitle: { fontWeight: '700', fontSize: 15, marginBottom: 4 },
  postContent: { fontSize: 14, color: '#444', marginBottom: 10, lineHeight: 20 },
  likeButton: { alignSelf: 'flex-start', backgroundColor: '#E0F7FA', borderRadius: 20, paddingVertical: 6, paddingHorizontal: 14 },
  likeButtonText: { fontSize: 13, fontWeight: '600', color: '#00838F' },
  resourceCard: {
    flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 12, padding: 14, marginBottom: 12, alignItems: 'center',
  },
  resourceIcon: { fontSize: 36, marginRight: 14 },
  resourceTitle: { fontWeight: '700', fontSize: 14, marginBottom: 4 },
  resourceDescription: { fontSize: 12, color: '#666' },
  addPostButton: {
    position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#00ACC1', justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 6,
  },
  addPostButtonText: { color: '#fff', fontSize: 28, fontWeight: '700', marginTop: -2 },
});