import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView,TouchableOpacity } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import Pedidos_mesas from "../../components/pedidos_mesas";

import { Svg, Path } from "react-native-svg";

import { initializeApp } from "firebase/app";
import {  getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import firebaseConfig from "../../config_firebase/config";
import { useNavigation } from "@react-navigation/native";
export default function Pag_pedidos({ route }) {
    const navigation = useNavigation();
     const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
  const {campo, cafeteria, nombre } = route.params;
  const [mesas, setMesas] = useState([]);

  useEffect(() => {
    async function fetchMesas() {
      try {
        const mesasRef = collection(db, "mesas");
        const q = query(mesasRef, where("cafeteria", "==", cafeteria));
        const querySnapshot = await getDocs(q);
        const mesasData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMesas(mesasData);
      } catch (error) {
        console.log("Error obteniendo mesas:", error);
      }
    }

    fetchMesas();
  }, [cafeteria]);

  return (
    <View style={styles.container}>
        <View style={styles.container_top}>
                <TouchableOpacity style={styles.btn_salir} onPress={()=>{
                    navigation.navigate('Admin');
                    navigation.reset({
                        index:0,
                        routes:[{name:'Admin'}]
                    })
                }} >
                    <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 14, fontWeight:'bold', color: "black", }}>
                        Salir
                    </Text>
                    <Svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><Path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></Svg>
                </TouchableOpacity>
            </View>
      <Text style={styles.titulo}>Hola, {nombre} </Text>
      <Text style={styles.subtitulo}>Pedidos</Text>

      <ScrollView>
        <Grid>
          {mesas.map(mesa => (
            <Row key={mesa.id} style={styles.row_mesas}>
              <Pedidos_mesas
                title={mesa.nombre_mesa || "Mesa"}
                text={`Estado:  "Desconocido"`}
                icon={
                  <Svg
                    xmlns="http://www.w3.org/2000/svg"
                    height="34px"
                    viewBox="0 -960 960 960"
                    width="34px"
                    fill="#000000"
                  >
                    <Path d="M440-80v-520H80l400-280 400 280H520v520h-80Zm40-600h146-292 146ZM120-80v-210L88-466l78-14 30 160h164v240h-80v-160h-80v160h-80Zm480 0v-240h164l30-160 78 14-32 176v210h-80v-160h-80v160h-80ZM334-680h292L480-782 334-680Z" />
                  </Svg>
                }
                color="#D6D0FC"
              />
            </Row>
          ))}
        </Grid>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#EEEEEE",
  },
  titulo: {
    fontFamily: "Poppins_400Regular",
    fontSize: 30,
    color: "black",
    marginLeft: 20,
    marginTop: 50,
  },
  subtitulo: {
    textAlign: "center",
    fontFamily: "Poppins_400Regular",
    color: "black",
    fontSize: 35,
    fontWeight: "600",
    marginLeft: 20,
    marginTop: 10,
  },
  row_mesas: {
    height: 150,
    marginTop: 20,
    borderRadius: 20,
    marginLeft: 20,
    marginRight: 20,
  },
   container_top:{
        marginTop:'10%',
        display:'flex',
        justifyContent:'space-between',
        alignItems:'flex-end',
        alignContent:'flex-end',
    },
    btn_salir:{
        borderRadius:10,
        borderWidth:2,
        borderColor:'black',
        width:100,
        height:40,
        marginRight:20,
        padding:10,
display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
    },
});
