
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Index from './paginas/pag_init';
import Productos_all from './paginas/pag_products/productos_all';
import ProductosInfo from './paginas/pag_products/productos_info';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Index">
        <Stack.Screen name="Index" component={Index} options={{headerShown:false}} />
        <Stack.Screen name="Productos_all" component={Productos_all} options={{headerShown:false}} />
         <Stack.Screen name="Stack_productos" component={ProductosInfo} options={{headerShown:false}} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
