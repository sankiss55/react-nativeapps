import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView,TouchableOpacity } from "react-native";
import { Grid, Row } from "react-native-easy-grid";
import Pedidos_mesas from "../../components/pedidos_mesas";

import { Svg, Path } from "react-native-svg";

import { initializeApp } from "firebase/app";
import { collection, query, where, onSnapshot, getDocs, getFirestore, initializeFirestore } from "firebase/firestore";
import firebaseConfig from "../../config_firebase/config";
import { useNavigation } from "@react-navigation/native";
export default function Pag_pedidos({ route }) {
    const navigation = useNavigation();
     const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
  const {campo, cafeteria, nombre, usuario, password } = route.params;
  const [mesas, setMesas] = useState([]);
useEffect(() => {
  const usuariosRef = collection(db, "usuarios");
  const q = query(
    usuariosRef,
    where("usuario", "==", usuario),
    where("password", "==", password),
    where("campo", "==", campo)
  );

  const unsubscribeUsuarios = onSnapshot(q, (querySnapshot) => {
    const pedidosUsuarios = [];

    querySnapshot.forEach((doc) => {
      const usuarioId = doc.id;
      const pedidosRef = collection(db, "usuarios", usuarioId, "pedidos_usuarios");

      const unsubscribePedidos = onSnapshot(pedidosRef, (pedidosSnap) => {
        const pedidos = pedidosSnap.docs.map((pedidoDoc) => ({
          id: pedidoDoc.id,
          ...pedidoDoc.data(),
        }));

        const usuarioIndex = pedidosUsuarios.findIndex(u => u.usuarioId === usuarioId);
        if (usuarioIndex !== -1) {
          pedidosUsuarios[usuarioIndex].pedidos = pedidos;
        } else {
          pedidosUsuarios.push({
            usuarioId,
            pedidos,
          });
        }

        setMesas([...pedidosUsuarios]); // Actualiza el estado con los pedidos
      });

      // Cleanup para cada oyente de pedidos
      return () => unsubscribePedidos();
    });
  });

  // Cleanup para el oyente de usuarios
  return () => unsubscribeUsuarios();
}, [campo, usuario, password]);
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
          <Svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><Path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></Svg>
        </TouchableOpacity>
      </View>
      <Text style={styles.titulo}>Hola, {nombre} </Text>
      <Text style={styles.subtitulo}>Pedidos de Usuarios</Text>
      <ScrollView>
        <Grid>
          {mesas.map((usuario, index) => {
            const pedidosPorMesa = usuario.pedidos.reduce((acc, pedido) => {
              const { mesa } = pedido;

              if (mesa === "parallevar") {
                acc[`${mesa}-${pedido.id}`] = [pedido];
              } else {
                if (!acc[mesa]) {
                  acc[mesa] = [];
                }
                acc[mesa].push(pedido);
              }

              return acc;
            }, {});

            return Object.keys(pedidosPorMesa)
              .filter(
                (mesa) =>
                  pedidosPorMesa[mesa].filter((p) => !p.atendido).length > 0
              ) // Filtrar mesas con pendientes
              .map((mesa, mesaIndex) => (
                <Row
                  key={`${usuario.usuarioId}-${mesa}`}
                  style={styles.row_mesas}
                >
                  <Pedidos_mesas
                    opacity={
                      pedidosPorMesa[mesa].some((p) => !p.atendido) ? 1 : 0.5
                    }
                    onPress={() =>
                      navigation.navigate("Pedidos_info", {
                        usuarioId: usuario.usuarioId,
                        pedidos: pedidosPorMesa[mesa],
                        id_usuario_pedido:pedidosPorMesa[mesa][0].id_usuario,
                      })
                    }
                    title={
                      mesa.includes("parallevar")
                        ? "Pedido: Para llevar"
                        : `Pedido para: ${mesa}`
                    }
                    text={`Pedidos: ${
                      pedidosPorMesa[mesa].length
                    } | Pendientes: ${
                      pedidosPorMesa[mesa].filter((p) => !p.atendido).length
                    }`}
                    icon={
                      <Svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="black"><Path d="M173-600h614l-34-120H208l-35 120Zm307-60Zm192 140H289l-11 80h404l-10-80ZM160-160l49-360h-89q-20 0-31.5-16T82-571l57-200q4-13 14-21t24-8h606q14 0 24 8t14 21l57 200q5 19-6.5 35T840-520h-88l48 360h-80l-27-200H267l-27 200h-80Z"/></Svg>
                    }
                    color={colores[(index + mesaIndex) % colores.length]}
                  />
                </Row>
              ));
          })}
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
