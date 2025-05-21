import React, { useState, useEffect } from 'react';
import { Text, View, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Index() {
    const navigation = useNavigation();

  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (!permission) {
      requestPermission();
    }
  }, []);

  const handleBarCodeScanned = ({ data }) => {
    setScanned(true);
    Alert.alert('Código QR escaneado', `Datos: ${data}`);
navigation.navigate('Productos_all'); 

    // Aquí podrías redirigir al menú o procesar el pedido
  };

  if (!permission?.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.permissionText}>Se necesita acceso a la cámara</Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>Conceder permiso</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bienvenido a Café Roma</Text>
      <Image
        source={require('../../img/logo.png')} 
    style={{ width: 150, height: 150, marginBottom: 20 }}
      />
      <Text style={styles.subtitle}>Para iniciar tu pedido, debes escanear el QR</Text>

      <View style={styles.scannerContainer}>
        <CameraView
          style={styles.camera}
          barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
      </View>

      {scanned && (
        <TouchableOpacity style={styles.scanAgainButton} onPress={() => setScanned(false)}>
          <Text style={styles.scanAgainText}>Escanear de nuevo</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff8f0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 10,
    color: '#4e342e',
  },
  subtitle: {
    fontSize: 16,
    color: '#6d4c41',
    marginBottom: 20,
    textAlign: 'center',
  },
  scannerContainer: {
    width: 250,
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#a1887f',
    marginBottom: 20,
  },
  camera: {
    flex: 1,
  },
  scanAgainButton: {
    backgroundColor: '#8d6e63',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 10,
  },
  scanAgainText: {
    color: 'white',
    fontSize: 16,
  },
  permissionText: {
    fontSize: 16,
    marginBottom: 20,
    color: '#4e342e',
  },
  permissionButton: {
    backgroundColor: '#a1887f',
    padding: 12,
    borderRadius: 10,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
  },
});
