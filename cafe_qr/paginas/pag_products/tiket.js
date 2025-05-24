import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { getFirestore, collection, query, where, onSnapshot } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../../config_firebase/config";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Tiket() {
  const [productos, setProductos] = useState([]);
  const [nombreMesa, setNombreMesa] = useState('');
  const [cafeteria, setCafeteria] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const nombre = await AsyncStorage.getItem('nombre_mesa');
        const cafe = await AsyncStorage.getItem('nombre_cafeteria');
        const idUsuario = await AsyncStorage.getItem('id_usuario'); // Obtener el id_usuario
        setNombreMesa(nombre);
        setCafeteria(cafe);

        if (idUsuario) {
          try {
            // Configurar oyente en tiempo real
            const pedidosRef = collection(db, "pedidos");
            const q = query(pedidosRef, where("id_usuario", "==", idUsuario));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
              const pedidosArray = querySnapshot.docs.map(doc => doc.data());

              // Procesar los productos para agrupar promociones
              const productosProcesados = pedidosArray.reduce((acc, prod) => {
                if (prod.promo) {
                  const [promoName, promoId] = prod.promo.split('|');
                  const promoGroup = acc.find(item => item.promoId === promoId);
                  if (promoGroup) {
                    promoGroup.items.push(prod);
                    promoGroup.total += prod.precio_unitario * prod.cantidad;
                    promoGroup.quantity += prod.cantidad;
                  } else {
                    acc.push({ promoName, promoId, total: prod.precio_unitario * prod.cantidad, quantity: prod.cantidad, items: [prod] });
                  }
                } else {
                  acc.push(prod);
                }
                return acc;
              }, []);

              setProductos(productosProcesados);
            });

            return () => unsubscribe(); // Limpiar el oyente al desmontar
          } catch (error) {
            console.error("Error al obtener los pedidos:", error);
          }
        }
      };

      fetchData();
    }, [])
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Ticket de Pedido</Text>
      <Text style={styles.subtitle}>Mesa: {nombreMesa} | {cafeteria}</Text>
      <View style={styles.divider} />

      {productos.length > 0 ? (
        <>
          {productos.map((prod, index) => {
            if (prod.promoName) {
              // Renderizar promociones
              return (
                <View key={index} style={styles.promoContainer}>
                  <Text style={styles.promoTitle}>
                    Promoción: {prod.promoName}  - ${prod.total.toFixed(2)}
                  </Text>
                 
                  {prod.items.map((item, idx) => (
                    <Text key={idx} style={styles.itemText}>
                      {item.pedido}
                    </Text>
                  ))}
                </View>
              );
            } else {
              // Renderizar productos normales
              return (
                <View key={index} style={styles.lineItem}>
                  <Text style={styles.itemText}>
                    {prod.pedido} x {prod.cantidad} - ${prod.precio_unitario * prod.cantidad}
                  </Text>
                </View>
              );
            }
          })}
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              TOTAL: ${productos.reduce((acc, prod) => {
                if (prod.promoName) {
                  return acc + prod.total;
                }
                return acc + prod.precio_unitario * prod.cantidad;
              }, 0).toFixed(2)}
            </Text>
          </View>
        </>
      ) : (
        <Text style={styles.empty}>No hay productos aún para esta mesa.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#F8F4EF",
    flex: 1,
  },
  title: {
    marginTop: '10%',
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    color: "#3E2C18",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B4F3F",
    marginBottom: 10,
  },
  divider: {
    borderBottomWidth: 1,
    borderColor: "#D3C2A0",
    marginVertical: 10,
  },
  lineItem: {
    marginBottom: 8,
  },
  itemText: {
    fontSize: 16,
    color: "#3E2C18",
  },
  totalContainer: {
    marginTop: 30,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#D3C2A0",
  },
  totalText: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: "#3E2C18",
  },
  empty: {
    textAlign: "center",
    color: "#999",
    fontStyle: "italic",
    marginTop: 30,
  },
  promoContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: "#F0E6D2",
    borderRadius: 5,
  },
  promoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3E2C18",
    marginBottom: 5,
  },
});
