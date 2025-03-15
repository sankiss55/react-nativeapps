import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity ,KeyboardAvoidingView,Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import axios from 'axios';
import { useState } from 'react';
import { Alert } from 'react-native';
const Login = ({ navigation }) => {
  const iniciar_sesion=()=>{
     Alert.alert(
            "Usuario logiado"
          );
//  axios.get("https://7d48-2806-105e-2b-6b02-8def-243-7484-5fc1.ngrok-free.app/api_res/", {
//   params: {
//     password: Contrasena,
//     nombre: usuario,
//   }
//       }).then(function(respuesta){
//       console.log(  respuesta.data);
     
//       }).catch(function(err){
//         console.log(err);
//       });
  }
  const [usuario,setusuario] =useState('');
  const [Contrasena, setcontrasena]=useState('');
  return (
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
      <View style={styles.bolitas1}></View>
      
      <View style={styles.bolitas2}></View>
      
      <MaterialCommunityIcons name="account-circle" size={50} color="rgb(75, 0, 155)" />
    <Text style={styles.text}>

      login
      </Text>
    <View  style={styles.contenedor1}>
      <TouchableOpacity onPress={iniciar_sesion} style={styles.buttonsigiente}>
        <Text style={styles.text2}>→</Text>
      </TouchableOpacity>
   <View style={styles.children1}>

        <MaterialCommunityIcons  name='account' size={35} color="black"/>
     <TextInput placeholder='Nombre de usuario' onChangeText={setusuario} style={styles.textinput} />
   </View>
   <View style={styles.children2}>
      <MaterialCommunityIcons name="eye" size={35} color="black" />
    <TextInput placeholder='Contraseña' onChangeText={setcontrasena} style={styles.textinput} />
    
   </View>
   <TouchableOpacity style={styles.botonregistrate2}>
        <Text style={styles.text4}>¿Perdistbdhdhhd dee tu Contraseña?</Text>
      </TouchableOpacity>
    </View>
    <TouchableOpacity style={styles.botonregistrate}  onPress={() => navigation.navigate('registrarte')}>
        <Text style={styles.text3}>Registrate</Text>
      </TouchableOpacity>
      <View style={styles.bolitas3}></View>
      
      <View style={styles.bolitas4}></View>
      <StatusBar style="auto" />
      </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bolitas1:{
width:200,
height:200,
backgroundColor:"rgba(29, 177, 229, 6)",
position:"absolute",
top:0,
left:0,
borderBottomEndRadius:300,
zIndex:2,
  },
  bolitas2:{
    width:200,
    height:200,
    backgroundColor:"rgba(71, 186, 227, 6)",
    position:"absolute",
    top:-80,
    left:150,
    borderBottomEndRadius:300,
      },
      bolitas4:{
        width:200,
        height:200,
        backgroundColor:"rgba(29, 177, 229, 6)",
        position:"absolute",
        bottom:0,
        right:0,
        borderTopLeftRadius:300,
          },
          bolitas3:{
            width:200,
            height:200,
            backgroundColor:"rgba(71, 186, 227, 6)",
            position:"absolute",
            
            bottom:-80,
            right:150,
            borderTopLeftRadius:300,
              },
  botonregistrate2:{
    width:"45%",
    marginLeft:"50%",
    marginTop:10,
transform: [{ translateX: -50 }, { translateY: -0 }],
  },
  text4:{

color:"rgba(185, 185, 185, 6)",
fontWeight:600
  },
  botonregistrate:{
    position:"absolute",
    top:"75%",
    padding:10,
    borderEndEndRadius:20,
    borderTopEndRadius:20,
    left:0,
boxShadow: "1 2 5 2 rgba(44, 44, 44, 0.6)"
  },
  text3:{
fontSize:20, 
color:"rgb(223, 55, 29)",
fontWeight:500
  },

  buttonsigiente:{
backgroundColor:"rgba(161, 180, 255, 1)",
borderRadius:50,
width:"20%",
position:"absolute",
zIndex:2,
left:"95%",
top:"50%",
transform: [{ translateX: -95 }, { translateY: -50 }]
  },
  children1:{
    
display:"flex",
flexDirection:"row",
padding:5,
width:"80%",
borderTopEndRadius:20,
boxShadow: "1 -2 5 2 rgba(44, 44, 44, 0.6)"
  }, 

  children2:{
    padding:5,
display:"flex",
flexDirection:"row",
    width:"80%",
    borderEndEndRadius:20,
    boxShadow: "1 2 5 2 rgba(44, 44, 44, 0.6)"
      },

  contenedor1:{
    zIndex:999,
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
export default Login;