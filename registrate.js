import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity } from 'react-native';
import axios from 'axios';
import { useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

export default function App() {
  const [nombre, setnombre]= useState('');
  const [Contrasena, setcontrasena]= useState('');
  const [correo, setcorreo]= useState('');
  const registrouser=()=>{
    axios.post("https://47cb-2806-105e-2b-accf-e1e4-4dbf-7e77-5557.ngrok-free.app/api_res/", {
      password:Contrasena,
      nombre_user:nombre,
      correo_user:correo,
    }).then(function(respuesta){
    console.log(  respuesta.data);
    }).catch(function(err){
      console.log(err);
    })
  }
  return (
    <View style={styles.container}>
      <View style={styles.bolitas1}></View>
      <MaterialCommunityIcons name="account-circle" size={50} color="green" />

      <View style={styles.bolitas2}></View>
    <Text style={styles.text}>
      Registrate
      </Text>
    <View  style={styles.contenedor1}>
      <TouchableOpacity onPress={registrouser} style={styles.buttonsigiente}>
        <Text style={styles.text2}>✓</Text>
      </TouchableOpacity>
   <View style={styles.children1}>
    <MaterialCommunityIcons  name='account' size={35} color="black"/>
     <TextInput placeholder='Nombre de usuario' onChangeText={setnombre} style={styles.textinput} />
   </View>
   <View style={styles.children3}>
   <MaterialCommunityIcons name="eye" size={35} color="black" />

    <TextInput placeholder='Contraseña' onChangeText={setcontrasena} style={styles.textinput} />
    
   </View>
   
   <View style={styles.children2}>
   <MaterialCommunityIcons name="gmail" size={35} color="black" />

    <TextInput placeholder='Gmail' onChangeText={setcorreo} style={styles.textinput} />
    
   </View>
    </View>
    <TouchableOpacity style={styles.botonregistrate}>
        <Text style={styles.text3}>Login</Text>
      </TouchableOpacity>
      <View style={styles.bolitas3}></View>
      
      <View style={styles.bolitas4}></View>
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  bolitas1:{
width:200,
height:200,
backgroundColor:"rgba(245, 110, 57, 1)",
position:"absolute",
top:0,
left:0,
borderBottomEndRadius:300,
zIndex:2,

  },
  bolitas2:{
    width:200,
    height:200,
    backgroundColor:"rgba(255, 72, 0, 1)",
    position:"absolute",
    top:-80,
    left:150,
    borderBottomEndRadius:300,
      },
      children3:{
        padding:5,
        display: "flex",
        flexDirection:"row",
      },
      bolitas4:{
        width:200,
        height:200,
        backgroundColor:"rgba(245, 110, 57, 1)",
        position:"absolute",
        bottom:0,
        right:0,
        borderTopLeftRadius:300,
          },
          bolitas3:{
            width:200,
            height:200,
            backgroundColor:"rgba(255, 72, 0, 1)",
            position:"absolute",
            
            bottom:-80,
            right:150,
            borderTopLeftRadius:300,
              },
 
  botonregistrate:{
    position:"absolute",
    bottom:"75%",
    padding:10,
    borderBottomLeftRadius:20,
    borderTopLeftRadius:20,
    left:"100%",
boxShadow: "1 2 5 2 rgba(44, 44, 44, 0.6)",
transform:[{translateX:"-100%"}, {translateY:0}]
  },
  text3:{
fontSize:20, 
color:"rgb(223, 55, 29)",
fontWeight:500
  },

  buttonsigiente:{
backgroundColor:"rgba(255, 195, 107, 1)",
borderRadius:50,
width:"20%",
position:"absolute",
zIndex:2,
left:"95%",
top:"50%",
transform: [{ translateX: -95 }, { translateY: -50 }]
  },
  children1:{
    
    padding:5,
    display: "flex",
    flexDirection:"row",
width:"80%",
borderTopEndRadius:20,
boxShadow: "0 -3 4 2 rgba(44, 44, 44, 0.3)"
  }, 
  children2:{

    padding:5,
    display: "flex",
    flexDirection:"row",
    width:"80%",
    borderEndEndRadius:20,
boxShadow: "0 3 4 2 rgba(44, 44, 44, 0.3)"
      },

  contenedor1:{
    
    marginTop:50,
width:"100%"
  },
  text:{
    fontSize: 35,
    fontWeight:500,
  }, text2:{
    fontSize: 65,
    
transform: [{ translateX: 25 }, { translateY: -5 }]
  },
  textinput:{
    
    fontWeight:"bold", padding:20
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});