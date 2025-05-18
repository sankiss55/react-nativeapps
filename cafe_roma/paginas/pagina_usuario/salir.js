import { StyleSheet, TextInput, View, Text, TouchableOpacity, Image } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ALERT_TYPE, AlertNotificationRoot, Toast, Dialog } from "react-native-alert-notification";
import { Svg, Path } from 'react-native-svg';
import { useState } from "react";
import { useNavigation } from "@react-navigation/native";
export default function Salir(){
const navigation=useNavigation();
    const [password, setPassword] = useState('');
    function salir_usuario(){
if(password!='cafeteria'){
    Toast.show({
        type: ALERT_TYPE.WARNING,
        title: 'Contraseña incorrecta',
        textBody: 'La contraseña es incorrecta',
        autoClose: 2000,
        onHide: () => {
            setPassword('');
        }
    });
    return;
}
navigation.replace('Admin');
    }
    return(
      <AlertNotificationRoot>
        <View style={estilos.container}>
                    
                 
              <View style={estilos.formContainer}>
          <Image
                source={require('../../img/logo.png')}
                style={estilos.imagen_logo}
              />
              
        
                {/* Contraseña */}
                <View style={estilos.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#888" style={estilos.icon} />
                  <TextInput
                    secureTextEntry
                    placeholder="Contraseña"
                    placeholderTextColor="rgb(184, 184, 184)"
                    style={estilos.input}
                    value={password}
                    onChangeText={setPassword}
                  />
                  
                </View>
                <View style={estilos.ralla}></View>
        <Text style={estilos.text}>Solamente usuarios autorizados </Text>
        <TouchableOpacity style={estilos.entrar} onPress={()=>{salir_usuario()}}>
            <Text>Salir</Text>
            <Icon name="arrow-forward-circle-outline" size={30}/>
        </TouchableOpacity>
              </View>
            </View>
            </AlertNotificationRoot>
    )
}

const estilos = StyleSheet.create({
  
    text:{
color:'#808080', fontWeight:600,
width:'100%',
    },

  container: {
    backgroundColor: '#C48623',
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    justifyContent:'center',
    alignContent:'center',
    backgroundColor: 'white',
    width: '100%',
    height:'90%',
    marginTop:'30%',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
  },
  imagen_logo: {
    position:'absolute',
    top:'5%',
    width: 180,
    height: 180,
    resizeMode: 'contain',
    marginBottom: 30,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 15,
    paddingHorizontal: 10,
    paddingVertical: 10,
    marginBottom: 20,
    width: '100%',
    
  },
  icon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 18,
    color: '#3A2E2E',
  },
  ralla: {
    width: '90%',
    height: 2,
    backgroundColor: '#E8E8E8',
    borderRadius: 5,
    marginVertical: 20,
  },
  entrar: {
    flexDirection: 'row',
    borderColor: 'black',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 10,
    width: '50%',
    padding: 12,
    marginTop: 50,
    marginLeft:'50%'
  },
});
