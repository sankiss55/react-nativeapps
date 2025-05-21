import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable, ScrollView, SafeAreaView } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import HTMLView from 'react-native-htmlview';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode } from 'html-entities';
export default function ProductosInfo({ route }) {
  const [cartTotal, setCartTotal] = useState(0);
  const navigation = useNavigation();
  const { itemId, image, name, price, description, categoria } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [text_input, settext_input] = useState('');

  useEffect(() => {
    // Ocultar la barra de navegación de las tabs
    navigation.setOptions({ tabBarStyle: { display: 'none' } });

    return () => {
      // Restaurar la barra de navegación al salir de la pantalla
      navigation.setOptions({ tabBarStyle: { display: 'flex' } });
    };
  }, [navigation]);

  const increment = () => setQuantity(quantity + 1);
  const decrement = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  useEffect(() => {
    try {
      const sinEtiquetas = description.replace(/<\/?[^>]+(>|$)/g, "");
      const decodificado = decode(sinEtiquetas);
      const limpio = decodificado.trim().replace(/\s+/g, " ");

      // Solo parsea si realmente esperas un JSON en description
      const datos = JSON.parse(limpio);
      settext_input(datos);
      console.info(datos);
    } catch (error) {
      console.error("❌ Error al procesar la descripción:", error.message);
    }
    const loadCartTotal = async () => {
      try {
        const cartData = await AsyncStorage.getItem('cart');
        const cart = cartData ? JSON.parse(cartData) : {};

        // Sumar todas las cantidades
        const totalQuantity = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);

        setCartTotal(totalQuantity);
      } catch (error) {
        console.error('Error al cargar el total del carrito:', error);
      }
    };

    loadCartTotal();
  }, []);

  async function handleAddToCart() {
    try {
      // Obtener el carrito completo (puede ser null si no existe aún)
      const cartData = await AsyncStorage.getItem('cart');
      let cart = cartData ? JSON.parse(cartData) : {};

      // Verificar si el producto ya existe
      if (cart[itemId]) {
        cart[itemId].quantity += quantity;
      } else {
        cart[itemId] = { id: itemId, name, price, quantity, categoria:categoria };
      }

      // Guardar el carrito actualizado
      await AsyncStorage.setItem('cart', JSON.stringify(cart));

      // Calcular total de productos (para el badge)
      const totalQuantity = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
      setCartTotal(totalQuantity);

      console.log(`Producto agregado: ${name}, cantidad en carrito: ${cart[itemId].quantity}`);

      // Reiniciar contador
      setQuantity(1);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Buttons */}
      <View style={styles.container_top}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="#000000">
            <Path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
          </Svg>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.navigate('Carrito')}>
          {cartTotal > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartTotal}</Text>
            </View>
          )}
          <Svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="#000000">
            <Path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z" />
          </Svg>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: image }} style={styles.productImage} />
        <Text style={styles.productName}>{name}</Text>
        <View style={{ marginVertical: 10 }}>

          {Array.isArray(text_input?.articulos) ? (
            <View style={{ marginVertical: 10 }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
                LA PROMO INCLUYE:
              </Text>
              {text_input.articulos.map((item, index) => (
                <View key={index} style={{ marginBottom: 10 }}>
                  <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
                    {item.articulo.nombre}
                  </Text>
                  <Text style={{ color: '#555' }}>{item.descripcion}</Text>
                </View>
              ))}
            </View>
          ) : (
            <HTMLView value={`<div>${description}</div>`} stylesheet={styles.htmlStyles} />
          )}

        </View>


        <View style={styles.quantityContainer}>
          <TouchableOpacity onPress={decrement} style={styles.qtyButton}>
            <Text style={styles.qtyButtonText}>-</Text>
          </TouchableOpacity>

          <Text style={styles.quantityText}>{quantity}</Text>

          <TouchableOpacity onPress={increment} style={styles.qtyButton}>
            <Text style={styles.qtyButtonText}>+</Text>
          </TouchableOpacity>

          <Text style={styles.subtotalText}>Sub total: ${price * quantity}</Text>
        </View>
      </ScrollView>

      {/* Fixed Bottom Buttons */}
      <View style={[styles.buttonsContainer, { marginBottom: '10%' }]}>
        <Pressable style={styles.addButton} onPress={handleAddToCart}>
          <Text style={styles.buttonText}>AGREGAR</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignContent: 'center',
    width: '100%',
    paddingTop: 60,
  },
  container_top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    position: 'absolute',
    top: '5%',
    width: '100%',
    left: '50%',
    transform: [{ translateX: '-50%' }],
    zIndex: 2,
    paddingHorizontal: 20,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 150, // Espacio adicional para evitar que la barra inferior sea tapada
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    width: '100%',
    marginBottom: 40, // Ajuste para que la barra esté más arriba
  },
  addButton: {
    backgroundColor: '#7B4A12',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    flex: 1,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  cartBadge: {
    position: 'absolute',
    backgroundColor: '#7B4A12',
    borderRadius: 20,
    paddingLeft: 8,
    paddingRight: 8,
    zIndex: 99,
    top: -8,
    left: 15,
  },
  cartBadgeText: {
    color: 'white',
    fontWeight: '600',
  },
  productImage: {

    width: '80%',
    height: 300,
    borderRadius: 12,
    marginTop: '20%',
    marginLeft: '50%',
    transform: [{ translateX: '-50%' }],
    marginBottom: 40,
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#000',
  },
  htmlStyles: {
    p: { fontSize: 16, color: '#333', marginBottom: 10 },
    strong: { fontWeight: 'bold' },
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  qtyButton: {
    backgroundColor: '#8B5E3C',
    padding: 10,
    borderRadius: 8,
  },
  qtyButtonText: {
    fontSize: 18,
    color: '#fff',
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtotalText: {
    marginLeft: 'auto',
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
});
