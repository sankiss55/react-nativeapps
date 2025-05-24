import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { SelectList } from 'react-native-dropdown-select-list';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';
import firebaseConfig from '../../config_firebase/config';

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function CrearQR() {
  const [mesas, setMesas] = useState([]);
  const [cafeterias, setCafeterias] = useState([]);
  const [selectedMesa, setSelectedMesa] = useState('');
  const [selectedCafeteria, setSelectedCafeteria] = useState('');
  const [tipo, setTipo] = useState('');
  const qrRef = useRef();

  useEffect(() => {
    const fetchCafeterias = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'cafeteria'));
        const cafeteriasData = querySnapshot.docs.map(doc => ({
          key: doc.id,
          value: doc.data().cafeteria,
        }));
        setCafeterias(cafeteriasData);
      } catch (error) {
        console.error('Error al obtener cafeterías:', error);
      }
    };

    fetchCafeterias();
  }, []);

  useEffect(() => {
    const fetchMesas = async () => {
      if (selectedCafeteria) {
        try {
          const q = query(collection(db, 'mesas'), where('cafeteria', '==', selectedCafeteria));
          const querySnapshot = await getDocs(q);
          const mesasData = querySnapshot.docs.map(doc => ({
            key: doc.id,
            value: doc.data().nombre_mesa,
          }));
          setMesas(mesasData);
        } catch (error) {
          console.error('Error al obtener mesas:', error);
        }
      }
    };

    fetchMesas();
  }, [selectedCafeteria]);

  const qrValue = tipo === 'parallevar'
    ? `mesa:parallevar|cafeteria:${cafeterias.find(cafeteria => cafeteria.value === selectedCafeteria)?.key}`
    : `mesa:${mesas.find(mesa => mesa.key === selectedMesa)?.value}|cafeteria:${cafeterias.find(cafeteria => cafeteria.value === selectedCafeteria)?.key}`;

  const downloadQR = () => {
    if (qrRef.current) {
      qrRef.current.toDataURL((data) => {
        const filePath = `${FileSystem.cacheDirectory}qr_code.png`;
        FileSystem.writeAsStringAsync(filePath, data, {
          encoding: FileSystem.EncodingType.Base64,
        })
          .then(() => {
            Sharing.shareAsync(filePath)
              .then(() => ToastAndroid.show('QR compartido correctamente', ToastAndroid.SHORT))
              .catch(() => ToastAndroid.show('No se pudo compartir el QR', ToastAndroid.SHORT));
          })
          .catch(() => ToastAndroid.show('No se pudo guardar el QR', ToastAndroid.SHORT));
      });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Generador de QR</Text>

      <SelectList
        setSelected={(key) => {
          const selected = cafeterias.find(cafeteria => cafeteria.key === key);
          setSelectedCafeteria(selected ? selected.value : '');
        }}
        data={cafeterias}
        placeholder="Selecciona una cafetería"
        boxStyles={styles.selectList}
      />

      <SelectList
        setSelected={setTipo}
        data={[
          { key: 'mesa', value: 'Mesa' },
          { key: 'parallevar', value: 'Para llevar' },
        ]}
        placeholder="Selecciona el tipo"
        boxStyles={styles.selectList}
      />

      {tipo === 'mesa' && (
        <SelectList
          setSelected={setSelectedMesa}
          data={mesas}
          placeholder="Selecciona una mesa"
          boxStyles={styles.selectList}
          disabled={!selectedCafeteria}
        />
      )}

      {tipo && selectedCafeteria ? (
        <View style={styles.qrContainer}>
          <QRCode value={qrValue} size={200} getRef={qrRef} />
          <TouchableOpacity style={styles.downloadButton} onPress={downloadQR}>
            <Text style={styles.downloadButtonText}>Descargar QR</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <Text style={styles.instruction}>Selecciona todos los campos para generar el QR</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  selectList: {
    borderRadius: 5,
    borderColor: '#ccc',
    marginVertical: 10,
  },
  qrContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  qrText: {
    marginTop: 10,
    fontSize: 16,
  },
  instruction: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
  downloadButton: {
    marginTop: 20,
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
