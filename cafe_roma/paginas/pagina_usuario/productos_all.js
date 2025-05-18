import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, ActivityIndicator, TouchableOpacity, TextInput, ScrollView, FlatList, Image } from 'react-native';
import { useFonts, Pacifico_400Regular } from '@expo-google-fonts/pacifico';
import { Svg, Path } from 'react-native-svg';
import Icon from "react-native-vector-icons/Ionicons";
import accessToken from '../../config_loyverce/config';
import axios from 'axios';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Productos_all() {
 

  const [product_search, setProduct_search] = useState('');
    const navigation = useNavigation();
  const [fontsLoaded] = useFonts({
    Pacifico_400Regular,
  });

    const [cartTotal, setCartTotal] = useState(0);
const [categoriaSeleccionada, setCategoriaSeleccionada] = useState('');
  const [categories, setCategories] = useState([]);
  const [productos_all, setProductos_all] = useState([]);
  const [loading, setLoading] = useState(true);

  async function obtenerCategorias() {
    try {
      const response = await axios.get('https://api.loyverse.com/v1.0/categories', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      setCategories(response.data.categories);
    } catch (error) {
      console.error('Error al obtener categorías:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }
const obtenerProductos = async (categoria, nombre) => {
      try {
        const response = await axios.get('https://api.loyverse.com/v1.0/items', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        });
        if (nombre != '') {
          const filteredItems = response.data.items.filter(item => item.item_name.toLowerCase().includes(nombre.toLowerCase()));
          setProductos_all(filteredItems);
          return;
        }
        if(categoria != ''){
            const filteredItems = response.data.items.filter(item => item.category_id === categoria);
            setProductos_all(filteredItems);
            return;
        }
        console.log('Productos:', response.data.items);
        setProductos_all(response.data.items);
      } catch (err) {
        
        console.log('Productos:', err);
      } 
    };

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


  useFocusEffect(
  useCallback(() => {
    loadCartTotal();
    obtenerCategorias();
    obtenerProductos('', '');

  }, [])
);
  if (!fontsLoaded || loading) {
    return (
      <View style={estilos.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={estilos.container}>
      <View style={estilos.container_top}>
        <Text style={estilos.titulo}>Café Roma</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Carrito')}>
            {cartTotal> 0 && (
           <View style={{ position:'absolute', backgroundColor:'#8B5E3C', borderRadius:20,paddingLeft:8,paddingRight:8, zIndex:99, top:-8, left:15 }} >
                      <Text style={{color:'white', fontWeight:600}}>{cartTotal}</Text>
                    </View>
          )}
          <Svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="#000000"><Path d="M280-80q-33 0-56.5-23.5T200-160q0-33 23.5-56.5T280-240q33 0 56.5 23.5T360-160q0 33-23.5 56.5T280-80Zm400 0q-33 0-56.5-23.5T600-160q0-33 23.5-56.5T680-240q33 0 56.5 23.5T760-160q0 33-23.5 56.5T680-80ZM246-720l96 200h280l110-200H246Zm-38-80h590q23 0 35 20.5t1 41.5L692-482q-11 20-29.5 31T622-440H324l-44 80h480v80H280q-45 0-68-39.5t-2-78.5l54-98-144-304H40v-80h130l38 80Zm134 280h280-280Z" /></Svg>
        </TouchableOpacity>
      </View>

      <View style={estilos.container_search}>
        <View style={[estilos.container_search, estilos.container_search_trow]}>
          <Icon name="search-sharp" size={30} color="#000000" style={estilos.icon} />
          <TextInput
            placeholder="Buscar"
            placeholderTextColor="rgb(184, 184, 184)"
            style={estilos.input}
            value={product_search}
           onChangeText={(text) => {
  setProduct_search(text);
  obtenerProductos('', text);
}}

          />
        </View>
        {/* <TouchableOpacity style={{ backgroundColor: '#8B5E3C', borderRadius: 15, padding: 10 }} >
          <Svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#FFFFFF"><Path d="M440-120v-240h80v80h320v80H520v80h-80Zm-320-80v-80h240v80H120Zm160-160v-80H120v-80h160v-80h80v240h-80Zm160-80v-80h400v80H440Zm160-160v-240h80v80h160v80H680v80h-80Zm-480-80v-80h400v80H120Z" /></Svg>
        </TouchableOpacity> */}
      </View>
<ScrollView horizontal showsHorizontalScrollIndicator={false} style={estilos.categoriesContainer}>

  {/* Botón Todos */}
  <TouchableOpacity
    style={[
      estilos.categoryButton,
      categoriaSeleccionada === '' ? estilos.categoryButtonSelectedAll : null
    ]}
    onPress={() => {
      setCategoriaSeleccionada('');
      obtenerProductos('','');
    }}
  >
    <Text style={estilos.categoryButtonText}>Todos</Text>
  </TouchableOpacity>

  {/* Botones dinámicos */}
  {categories.map((cat) => (
    <TouchableOpacity
      key={cat.id}
      style={[
        estilos.categoryButton,
        categoriaSeleccionada === cat.id ? estilos.categoryButtonSelectedAll : null
      ]}
      onPress={() => {
        setCategoriaSeleccionada(cat.id);
        obtenerProductos(cat.id, '');
      }}
    >
      <Text style={estilos.categoryButtonText}>{cat.name}</Text>
    </TouchableOpacity>
  ))}
</ScrollView>


        <FlatList
    data={productos_all}
    keyExtractor={(item) => item.id}
    numColumns={2}
    columnWrapperStyle={{ justifyContent: 'space-between' }}
    contentContainerStyle={{ paddingBottom: 100 }}
    renderItem={({ item }) => (
      <TouchableOpacity onPress={()=>{
        navigation.navigate('Stack_productos', {screen: 'ProductosInfo',
  params: { itemId: item.id, image: item.image_url, name: item.item_name, price: item.variants[0]?.default_price, description:item.description, }});
      }} style={{ flex: 1, margin: 10, backgroundColor: 'white', padding: 10, borderRadius: 8,  shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
justifyContent: 'center',
    alignItems: 'center',
    height: 250,
    elevation: 6, }}>
       <Image 
  source={{ uri: item.image_url }}
  style={{ width: 100, height: 100, borderRadius: 8 }}
  resizeMode="cover"
/>

        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{item.item_name}</Text>
        
        <Text>${item.variants[0]?.default_price} {item.currency}MX</Text>
      </TouchableOpacity>
    )}
  />
    </View>
  );
}

const estilos = StyleSheet.create({
  input: {
    flex: 1,
    height: 40,
    paddingLeft: 10,
  },
  container_search_trow: {
    width: '100%',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 5,
    // Sombra para iOS
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,

    // Sombra para Android
    elevation: 6,

    // Fondo para que la sombra sea visible
    backgroundColor: 'white',
  },

  container_search: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  container_top: {
    width: '100%',
    marginTop: '2%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  titulo: {
    fontFamily: 'Pacifico_400Regular',
    fontSize: 30,
    color: '#5D4037',
  },
categoriesContainer: {
  marginTop: 15,
  marginBottom: 10,
  flexDirection: 'row',
  maxHeight: 50, // limita la altura máxima
  minHeight: 40, // o el que mejor se ajuste a tus botones
},

  categoryButton: {
    backgroundColor: '#8B5E3C',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 15,
    marginRight: 10,
  },
  categoryButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },categoryButton: {
  backgroundColor: '#8B5E3C',
  paddingVertical: 8,
  paddingHorizontal: 15,
  borderRadius: 15,
  marginRight: 10,
},

categoryButtonAll: {
  // este solo aplica el estilo base de "Todos"
  backgroundColor: '#D2691E',
},

categoryButtonSelected: {
  backgroundColor: '#5D4037', // color más oscuro para botón activo
},

categoryButtonText: {
  color: 'white',
  fontWeight: 'bold',
},

categoryButton: {
  backgroundColor: '#8B5E3C', // Color base
  paddingVertical: 8,
  paddingHorizontal: 15,
  borderRadius: 15,
  marginRight: 10,
},

categoryButtonSelectedAll: {
  backgroundColor: '#D2691E', // Color del botón "Todos"
},

});

