import { createStackNavigator } from "@react-navigation/stack"
import { NavigationContainer } from "@react-navigation/native";
import Pag_pedidos from "./pag_pedidos";

const Stack= createStackNavigator();
export default function Stack_empleados(){
    return(
      <Stack.Navigator>
        <Stack.Screen name="pag_pedidos" component={Pag_pedidos} options={{ headerShown:false,}} />
      </Stack.Navigator>
    )

}