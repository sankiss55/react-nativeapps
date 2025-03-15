import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Login from './screens/Login'; 
import Registrarte from './screens/Registrarte';  


const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="login">
        <Stack.Screen name="login" component={Login} />
<Stack.Screen name="registrarte" component={Registrarte} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
