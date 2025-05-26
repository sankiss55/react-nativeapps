import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput, Alert, Modal } from "react-native";
import { Svg, Path } from 'react-native-svg';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { getFirestore, collection, query, where, getDocs, addDoc, doc, setDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../../config_firebase/config";
import accessToken from "../../config_loyverce/config";
import { AlertNotificationRoot, ALERT_TYPE, Toast, Dialog } from 'react-native-alert-notification';

export default function Carrito() {
  
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);
  const navigation = useNavigation();
  const [text_input, settext_input]=useState('');
  const [cart, setCart] = useState({});
  const [totalPrice, setTotalPrice] = useState(0);
  const [clientName, setClientName] = useState('');
  const [modalVisible, setModalVisible] = useState(false); // Estado para controlar la visibilidad del modal
  const [nameError, setNameError] = useState(''); // Estado para controlar errores de validación

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

  // Diálogo personalizado para solicitar nombre del cliente
  const CustomNameDialog = () => {
    // Estado local para el input dentro del modal para evitar re-renders del componente principal
    const [localClientName, setLocalClientName] = useState(clientName);
    const [localNameError, setLocalNameError] = useState('');
    
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIcon}>
              <Svg xmlns="http://www.w3.org/2000/svg" height="40" viewBox="0 -960 960 960" width="40" fill="#8B5E3C">
                <Path d="M480-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM160-160v-112q0-34 17.5-62.5T224-378q62-31 126-46.5T480-440q66 0 130 15.5T736-378q29 14 46.5 42.5T800-272v112H160Z"/>
              </Svg>
            </View>
            <Text style={styles.modalTitle}>Pedido para llevar</Text>
            <Text style={styles.modalText}>Por favor, ingresa tu nombre para identificar tu pedido:</Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="Nombre"
              value={localClientName}
              onChangeText={(text) => {
                setLocalClientName(text);
                setLocalNameError('');
              }}
              autoCapitalize="words"
            />
            
            {localNameError ? <Text style={styles.errorText}>{localNameError}</Text> : null}
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  setLocalClientName('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]}
                onPress={async () => {
                  if (!localClientName || localClientName.trim() === '') {
                    setLocalNameError('Por favor ingresa tu nombre');
                  } else {
                    // Actualizar el estado principal antes de cerrar el modal
                    setClientName(localClientName);
                    setModalVisible(false);
                    
                    // Obtener el carrito desde AsyncStorage de manera asíncrona
                    try {
                      const cartData = await AsyncStorage.getItem('cart');
                      const parsedCart = cartData ? JSON.parse(cartData) : {};
                      // Continuar con el proceso del pedido con el carrito recuperado
                      processOrder(parsedCart, "parallevar", localClientName);
                    } catch (error) {
                      console.error("Error al recuperar el carrito:", error);
                      alert("Error al procesar el carrito. Inténtalo nuevamente.");
                    }
                  }
                }}
              >
                <Text style={styles.confirmButtonText}>Continuar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    );
  };

  // Definición de la función handleOrderNow modificada para usar el diálogo personalizado
  const handleOrderNow = async () => {
    try {
      const app = initializeApp(firebaseConfig);
      const db = getFirestore(app);

      const cartData = await AsyncStorage.getItem('cart');
      const parsedCart = cartData ? JSON.parse(cartData) : {};
      console.log('Parsed Cart:', parsedCart);

      if (Object.keys(parsedCart).length === 0) {
        alert("Tu carrito está vacío.");
        return;
      }

      // Verificar si es un pedido para llevar
      const mesa = await AsyncStorage.getItem('nombre_mesa');
      if (mesa === "parallevar") {
        // Mostrar modal personalizado para pedir nombre
        setModalVisible(true);
        // El procesamiento continúa en el manejador del botón "Continuar" del modal
      } else {
        // Si no es para llevar, continuar con el proceso normal
        processOrder(parsedCart, mesa, '');
      }
    } catch (error) {
      console.error("Error al enviar el pedido:", error);
      alert("Hubo un error al procesar tu pedido.");
    }
  };

  // Función modificada para manejar la validación desde nuestro modal personalizado
  const processOrder = async (parsedCart, mesa, clientNameInput) => {
    try {
      // Usar el nombre del cliente proporcionado o el estado actual
      const finalClientName = clientNameInput || clientName;
      
      // Verificar que parsedCart es un objeto válido
      if (!parsedCart || typeof parsedCart !== 'object' || Object.keys(parsedCart).length === 0) {
        console.error('Carrito inválido o vacío:', parsedCart);
        alert("Tu carrito está vacío o no es válido.");
        return;
      }

      // Verificar si algún producto tiene descripción con array
      const expandedCart = [];
      for (const item of Object.values(parsedCart)) {
        const numeroRandom = Math.floor(1000000000 + Math.random() * 9000000000);
        
        // Verificar si es una promoción con estructura antigua o nueva
        const isLegacyPromo = item.description && Array.isArray(item.description.articulos);
        const isNewPromo = item.selectedOptionsDetail && Object.keys(item.selectedOptionsDetail).length > 0;
        
        // Formateamos la descripción basada en las opciones seleccionadas (para nueva estructura)
        let itemDescription = "";
        
        if (isNewPromo) {
          const optionsText = Object.values(item.selectedOptionsDetail)
            .map(option => `${option.nombre}${option.descripcion && option.descripcion !== "Sin descripción" ? ` (${option.descripcion})` : ""}`)
            .join(", ");
          
          itemDescription = `Opciones seleccionadas: ${optionsText}`;
        }
        
        // Procesar promociones con la estructura antigua (description.articulos)
        if (isLegacyPromo) {
          for (const articulo of item.description.articulos) {
            try {
              // Buscar si hay opción seleccionada para este artículo
              let nombreArticulo = articulo.articulo.nombre || "";
              let descripcionArticulo = articulo.descripcion || "";
              let articuloId = articulo.articulo.id_articulo;
              
              // Si hay un ID de artículo seleccionado en las opciones
              if (item.selectedOptions) {
                const articuloIndex = item.description.articulos.indexOf(articulo);
                const selectedOptionId = item.selectedOptions[articuloIndex];
                
                // Si hay una opción seleccionada para este artículo específico
                if (selectedOptionId && articulo.articulo.opciones) {
                  const selectedOption = articulo.articulo.opciones.find(
                    option => option.id_articulo === selectedOptionId
                  );
                  
                  if (selectedOption) {
                    nombreArticulo = selectedOption.nombre;
                    descripcionArticulo = selectedOption.descripcion !== "Sin descripción" 
                      ? selectedOption.descripcion 
                      : descripcionArticulo;
                    articuloId = selectedOptionId;
                  }
                }
              }
              
              // Realizar petición a la API de Loyverse para obtener todos los productos
              const response = await fetch(`https://api.loyverse.com/v1.0/items`, {
                method: 'GET',
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              });

              if (!response.ok) {
                const errorBody = await response.json();
                console.error(`Error al obtener productos para ${nombreArticulo}:`, errorBody);
                continue;
              }

              const productsData = await response.json();
              
              // Filtrar el producto por id_articulo
              const product = productsData.items.find(
                (prod) => prod.id === articuloId
              );

              if (!product) {
                console.error(`No se encontró el producto con id ${articuloId}`);
                continue;
              }

              // Información adicional para la promoción
              const promoInfo = `${item.name}|${numeroRandom}|${item.price}`;
              
              expandedCart.push({
                id: articuloId,
                name: nombreArticulo,
                price: item.price / item.description.articulos.length,
                quantity: item.quantity,
                categoria: item.categoria,
                descripcion: descripcionArticulo, 
                promo: promoInfo,
                originalPromoName: item.name,
                promoId: numeroRandom
              });
            } catch (error) {
              console.error(`Error inesperado al procesar ${articulo.articulo.nombre || "artículo"}:`, error);
              continue;
            }
          }
        } 
        // Procesar promociones con la nueva estructura o productos normales
        else {
          expandedCart.push({
            ...item,
            descripcion: isNewPromo ? itemDescription : item.descripcion || null,
            // Asegúrate de que la categoría esté definida
            categoria: item.categoria || "default"
          });
        }
      }
      
      console.log('Expanded Cart:', expandedCart);

      // Procesamiento adicional para identificar productos de la misma promoción
      const promoGroups = {};
      for (const item of expandedCart) {
        if (item.promoId) {
          if (!promoGroups[item.promoId]) {
            promoGroups[item.promoId] = {
              name: item.originalPromoName,
              items: []
            };
          }
          promoGroups[item.promoId].items.push(item);
        }
      }
      
      // Log para verificar los grupos de promociones
      console.log('Promociones agrupadas:', promoGroups);

      // Procesar el carrito expandido
      const nombreCafeteria = await AsyncStorage.getItem('nombre_cafeteria');
      const usuariosRef = collection(db, "usuarios");
      const q = query(usuariosRef, where("cafeteria", "==", nombreCafeteria));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        alert("No se encontraron usuarios asociados a esta cafetería.");
        return;
      }

      const filteredUsers = querySnapshot.docs.filter((doc) => doc.data().campo !== "admin");
      if (filteredUsers.length === 0) {
        alert("No se encontraron usuarios válidos para procesar el pedido.");
        return;
      }

      const addPromises = [];
      for (const docSnapshot of filteredUsers) {
        const userData = docSnapshot.data();
        const userId = docSnapshot.id;

        const hasCategory = expandedCart.some((item) =>
          Array.isArray(userData.categorias) && userData.categorias.includes(item.categoria)
        );

        if (hasCategory) {
          const pedidosRef = collection(db, "usuarios", userId, "pedidos_usuarios");
          const pedidosGlobalRef = collection(db, "pedidos");
          const nombre_cafeteria = await AsyncStorage.getItem('nombre_cafeteria');
          const id_usuario = await AsyncStorage.getItem('id_usuario');
          
          // Si es parallevar, agregar el nombre del cliente al nombre de mesa
          const mesaFinal = mesa === "parallevar" && finalClientName 
            ? `parallevar - ${finalClientName}`
            : mesa;

          for (const item of expandedCart) {
            const pedidoDocRef = doc(pedidosRef);
            const pedidoId = pedidoDocRef.id;

            addPromises.push(
              setDoc(pedidoDocRef, {
                id_producto: item.id,
                pedido: item.name,
                cantidad: item.quantity,
                precio_unitario: item.price,
                atendido: false,
                mesa: mesaFinal,
                nombre_cafeteria,
                id_usuario,
                promo: item.promo ?? null,
                descripcion: item.descripcion || null,
              })
            );

            addPromises.push(
              setDoc(doc(pedidosGlobalRef, pedidoId), {
                id_producto: item.id,
                pedido: item.name,
                cantidad: item.quantity,
                precio_unitario: item.price,
                atendido: false,
                mesa: mesaFinal,
                nombre_cafeteria,
                id_usuario,
                categoria: item.categoria,
                descripcion: item.descripcion || null,
                fecha: new Date().toISOString(),
                promo: item.promo ?? null,
              })
            );
          }

          if (text_input !== '') {
            const observacionesRef = collection(db, "usuarios", userId, "observaciones");
            const qrSessionId = await AsyncStorage.getItem('id_usuario');
            addPromises.push(
              addDoc(observacionesRef, {
                observacion: `${text_input} `,
                id_usuario: qrSessionId,
                fecha: new Date().toISOString(),
              })
            );
          }
        }
      }

      await Promise.all(addPromises);

      const existingPedidos = await AsyncStorage.getItem('pedidos_realizados');
      let parsedPedidos = existingPedidos ? JSON.parse(existingPedidos) : [];
      if (!Array.isArray(parsedPedidos)) {
        parsedPedidos = [];
      }
      parsedPedidos.push(expandedCart);
      await AsyncStorage.setItem('pedidos_realizados', JSON.stringify(parsedPedidos));

      // Mostrar confirmación de éxito con nuestro propio estilo
      Alert.alert(
        "¡Éxito!",
        "¡Pedido realizado con éxito!",
        [
          {
            text: "Cerrar", 
            onPress: () => {
              const availableRoutes = navigation.getState().routeNames;
              if (availableRoutes.includes('Tiket')) {
                navigation.navigate('Tiket');
              } else {
                navigation.goBack();
              }
            }
          }
        ]
      );

      // Limpiar estados
      await AsyncStorage.removeItem('cart');
      setCart({});
      setTotalPrice(0);
      settext_input('');
      setClientName('');
      
    } catch (error) {
      console.error("Error al enviar el pedido:", error);
      alert("Hubo un error al procesar tu pedido.");
    }
  };

  // Función para eliminar un producto del carrito
  const handleRemoveItem = async (itemId) => {
    try {
      // Obtener carrito actual
      const cartData = await AsyncStorage.getItem('cart');
      let currentCart = cartData ? JSON.parse(cartData) : {};
      
      // Verificar si el producto existe
      if (currentCart[itemId]) {
        // Confirmar eliminación
        Alert.alert(
          "Eliminar producto",
          "¿Estás seguro que deseas eliminar este producto del carrito?",
          [
            {
              text: "Cancelar",
              style: "cancel"
            },
            {
              text: "Eliminar",
              onPress: async () => {
                // Eliminar el producto del objeto del carrito
                delete currentCart[itemId];
                
                // Guardar el carrito actualizado
                await AsyncStorage.setItem('cart', JSON.stringify(currentCart));
                
                // Actualizar el estado
                setCart(currentCart);
                
                // Recalcular total
                const newTotal = Object.values(currentCart).reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                );
                setTotalPrice(newTotal);
              },
              style: "destructive"
            }
          ]
        );
      }
    } catch (error) {
      console.error('Error al eliminar del carrito:', error);
    }
  };

  // Función para renderizar los detalles de un producto según su tipo
  const renderItemDetails = (item) => {
    // Verificar si es una promoción con opciones seleccionadas (nueva estructura)
    if (item.selectedOptionsDetail && Object.keys(item.selectedOptionsDetail).length > 0) {
      return (
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>Opciones seleccionadas:</Text>
          {Object.values(item.selectedOptionsDetail).map((option, idx) => (
            <Text key={idx} style={styles.optionItem}>
              • {option.nombre}
              {option.descripcion && option.descripcion !== "Sin descripción" 
                ? ` (${option.descripcion})` 
                : ""}
            </Text>
          ))}
        </View>
      );
    }
    // Verificar si es una promoción con estructura antigua
    else if (item.description && Array.isArray(item.description.articulos)) {
      return (
        <View style={styles.optionsContainer}>
          <Text style={styles.optionsTitle}>La promoción incluye:</Text>
          {item.description.articulos.map((articulo, idx) => {
            // Buscar si tiene una opción seleccionada
            const selectedOption = item.selectedOptions && item.selectedOptions[idx] && articulo.articulo.opciones
              ? articulo.articulo.opciones.find(
                  opt => opt.id_articulo === item.selectedOptions[idx]
                )
              : null;
            
            return (
              <Text key={idx} style={styles.optionItem}>
                • {selectedOption 
                    ? selectedOption.nombre
                    : (articulo.articulo.nombre || `Producto ${idx + 1}`)}
                {(selectedOption && selectedOption.descripcion && selectedOption.descripcion !== "Sin descripción") ||
                 (articulo.descripcion && articulo.descripcion !== "Sin descripción")
                  ? ` (${selectedOption?.descripcion || articulo.descripcion})`
                  : ""}
              </Text>
            );
          })}
        </View>
      );
    }
    
    return null;
  };
  
  return (
    <AlertNotificationRoot
      theme="light" // Optional: 'light', 'dark', or omit for auto
      colors={[
        {
          label: '#000000',
          card: '#ffffff',
          overlay: '#00000080',
          success: '#8B5E3C',     
          danger: '#ff0000',
          warning: '#ffa500',
        },
        {
          label: '#ffffff',
          card: '#1e1e1e',
          overlay: '#00000080',
          success: '#8B5E3C',     
          danger: '#ff4444',
          warning: '#ffbb33',
        },
      ]}
    >
      <View style={styles.container}>
        {/* Modal personalizado para el nombre del cliente */}
        <CustomNameDialog />
        
        <View style={styles.container_top}>
          <TouchableOpacity onPress={() => {
            const availableRoutes = navigation.getState().routeNames;
            if (availableRoutes.includes('Productos_all')) {
              navigation.navigate('Productos_all');
            } else {
              navigation.goBack();
            }
          }}>
            <Svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="#000000">
              <Path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z" />
            </Svg>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>MI ORDEN</Text>

        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <TextInput
          value={text_input}
          onChangeText={settext_input}
            editable
            multiline
            placeholder="¿Quieres quitar o cambiar algo? Ej: sin crema..."
            numberOfLines={4}
            style={styles.textinput}
          />

          {Object.values(cart).length === 0 ? (
            <Text style={styles.emptyText}>Tu carrito está vacío.</Text>
          ) : (
            Object.entries(cart).map(([itemId, item], index) => (
              <View key={index} style={styles.itemContainerWrapper}>
                <View style={styles.itemContainer}>
                  <View style={styles.itemDetails}>
                    <Text style={styles.itemName}>{item.name} X{item.quantity}</Text>
                    <Text style={styles.itemPrice}>${item.price * item.quantity} MX</Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.removeButton}
                    onPress={() => handleRemoveItem(itemId)}
                  >
                    <Svg xmlns="http://www.w3.org/2000/svg" height="24" width="24" viewBox="0 0 24 24" fill="#ff3b30">
                      <Path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zm2.46-7.12l1.41-1.41L12 12.59l2.12-2.12 1.41 1.41L13.41 14l2.12 2.12-1.41 1.41L12 15.41l-2.12 2.12-1.41-1.41L10.59 14l-2.13-2.12zM15.5 4l-1-1h-5l-1 1H5v2h14V4z" />
                    </Svg>
                  </TouchableOpacity>
                </View>
                {renderItemDetails(item)}
              </View>
            ))
          )}

          {/* Agregamos un margen extra al final para evitar que el último ítem quede detrás del footer */}
          <View style={{ height: 120 }} />
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

    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  textinput:{
    width: '100%',
  minHeight: 100,
  backgroundColor: '#fff',
  borderColor: '#ccc',
  borderWidth: 1,
  borderRadius: 10,
  padding: 10,
  fontSize: 16,
  color: '#333',
  },
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
    marginTop: 20,
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
  itemContainerWrapper: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 15,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: '#7B4A12',
    fontWeight: '600',
  },
  removeButton: {
    padding: 8,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
  },
  optionsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  optionsTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
    marginBottom: 4,
  },
  optionItem: {
    fontSize: 13,
    color: '#666',
    marginLeft: 12,
    marginTop: 2,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#888',
  },
  footer: {
    position: 'absolute',
    bottom: '0%',
    width: '100%',
    backgroundColor: '#fff',
    height: '17%',
    paddingVertical: 12,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
  // Estilos para el modal personalizado
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5
  },
  modalIcon: {
    backgroundColor: '#f0e4d7',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15
  },
  modalTitle: {
    marginBottom: 10,
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
    fontSize: 14,
  },
  modalInput: {
    width: '100%',
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  errorText: {
    color: 'red',
    fontSize: 12,
    marginBottom: 10,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
  },
  modalButton: {
    borderRadius: 8,
    padding: 10,
    elevation: 2,
    width: '45%',
    alignItems: 'center',
  },
  confirmButton: {
    backgroundColor: '#7B4A12',
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  cancelButtonText: {
    color: '#333',
  },
});
