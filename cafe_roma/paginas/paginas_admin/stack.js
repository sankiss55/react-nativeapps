import { createStackNavigator } from "@react-navigation/stack"
import Admin from "./admin";

const Stack= createStackNavigator();
export default function Stack_admin(){
    return(
      <Stack.Navigator>
        <Stack.Screen name="Admin_panel" component={Admin} options={{ headerShown:false,}} />
      </Stack.Navigator>
    )

}