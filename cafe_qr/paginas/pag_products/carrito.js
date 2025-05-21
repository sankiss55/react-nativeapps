import React, { useEffect, useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View, ScrollView, TextInput } from "react-native";
import { Svg, Path } from 'react-native-svg';
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { getFirestore, collection, query, where, getDocs, addDoc } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import firebaseConfig from "../../config_firebase/config";
import { AlertNotificationRoot,ALERT_TYPE, Toast,Dialog } from 'react-native-alert-notification';

export default function Carrito() {
  const navigation = useNavigation();
  const [text_input, settext_input]=useState('');
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

    const nombreCafeteria = await AsyncStorage.getItem('nombre_cafeteria');

    // 1. Buscar usuarios que coincidan con la cafetería
    const usuariosRef = collection(db, "usuarios");
    const q = query(usuariosRef, where("cafeteria", "==", nombreCafeteria));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      alert("No se encontraron usuarios asociados a esta cafetería.");
      return;
    }

    // 2. Filtrar manualmente los usuarios que no sean "admin"
    const filteredUsers = querySnapshot.docs.filter((doc) => doc.data().campo !== "admin");

    if (filteredUsers.length === 0) {
      alert("No se encontraron usuarios válidos para procesar el pedido.");
      return;
    }

    // 3. Verificar si el usuario tiene la categoría del producto pedido
    const addPromises = [];
    filteredUsers.forEach((doc) => {
      const userData = doc.data();
      console.log('User Data:', userData);
      const userId = doc.id;

      const hasCategory = Object.values(parsedCart).some((item) =>
        Array.isArray(userData.categorias) && userData.categorias.includes(item.categoria)
      );

      if (hasCategory) {
        // Crear la colección "pedidos_usuarios" si no existe y agregar documentos
        const pedidosRef = collection(db, "usuarios", userId, "pedidos_usuarios");

        Object.values(parsedCart).forEach((item) => {
          addPromises.push(
            addDoc(pedidosRef, {
              id_producto: item.id,
              pedido: item.name,
              cantidad: item.quantity,
              precio_unitario: item.price,
              atendido: false,
            })
          );
        });

        // Crear la colección "observaciones" y guardar la observación del usuario
        const observacionesRef = collection(db, "usuarios", userId, "observaciones");
        if(text_input!==''){
addPromises.push(
          addDoc(observacionesRef, {
            observacion: text_input, // Guardar el texto ingresado por el usuario
            fecha: new Date().toISOString(),
          })
        );
        }
      } else {
        console.error("El usuario no tiene la categoría requerida:", hasCategory);
      }
    });

    await Promise.all(addPromises);

    // Agregar el pedido actual a la lista de pedidos realizados
    const existingPedidos = await AsyncStorage.getItem('pedidos_realizados');
    let parsedPedidos = existingPedidos ? JSON.parse(existingPedidos) : []; // Asegurarse de que sea un array
    if (!Array.isArray(parsedPedidos)) {
      console.error("El valor de 'pedidos_realizados' no es un array. Se inicializará como un array vacío.");
      parsedPedidos = [];
    }
    parsedPedidos.push(parsedCart); // Agregar el carrito actual a la lista
    await AsyncStorage.setItem('pedidos_realizados', JSON.stringify(parsedPedidos));

    // 4. Limpiar carrito y observaciones
    await AsyncStorage.removeItem('cart');
    setCart({});
    setTotalPrice(0);
    settext_input(''); // Limpiar el campo de texto

    Dialog.show({
      type: ALERT_TYPE.SUCCESS,
      title: 'Éxito',
      textBody: '¡Pedido realizado con éxito!',
      button: 'Cerrar',
      onPressButton: () => {
        Dialog.hide();
        const availableRoutes = navigation.getState().routeNames;
        if (availableRoutes.includes('Tiket')) {
          navigation.navigate('Tiket');
        } else {
          navigation.goBack();
        }
      }
    });
  } catch (error) {
    console.error("Error al enviar el pedido:", error);
    alert("Hubo un error al procesar tu pedido.");
  }
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
      Object.values(cart).map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <Text style={styles.itemName}>{item.name} X{item.quantity}</Text>
          <Text style={styles.itemName}> ${item.price * item.quantity}MX</Text>
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
});
