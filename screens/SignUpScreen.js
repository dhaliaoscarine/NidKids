// screens/SignUpScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerUser } from '../api';


const ROLES = [
  { key: 'parent', label: 'Parent' },
  { key: 'therapist', label: 'Therapist' },
];

export default function SignUpScreen({ navigation }) {
  const [name, setName] = useState('');
  const [contactMethod, setContactMethod] = useState('phone'); // 'phone' or 'email'
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSignUp = async () => {
    setMessage('');
    if (!name || !password || !confirmPassword) {
      setMessage('Name and password fields are required.');
      return;
    }
    if (contactMethod === 'phone' && !phone) {
      setMessage('Please enter a phone number.');
      return;
    }
    if (contactMethod === 'email' && !email) {
      setMessage('Please enter an email.');
      return;
    }
    if (password !== confirmPassword) {
      setMessage('Passwords do not match.');
      return;
    }
    if (!role) {
      setMessage('Please select a role.');
      return;
    }

    setLoading(true);
    try {
      const payload = { name, password, confirmPassword, role };
      if (contactMethod === 'phone') payload.phone = phone;
      if (contactMethod === 'email') payload.email = email;

      const response = await registerUser(payload);
      const { token, user } = response.data;

      await AsyncStorage.setItem('nidkids_token', token);
      await AsyncStorage.setItem('nidkids_user', JSON.stringify(user));

            if (user.role === 'parent') {
        navigation.replace('AddChild', { token, user });
      } else if (user.role === 'therapist' && !user.profileComplete) {
        navigation.replace('CompleteProfile', { token, user, isEditing: false });
      } else {
        navigation.replace('Home', { token, user });
      }
    } catch (error) {
      if (error.response) {
        setMessage(`Server says: ${error.response.data?.message || 'Sign up failed'}`);
      } else {
        setMessage('Could not reach the server. Check backend is running and IP is correct.');
      }
      console.error('Sign up error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        <Text style={styles.title}>SIGN UP</Text>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TextInput style={styles.input} placeholder="Name" value={name} onChangeText={setName} />

        {/* Toggle between Phone and Email — only one field shows at a time */}
        <Text style={styles.label}>Contact via:</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleButton, contactMethod === 'phone' && styles.toggleButtonActive]}
            onPress={() => setContactMethod('phone')}
          >
            <Text style={[styles.toggleText, contactMethod === 'phone' && styles.toggleTextActive]}>📱 Phone</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, contactMethod === 'email' && styles.toggleButtonActive]}
            onPress={() => setContactMethod('email')}
          >
            <Text style={[styles.toggleText, contactMethod === 'email' && styles.toggleTextActive]}>✉️ Email</Text>
          </TouchableOpacity>
        </View>

        {contactMethod === 'phone' ? (
          <TextInput style={styles.input} placeholder="Phone number" value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        ) : (
          <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" />
        )}

        <TextInput style={styles.input} placeholder="Password" value={password} onChangeText={setPassword} secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />

        <Text style={styles.label}>I am a:</Text>
        <View style={styles.roleRow}>
          {ROLES.map((r) => (
            <TouchableOpacity
              key={r.key}
              style={[styles.roleButton, role === r.key && styles.roleButtonSelected]}
              onPress={() => setRole(r.key)}
            >
              <Text style={[styles.roleText, role === r.key && styles.roleTextSelected]}>{r.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSignUp} disabled={loading}>
          <Text style={styles.buttonText}>{loading ? 'Creating account...' : 'Sign up'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <Text style={styles.link}>Already have an account? Sign in</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: '#4DD0E1' },
  container: { padding: 24, paddingTop: 50, paddingBottom: 40 },
  title: { fontSize: 28, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  message: { backgroundColor: '#fff3cd', padding: 12, borderRadius: 8, marginBottom: 16, textAlign: 'center' },
  input: { backgroundColor: '#fff', borderRadius: 8, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#ccc' },
  label: { fontWeight: '600', marginBottom: 8, fontSize: 15 },
  toggleRow: { flexDirection: 'row', marginBottom: 12 },
  toggleButton: { flex: 1, paddingVertical: 12, borderWidth: 1.5, borderColor: '#fff', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.3)' },
  toggleButtonActive: { backgroundColor: '#fff' },
  toggleText: { fontWeight: '600', color: '#fff' },
  toggleTextActive: { color: '#0A6E7A' },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  roleButton: { flex: 1, marginHorizontal: 4, paddingVertical: 12, borderRadius: 8, borderWidth: 2, borderColor: '#E91E9F', alignItems: 'center', backgroundColor: '#fff' },
  roleButtonSelected: { backgroundColor: '#E91E9F' },
  roleText: { color: '#E91E9F', fontSize: 13, fontWeight: '700' },
  roleTextSelected: { color: '#fff' },
  button: { backgroundColor: '#E91E9F', borderRadius: 8, padding: 16, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  link: { textAlign: 'center', marginTop: 16, textDecorationLine: 'underline' },
});