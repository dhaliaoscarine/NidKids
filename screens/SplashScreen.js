// screens/SplashScreen.js
import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function SplashScreen({ navigation }) {
  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('nidkids_token');
      const userJson = await AsyncStorage.getItem('nidkids_user');

      if (token && userJson) {
        const user = JSON.parse(userJson);
        // Old/returning user with a finished profile -> straight to dashboard
        if (user.role === 'therapist' && !user.profileComplete) {
          navigation.replace('CompleteProfile', { token, user, isEditing: false });
        } else {
          navigation.replace('Home', { token, user });
        }
      } else {
        // No saved session -> new user starts at Sign In
        navigation.replace('SignIn');
      }
    } catch (error) {
      console.error('Splash check error:', error);
      navigation.replace('SignIn');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>NidKids</Text>
      <Text style={styles.tagline}>TO LEARN AND GROW SPECIAL</Text>
      <ActivityIndicator size="large" color="#fff" style={{ marginTop: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#D7B8F5', justifyContent: 'center', alignItems: 'center' },
  logo: { fontSize: 36, fontWeight: 'bold', color: '#fff' },
  tagline: { fontSize: 13, color: '#fff', marginTop: 6 },
});