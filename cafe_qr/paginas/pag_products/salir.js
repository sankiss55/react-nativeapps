import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function Salir({ navigation }) {
  const handleSalir = () => {
    // Lógica para cerrar sesión o salir
    console.log('Usuario ha salido');
    // Redirigir a la pantalla de inicio o login
    navigation.replace('Index'); // Asegúrate de tener una pantalla llamada 'Login'
  };

  const handleCancelar = () => {
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Estás seguro de que deseas salir?</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.buttonSalir} onPress={handleSalir}>
          <Text style={styles.buttonText}>Salir</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.buttonCancelar} onPress={handleCancelar}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFE699',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#A56C46',
    textAlign: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  buttonSalir: {
    backgroundColor: '#A56C46',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginRight: 10,
    alignItems: 'center',
  },
  buttonCancelar: {
    backgroundColor: '#999',
    padding: 15,
    borderRadius: 10,
    flex: 1,
    marginLeft: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
