import React, { useState } from "react";
import { StyleSheet, TextInput, View, Text, TouchableOpacity, Image, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Svg, Path } from 'react-native-svg';
import { useNavigation } from "@react-navigation/native";
import { ALERT_TYPE, AlertNotificationRoot, Toast } from "react-native-alert-notification";
import firebaseConfig from "../../config_firebase/config";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  getDocs,
  collection,
  query,
  where
} from "firebase/firestore";
export default function Login_admin() {
  
  const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
     const navigation = useNavigation();
     const[usuario, setusuario]=useState("");
      const[contrasena,setcontrasena]=useState("");

    async function entrar_usuarios(){
      if(usuario==='' || contrasena===''){
        Toast.show({
          type: ALERT_TYPE.WARNING,
          title: 'Campos vacios',
          textBody: 'Por favor llene todos los campos',
          autoClose: 2000,
          onHide: () => {
              setusuario('');
              setcontrasena('');
          }
      });
      return;
      }
      
  try {
    const usuariosRef = collection(db, "usuarios"); 
    const q = query(
      usuariosRef,
      where("usuario", "==", usuario),
      where("password", "==", contrasena)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
       const userData = querySnapshot.docs[0].data(); 

  const esAdmin = userData.campo === 'admin'; 

  await AsyncStorage.setItem('cafeteria',  userData.cafeteria);
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: 'Acceso permitido',
        textBody: 'Bienvenido',
        autoClose: 1000,
         onHide: () => {  if (esAdmin) {
        navigation.replace('Admin_menu',{
          usuario: userData.nombre,
        });
      } else if(userData.campo=== 'cajero') {
        navigation.replace('PedidosCajeros',{
          campo: userData.campo,
          cafeteria: userData.cafeteria,
          nombre: userData.nombre,
          usuario: userData.usuario,
          password: userData.password,
        });
      }else{
        navigation.replace('empleados_menu',{
          campo: userData.campo,
          cafeteria: userData.cafeteria,
          nombre: userData.nombre,
          usuario: userData.usuario,
          password: userData.password,
        }); 
      }}
      });
    } else {
       setusuario('');
          setcontrasena('');
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: 'Acceso denegado',
        textBody: 'Credenciales incorrectas',
        autoClose: 2000,
        
      });
    }
  } catch (error) {
    console.error("Error al consultar usuario:", error);
    Toast.show({
      type: ALERT_TYPE.DANGER,
      title: 'Error',
      textBody: 'Ocurrió un error al verificar los datos',
    });
  }
     }
  const { width, height } = Dimensions.get("window");
  const isTablet = width >= 768;

  return (
    <AlertNotificationRoot>
      <View style={estilos.container}>
        <View style={[estilos.formContainer, { width:'100%', height: isTablet ? '80%' : '90%' }]}>
          <Image
            source={require('../../img/logo.png')}
            style={[
              estilos.imagen_logo,
              { width: isTablet ? width * 0.3 : width * 0.5, height: isTablet ? width * 0.3 : width * 0.5 }
            ]}
          />
          {/* Usuario */}
          <View style={estilos.inputWrapper}>
            <Ionicons name="person-outline" size={20} color="#888" style={estilos.icon} />
            <TextInput
              placeholder="Usuario"
              value={usuario}
              onChangeText={setusuario}
              placeholderTextColor="rgb(184, 184, 184)"
              style={estilos.input}
            />
          </View>

          {/* Contraseña */}
          <View style={estilos.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={20} color="#888" style={estilos.icon} />
            <TextInput
              secureTextEntry
              value={contrasena}
              onChangeText={setcontrasena}
              placeholder="Contraseña"
              placeholderTextColor="rgb(184, 184, 184)"
              style={estilos.input}
            />
          </View>
          <View style={estilos.ralla}></View>
          <Text style={estilos.text}>Solamente usuarios autorizados</Text>
          <TouchableOpacity onPress={entrar_usuarios} style={[estilos.entrar, { width: isTablet ? '40%' : '60%' }]}>
            <Text>Entrar</Text>
            <Icon name="arrow-forward-circle-outline" size={30} />
          </TouchableOpacity>
        </View>
      </View>
    </AlertNotificationRoot>
  );
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
  formContainerTablet: {
    width: '70%',
    height: '80%',
    padding: 50,
  },
  imagen_logo: {
    resizeMode: 'contain',
    marginBottom: 30,
  },
  imagen_logoTablet: {
    width: 250,
    height: 250,
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
