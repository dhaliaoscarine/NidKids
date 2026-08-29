// screens/SignInScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { loginUser } from '../api';

export default function SignInScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignIn = async () => {
    setMessage('');
    if (!identifier || !password) {
      setMessage('Please fill in both fields.');
      return;
    }
    setLoading(true);
    try {
      const response = await loginUser({ identifier, password });
      const { token, user } = response.data;

      // Save login so next app launch skips straight to Home via SplashScreen
      await AsyncStorage.setItem('nidkids_token', token);
      await AsyncStorage.setItem('nidkids_user', JSON.stringify(user));

      if (user.role === 'therapist' && !user.profileComplete) {
        navigation.replace('CompleteProfile', { token, user, isEditing: false });
      } else {
        navigation.replace('Home', { token, user });
      }
    } catch (error) {
      if (error.response) {
        setMessage(`Server says: ${error.response.data?.message || 'Login failed'}`);
      } else {
        setMessage('Could not reach the server. Check backend is running and IP is correct.');
      }
      console.error('Sign in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SIGN IN</Text>
      {message ? <Text style={styles.message}>{message}</Text> : null}
      <TextInput style={styles.input} placeholder="Phone number or email" value={identifier} onChangeText={setIdentifier} autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity style={styles.button} onPress={handleSignIn} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign in'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.link}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#4DD0E1', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  message: { backgroundColor: '#fff3cd', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 14, borderWidth: 1, borderColor: '#ccc' },
  button: { backgroundColor: '#E91E9F', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', marginTop: 16, textDecorationLine: 'underline' },
});