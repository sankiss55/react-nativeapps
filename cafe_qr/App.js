import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Index from './paginas/pag_init';
import Tabs from './paginas/pag_products/tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createNavigationContainerRef } from '@react-navigation/native';
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from "./config_firebase/config";

const Stack = createNativeStackNavigator();
export const navigationRef = createNavigationContainerRef();

export default function App() {
  // Listener para navegación y para cuando se monta la app
  const handleStateChange = async (state) => {
    const currentRoute = state?.routes?.[state.index]?.name;
    if (!state || currentRoute === "Index") {
      const userId = await AsyncStorage.getItem('id_usuario');
      if (userId) {
        try {
          const app = initializeApp(firebaseConfig);
          const db = getFirestore(app);
          const pedidosRef = collection(db, "pedidos");
          const q = query(pedidosRef, where("id_usuario", "==", userId));
          const snapshot = await getDocs(q);

          if (!snapshot.empty) {
            navigationRef.current?.reset({
              index: 0,
              routes: [{ name: "Tabs" }],
            });
          }
        } catch (e) {
          // Manejo de error opcional
        }
      }
    }
  };

  // Ejecutar al montar la app
  React.useEffect(() => {
    handleStateChange({});
  }, []);

  return (
    <NavigationContainer ref={navigationRef} onStateChange={handleStateChange}>
      <Stack.Navigator initialRouteName="Index">
        <Stack.Screen name="Index" component={Index} options={{ headerShown: false }} />
        <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
