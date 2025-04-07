import React, { useEffect } from 'react';
import { View, Text, Button } from 'react-native';
import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export default function CustomTimePicker() {

  useEffect(() => {
    const getNotificationPermission = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        console.log(status);
        if (status === 'granted') {
          console.log('Permiso concedido para notificaciones');
        } else {
          console.log('Permiso denegado para notificaciones');
        }
      } catch (error) {
        console.error('Error al solicitar permiso de notificación:', error);
      }
    };

    getNotificationPermission();
  }, []);

  // Función para enviar una notificación local
  const sendNotification = async () => {
    try {
      // Calcula la fecha y hora para dentro de 5 segundos
      const triggerDate = new Date(Date.now() + 2000);
  
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "¡Hola!",
          body: "Esta es una notificación push local en Expo.",
          sound: './alarma.mp3',  // Ruta completa del sonido
        },
        trigger: triggerDate,  // Configura la fecha y hora para el disparo de la notificación
      });
      console.log('Notificación programada correctamente');
    } catch (error) {
      console.error('Error al enviar la notificación:', error);
    }
  };

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Notificación Local con Expo</Text>
      <Button title="Enviar notificación local" onPress={sendNotification} />
    </View>
  );
}
