
import { createStackNavigator } from "@react-navigation/stack";
import ProductosInfo from "./productos_info";
const Stack= createStackNavigator();
export default function Stack_productos() {
  return (
      <Stack.Navigator >
     <Stack.Screen name="ProductosInfo" component={ProductosInfo} options={{ headerShown:false,}} /> 
      </Stack.Navigator>

  );
}
