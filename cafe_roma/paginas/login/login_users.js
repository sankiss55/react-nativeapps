
import React from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  getDocs,
  collection,
  query,
  where
} from "firebase/firestore";
import { CommonActions } from '@react-navigation/native';
import { ALERT_TYPE, AlertNotificationRoot, Dialog, Toast } from 'react-native-alert-notification';
import firebaseConfig from "../../config_firebase/config";
import { useState, useEffect, } from "react";
import { StyleSheet, TextInput, View, Text, TouchableOpacity, Image } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Svg, Path } from 'react-native-svg';
import { useNavigation } from "@react-navigation/native";
import { SelectList } from 'react-native-dropdown-select-list';
import AsyncStorage from '@react-native-async-storage/async-storage';
export default function Login_users() {
  const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const [selectedMesa, setSelectedMesa] = useState("");
const [contrasena,setcontrasena]=useState("");
     const navigation = useNavigation();
     const [cafeterias, setCafeterias] = useState([]);
     const [mesas, setMesas] = useState([]);
const [selectedCafeteria, setSelectedCafeteria] = useState("");
 const fetchCafeterias = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "cafeteria"));
      const data = querySnapshot.docs.map(doc => ({
        key: doc.id,
        value: doc.data().cafeteria || "Sin nombre",
      }));
      setCafeterias(data);
    } catch (error) {
      console.error("Error al obtener cafeterías:", error);
    }
  };
async function buscar_mesas(nombre_cafe) {
  try {
    const q = query(collection(db, "mesas"), where("cafeteria", "==", nombre_cafe));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setMesas(data);
    console.log("Mesas encontradas:", data); // para depurar
  } catch (error) {
    console.error("Error al obtener mesas:", error);
  }
}
async function  verificar_session (){
  if(selectedCafeteria=='' || selectedMesa==''){
    Toast.show({
      type: ALERT_TYPE.WARNING,
      title: 'Error',
      textBody: 'Error Seleccione una cafeteria y una mesa.',
    })
    return;

  }
if(contrasena!='cafeteria'){
  Toast.show({
  type: ALERT_TYPE.DANGER,
  title: 'Error',
  textBody: 'Error La contraseña no es valida, porfavor valide y intente de nuevo.',

});
return;
}
 await AsyncStorage.setItem('nombre_mesa', selectedMesa);
 await AsyncStorage.setItem('nombre_cafeteria', selectedCafeteria);
navigation.dispatch(
  CommonActions.reset({
    index: 0,
    routes: [{ name: 'Usuario' }],
  })
);
}
useEffect(() => {
  if (selectedCafeteria) {
    buscar_mesas(selectedCafeteria);
  }
}, [selectedCafeteria]);
useEffect(() => {
  
  fetchCafeterias();
}, []);

  return (
    <AlertNotificationRoot >
    <View style={estilos.container}>
            
           <TouchableOpacity onPress={()=>{navigation.goBack()}} style={estilos.container_switch}>
             <Text style={{fontWeight:600,fontSize:18}}>Administracion</Text>
       
<Svg  style={{backgroundColor:'rgb(255, 255, 255)', borderRadius:30,}}  xmlns="http://www.w3.org/2000/svg" height="40px" viewBox="0 -960 960 960" width="40px" fill="#000000"><Path d="M400-480q-66 0-113-47t-47-113q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47ZM80-160v-112q0-33 17-62t47-44q51-26 115-44t141-18h14q6 0 12 2-8 18-13.5 37.5T404-360h-4q-71 0-127.5 18T180-306q-9 5-14.5 14t-5.5 20v32h252q6 21 16 41.5t22 38.5H80Zm560 40-12-60q-12-5-22.5-10.5T584-204l-58 18-40-68 46-40q-2-14-2-26t2-26l-46-40 40-68 58 18q11-8 21.5-13.5T628-460l12-60h80l12 60q12 5 22.5 11t21.5 15l58-20 40 70-46 40q2 12 2 25t-2 25l46 40-40 68-58-18q-11 8-21.5 13.5T732-180l-12 60h-80Zm40-120q33 0 56.5-23.5T760-320q0-33-23.5-56.5T680-400q-33 0-56.5 23.5T600-320q0 33 23.5 56.5T680-240ZM400-560q33 0 56.5-23.5T480-640q0-33-23.5-56.5T400-720q-33 0-56.5 23.5T320-640q0 33 23.5 56.5T400-560Zm0-80Zm12 400Z"/></Svg>

           </TouchableOpacity>
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
value={contrasena}
 onChangeText={setcontrasena}
            style={estilos.input}
          />
          
        </View>
        <View style={{ width: '100%', marginBottom: 20 }}>
  <SelectList
    setSelected={setSelectedCafeteria}
    data={cafeterias}
    save="value"
    placeholder="Selecciona una cafetería"
    boxStyles={{ borderRadius: 10, borderColor: "#ddd" }}
    inputStyles={{ color: "#000" }}
    dropdownStyles={{ borderColor: "#ccc" }}
  />
</View>
<View style={{ width: '100%', marginBottom: 20 }}>
  <SelectList
   setSelected={setSelectedMesa}
    data={mesas.map((mesa) => ({
      key: mesa.id,
      value: mesa.nombre_mesa || "Sin nombre",
    }))}
    
    save="value"
    placeholder="Selecciona una mesa"
    boxStyles={{ borderRadius: 10, borderColor: "#ddd" }}
    inputStyles={{ color: "#000" }}
    dropdownStyles={{ borderColor: "#ccc" }}
  />
</View>

        <View style={estilos.ralla}></View>
<Text style={estilos.text}>Solamente usuarios autorizados </Text>
<TouchableOpacity onPress={()=>{verificar_session()}} style={estilos.entrar}>
    <Text>Entrar</Text>
    <Icon name="arrow-forward-circle-outline" size={30}/>
</TouchableOpacity>
      </View>
    </View>
    
    </AlertNotificationRoot>
  );
}
const estilos = StyleSheet.create({
    container_switch:{
        position:'absolute',
        top:'5%',
        display:'flex',
        flexDirection:'row',
        justifyContent:'flex-end',
        alignContent:'flex-end',
        alignItems:'center',
height:60,
gap: 20,
marginLeft:'60%',
width:'35%'
    },
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
