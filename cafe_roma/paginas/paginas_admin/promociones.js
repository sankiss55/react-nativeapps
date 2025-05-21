import { useEffect, useState } from "react";
import {
  Text,
  View,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  TextInput,
  Modal,
} from "react-native";
import accessToken from "../../config_loyverce/config";
import { Button } from "react-native";
const API_URL = "https://api.loyverse.com/v1.0";

export default function Promociones() {
  const [promocionesCategoryId, setPromocionesCategoryId] = useState(null);
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [promotionName, setPromotionName] = useState("");
  const [promotionPrice, setPromotionPrice] = useState("");

  const fetchPromociones = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      // Obtener categorías
      const categoriasResp = await fetch(`${API_URL}/categories`, {
        headers,
      });

      const categoriasData = await categoriasResp.json();
      const categoria = categoriasData.categories.find(
        (cat) => cat.name.toLowerCase() === "promociones"
      );

      if (!categoria) {
        console.warn("Categoría 'Promociones' no encontrada.");
        setLoading(false);
        return;
      }

      setPromocionesCategoryId(categoria.id); // Guardar el ID de la categoría "Promociones"

      // Obtener productos
      const productosResp = await fetch(`${API_URL}/items`, { headers });
      const productosData = await productosResp.json();

      const promociones = productosData.items.filter(
        (item) => item.category_id === categoria.id
      );

      setProductos(promociones);
      setFilteredProductos(promociones); // Inicialmente, mostrar todos los productos
    } catch (error) {
      console.error("Error al obtener promociones:", error);
    } finally {
      setLoading(false);
    }
  };
  const createPromotion = () => {
    const articulos = selectedProducts.map((product) => ({
      articulo: {
        id_articulo: product.id,
        nombre: product.item_name,
      },
      descripcion: product.description || "Sin descripción",
    }));

    const promotionData = {
      articulos,
      precio_total: parseFloat(promotionPrice),
    };

    console.log("Promoción creada:", JSON.stringify(promotionData, null, 2));
    Alert.alert("Promoción creada", "La promoción se ha creado exitosamente.");

    // Pasar promotionData como argumento
    createProductInLoyverse(promotionData).then(() => {
      // Traer los productos nuevamente después de crear la promoción
      fetchPromociones();
    });

    // Limpiar los datos de la ventana flotante
    setPromotionName("");
    setPromotionPrice("");
    setSelectedProducts([]);
    setModalVisible(false);
  };

  const createProductInLoyverse = async (promotionData) => {
    try {
      if (!promotionName || !promotionPrice) {
        Alert.alert(
          "Error",
          "Por favor, completa todos los campos antes de continuar."
        );
        return;
      }

      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json", // Cambiar a JSON
      };

      const body = {
        item_name: promotionName, // Nombre de la promoción
        category_id: promocionesCategoryId, // ID de la categoría "Promociones"
        description: JSON.stringify(promotionData, null, 2), // Descripción en formato JSON
        variants: [
          {
            default_pricing_type: "FIXED", // Tipo de precio fijo
            default_price: parseFloat(promotionPrice), // Precio de la promoción
          },
        ],
      };

      const response = await fetch(`${API_URL}/items`, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Producto creado en Loyverse:", data);
        Alert.alert("Éxito", "El producto se ha creado en Loyverse.");
      } else {
        const errorData = await response.json();
        console.error("Error al crear el producto en Loyverse:", errorData);
        Alert.alert("Error", "No se pudo crear el producto en Loyverse.");
      }
    } catch (error) {
      console.error("Error al enviar el producto a Loyverse:", error);
      Alert.alert("Error", "Ocurrió un error al enviar el producto.");
    }
  };
  const fetchAllProducts = async () => {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const productosResp = await fetch(`${API_URL}/items`, { headers });
      const productosData = await productosResp.json();
      setProductos(productosData.items);
    } catch (error) {
      console.error("Error al obtener productos:", error);
    }
  };

  const handleSearch = (text) => {
    setSearchText(text);
    if (text === "") {
      const filteredByCategory = productos.filter(
        (item) => item.category_id === promocionesCategoryId
      );
      setFilteredProductos(filteredByCategory); // Mostrar solo productos de la categoría "Promociones"
    } else {
      const filtered = productos.filter(
        (item) =>
          item.category_id === promocionesCategoryId &&
          item.item_name.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredProductos(filtered);
    }
  };

  const toggleProductSelection = (product) => {
    if (selectedProducts.includes(product)) {
      setSelectedProducts(selectedProducts.filter((p) => p !== product));
    } else {
      setSelectedProducts([...selectedProducts, product]);
    }
  };

  const deletePromotion = async (promotionId) => {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await fetch(`${API_URL}/items/${promotionId}`, {
        method: "DELETE",
        headers,
      });

      if (response.ok) {
        console.log("Promoción eliminada exitosamente.");
        Alert.alert("Éxito", "La promoción se ha eliminado exitosamente.");
        fetchPromociones(); // Actualizar la lista de promociones
      } else {
        const errorData = await response.json();
        console.error("Error al eliminar la promoción:", errorData);
        Alert.alert("Error", "No se pudo eliminar la promoción.");
      }
    } catch (error) {
      console.error("Error al eliminar la promoción:", error);
      Alert.alert("Error", "Ocurrió un error al eliminar la promoción.");
    }
  };

  useEffect(() => {
    fetchPromociones(); // Traer los productos al inicio
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  return (
    <View style={{ padding: 16 }}>
      <Text style={styles.title}>Promociones</Text>
      <TextInput
        style={styles.searchBar}
        placeholder="Buscar promociones..."
        value={searchText}
        onChangeText={handleSearch}
      />
      <TouchableOpacity
        style={styles.createButton}
        onPress={() => {
          fetchAllProducts();
          setModalVisible(true);
        }}
      >
        <Text style={styles.createButtonText}>Crear nueva promoción</Text>
      </TouchableOpacity>
      {filteredProductos.length > 0 ? (
        <FlatList
          data={filteredProductos}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <View style={styles.textContainer}>
                <Text style={styles.itemName}>{item.item_name}</Text>
                <Text style={styles.price}>
                  ${item.variants[0]?.default_price?.toFixed(2) || "0.00"}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deletePromotion(item.id)}
              >
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
      ) : (
        <Text>No hay productos que coincidan con la búsqueda.</Text>
      )}

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Nueva Promoción</Text>
          <TextInput
            style={styles.input}
            placeholder="Nombre de la promoción"
            value={promotionName}
            onChangeText={setPromotionName}
          />
          <TextInput
            style={styles.input}
            placeholder="Precio de la promoción"
            keyboardType="numeric"
            value={promotionPrice}
            onChangeText={setPromotionPrice}
          />
          <View style={styles.productListContainer}>
            <FlatList
              data={productos}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[
                    styles.row,
                    selectedProducts.includes(item) && styles.selectedRow,
                  ]}
                  onPress={() => toggleProductSelection(item)}
                >
                  <Text style={styles.itemName}>{item.item_name}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
          <Button title="Crear Promoción" onPress={createPromotion} />
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => setModalVisible(false)}
          >
            <Text style={styles.cancelButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#6B4226",
  },
  searchBar: {
    height: 40,
    borderColor: "#D3A588",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#FFF8E7",
    width: "100%",
  },
  row: {
    flexDirection: "row",
    padding: 16,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: "#D3A588",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF8E7",
  },
  textContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: "500",
    color: "#6B4226",
  },
  price: {
    fontSize: 16,
    fontWeight: "400",
    color: "#6B4226",
  },
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#FFF8E7",
    justifyContent: "center",
    alignItems: "center",
  },
  productListContainer: {
    flex: 1,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: "#D3A588",
    borderRadius: 8,
    backgroundColor: "#FFF",
    width: "100%",
  },
  selectedRow: {
    backgroundColor: "#D3A588",
  },
  input: {
    height: 40,
    borderColor: "#D3A588",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: "#FFF",
    width: "100%",
  },
  createButton: {
    backgroundColor: "#6B4226",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 16,
    width: "100%",
  },
  createButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#FF6347",
    padding: 8,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: "#FFF",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#6B4226",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
    width: "100%",
  },
  cancelButtonText: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  container: {
    flex: 1,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
  },
});