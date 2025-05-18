import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore, collection, query, where, getDocs, collection as subCollection } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../../config_firebase/config";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Tiket() {
  const [productos, setProductos] = useState([]);
  const [nombreMesa, setNombreMesa] = useState('');
  const [cafeteria, setCafeteria] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      const nombre = await AsyncStorage.getItem('nombre_mesa');
      const cafe = await AsyncStorage.getItem('nombre_cafeteria');
      setNombreMesa(nombre);
      setCafeteria(cafe);

      const mesasRef = collection(db, "mesas");
      const mesasQuery = query(mesasRef, where("nombre_mesa", "==", nombre), where("cafeteria", "==", cafe));
      const mesasSnapshot = await getDocs(mesasQuery);

      if (!mesasSnapshot.empty) {
        const mesaDoc = mesasSnapshot.docs[0];
        const pedidosRef = subCollection(db, "mesas", mesaDoc.id, "pedidos_mesas");
        const pedidosSnapshot = await getDocs(pedidosRef);

        const productosData = [];
        pedidosSnapshot.forEach((doc) => {
          productosData.push({ id: doc.id, ...doc.data() });
        });
        setProductos(productosData);
      } else {
        console.log("No se encontró la mesa");
      }
    };

    fetchData();
  }, []);

  const total = productos.reduce(
    (acc, prod) => acc + (prod.precio_unitario * prod.cantidad),
    0
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
                {prod.cantidad} x {prod.pedido} - ${prod.precio_unitario * prod.cantidad}
              </Text>
            </View>
          ))}
          <View style={styles.totalContainer}>
            <Text style={styles.totalText}>TOTAL: ${total.toFixed(2)}</Text>
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
