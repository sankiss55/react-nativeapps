import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Toast from 'react-native-toast-message'; 

import Alarma from './alarma';
import Temporizador from './temporizador';
import Clonometro from './clonometro';

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator 
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;

            if (route.name === 'Alarma') {
              iconName = 'alarm-outline';
            } else if (route.name === 'Temporizador') {
              iconName = 'hourglass-outline';
            } else if (route.name === 'Clonometro') {
              iconName = 'timer-outline';
            }

            return (
              <Icon
                name={iconName}
                size={size}
                color={color}
                style={{ textAlign: 'center' }}
              />
            );
          },
          tabBarActiveTintColor: 'white', 
          tabBarInactiveTintColor: 'gray', 
          headerShown: false,
          tabBarStyle: { backgroundColor: '#121212' }, 
        })}
      >
        <Tab.Screen name="Alarma" component={Alarma} />
        <Tab.Screen name="Temporizador" component={Temporizador} />
        <Tab.Screen name="Clonometro" component={Clonometro} />
      </Tab.Navigator>

    
      <Toast />
    </NavigationContainer>
  );
}
