
import { createStackNavigator } from "@react-navigation/stack";
 
import { NavigationContainer } from "@react-navigation/native";
import Login_admin from "./login_admin";
import Login_users from "./login_users";
const Stack= createStackNavigator();
export default function App() {
  return (
        <NavigationContainer>
      <Stack.Navigator initialRouteName="Admin">
        <Stack.Screen name="Admin" component={Login_admin} options={{ headerShown:false,}} />
        <Stack.Screen name="Usuarios" component={Login_users}  options={{ headerShown:false,}} />
      </Stack.Navigator>
    </NavigationContainer>

  );
}
