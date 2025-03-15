
import React from 'react';
import { Alert, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRef, useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import * as SQLite from 'expo-sqlite';
import { Switch } from 'react-native-paper';
const db = SQLite.openDatabaseSync('despertador.db');


export default function Alarma() {
  const [alarmas, setAlarmas] = useState([]);
  const [time, setTime] = useState(new Date());
  const [show, setShow] = useState(false);
  const elementoScroll = useRef(null);
  // 📌 Crear la tabla asegurando que la columna `activo` existe
  useEffect(() => {
    db.execAsync(`
      CREATE TABLE IF NOT EXISTS alarmas (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        hora TEXT NOT NULL,
        activo INTEGER NOT NULL DEFAULT 1 
      );
    `)
      .then(() => console.log("✅ Tabla creada correctamente"))
      .catch(error => console.error("❌ Error creando la tabla:", error));

    cargarAlarmas();
  }, []);

  // 📌 Cargar alarmas desde la base de datos
  const cargarAlarmas = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM alarmas');
      setAlarmas(result);
    } catch (error) {
      console.error("❌ Error cargando alarmas:", error);
    }
  };

  // 📌 Guardar una nueva alarma
  const guardar = async (horas, minutos) => {
    const horaFormateada = `${horas}:${minutos < 10 ? '0' + minutos : minutos}`;
    try {
      await db.runAsync("INSERT INTO alarmas (hora, activo) VALUES (?, ?)", [horaFormateada, 1]);  
      cargarAlarmas(); // Recargar lista
    } catch (error) {
      console.error("❌ Error guardando alarma:", error);
    }
  };
  const toggleAlarma = async (id, activo) => {
    try {
      // Cambiar el estado en la base de datos
      const nuevoEstado = activo === 1 ? 0 : 1;
      await db.runAsync("UPDATE alarmas SET activo = ? WHERE id = ?", [nuevoEstado, id]);
  
      // Actualizar el estado en la lista de alarmas
      setAlarmas((prevAlarmas) =>
        prevAlarmas.map((alarma) =>
          alarma.id === id ? { ...alarma, activo: nuevoEstado } : alarma
        )
      );
    } catch (error) {
      console.error("❌ Error al actualizar la alarma:", error);
    }
  };
  const showTimepicker = () => setShow(true);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(53,22,143,255)' }}>
      <StatusBar barStyle='dark-content' backgroundColor="rgba(88,55,186,255)" translucent />

      <View style={{ flexDirection: 'row', backgroundColor: 'rgba(146,106,255,255)', padding: 10, marginTop: StatusBar.currentHeight }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: 'white', fontSize: 20 }}>Alarmas Santiago</Text>
        </View>
        <TouchableOpacity>
          <Icon name='menu-outline' size={30} style={{ color: 'white' }} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, padding: 2, position: 'relative' }}>
        <ScrollView ref={elementoScroll} style={{ backgroundColor: 'rgb(67, 0, 138)', flexDirection: 'column' }}>
          {alarmas.map((alarma) => (
            <View key={alarma.id}  style={[
              styles.alarma, 
              { backgroundColor: alarma.activo === 1 ? 'green' : 'red' } // Cambia el color según el estado
            ]}>
              <Text style={styles.horaTexto}>⏰ {alarma.hora} {alarma.activo ? '✅' : '❌'}</Text>
              <Switch
  value={alarma.activo === 1}
  onValueChange={() => toggleAlarma(alarma.id, alarma.activo)}
/>
            </View>
            
          ))}
        </ScrollView>

        <TouchableOpacity onPress={showTimepicker} style={styles.botonAgregar}>
          <Icon style={{ color: 'white', padding: 10 }} name='add-outline' size={55} />
        </TouchableOpacity>

        {show && (
          <DateTimePicker
            isVisible={show}
            mode="time"
            is24Hour={true}
            onConfirm={(selectedDate) => {
              guardar(selectedDate.getHours(), selectedDate.getMinutes());
              setShow(false);
              setTime(selectedDate);
            }}
            onCancel={() => setShow(false)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

// 📌 Estilos de la app
const styles = StyleSheet.create({
  alarma: {
    height: 80,
    backgroundColor: 'rgba(146,106,255,255)',
    borderRadius: 20,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  horaTexto: {
    
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  botonAgregar: {
    backgroundColor: 'rgba(162,71,252,255)',
    shadowOpacity: 0.7,
    shadowColor: '#000',
    shadowRadius: 10,
    elevation: 10,
    borderRadius: 25,
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});
