import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import axios from 'axios';
import { useEffect, useState } from 'react';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const Registrarte = ({ navigation }) => {
  const [nombre, setnombre]= useState('');
  const [Contrasena, setcontrasena]= useState('');
  const [correo, setcorreo]= useState('');
    const registrouser=()=>{
      // Alert.alert(
      //   "Usuario registrado",
      //   "Presiona aceptar para continuar",
      //   [{ text: "Aceptar", onPress: () => navigation.goBack() }]
      // // );
      // axios.post("https://sanrec.alwaysdata.net/enviar_correo.php", {
     
      //   correo:correo,
      // }
      //  ).then(function(respuesta){
      //  console.log(respuesta.data);
      //  if(respuesta.data==true){
          // Alert.alert(
          //   "le enviamos un correo",
          //   "Presiona aceptar para continuar",
          //   [{ text: "Aceptar", onPress: () => navigation.goBack() }]
          // );
          
          for (let index = 0; index <5; index++) {
            axios.post("flutterproyect-production.up.railway.app", {
              usurio:nombre,
              correo_user:correo,
              password:Contrasena
            }
             ).then(function(respuesta){
              console.log(respuesta.data);
              if(respuesta.data==true){
                Alert.alert(
                  "Usuario registrado",
                  "Presiona aceptar para continuar",
                  [{ text: "Aceptar", onPress: () => navigation.goBack() }]
                );
              }
             
            })
            .catch(err => console.log(err));
          //}
        //}
       
      //})
     // .catch(function(err){
       // Alert.alert(
      //     "Error de correo",
      //     "El correo no es el correcto ingrese uno que lo sea ",
        
      //   );
      // })
      
       //;
          }
    }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <View style={styles.bolitas1}></View>
      <MaterialCommunityIcons name="account-circle" size={50} color="green" />

      <View style={styles.bolitas2}></View>
      <Text style={styles.text}>
        Registrate
      </Text>
      <View style={styles.contenedor1}>
        <TouchableOpacity onPress={registrouser} style={styles.buttonsigiente}>
          <Text style={styles.text2}>✓</Text>
        </TouchableOpacity>
        <View style={styles.children1}>
          <MaterialCommunityIcons name='account' size={35} color="black" />
          <TextInput placeholder='Nombre de usuario'  onChangeText={setnombre} style={styles.textinput} />
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
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.botonregistrate}
      >
        <Text style={styles.text3}>Login</Text>
      </TouchableOpacity>
      <View style={styles.bolitas3}></View>
      <View style={styles.bolitas4}></View>
      <StatusBar style="auto" />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  bolitas1: {
    width: 200,
    height: 200,
    backgroundColor: "rgba(245, 110, 57, 1)",
    position: "absolute",
    top: 0,
    left: 0,
    borderBottomEndRadius: 300,
    zIndex: 2,
  },
  bolitas2: {
    width: 200,
    height: 200,
    backgroundColor: "rgba(255, 72, 0, 1)",
    position: "absolute",
    top: -80,
    left: 150,
    borderBottomEndRadius: 300,
  },
  children3: {
    padding: 5,
    display: "flex",
    flexDirection: "row",
  },
  bolitas4: {
    width: 200,
    height: 200,
    backgroundColor: "rgba(245, 110, 57, 1)",
    position: "absolute",
    bottom: 0,
    right: 0,
    borderTopLeftRadius: 300,
  },
  bolitas3: {
    width: 200,
    height: 200,
    backgroundColor: "rgba(255, 72, 0, 1)",
    position: "absolute",
    bottom: -80,
    right: 150,
    borderTopLeftRadius: 300,
  },
  botonregistrate: {
    position: 'absolute',
    bottom: '75%',
    padding: 10,
    borderBottomLeftRadius: 20,
    borderTopLeftRadius: 20,
    left: '100%',
    shadowColor: '#2c2c2c',
    shadowOpacity: 0.6,
    shadowRadius: 5,
    elevation: 3,
    padding: 15,
    width: 100,
    transform: [{ translateX: -100 }, { translateY: 0 }],
  },
  text3: {
    fontSize: 20,
    color: "rgb(223, 55, 29)",
    fontWeight: 500
  },
  buttonsigiente: {
    backgroundColor: "rgba(255, 195, 107, 1)",
    borderRadius: 50,
    width: "20%",
    position: "absolute",
    zIndex: 2,
    left: "95%",
    top: "50%",
    transform: [{ translateX: -95 }, { translateY: -50 }]
  },
  children1: {
    padding: 5,
    display: "flex",
    flexDirection: "row",
    width: "80%",
    borderTopEndRadius: 20,
    boxShadow: "0 -3 4 2 rgba(44, 44, 44, 0.3)"
  },
  children2: {
    padding: 5,
    display: "flex",
    flexDirection: "row",
    width: "80%",
    borderEndEndRadius: 20,
    boxShadow: "0 3 4 2 rgba(44, 44, 44, 0.3)"
  },
  contenedor1: {
    zIndex:99,
    marginTop: 50,
    width: "100%"
  },
  text: {
    fontSize: 35,
    fontWeight: 500,
  },
  text2: {
    fontSize: 65,
    transform: [{ translateX: 25 }, { translateY: -5 }]
  },
  textinput: {
    fontWeight: "bold",
    padding: 20,
    minWidth:"60%"
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default Registrarte;