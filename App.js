// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import SplashScreen from './screens/SplashScreen';
import SignInScreen from './screens/SignInScreen';
import SignUpScreen from './screens/SignUpScreen';
import AddChildScreen from './screens/AddChildScreen';
import CompleteProfileScreen from './screens/CompleteProfileScreen';
import HomeScreen from './screens/HomeScreen';

import TelemedicineHomeScreen from './screens/TelemedicineScreen';
import BrowseSpecialistsScreen from './screens/BrowseSpecialistsScreen';
import SpecialistSlotsScreen from './screens/SpecialistSlotsScreen';
import MyAvailabilityScreen from './screens/MyAvailabilityScreen';
import MyAppointmentsScreen from './screens/MyAppointmentsScreen';

import GamesScreen from './screens/games/GamesScreen';
import GameCategoryScreen from './screens/games/GameCategoryScreen';
import MemoryMatchGame from './screens/games/cognitive/MemoryMatchGame';
import CountingGame from './screens/games/cognitive/CountingGame';
import ShapeSortGame from './screens/games/fineMotor/ShapeSortGame';
import DotTraceGame from './screens/games/fineMotor/DotTraceGame';
import TraceGame from './screens/games/fineMotor/TraceGame';
import ListenAndPointGame from './screens/games/speech/ListenAndPointGame';
import NameThePictureGame from './screens/games/speech/NameThePictureGame';
import FeelingsCheckInGame from './screens/games/social/FeelingsCheckInGame';
import StoryTimeGame from './screens/games/social/StoryTimeGame';

import TherapyScreen from './screens/TherapyScreen';
import TherapyCategoryScreen from './screens/TherapyCategoryScreen';
import ExerciseDetailScreen from './screens/ExerciseDetailScreen';
import CommunityScreen from './screens/CommunityScreen';
import AddPostScreen from './screens/AddPostScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Splash" screenOptions={{ headerShown: true, headerBackTitleVisible: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
        <Stack.Screen name="SignUp" component={SignUpScreen} options={{ headerShown: false }} />
        <Stack.Screen name="AddChild" component={AddChildScreen} options={{ headerShown: false }} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} options={{ title: 'Profile' }} />
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />

        <Stack.Screen name="Telemedicine" component={TelemedicineHomeScreen} options={{ title: 'Tele-Medicine' }} />
        <Stack.Screen name="BrowseSpecialists" component={BrowseSpecialistsScreen} options={{ title: 'Specialists' }} />
        <Stack.Screen name="SpecialistSlots" component={SpecialistSlotsScreen} options={{ title: 'Book Appointment' }} />
        <Stack.Screen name="MyAvailability" component={MyAvailabilityScreen} options={{ title: 'My Availability' }} />
        <Stack.Screen name="MyAppointments" component={MyAppointmentsScreen} options={{ title: 'My Appointments' }} />

        <Stack.Screen name="Games" component={GamesScreen} options={{ title: 'Games' }} />
        <Stack.Screen name="GameCategory" component={GameCategoryScreen} options={{ title: 'Games' }} />
        <Stack.Screen name="MemoryMatchGame" component={MemoryMatchGame} options={{ title: 'Memory Match' }} />
        <Stack.Screen name="CountingGame" component={CountingGame} options={{ title: 'Counting Fun' }} />
        <Stack.Screen name="ShapeSortGame" component={ShapeSortGame} options={{ title: 'Shape Sorting' }} />
        <Stack.Screen name="DotTraceGame" component={DotTraceGame} options={{ title: 'Trace the Star' }} />
        <Stack.Screen name="FreehandTraceGame" component={TraceGame} options={{ title: 'Trace the Circle' }} />
        <Stack.Screen name="ListenAndPointGame" component={ListenAndPointGame} options={{ title: 'Listen and Point' }} />
        <Stack.Screen name="NameThePictureGame" component={NameThePictureGame} options={{ title: 'Name the Picture' }} />
        <Stack.Screen name="FeelingsCheckInGame" component={FeelingsCheckInGame} options={{ title: 'How Do You Feel?' }} />
        <Stack.Screen name="StoryTimeGame" component={StoryTimeGame} options={{ title: 'Story Time' }} />

        <Stack.Screen name="Therapy" component={TherapyScreen} options={{ title: 'Therapy Exercises' }} />
        <Stack.Screen name="TherapyCategory" component={TherapyCategoryScreen} options={{ title: 'Exercises' }} />
        <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} options={{ title: 'Exercise' }} />
        <Stack.Screen name="Community" component={CommunityScreen} options={{ title: 'Community & Support' }} />
        <Stack.Screen name="AddPost" component={AddPostScreen} options={{ title: 'Add Post' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}