import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, Modal } from "react-native";
import * as FileSystem from "expo-file-system";
import { printToFileAsync } from "expo-print";
import { Asset } from "expo-asset";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import firebaseConfig from "../../config_firebase/config";
import {  TextInput } from "react-native";
import { SelectList } from "react-native-dropdown-select-list"; // Importar SelectList

export default function PedidosTerminados({ route, navigation }) {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const { pedidos } = route.params;

  // Agrupar productos por promoción
  const pedidosAgrupados = pedidos.reduce((acc, pedido) => {
    if (pedido.promo) {
      const [promoName, promoId] = pedido.promo.split("|");
      if (!acc[promoId]) {
        acc[promoId] = { promoName, cantidad: 0, productos: [], precio_unitario: 0 };
      }
      acc[promoId].cantidad += pedido.cantidad;
      acc[promoId].productos.push(pedido.pedido);
      acc[promoId].precio_unitario += (pedido.precio_unitario || 0) * pedido.cantidad;
    } else {
      acc[pedido.id] = { ...pedido, cantidad: pedido.cantidad, productos: [pedido.pedido] };
    }
    return acc;
  }, {});

  const pedidosFinales = Object.values(pedidosAgrupados);

  // Calcular total
  const totalCompra = pedidosFinales.reduce((sum, pedido) => {
    return sum + pedido.precio_unitario;
  }, 0);

  const [modalVisible, setModalVisible] = useState(false);
  const [metodoPago, setMetodoPago] = useState("");
  const [montoPago, setMontoPago] = useState("");

  const opcionesPago = [
    { key: "Tarjeta", value: "Tarjeta" },
    { key: "Efectivo", value: "Efectivo" },
  ];

  const imprimirRecibo = async () => {
    setModalVisible(true); // Mostrar el modal para seleccionar método de pago y monto
  };

  const handleConfirmarPago = async () => {
    if (!metodoPago) {
      Alert.alert("Error", "Seleccione un método de pago.");
      return;
    }

    const monto = parseFloat(montoPago);
    if (isNaN(monto) || monto <= 0) {
      Alert.alert("Error", "Ingrese un monto válido.");
      return;
    }

    setModalVisible(false); // Ocultar el modal

    // Continuar con la generación del recibo
    const asset = Asset.fromModule(require("./../../img/logo.png"));
    await asset.downloadAsync();
    const base64Img = await FileSystem.readAsStringAsync(asset.localUri, { encoding: FileSystem.EncodingType.Base64 });

    const html = `<div style="font-size: 20px; padding: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="data:image/png;base64,${base64Img}" style="width: 150px; height: auto;" />
        <h1 style="font-size: 45px; margin: 10px 0;">Recibo</h1>
        <h1 style="font-size: 45px; margin: 10px 0;">¡Gracias por su compra!</h1>
      </div>
      <hr style="margin: 20px 0;" />
      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
        <thead>
          <tr>
            <th style="text-align: left; padding: 8px; border-bottom: 2px solid #ddd;">
              <h1 style="font-size: 45px; margin: 0;">Producto</h1>
            </th>
            <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">
              <h1 style="font-size: 45px; margin: 0;">Cantidad</h1>
            </th>
            <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">
              <h1 style="font-size: 45px; margin: 0;">Precio Unitario</h1>
            </th>
            <th style="text-align: right; padding: 8px; border-bottom: 2px solid #ddd;">
              <h1 style="font-size: 45px; margin: 0;">Subtotal</h1>
            </th>
          </tr>
        </thead>
        <tbody>
          ${pedidosFinales
            .map((pedido) => {
              const subtotal = pedido.precio_unitario;
              return `
                <tr>
                  <td style="padding: 8px; border-bottom: 1px solid #ddd;">
                    <h1 style="font-size: 45px; margin: 0;">${pedido.promoName || pedido.productos.join(", ")}</h1>
                  </td>
                  <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">
                    <h1 style="font-size: 45px; margin: 0;">${pedido.cantidad}</h1>
                  </td>
                  <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">
                    <h1 style="font-size: 45px; margin: 0;">$${(subtotal / pedido.cantidad).toFixed(2)}</h1>
                  </td>
                  <td style="text-align: right; padding: 8px; border-bottom: 1px solid #ddd;">
                    <h1 style="font-size: 45px; margin: 0;">$${subtotal.toFixed(2)}</h1>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
      <div style="text-align: right; margin-top: 20px;">
        <h1 style="font-size: 50px;">Total: $${totalCompra.toFixed(2)}</h1>
        <h1 style="font-size: 45px;">Método de Pago: ${metodoPago}</h1>
        <h1 style="font-size: 45px;">Monto Pagado: $${monto.toFixed(2)}</h1>
        <h1 style="font-size: 45px;">Cambio: $${(monto - totalCompra).toFixed(2)}</h1>
      </div>
    </div>`;

    const { uri } = await printToFileAsync({ html });

    const pdfBase64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const intentUrl = `rawbt:data:application/pdf;base64,${pdfBase64}`;
    const canOpen = await Linking.canOpenURL(intentUrl);
    if (!canOpen) {
      Alert.alert("Error", "RawBT no está instalado o no es compatible.");
      return;
    }

    await Linking.openURL(intentUrl);

    for (const pedido of pedidos) {
      const pedidoRef = doc(db, "pedidos", pedido.id);
      await deleteDoc(pedidoRef);
    }

    Alert.alert("Éxito", "El recibo ha sido impreso y los pedidos eliminados.");
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pedido Terminado</Text>
      {pedidosFinales.map((pedido, index) => (
        <View key={index} style={styles.pedidoContainer}>
          <Text style={styles.pedidoText}>
            {pedido.promoName || pedido.productos.join(", ")} x{pedido.cantidad} - $
            {(pedido.precio_unitario / pedido.cantidad).toFixed(2)} c/u
          </Text>
        </View>
      ))}
      <View style={styles.totalContainer}>
        <Text style={styles.totalText}>Total de la compra: ${totalCompra.toFixed(2)}</Text>
      </View>
      <TouchableOpacity style={styles.button} onPress={imprimirRecibo}>
        <Text style={styles.buttonText}>Imprimir Recibo</Text>
      </TouchableOpacity>

      {/* Modal para método de pago */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Método de Pago</Text>
            <SelectList
              setSelected={setMetodoPago}
              data={opcionesPago}
              placeholder="Seleccione un método"
              boxStyles={styles.selectList}
            />
            <TextInput
              placeholder="Ingrese el monto pagado"
              keyboardType="numeric"
              value={montoPago}
              onChangeText={setMontoPago}
              style={styles.input}
            />
            <TouchableOpacity style={styles.modalButton} onPress={handleConfirmarPago}>
              <Text style={styles.modalButtonText}>Confirmar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f5f5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  pedidoContainer: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  pedidoText: {
    fontSize: 16,
    color: "#333",
  },
  totalContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  totalText: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
  },
  selectList: {
    width: "100%",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
