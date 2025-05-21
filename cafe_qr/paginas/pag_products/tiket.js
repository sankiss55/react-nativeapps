import React, { useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

export default function Tiket() {
  const [productos, setProductos] = useState([]);
  const [nombreMesa, setNombreMesa] = useState('');
  const [cafeteria, setCafeteria] = useState('');

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const nombre = await AsyncStorage.getItem('nombre_mesa');
        const cafe = await AsyncStorage.getItem('nombre_cafeteria');
        setNombreMesa(nombre);
        setCafeteria(cafe);

        // Recuperar los pedidos realizados desde AsyncStorage
        const pedidosRealizados = await AsyncStorage.getItem('pedidos_realizados');
        console.error(pedidosRealizados);
        const parsedPedidos = pedidosRealizados ? JSON.parse(pedidosRealizados) : {};

        // Convertir el array de objetos en un array plano de productos
        const pedidosArray = pedidosRealizados
          ? JSON.parse(pedidosRealizados).flatMap((pedido) => Object.values(pedido))
          : [];
        console.info(pedidosArray);
        setProductos(pedidosArray);
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
          {productos.map((prod, index) => (
            <View key={index} style={styles.lineItem}>
              <Text style={styles.itemText}>
                {prod.name} x {prod.quantity} - ${prod.price * prod.quantity}
              </Text>
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>
              TOTAL: ${productos.reduce((acc, prod) => acc + prod.price * prod.quantity, 0).toFixed(2)}
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
});
