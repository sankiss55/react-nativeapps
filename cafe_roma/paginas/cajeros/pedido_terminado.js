import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert, Linking, Modal, Switch } from "react-native";
import * as FileSystem from "expo-file-system";
import { printToFileAsync } from "expo-print";
import { Asset } from "expo-asset";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, deleteDoc } from "firebase/firestore";
import firebaseConfig from "../../config_firebase/config";
import { TextInput } from "react-native";
import { SelectList } from "react-native-dropdown-select-list"; // Importar SelectList
import accessToken from "../../config_loyverce/config"; // Importar token de Loyverse

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
  const [errorMonto, setErrorMonto] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cuentasSeparadas, setCuentasSeparadas] = useState(false); // Nuevo estado

  const opcionesPago = [
    { key: "Tarjeta", value: "Tarjeta" },
    { key: "Efectivo", value: "Efectivo" },
  ];

  const imprimirRecibo = async () => {
    setModalVisible(true); // Mostrar el modal para seleccionar método de pago y monto
    // Inicializar con el monto exacto por defecto
    setMontoPago(totalCompra.toString());
  };

  // Función para crear recibo en Loyverse
  const crearReciboLoyverse = async (metodoPago, montoPagado, pedidosFinalesOverride) => {
    try {
      setIsLoading(true);
      
      // Obtener ID de la tienda
      const storeResponse = await fetch('https://api.loyverse.com/v1.0/stores', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!storeResponse.ok) {
        throw new Error('No se pudieron obtener las tiendas');
      }
      
      const storeData = await storeResponse.json();
      if (!storeData.stores || storeData.stores.length === 0) {
        throw new Error('No hay tiendas disponibles');
      }
      
      const storeId = storeData.stores[0].id;
      
      // Obtener ID del cajero
      const employeeResponse = await fetch('https://api.loyverse.com/v1.0/employees', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!employeeResponse.ok) {
        throw new Error('No se pudieron obtener los empleados');
      }
      
      const employeeData = await employeeResponse.json();
      if (!employeeData.employees || employeeData.employees.length === 0) {
        throw new Error('No hay empleados disponibles');
      }
      
      const employeeId = employeeData.employees[0].id;
      
      // NUEVO: Obtener los tipos de pago disponibles
      const paymentTypesResponse = await fetch('https://api.loyverse.com/v1.0/payment_types', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!paymentTypesResponse.ok) {
        throw new Error('No se pudieron obtener los tipos de pago');
      }
      
      const paymentTypesData = await paymentTypesResponse.json();
      console.log("Tipos de pago disponibles:", paymentTypesData);
      
      if (!paymentTypesData.payment_types || paymentTypesData.payment_types.length === 0) {
        throw new Error('No hay tipos de pago disponibles');
      }
      
      // Encontrar el payment_type_id correspondiente al método de pago
      let paymentTypeId = null;
      
      // Buscar un tipo de pago que coincida con nuestro método
      for (const paymentType of paymentTypesData.payment_types) {
        // Verificar si es un tipo de pago en efectivo o tarjeta según lo que seleccionó el usuario
        if (metodoPago === "Efectivo" && paymentType.type === "CASH") {
          paymentTypeId = paymentType.id;
          break;
        } else if (metodoPago === "Tarjeta" && paymentType.type === "CARD") {
          paymentTypeId = paymentType.id;
          break;
        }
      }
      
      // Si no encontramos el tipo de pago, usar el primer tipo por defecto
      if (!paymentTypeId) {
        console.warn(`No se encontró un tipo de pago para "${metodoPago}", usando el primer tipo disponible`);
        paymentTypeId = paymentTypesData.payment_types[0].id;
      }
      
      // 1. Obtener todos los productos y variantes de Loyverse
      const itemsResponse = await fetch('https://api.loyverse.com/v1.0/items', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!itemsResponse.ok) {
        throw new Error('No se pudieron obtener los productos');
      }
      
      const itemsData = await itemsResponse.json();
      console.log("Productos obtenidos:", JSON.stringify(itemsData, null, 2));
      
      // Función para generar un UUID válido en formato v4
      const generateUUID = () => {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
          const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
          return v.toString(16);
        });
      };
      
      // Intentar buscar variantes por cada producto primero
      let productVariants = {}; // Mapa de nombre de producto a variant_id
      let anyVariantId = null; // Cualquier variant_id válido para usar como fallback

      if (itemsData.items && Array.isArray(itemsData.items)) {
        // Recorrer todos los productos para mapear nombres a variant_ids
        itemsData.items.forEach(item => {
          // La API de Loyverse usa item_name, no name
          const itemName = item.item_name || ""; // Aseguramos que nunca sea undefined
          
          if (item.variants && item.variants.length > 0) {
            // Guardar variant_id para este producto específico
            productVariants[itemName.toLowerCase()] = item.variants[0].variant_id; // Usando variant_id correcto
            
            // También guardar el primer variant_id que encontremos como respaldo
            if (!anyVariantId) {
              anyVariantId = item.variants[0].variant_id;
              console.log("Encontrado variant_id de respaldo:", anyVariantId);
            }
          }
          
          // También guardamos el mapping de SKU a variant_id si está disponible
          if (item.variants && item.variants.length > 0 && item.variants[0].sku) {
            productVariants[item.variants[0].sku] = item.variants[0].variant_id;
          }
        });
      }

      console.log("Productos mapeados:", productVariants);

      // Si no encontramos ningún variant_id, generamos un UUID válido
      if (!anyVariantId) {
        anyVariantId = generateUUID();
        console.log("Generando UUID para variant_id:", anyVariantId);
      }
      
      // Formatear líneas del recibo asegurándonos de incluir variant_id
      const lineItems = pedidosFinales.map(pedido => {
        const productName = (pedido.promoName || pedido.productos.join(", ") || "").toString();
        
        // Intentar encontrar un variant_id específico para este producto
        let variantId = productVariants[productName.toLowerCase()];
        if (!variantId) {
          const productKey = Object.keys(productVariants).find(key => 
            productName.toLowerCase().includes(key) || key.includes(productName.toLowerCase())
          );
          if (productKey) {
            variantId = productVariants[productKey];
          }
        }
        if (!variantId) {
          variantId = anyVariantId;
        }

        // Si el variantId existe en el mapeo, NO enviar name ni custom_sale
        if (variantId && Object.values(productVariants).includes(variantId)) {
          return {
            variant_id: variantId,
            quantity: pedido.cantidad,
            price: pedido.precio_unitario / pedido.cantidad
          };
        } else {
          // Venta personalizada
          return {
            name: productName,
            quantity: pedido.cantidad,
            price: pedido.precio_unitario / pedido.cantidad,
            custom_sale: true
          };
        }
      });
      
      // Crear objeto de recibo con la estructura correcta
      const receiptData = {
        store_id: storeId,
        employee_id: employeeId,
        receipt_type: "SALE",
        line_items: lineItems,
        payments: [
          {
            // type: metodoPago === "Tarjeta" ? "CARD" : "CASH", // <-- Eliminar esta línea
            amount: parseFloat(montoPagado),
            payment_type_id: paymentTypeId
          }
        ]
      };
      
      console.log("Enviando datos del recibo a Loyverse:", JSON.stringify(receiptData, null, 2));
      
      // Enviar a API de Loyverse
      const response = await fetch('https://api.loyverse.com/v1.0/receipts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(receiptData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Respuesta de error completa:", JSON.stringify(errorData, null, 2));
        throw new Error(`Error al crear recibo: ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      console.log("Recibo creado con éxito:", data);
      return data.receipt_number;
    } catch (error) {
      console.error("Error con la API de Loyverse:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para imprimir ticket (RawBT)
  const imprimirTicket = async (reciboNumero, pedidosFinalesTicket, totalTicket, metodoPagoTicket, montoTicket) => {
    const asset = Asset.fromModule(require("./../../img/logo.png"));
    await asset.downloadAsync();
    const base64Img = await FileSystem.readAsStringAsync(asset.localUri, { encoding: FileSystem.EncodingType.Base64 });

    const html = `<div style="font-size: 20px; padding: 20px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="data:image/png;base64,${base64Img}" style="width: 150px; height: auto;" />
        <h1 style="font-size: 45px; margin: 10px 0;">Recibo #${reciboNumero || 'SIN-NUMERO'}</h1>
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
          ${pedidosFinalesTicket
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
        <h1 style="font-size: 50px;">Total: $${totalTicket.toFixed(2)}</h1>
        <h1 style="font-size: 45px;">Método de Pago: ${metodoPagoTicket}</h1>
        <h1 style="font-size: 45px;">Monto Pagado: $${montoTicket.toFixed(2)}</h1>
        <h1 style="font-size: 45px;">Cambio: $${(montoTicket - totalTicket).toFixed(2)}</h1>
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
  };

  const handleConfirmarPago = async () => {
    if (!metodoPago) {
      Alert.alert("Error", "Seleccione un método de pago.");
      return;
    }

    const monto = parseFloat(montoPago);
    if (isNaN(monto)) {
      setErrorMonto("Ingrese un monto válido.");
      return;
    }

    // Validar que el monto sea igual o mayor al total
    if (monto < totalCompra) {
      setErrorMonto(`El monto debe ser igual o mayor a $${totalCompra.toFixed(2)}`);
      return;
    }
    
    setErrorMonto("");
    setModalVisible(false); // Ocultar el modal

    try {
      if (cuentasSeparadas) {
        // Procesar cada usuario por separado
        for (const [idUsuario, pedidosUsuario] of Object.entries(pedidosPorUsuario)) {
          // Agrupar productos por promoción para este usuario
          const pedidosAgrupados = pedidosUsuario.reduce((acc, pedido) => {
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
          const pedidosFinalesUsuario = Object.values(pedidosAgrupados);
          const totalUsuario = pedidosFinalesUsuario.reduce((sum, pedido) => sum + pedido.precio_unitario, 0);

          // Crear recibo y obtener número
          const reciboNumero = await crearReciboLoyverse(metodoPago, totalUsuario, pedidosFinalesUsuario);

          // Imprimir ticket individual
          await imprimirTicket(
            reciboNumero,
            pedidosFinalesUsuario,
            totalUsuario,
            metodoPago,
            totalUsuario // Se asume que paga exacto, puedes ajustar si quieres pedir monto individual
          );
        }
        // Eliminar todos los pedidos de Firebase
        for (const pedido of pedidos) {
          const pedidoRef = doc(db, "pedidos", pedido.id);
          await deleteDoc(pedidoRef);
        }
        navigation.goBack();
      } else {
        // Crear recibo en Loyverse
        const reciboNumero = await crearReciboLoyverse(metodoPago, monto);
        
        // Imprimir ticket
        await imprimirTicket(
          reciboNumero,
          pedidosFinales,
          totalCompra,
          metodoPago,
          monto
        );

        // Eliminar pedidos de Firebase
        for (const pedido of pedidos) {
          const pedidoRef = doc(db, "pedidos", pedido.id);
          await deleteDoc(pedidoRef);
        }

        navigation.goBack();
      }
    } catch (error) {
      console.error("Error al procesar el pago:", error);
      Alert.alert("Error", "Ocurrió un error al procesar el pago. Por favor intente de nuevo.");
    }
  };

  // Agrupar productos por usuario si cuentas separadas
  const pedidosPorUsuario = pedidos.reduce((acc, pedido) => {
    const idUsuario = pedido.id_usuario || "sin_usuario";
    if (!acc[idUsuario]) acc[idUsuario] = [];
    acc[idUsuario].push(pedido);
    return acc;
  }, {});

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
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Método de Pago</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>X</Text>
              </TouchableOpacity>
            </View>
            
            <Text style={styles.modalLabel}>Total a pagar: ${totalCompra.toFixed(2)}</Text>
            
            <Text style={styles.modalLabel}>Método de pago:</Text>
            <SelectList
              setSelected={setMetodoPago}
              data={opcionesPago}
              placeholder="Seleccione un método"
              boxStyles={styles.selectList}
              defaultOption={opcionesPago[0]}
            />
            
            <Text style={styles.modalLabel}>Monto recibido:</Text>
            <TextInput
              placeholder="Ingrese el monto pagado"
              keyboardType="numeric"
              value={montoPago}
              onChangeText={(text) => {
                setMontoPago(text);
                setErrorMonto("");
              }}
              style={styles.input}
            />
            {errorMonto ? <Text style={styles.errorText}>{errorMonto}</Text> : null}
            
            {metodoPago === "Efectivo" && (
              <View style={styles.cambioContainer}>
                <Text style={styles.cambioLabel}>
                  Cambio: ${((parseFloat(montoPago) || 0) - totalCompra) > 0 ? ((parseFloat(montoPago) || 0) - totalCompra).toFixed(2) : '0.00'}
                </Text>
              </View>
            )}

            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
              <Text style={{ fontSize: 16, fontWeight: "bold", marginRight: 10 }}>Cuentas separadas</Text>
              <Switch
                value={cuentasSeparadas}
                onValueChange={setCuentasSeparadas}
              />
            </View>
            
            <TouchableOpacity 
              style={[styles.modalButton, isLoading && styles.buttonDisabled]}
              onPress={handleConfirmarPago}
              disabled={isLoading}
            >
              <Text style={styles.modalButtonText}>
                {isLoading ? "Procesando..." : "Confirmar Pago"}
              </Text>
            </TouchableOpacity>

            {/* Botón adicional para cerrar el modal */}
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: "#888", marginTop: 10 }]}
              onPress={() => setModalVisible(false)}
              disabled={isLoading}
            >
              <Text style={styles.modalButtonText}>Cerrar</Text>
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
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#555",
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 5,
    color: "#444",
  },
  selectList: {
    marginBottom: 15,
    borderColor: "#ccc",
  },
  input: {
    width: "100%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  errorText: {
    color: "red",
    fontSize: 14,
    marginBottom: 10,
  },
  cambioContainer: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginBottom: 15,
  },
  cambioLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  modalButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  buttonDisabled: {
    backgroundColor: "#cccccc",
  },
});
