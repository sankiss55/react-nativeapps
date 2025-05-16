import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView } from "react-native";
import { Svg, Path } from 'react-native-svg';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
export default function Carrito() {
  const navigation = useNavigation();
  const [cart, setCart] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
useFocusEffect(
  useCallback(() => {
    const loadCart = async () => {
      try {
        const cartData = await AsyncStorage.getItem('cart');
        const parsedCart = cartData ? JSON.parse(cartData) : {};
        setCart(parsedCart);

        // Calcular total
        const total = Object.values(parsedCart).reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );
        setTotalPrice(total);
      } catch (error) {
        console.error('Error cargando carrito:', error);
      }
    };

    loadCart();
  }, [])
);

  const handleOrderNow = () => {
    AsyncStorage.removeItem('cart');
    setCart({});
    setTotalPrice(0);
  };

  return (
    <View style={styles.container}>
      <View style={styles.container_top}>
        <TouchableOpacity onPress={() => navigation.navigate('Productos_all')}>
          <Svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="#000000">
            <Path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
          </Svg>
        </TouchableOpacity>
      </View>

        <Text style={styles.title}>MI ORDEN</Text>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {Object.values(cart).length === 0 ? (
          <Text style={styles.emptyText}>Tu carrito está vacío.</Text>
        ) : (
          Object.values(cart).map((item, index) => (
  <View key={index} style={styles.itemContainer}>
              <Text style={styles.itemName}>{item.name} X{item.quantity}</Text>
              <Text style={styles.itemName}> ${item.price.toFixed(2)}MX</Text>
              
            </View>
          ))
        )}
      </ScrollView>

      {Object.values(cart).length > 0 && (
        <View style={styles.footer}>
            <Text style={styles.totaltxt}>Precio total:  <Text style={styles.totalText}> ${totalPrice.toFixed(2)}</Text></Text>
         
          <TouchableOpacity style={styles.orderButton} onPress={handleOrderNow}>
            <Text style={styles.orderButtonText}>Pedir Ahora</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container_top: {
    position: 'absolute',
    top: 0,
    width: '100%',
    marginTop: '4%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 10,
    gap: 10,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  container: {
    flex: 1,
    paddingTop: 70,
    backgroundColor: '#f9f9f9',
  },
  title: {
    marginTop: 70,
    fontSize: 40,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  totaltxt:
  {

    fontSize: 20,
    fontWeight:600,
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  itemContainer: {
    padding: 15,
    marginBottom: 12,
    display:'flex', 
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  itemName: {
    
    color:'rgb(153, 153, 153)',
    fontSize: 16,
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopColor: '#ddd',
    borderTopWidth: 1,
  },
  totalText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  orderButton: {
    backgroundColor: '#7B4A12',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
  },
  orderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
