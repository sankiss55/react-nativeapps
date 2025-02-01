import React, { useState } from 'react';
import { View, Text, Button,StatusBar, StyleSheet,TouchableOpacity } from 'react-native';
export default function App() {
  const [contador, cambiocontador] = useState(0); // Estado inicial en 0

  return (
    <View style={styles.container}>
    <StatusBar barStyle="dark-content" backgroundColor="rgb(0,0,0)" />
     <View style={styles.topBar}>
        <Text style={styles.texto2}>Echo por Santiago Vera :){"\n"} Instagran:@07san_vs12  </Text>
      </View>
      <Text style={styles.texto}>Contador: {contador}</Text>
     
      <View style={styles.divs}>
      <TouchableOpacity style={styles.boton} onPress={() => cambiocontador(contador+1)}>
      <Text style={styles.texto}>+</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.boton} onPress={() => cambiocontador(contador-1)}>
      <Text style={styles.texto}>-</Text>
      </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
   topBar: {
    backgroundColor: 'rgb(0, 123, 255)', 
    justifyContent: 'center',
    position: 'absolute', 
    top: "4%",
    left: 0,
    right: 0,
  },
  divs:{
    width:"100%",
    height:"7%",
    display:"flex",
    flexDirection:'row', 
    justifyContent:"center",
    marginTop: 40,
    gap:30
  },
  boton:{
    backgroundColor:"rgb(255, 234, 124)",
    marginLeft:10,
    justifyContent:"center",
    width: "15%",
    borderRadius:100,
    padding:10,
  },
  container: { backgroundColor:"rgb(99, 174, 219)", flex: 1, justifyContent: "center", alignItems: "center" },
  texto: { fontSize: 20, fontWeight: "bold",
    textAlign:"center" },
     texto2: { fontSize: 16,padding:10,
    textAlign:"center" }
});
