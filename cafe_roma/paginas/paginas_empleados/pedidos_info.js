import { Text, View, TouchableOpacity, ScrollView } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc, onSnapshot } from "firebase/firestore";

import { initializeApp } from "firebase/app";
import firebaseConfig from "../../config_firebase/config";
import { useState, useEffect } from "react";
export default function Pedidos_info({ route, navigation }) {
  const { nombre_mesa, mesa_id, pedidos } = route.params;
  const nuevosPedidos = pedidos.filter(p => p.atendido === false);
  const anterioresPedidos = pedidos.filter(p => p.atendido === true);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const [pedidoss, setPedidos] = useState([]);
const eliminarPedidosMesa = async () => {
   
    
 
  try {
     const notasRef = collection(db, "mesas", mesa_id, "notas_productos");
    const snapshot = await getDocs(notasRef);

    const deletePromises = snapshot.docs.map(docSnap =>
      deleteDoc(doc(db, "mesas", mesa_id, "notas_productos", docSnap.id))
    );

    await Promise.all(deletePromises);

    const pedidosRef = collection(db, "mesas", mesa_id, "pedidos_mesas");
    const pedidosSnapshot = await getDocs(pedidosRef);
     const productos = pedidosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    console.log("Productos de la mesa:", productos);
    const deletePromises2 = pedidosSnapshot.docs.map((docSnap) =>
      deleteDoc(doc(db, "mesas", mesa_id, "pedidos_mesas", docSnap.id))
    );

    await Promise.all(deletePromises2);
    navigation.goBack(); 
  } catch (error) {
    console.error("Error eliminando pedidos:", error);
    alert("Hubo un error al eliminar los pedidos");
  }
};
useEffect(() => {
    // Referencia a la subcolección pedidos_mesas de la mesa
    const pedidosRef = collection(db, "mesas", mesa_id, "notas_productos");

    // Listener en tiempo real
    const unsubscribe = onSnapshot(
      pedidosRef,
      (snapshot) => {
        const pedidosActualizados = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setPedidos(pedidosActualizados);
      },
      (error) => {
        console.error("Error escuchando pedidos:", error);
      }
    );

    // Cleanup al desmontar componente
    return () => unsubscribe();
  }, [db, mesa_id]);
const marcarPedidosComoAtendidos = async (mesaId) => {
  try {
    const pedidosRef = collection(db, "mesas", mesaId, "pedidos_mesas");
    const snapshot = await getDocs(pedidosRef);

    const updates = [];

    snapshot.forEach((docSnap) => {
      const pedidoDocRef = doc(db, "mesas", mesaId, "pedidos_mesas", docSnap.id);
      updates.push(updateDoc(pedidoDocRef, { atendido: true }));
    });

    await Promise.all(updates);
    
    navigation.goBack(); 
    console.log("Todos los pedidos fueron marcados como atendidos.");
  } catch (error) {
    console.error("Error al marcar los pedidos como atendidos:", error);
  }
};
  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* Barra superior */}
      <View
        style={{
          marginTop: "10%",
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 15,
          paddingVertical: 10,
          backgroundColor: "#fff",
        }}
      >
        {/* Botón de retroceso */}
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>

        {/* Estado en rojo */}
        <TouchableOpacity
         onPress={() => marcarPedidosComoAtendidos(mesa_id)}
          style={{
            backgroundColor: "#E50000",
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "white", fontWeight: "bold", fontSize: 12 }}>
            Atendido en espera de pago
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={{ padding: 20 }}>
        {/* Título de la orden */}
        <Text style={{ fontSize: 24, fontWeight: "bold", marginBottom: 20 }}>
          Orden {nombre_mesa}
        </Text>

        {/* Nuevos pedidos */}
        {nuevosPedidos.length > 0 && (
          <View style={{ marginBottom: 30 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Nuevos Pedidos
            </Text>
            {nuevosPedidos.map((p, index) => (
              <View
                key={`nuevo-${index}`}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Text>{`${p.pedido} X${p.cantidad}`}</Text>
                <Text>{`$${(p.precio_unitario * p.cantidad).toFixed(2)}`}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Pedidos anteriores */}
        {anterioresPedidos.length > 0 && (
          <View style={{ marginBottom: 30 }}>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "bold",
                marginBottom: 10,
                textAlign: "center",
              }}
            >
              Órdenes Anteriores
            </Text>
            {anterioresPedidos.map((p, index) => (
              <View
                key={`anterior-${index}`}
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: 10,
                }}
              >
                <Text>{`${p.pedido} X${p.cantidad}`}</Text>
                <Text>{`$${(p.precio_unitario * p.cantidad).toFixed(2)}`}</Text>
              </View>
            ))}
          </View>
        )}
          <View style={{ marginBottom: 30 }}>
    <Text
      style={{
        fontSize: 22,
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
      }}
    >
      Observaciones
    </Text>
    {pedidoss.length === 0 ? (
      <Text style={{ fontStyle: "italic", textAlign: "center" }}>
        No hay observaciones.
      </Text>
    ) : (
      pedidoss.map((obs, index) => (
        <View
          key={`observacion-${index}`}
          style={{
            backgroundColor: "#fff",
            padding: 15,
            borderRadius: 8,
            marginBottom: 10,
            shadowColor: "#000",
            shadowOpacity: 0.1,
            shadowRadius: 5,
            elevation: 2,
          }}
        >
          <Text>{obs.observaciones}</Text>
        </View>
      ))
    )}
  </View>
      </ScrollView>

      {/* Botón Terminar Pedido */}
      <View style={{ padding: 20 }}>
        <TouchableOpacity 
  onPress={eliminarPedidosMesa}
          style={{
            backgroundColor: "#FFDE67",
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: "center",
          }}
        >
          <Text style={{ fontWeight: "bold" }}
 >Terminar Pedido</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
