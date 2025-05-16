
import { createStackNavigator } from "@react-navigation/stack";
 import tabs from "../pagina_usuario/tabs";
 import Stack_admin from "../paginas_admin/stack";
import { NavigationContainer } from "@react-navigation/native";
import Login_admin from "./login_admin";
import Login_users from "./login_users";
import Stack_empleados from "../paginas_empleados/stack_empleados";
import Pag_pedidos from "../paginas_empleados/pag_pedidos";
const Stack= createStackNavigator();
export default function App() {
  return (
        <NavigationContainer>
      <Stack.Navigator initialRouteName="Admin">
        <Stack.Screen name="Admin" component={Login_admin} options={{ headerShown:false,}} />
        <Stack.Screen name="Usuarios" component={Login_users}  options={{ headerShown:false,}} />
        <Stack.Screen name="Usuario"component={tabs} options={{ headerShown:false,}}/>
        <Stack.Screen name="Admin_menu" component={Stack_admin} options={{ headerShown:false,}} />
          <Stack.Screen name="empleados_menu" component={Pag_pedidos} options={{ headerShown:false,}} />
      </Stack.Navigator>
    </NavigationContainer>

  );
}
