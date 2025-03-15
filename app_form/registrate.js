import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import RegistroScreen from './screens/registrarte'; // Ensure the correct path

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Register" component={RegistroScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
