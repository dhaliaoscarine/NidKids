// screens/CompleteProfileScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image, Modal, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateProfile } from '../api';

const SPECIALTIES = [
  'Speech Therapist',
  'Physiotherapist',
  'Occupational Therapist',
  'Psychologist',
  'Special Education Teacher',
  'Other',
];

export default function CompleteProfileScreen({ navigation, route }) {
  const { token, user, isEditing } = route.params || {};

  const [specialty, setSpecialty] = useState(user?.specialty || '');
  const [showDropdown, setShowDropdown] = useState(false);
  const [town, setTown] = useState(user?.town || '');
  const [hospitalCenter, setHospitalCenter] = useState(user?.hospitalCenter || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [photoBase64, setPhotoBase64] = useState(user?.photoBase64 || '');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handlePickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setMessage('Permission to access photos is needed to add a picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.4,
      base64: true,
    });
    if (!result.canceled && result.assets?.[0]?.base64) {
      setPhotoBase64(`data:image/jpeg;base64,${result.assets[0].base64}`);
    }
  };

  const handleSave = async () => {
    setMessage('');
    if (!specialty || !town || !hospitalCenter) {
      setMessage('Please fill in Specialty, Town, and Hospital/Center.');
      return;
    }
    setLoading(true);
    try {
      const response = await updateProfile({ specialty, town, hospitalCenter, bio, photoBase64 }, token);
      const updatedUser = response.data.user;

      await AsyncStorage.setItem('nidkids_user', JSON.stringify(updatedUser));

      if (isEditing) {
        navigation.goBack();
      } else {
        navigation.replace('Home', { token, user: updatedUser });
      }
    } catch (error) {
      console.error('Update profile error:', error);
      // Show as much detail as possible directly on screen, so we can
      // diagnose the issue without needing terminal access.
      let debugMessage;
      if (error.response) {
        debugMessage = `Server error (${error.response.status}): ${error.response.data?.message || 'Unknown'}`;
      } else if (error.request) {
        debugMessage = 'No response from server. Check backend is running and IP/port are correct.';
      } else {
        debugMessage = `Error: ${error.message}`;
      }
      setMessage(debugMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scroll}>
      <View style={styles.container}>
        {navigation.canGoBack() && (
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Text style={styles.backButtonText}>‹ Back</Text>
          </TouchableOpacity>
        )}

        <Text style={styles.title}>{isEditing ? 'Edit Profile' : 'Complete Your Profile'}</Text>
        <Text style={styles.subtitle}>
          {isEditing ? 'Update your information anytime.' : 'Parents will see this information when choosing a therapist.'}
        </Text>

        {message ? <Text style={styles.message}>{message}</Text> : null}

        <TouchableOpacity style={styles.photoPicker} onPress={handlePickPhoto}>
          {photoBase64 ? (
            <Image source={{ uri: photoBase64 }} style={styles.photoPreview} />
          ) : (
            <Text style={styles.photoPlaceholderText}>Add Photo{'\n'}(optional)</Text>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Specialty *</Text>
        <TouchableOpacity style={styles.dropdownButton} onPress={() => setShowDropdown(true)}>
          <Text style={specialty ? styles.dropdownText : styles.dropdownPlaceholder}>
            {specialty || 'Select specialty'}
          </Text>
          <Text style={styles.dropdownArrow}>▾</Text>
        </TouchableOpacity>

        <Modal visible={showDropdown} transparent animationType="fade" onRequestClose={() => setShowDropdown(false)}>
          <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowDropdown(false)}>
            <View style={styles.modalContent}>
              <FlatList
                data={SPECIALTIES}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.modalItem}
                    onPress={() => {
                      setSpecialty(item);
                      setShowDropdown(false);
                    }}
                  >
                    <Text style={styles.modalItemText}>{item}</Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </TouchableOpacity>
        </Modal>

        <Text style={styles.label}>Town / City *</Text>
        <TextInput style={styles.input} placeholder="e.g. Yaoundé" value={town} onChangeText={setTown} />

        <Text style={styles.label}>Hospital / Center *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. St John Hospital"
          value={hospitalCenter}
          onChangeText={setHospitalCenter}
        />

        <Text style={styles.label}>Bio (optional)</Text>
        <TextInput
          style={[styles.input, styles.bioInput]}
          placeholder="Tell parents about yourself and your approach..."
          value={bio}
          onChangeText={setBio}
          multiline
        />

        <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
          <Text style={styles.saveButtonText}>{loading ? 'Saving...' : 'Save Profile'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flexGrow: 1, backgroundColor: '#fff' },
  container: { padding: 24, paddingTop: 20, paddingBottom: 40 },
  backButton: { alignSelf: 'flex-start', marginBottom: 16, paddingVertical: 4, paddingHorizontal: 8 },
  backButtonText: { fontSize: 16, color: '#1976D2', fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '700', textAlign: 'center', marginBottom: 4, color: '#1A237E' },
  subtitle: { fontSize: 13, color: '#5C6BC0', textAlign: 'center', marginBottom: 24 },
  message: { backgroundColor: '#FFF3CD', padding: 12, borderRadius: 6, marginBottom: 16, textAlign: 'center', color: '#664D03' },
  photoPicker: {
    width: 96, height: 96, borderRadius: 48, backgroundColor: '#E8EAF6', alignSelf: 'center', marginBottom: 28,
    justifyContent: 'center', alignItems: 'center', overflow: 'hidden', borderWidth: 1.5, borderColor: '#1976D2',
  },
  photoPreview: { width: '100%', height: '100%' },
  photoPlaceholderText: { fontSize: 11, textAlign: 'center', color: '#5C6BC0' },
  label: { fontWeight: '600', marginBottom: 6, marginTop: 4, fontSize: 13, color: '#283593' },
  dropdownButton: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: '#F5F7FF', borderRadius: 6, borderWidth: 1, borderColor: '#C5CAE9',
    paddingVertical: 12, paddingHorizontal: 14, marginBottom: 14,
  },
  dropdownText: { fontSize: 14, color: '#1A237E' },
  dropdownPlaceholder: { fontSize: 14, color: '#9FA8DA' },
  dropdownArrow: { fontSize: 14, color: '#1976D2' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', padding: 30 },
  modalContent: { backgroundColor: '#fff', borderRadius: 10, maxHeight: 320, paddingVertical: 6 },
  modalItem: { paddingVertical: 14, paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: '#EEF0FA' },
  modalItemText: { fontSize: 15, color: '#1A237E' },
  input: {
    backgroundColor: '#F5F7FF', borderRadius: 6, padding: 12, marginBottom: 14,
    borderWidth: 1, borderColor: '#C5CAE9', fontSize: 14, color: '#1A237E',
  },
  bioInput: { minHeight: 80, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#1976D2', borderRadius: 8, paddingVertical: 15, alignItems: 'center', marginTop: 10 },
  saveButtonText: { color: '#fff', fontWeight: '600', fontSize: 15 },
});