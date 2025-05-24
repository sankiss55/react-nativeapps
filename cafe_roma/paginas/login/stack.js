
import { createStackNavigator } from "@react-navigation/stack";
 import tabs from "../pagina_usuario/tabs";
 import Stack_admin from "../paginas_admin/stack";
import { NavigationContainer } from "@react-navigation/native";
import Login_admin from "./login_admin";
import Login_users from "./login_users";
import Pedidos_info from "../paginas_empleados/pedidos_info";
import Stack_empleados from "../paginas_empleados/stack_empleados";
import Pag_pedidos from "../paginas_empleados/pag_pedidos";
import Admin from "../paginas_admin/admin";
import Promociones from "../paginas_admin/promociones";
import GestionAdmin from "../paginas_admin/gestion_admin";
import Usuarios_categoria from "../paginas_admin/usuarios_categoria";
import CrearQR from "../paginas_admin/crearQR";
import Mesas from "../paginas_admin/mesas";
import GestionVentanilla from "../paginas_admin/usuario_ventana";
import PedidosCajeros from "../cajeros/pedidos_cajeros";
import PedidosTerminados from "../cajeros/pedido_terminado";
const Stack= createStackNavigator();

export default function App() {
  return (
        <NavigationContainer>
      <Stack.Navigator initialRouteName="Admin">
        <Stack.Screen name="Admin" component={Login_admin} options={{ headerShown:false,}} />
        <Stack.Screen name="Usuarios" component={Login_users}  options={{ headerShown:false,}} />
        <Stack.Screen name="Usuario"component={tabs} options={{ headerShown:false,}}/>
        <Stack.Screen name="Admin_menu" component={Admin} options={{ headerShown:false,}} />
          <Stack.Screen name="empleados_menu" component={Pag_pedidos} options={{ headerShown:false,}} />
           <Stack.Screen name="Pedidos_info" component={Pedidos_info} options={{ headerShown:false,}} />
           
             <Stack.Screen name="promos" component={Promociones} options={{ headerShown:false,}} />
        <Stack.Screen name="GestionAdmin" component={GestionAdmin} options={{ headerShown:false,}} />
         <Stack.Screen name="Usuarios_categoria" component={Usuarios_categoria} options={{ headerShown:false,}} />
         <Stack.Screen name="Qr" component={CrearQR} options={{ headerShown:false,}} />
          <Stack.Screen name="mesas" component={Mesas} options={{ headerShown:false,}} />
          <Stack.Screen name="GestionVentanilla" component={GestionVentanilla} options={{ headerShown:false,}} />
            <Stack.Screen name="PedidosCajeros" component={PedidosCajeros} options={{ headerShown:false,}} />
             <Stack.Screen name="PedidosTerminados" component={PedidosTerminados} options={{ headerShown:false,}} />
      </Stack.Navigator>
    </NavigationContainer>

  );
}
