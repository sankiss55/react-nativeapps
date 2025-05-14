import React from "react";
import { StyleSheet, TextInput, View, Text, TouchableOpacity, Image } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import Ionicons from 'react-native-vector-icons/Ionicons';
import { Svg, Path } from 'react-native-svg';
import { useNavigation } from "@react-navigation/native";
export default function Login_admin() {
     const navigation = useNavigation();
  return (
    <View style={estilos.container}>
            
           <TouchableOpacity onPress={()=>{navigation.navigate('Usuarios')}} style={estilos.container_switch}>
             <Text style={{fontWeight:600,fontSize:18}}>Mesas</Text>
           <Svg style={{backgroundColor:'rgb(255, 255, 255)', borderRadius:30,}} height="40" width="40" viewBox="0 -960 960 960" fill="#000000">
  <Path d="M360-390q-21 0-35.5-14.5T310-440q0-21 14.5-35.5T360-490q21 0 35.5 14.5T410-440q0 21-14.5 35.5T360-390Zm240 0q-21 0-35.5-14.5T550-440q0-21 14.5-35.5T600-490q21 0 35.5 14.5T650-440q0 21-14.5 35.5T600-390ZM480-160q134 0 227-93t93-227q0-24-3-46.5T786-570q-21 5-42 7.5t-44 2.5q-91 0-172-39T390-708q-32 78-91.5 135.5T160-486v6q0 134 93 227t227 93Zm0 80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-54-715q42 70 114 112.5T700-640q14 0 27-1.5t27-3.5q-42-70-114-112.5T480-800q-14 0-27 1.5t-27 3.5ZM177-581q51-29 89-75t57-103q-51 29-89 75t-57 103Zm249-214Zm-103 36Z" />
</Svg>

           </TouchableOpacity>
      <View style={estilos.formContainer}>
  <Image
        source={require('../../img/logo.png')}
        style={estilos.imagen_logo}
      />
        {/* Usuario */}
        <View style={estilos.inputWrapper}>
           
          <Ionicons name="person-outline" size={20} color="#888" style={estilos.icon} />
          <TextInput
            placeholder="Cafe Roma"
            placeholderTextColor="rgb(184, 184, 184)"
            style={estilos.input}
          />
        </View>

        {/* Contraseña */}
        <View style={estilos.inputWrapper}>
          <Ionicons name="lock-closed-outline" size={20} color="#888" style={estilos.icon} />
          <TextInput
            secureTextEntry
            placeholder="••••••••"
            placeholderTextColor="rgb(184, 184, 184)"
            style={estilos.input}
          />
          
        </View>
        <View style={estilos.ralla}></View>
<Text style={estilos.text}>Solamente usuarios autorizados </Text>
<TouchableOpacity style={estilos.entrar}>
    <Text>Entrar</Text>
    <Icon name="arrow-forward-circle-outline" size={30}/>
</TouchableOpacity>
      </View>
    </View>
  );
}
const estilos = StyleSheet.create({
    container_switch:{
        zIndex:999,
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
width:'30%'
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
