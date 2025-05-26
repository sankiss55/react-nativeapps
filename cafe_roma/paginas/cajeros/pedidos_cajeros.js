import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView,TouchableOpacity } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import Pedidos_mesas from "../../components/pedidos_mesas";

import { Svg, Path } from "react-native-svg";

import { initializeApp } from "firebase/app";
import { collection, query, where, onSnapshot, getDocs, getFirestore, initializeFirestore } from "firebase/firestore";
import firebaseConfig from "../../config_firebase/config";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function PedidosCajeros({ route }) {
  const navigation = useNavigation();
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const { nombre } = route.params; // Eliminamos 'cafeteria' de los parámetros
  const [mesas, setMesas] = useState([]);

  useEffect(() => {
    const fetchPedidos = async () => {
      try {
        const cafeteria = await AsyncStorage.getItem("cafeteria");
        if (!cafeteria) {
          console.error("No se encontró la cafetería en AsyncStorage.");
          return;
        }

        const pedidosRef = collection(db, "pedidos");
        const q = query(pedidosRef, where("nombre_cafeteria", "==", cafeteria));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
          const pedidosUsuarios = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));

          // Agrupar pedidos por mesa
          const pedidosAgrupados = pedidosUsuarios.reduce((acc, pedido) => {
            const mesa = pedido.mesa || "sin_mesa";
            if (!acc[mesa]) {
              acc[mesa] = [];
            }
            acc[mesa].push(pedido);
            return acc;
          }, {});

          // Filtrar mesas cuyos pedidos no están completamente atendidos
          const mesasConPedidosAtendidos = Object.entries(pedidosAgrupados).reduce((acc, [mesa, pedidos]) => {
            const todosAtendidos = pedidos.every((pedido) => pedido.atendido);
            if (todosAtendidos) {
              acc[mesa] = pedidos;
            }
            return acc;
          }, {});

          setMesas(mesasConPedidosAtendidos);
        });

        return () => unsubscribe(); // Limpiar el oyente al desmontar el componente
      } catch (error) {
        console.error("Error al obtener pedidos:", error);
      }
    };

    fetchPedidos();
  }, []);

  const colores = ["#AEF2BF", "#F9DECD", "#FEE8A1", "#FFFFFF"];

  return (
    <View style={styles.container}>
      <View style={styles.container_top}>
        <TouchableOpacity
          style={styles.btn_salir}
          onPress={() => {
            navigation.navigate("Admin");
            navigation.reset({
              index: 0,
              routes: [{ name: "Admin" }],
            });
          }}
        >
          <Text
            style={{
              fontFamily: "Poppins_400Regular",
              fontSize: 14,
              fontWeight: "bold",
              color: "black",
            }}
          >
            Salir
          </Text>
         <Svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><Path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></Svg>
        </TouchableOpacity>
      </View>
      <Text style={styles.titulo}>Hola, {nombre} </Text>
      <Text style={styles.subtitulo}>Pedidos de Usuarios</Text>
      <ScrollView>
        <Grid>
          {Object.keys(mesas).map((mesa, index) => (
            <Row key={mesa} style={styles.row_mesas}>
              <Pedidos_mesas
                onPress={() =>
                  navigation.navigate("PedidosTerminados", {
                    pedidos: mesas[mesa],
                    id_mesa_pedido: mesa,
                  })
                }
                title={`Pedido para: ${mesa === 'parallevar' ? 'Para llevar' : mesa}`}
                text={`Pedidos: ${mesas[mesa].length}`}
                icon={
                  <Svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><Path d="M173-600h614l-34-120H208l-35 120Zm307-60Zm192 140H289l-11 80h404l-10-80ZM160-160l49-360h-89q-20 0-31.5-16T82-571l57-200q4-13 14-21t24-8h606q14 0 24 8t14 21l57 200q5 19-6.5 35T840-520h-88l48 360h-80l-27-200H267l-27 200h-80Z"/></Svg>
                }
                color={colores[index % colores.length]}
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
