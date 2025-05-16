import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Usuario from "./productos_all";
import Salir from "./salir";
import Tiket from "./tiket";

import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Carrito from "./carrito";
import Stack_productos from "./stack_productos";
import { NavigationContainer } from '@react-navigation/native';
import { Svg, Path } from 'react-native-svg';
import Icon from "react-native-vector-icons/Ionicons";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function Tabs() {
  
  const [articulos, setArticulos] = useState(5);

  const loadCartTotal = async () => {
    try {
      const cartData = await AsyncStorage.getItem('cart');
      const cart = cartData ? JSON.parse(cartData) : {};

      // Sumar todas las cantidades
      const totalQuantity = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

      setArticulos(totalQuantity);
    } catch (error) {
      console.error('Error al cargar el total del carrito:', error);
    }
  };
useFocusEffect(
  useCallback(() => {
    loadCartTotal();
  }, [])
);
  return (
    <Tab.Navigator>
      <Tab.Screen
        name="Productos_all"
        component={Usuario}
        options={{
          headerShown: false,
          tabBarIcon: () => (
            <View>
              <Icon name='home-outline' size={30} color="#000000" />
              
            </View>
          ),
          tabBarLabel: 'Productos',
        }}
      />
      <Tab.Screen
        name="Tiket"
        component={Tiket}
        options={{
          headerShown: false,
          tabBarIcon: () => (
            <Svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
              <Path d="M240-80q-50 0-85-35t-35-85v-120h120v-560l60 60 60-60 60 60 60-60 60 60 60-60 60 60 60-60 60 60 60-60v680q0 50-35 85t-85 35H240Zm480-80q17 0 28.5-11.5T760-200v-560H320v440h360v120q0 17 11.5 28.5T720-160ZM360-600v-80h240v80H360Zm0 120v-80h240v80H360Zm320-120q-17 0-28.5-11.5T640-640q0-17 11.5-28.5T680-680q17 0 28.5 11.5T720-640q0 17-11.5 28.5T680-600Zm0 120q-17 0-28.5-11.5T640-520q0-17 11.5-28.5T680-560q17 0 28.5 11.5T720-520q0 17-11.5 28.5T680-480ZM240-160h360v-80H200v40q0 17 11.5 28.5T240-160Zm-40 0v-80 80Z" />
            </Svg>
          )
        }}
      />
      <Tab.Screen
        name="Carrito"
        component={Carrito}
        options={{
          headerShown: false,
          tabBarIcon: () => (
            
            <View>
               
            <Icon name='cart-outline' size={30} color="#000000" />
            {articulos > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{articulos}</Text>
                </View>
              )}
            </View>
          ),
        }}
      />
      <Tab.Screen
        name="Salir"
        component={Salir}
        options={{
          headerShown: false,
          tabBarIcon: () => (
            <Svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000">
              <Path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z" />
            </Svg>
          )
        }}
      />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Tabs" component={Tabs} />
        <Stack.Screen name="Stack_productos" component={Stack_productos} />
      </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: '#8B5E3C',
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  }
});
