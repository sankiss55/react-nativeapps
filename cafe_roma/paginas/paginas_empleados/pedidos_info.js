import { Text, View, TouchableOpacity, ScrollView, Alert } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { getFirestore, collection, getDocs, deleteDoc, doc, updateDoc, onSnapshot, query, where } from "firebase/firestore";

import { initializeApp } from "firebase/app";
import firebaseConfig from "../../config_firebase/config";
import { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
export default function Pedidos_info({ route }) {
  const navigation = useNavigation();
  const { usuarioId, pedidos, id_usuario_pedido } = route.params; 

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const [pedidosActualizados, setPedidosActualizados] = useState(
    pedidos.map((p) => ({ ...p })) // Inicializar con los pedidos recibidos
  );
  const [observaciones, setObservaciones] = useState(null);

  useEffect(() => {
    const obtenerObservaciones = async () => {
      try {
        const observacionesRef = collection(db, "usuarios", usuarioId, "observaciones");
        const q = query(observacionesRef, where("id_usuario", "==", id_usuario_pedido));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
          const observacionData = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setObservaciones(observacionData);
        } else {
          setObservaciones([]);
        }
      } catch (error) {
        console.error("Error al obtener las observaciones:", error);
        Alert.alert("Error", "No se pudieron cargar las observaciones.");
      }
    };

    obtenerObservaciones();
  }, [usuarioId, id_usuario_pedido]);

  // Nuevo useEffect para borrar pedidos y observaciones si todos están atendidos
  useEffect(() => {
    const borrarTodoSiNoPendientes = async () => {
      if (
        pedidosActualizados.length > 0 &&
        pedidosActualizados.every((p) => p.atendido)
      ) {
        try {
          // Solo borrar los pedidos del usuario en pedidos_usuarios (NO en pedidos global)
          for (const p of pedidosActualizados) {
            const pedidoRef = doc(db, "usuarios", usuarioId, "pedidos_usuarios", p.id);
            await deleteDoc(pedidoRef);
          }
          // Borrar todas las observaciones del usuario
          const observacionesRef = collection(db, "usuarios", usuarioId, "observaciones");
          const q = query(observacionesRef, where("id_usuario", "==", id_usuario_pedido));
          const querySnapshot = await getDocs(q);
          for (const docObs of querySnapshot.docs) {
            await deleteDoc(docObs.ref);
          }
          setPedidosActualizados([]);
          setObservaciones([]);
         
          navigation.goBack();
        } catch (error) {
          console.error("Error al borrar pedidos y observaciones:", error);
        }
      }
    };
    borrarTodoSiNoPendientes();
  }, [pedidosActualizados, usuarioId, id_usuario_pedido, db, navigation]);

  const toggleAtendido = async (pedidoId, currentStatus) => {
    try {
      // Actualizar en la colección "pedidos_usuarios"
      const pedidoRef = doc(db, "usuarios", usuarioId, "pedidos_usuarios", pedidoId);
      await updateDoc(pedidoRef, { atendido: !currentStatus });

      // Actualizar en la colección "pedidos"
      const pedidoGlobalRef = doc(db, "pedidos", pedidoId);
      await updateDoc(pedidoGlobalRef, { atendido: !currentStatus });

      // Actualizar el estado local
      setPedidosActualizados((prevPedidos) =>
        prevPedidos.map((p) =>
          p.id === pedidoId ? { ...p, atendido: !currentStatus } : p
        )
      );
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);
      alert("Hubo un error al actualizar el estado del pedido.");
    }
  };

  const eliminarPedido = async (pedidoId) => {
    try {
      // Eliminar de la colección "pedidos_usuarios"
      const pedidoRef = doc(db, "usuarios", usuarioId, "pedidos_usuarios", pedidoId);
      await deleteDoc(pedidoRef);


      // Actualizar el estado local
      setPedidosActualizados((prevPedidos) =>
        prevPedidos.filter((p) => p.id !== pedidoId)
      );
    } catch (error) {
      console.error("Error al eliminar el pedido:", error);
      alert("Hubo un error al eliminar el pedido.");
    }
  };

  if (pedidosActualizados.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: 18, color: "gray" }}>No hay pedidos disponibles.</Text>
      </View>
    );
  }

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
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={{ fontSize: 18, fontWeight: "bold" }}>Pedidos de Usuario</Text>
      </View>

      <ScrollView style={{ padding: 20 }}>
        {pedidosActualizados.map((p, index) => (
          <View
            key={`pedido-${index}`}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 10,
              backgroundColor: "#fff",
              padding: 10,
              borderRadius: 8,
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 2,
            }}
          >
            <TouchableOpacity
              onPress={() => toggleAtendido(p.id, p.atendido)}
              style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
            >
              <Icon
                name={p.atendido ? "checkmark-circle" : "ellipse-outline"}
                size={24}
                color={p.atendido ? "green" : "gray"}
                style={{ marginRight: 10 }}
              />
              <Text
                style={{
                  textDecorationLine: p.atendido ? "line-through" : "none", // Línea en medio si está atendido
                  color: p.atendido ? "green" : "black", // Color verde si está atendido
                }}
              >
                {`${p.pedido} X${p.cantidad}`}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => eliminarPedido(p.id)}>
              <Icon name="trash" size={24} color="red" />
            </TouchableOpacity>
          </View>
        ))}

        {/* Mostrar observaciones */}
        {observaciones && observaciones.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
              Observaciones:
            </Text>
            {observaciones.map((obs) => (
              <View
                key={obs.id}
                style={{
                  backgroundColor: "#fff",
                  padding: 10,
                  borderRadius: 8,
                  marginBottom: 10,
                  shadowColor: "#000",
                  shadowOpacity: 0.1,
                  shadowRadius: 5,
                  elevation: 2,
                }}
              >
                <Text style={{ fontSize: 16, color: "black" }}>{obs.observacion}</Text>
                <Text style={{ fontSize: 12, color: "gray" }}>{obs.fecha}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
