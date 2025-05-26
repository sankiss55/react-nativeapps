import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Pressable, ScrollView, SafeAreaView, Alert } from 'react-native';
import { Svg, Path } from 'react-native-svg';
import HTMLView from 'react-native-htmlview';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { decode } from 'html-entities';
import { AlertNotificationRoot, Toast } from 'react-native-alert-notification';
export default function ProductosInfo({ route }) {
  const [cartTotal, setCartTotal] = useState(0);
  const navigation = useNavigation();
  const { itemId, image, name, price, description, categoria } = route.params;
  const [quantity, setQuantity] = useState(1);
  const [text_input, settext_input] = useState('');
  const [selectedOptions, setSelectedOptions] = useState({});

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

      console.info(limpio);
      // Solo parsea si realmente esperas un JSON en description
      const datos = JSON.parse(limpio);
      settext_input(datos);
      console.info(datos);
      
      // Inicializar las opciones seleccionadas por defecto
      if (datos && datos.articulos) {
        const initialOptions = {};
        datos.articulos.forEach((item, index) => {
          if (item.articulo.opciones && item.articulo.opciones.length > 0) {
            initialOptions[index] = item.articulo.opciones[0].id_articulo;
          }
        });
        setSelectedOptions(initialOptions);
      }
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

  const handleOptionSelect = (articuloIndex, optionId) => {
    setSelectedOptions(prev => ({
      ...prev,
      [articuloIndex]: optionId
    }));
  };

  async function handleAddToCart() {
    try {
      // Verificar si hay opciones que seleccionar
      if (text_input && text_input.articulos) {
        const hasOptions = text_input.articulos.some(item => 
          item.articulo.opciones && item.articulo.opciones.length > 0
        );
        
        if (hasOptions) {
          // Verificar que todas las opciones necesarias están seleccionadas
          const allOptionsSelected = text_input.articulos.every((item, index) => {
            return !item.articulo.opciones || selectedOptions[index];
          });
          
          if (!allOptionsSelected) {
            Alert.alert("Por favor", "Selecciona todas las opciones requeridas para esta promoción");
            return;
          }
        }
      }
      
      // Obtener el carrito completo (puede ser null si no existe aún)
      const cartData = await AsyncStorage.getItem('cart');
      let cart = cartData ? JSON.parse(cartData) : {};

      // Verificar si estamos tratando con una promoción (tiene opciones seleccionables)
      const isPromotion = text_input && text_input.articulos && Array.isArray(text_input.articulos) && 
                        text_input.articulos.some(item => item.articulo.opciones && item.articulo.opciones.length > 0);
      
      // Para promociones, generar un ID único para cada adición al carrito
      const cartItemId = isPromotion 
        ? `${itemId}-${Object.values(selectedOptions).join('-')}-${Date.now()}`  // Añadir timestamp para hacerlo único
        : Object.keys(selectedOptions).length > 0 
          ? `${itemId}-${Object.values(selectedOptions).join('-')}`
          : itemId;

      // Crear una descripción detallada de las opciones seleccionadas
      let selectedOptionsDetail = {};
      if (text_input && text_input.articulos) {
        text_input.articulos.forEach((item, index) => {
          if (item.articulo.opciones && selectedOptions[index]) {
            // Buscar la opción seleccionada para obtener su nombre
            const selectedOption = item.articulo.opciones.find(
              option => option.id_articulo === selectedOptions[index]
            );
            if (selectedOption) {
              selectedOptionsDetail[index] = {
                id: selectedOptions[index],
                nombre: selectedOption.nombre,
                descripcion: selectedOption.descripcion || "Sin descripción",
                precio: selectedOption.precio || 0
              };
            }
          } else if (item.articulo.nombre) {
            // Si no tiene opciones pero tiene nombre
            selectedOptionsDetail[index] = {
              id: item.articulo.id_articulo,
              nombre: item.articulo.nombre,
              descripcion: item.articulo.descripcion || "Sin descripción",
              precio: item.articulo.precio || 0
            };
          }
        });
      }

      // Verificar si el producto ya existe (solo para productos no promocionales)
      if (!isPromotion && cart[cartItemId]) {
        cart[cartItemId].quantity += quantity;
        console.error(cart[cartItemId]);
      } else {
        cart[cartItemId] = { 
          id: itemId, 
          name, 
          price, 
          quantity, 
          categoria: categoria, 
          description: text_input,
          selectedOptions: selectedOptions,
          selectedOptionsDetail: selectedOptionsDetail, // Añadir los detalles de las opciones
          isPromotion: isPromotion // Marcar si es promoción para futura referencia
        };
      }
      // Guardar el carrito actualizado
      await AsyncStorage.setItem('cart', JSON.stringify(cart));

      // Calcular total de productos (para el badge)
      const totalQuantity = Object.values(cart).reduce((sum, item) => sum + item.quantity, 0);
      setCartTotal(totalQuantity);

      console.log(`Producto agregado: ${name}, cantidad en carrito: ${cart[cartItemId].quantity}`);
      console.log('Opciones seleccionadas:', selectedOptionsDetail);
      
      // Reiniciar contador
      setQuantity(1);
      
      Toast.show({
        type: 'INFO',
        title: 'Producto agregado al carrito',
        textBody: `${name} (${quantity} unidades) ha sido agregado al carrito.`,
        duration: 3000,
      });
    
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
    }
  }

  const renderArticulosPromo = () => {
    if (!Array.isArray(text_input?.articulos)) return null;

    return (
      <View style={{ marginVertical: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 20 }}>
          LA PROMO INCLUYE:
        </Text>
        {text_input.articulos.map((item, index) => (
          <View key={index} style={{ marginBottom: 20, padding: 10, backgroundColor: '#f9f9f9', borderRadius: 8 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 16 }}>
              Producto {index + 1}: {item.articulo.nombre || (item.articulo.opciones && "Opciones disponibles:")}
            </Text>
            <Text style={{ color: '#555', marginBottom: 8 }}>{item.descripcion}</Text>
            
            {/* Mostrar opciones si existen */}
            {item.articulo.opciones && item.articulo.opciones.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontWeight: 'bold', color: '#7B4A12', marginBottom: 5 }}>Selecciona una opción para Producto {index + 1}:</Text>
                {item.articulo.opciones.map((opcion) => (
                  <TouchableOpacity 
                    key={opcion.id_articulo}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 10,
                      backgroundColor: selectedOptions[index] === opcion.id_articulo ? '#e0d3c5' : 'transparent',
                      borderRadius: 5,
                      marginBottom: 5
                    }}
                    onPress={() => handleOptionSelect(index, opcion.id_articulo)}
                  >
                    <View style={{
                      width: 20,
                      height: 20,
                      borderRadius: 10,
                      borderWidth: 2,
                      borderColor: '#7B4A12',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 10
                    }}>
                      {selectedOptions[index] === opcion.id_articulo && (
                        <View style={{
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: '#7B4A12'
                        }} />
                      )}
                    </View>
                    <View>
                      <Text style={{ fontWeight: 'bold' }}>{opcion.nombre}</Text>
                      {opcion.descripcion && opcion.descripcion !== "Sin descripción" && (
                        <Text style={{ color: '#555', fontSize: 12 }}>{opcion.descripcion}</Text>
                      )}
                      {opcion.precio && (
                        <Text style={{ color: '#7B4A12', fontSize: 12 }}>Descripción: {opcion.descripcion}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        ))}
        {text_input.precio_total && (
          <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#7B4A12', marginTop: 10 }}>
            Valor total de la promoción: ${text_input.precio_total}
          </Text>
        )}
      </View>
    );
  };

  return (
    <AlertNotificationRoot>
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
         <Svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="#000000"><Path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z"/></Svg>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: image }} style={styles.productImage} />
        <Text style={styles.productName}>{name}</Text>
        <View style={{ marginVertical: 10 }}>

          {Array.isArray(text_input?.articulos) ? (
            renderArticulosPromo()
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
    </AlertNotificationRoot>
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
