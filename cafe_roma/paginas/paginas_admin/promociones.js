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
  const [allProductos, setAllProductos] = useState([]); // <-- Nuevo estado para todos los productos
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState([]); // Grupos ya armados
  const [currentGroupProducts, setCurrentGroupProducts] = useState([]); // Productos seleccionados en el grupo actual
  const [currentGroupDescription, setCurrentGroupDescription] = useState(""); // Descripción del grupo actual
  const [promotionName, setPromotionName] = useState("");
  const [promotionPrice, setPromotionPrice] = useState("");
  const [currentStep, setCurrentStep] = useState(1); // Paso actual en la selección de productos
  const [maxSteps, setMaxSteps] = useState(''); // Número máximo de productos en la promoción

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
  const createPromotion = (groups) => {
    const articulos = groups.map((group) => {
      // Si hay varias opciones seleccionadas en un producto
      if (
        group.grupo.length === 1 &&
        group.grupo[0].opciones?.some((o) => o.selected)
      ) {
        const opcionesSeleccionadas = group.grupo[0].opciones.filter((o) => o.selected);
        return {
          articulo: {
            opciones: opcionesSeleccionadas.map((opcion) => ({
              id_articulo: opcion.id,
              precio: opcion.price,
              nombre: opcion.item_name,
              descripcion: opcion.description || "Sin descripción",
            })),
          },
          descripcion: group.descripcion || group.grupo[0].descripcion || "Elige una opción.",
        };
      }
      // Si es un solo producto sin opciones seleccionadas
      if (group.grupo.length === 1) {
        const prod = group.grupo[0];
        return {
          articulo: {
            id_articulo: prod.id,
            precio: prod.precio,
            nombre: prod.nombre,
            descripcion: prod.descripcion,
          },
          descripcion: group.descripcion || prod.descripcion || "",
        };
      }
      // Si hay varios productos en el grupo (sin opciones)
      return {
        articulo: {
          opciones: group.grupo.map((prod) => ({
            id_articulo: prod.id,
            precio: prod.precio,
            nombre: prod.nombre,
            descripcion: prod.descripcion,
          })),
        },
        descripcion: group.descripcion || "Elige una opción.",
      };
    });

    const promotionData = {
      articulos,
      precio_total: parseFloat(promotionPrice),
    };

    console.log("Promoción creada:", JSON.stringify(promotionData, null, 2));
    Alert.alert("Promoción creada", "La promoción se ha creado exitosamente.");

    createProductInLoyverse(promotionData).then(() => {
      fetchPromociones();
    });

    resetModal();
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
      setAllProductos(productosData.items); // <-- Guardar todos los productos
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

  const handleSetMaxSteps = (steps) => {
    const parsedSteps = parseInt(steps, 10);
    if (parsedSteps > 0) {
      setMaxSteps(parsedSteps+1);
      setCurrentStep(2); // Avanzar al paso de selección del primer producto
      setSelectedGroups([]); // Limpiar selección previa
    } else {
      Alert.alert("Error", "Por favor, ingresa un número válido.");
    }
  };

  // Reiniciar todo al cancelar o finalizar
  const resetModal = () => {
    setPromotionName("");
    setPromotionPrice("");
    setMaxSteps('');
    setCurrentStep(1);
    setSelectedGroups([]);
    setCurrentGroupProducts([]);
    setCurrentGroupDescription("");
    setModalVisible(false);
    fetchAllProducts();
  };

  // Seleccionar/deseleccionar productos SOLO para el grupo actual
  const toggleProductSelection = (product) => {
    const isSelected = currentGroupProducts.some((p) => p.id === product.id);
    if (isSelected) {
      setCurrentGroupProducts((prev) => prev.filter((p) => p.id !== product.id));
    } else {
      const updatedProduct = {
        id: product.id,
        nombre: product.item_name,
        precio: product.variants?.[0]?.default_price || 0,
        descripcion: product.description || "Sin descripción",
        opciones: product.variants?.map((variant) => ({
          id: variant.variant_id,
          item_name: variant.name || product.item_name,
          price: variant.default_price || 0,
          description: variant.description || product.description || "Sin descripción",
          selected: false,
        })) || [],
      };
      setCurrentGroupProducts((prev) => [...prev, updatedProduct]);
    }
  };

  // Seleccionar/deseleccionar opciones dentro de un producto del grupo actual
  const toggleOptionSelection = (productId, optionId) => {
    setCurrentGroupProducts((prev) =>
      prev.map((product) => {
        if (product.id === productId) {
          return {
            ...product,
            opciones: product.opciones.map((opcion) =>
              opcion.id === optionId
                ? { ...opcion, selected: !opcion.selected }
                : opcion
            ),
          };
        }
        return product;
      })
    );
  };

  // Guardar el grupo actual y pasar al siguiente
  const handleNextStep = () => {
    if (currentGroupProducts.length === 0) {
      Alert.alert("Selecciona al menos un producto para este grupo.");
      return;
    }
    setSelectedGroups((prev) => [
      ...prev,
      {
        grupo: currentGroupProducts,
        descripcion: currentGroupDescription,
      },
    ]);
    setCurrentGroupProducts([]);
    setCurrentGroupDescription("");
    if (currentStep < maxSteps) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === maxSteps) {
      // Último grupo, llamar a createPromotion
      createPromotion([
        ...selectedGroups,
        { grupo: currentGroupProducts, descripcion: currentGroupDescription },
      ]);
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

  const handleCancel = () => {
    setModalVisible(false);
    setPromotionName("");
    setPromotionPrice("");
    setMaxSteps('');
    setCurrentStep(1);
    setSelectedGroups([]);
    setCurrentGroupProducts([]);
    setCurrentGroupDescription("");
    fetchAllProducts(); // Restaurar la lista completa de productos
  };

  // Obtener IDs de productos ya seleccionados en grupos anteriores
  const getSelectedProductIds = () => {
    return selectedGroups.flatMap(group => group.grupo.map(prod => prod.id));
  };

  // Filtrar productos disponibles para el grupo actual (sin repetidos)
  const getAvailableProductsForCurrentGroup = () => {
    const selectedIds = getSelectedProductIds();
    // Usar allProductos en vez de productos
    return allProductos.filter(prod => !selectedIds.includes(prod.id));
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
          <View style={styles.modalContent}>
            {currentStep === 1 && (
              <>
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
                <TextInput
                  style={styles.input}
                  placeholder="¿Cuántos grupos de productos tendrá la promoción?"
                  keyboardType="numeric"
                  value={String(maxSteps)}
                  onChangeText={(text) => setMaxSteps(parseInt(text) )}
                />
                <Button
                  title="Siguiente"
                  onPress={() => {
                    if (!promotionName.trim()) {
                      Alert.alert("Error", "Por favor ingresa un nombre para la promoción");
                      return;
                    }
                    if (!promotionPrice.trim()) {
                      Alert.alert("Error", "Por favor ingresa un precio para la promoción");
                      return;
                    }
                    handleSetMaxSteps(maxSteps);
                    fetchAllProducts(); // Asegurar que tenemos todos los productos disponibles
                  }}
                />
              </>
            )}
            {currentStep > 1 && currentStep <= maxSteps && (
              <>
                <Text style={styles.title}>
                  Selecciona productos para el grupo #{currentStep - 1}
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Descripción de este grupo (opcional)"
                  value={currentGroupDescription}
                  onChangeText={setCurrentGroupDescription}
                />
                <FlatList
                  // Cambia 'productos' por la función filtrada
                  data={getAvailableProductsForCurrentGroup()}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => {
                    const isSelected = currentGroupProducts.some((p) => p.id === item.id);
                    return (
                      <TouchableOpacity
                        style={[
                          styles.row,
                          isSelected && styles.selectedRow,
                        ]}
                        onPress={() => toggleProductSelection(item)}
                      >
                        <Text style={styles.itemName}>{item.item_name}</Text>
                        {/* Opciones solo si el producto está seleccionado */}
                        {isSelected && currentGroupProducts.find((p) => p.id === item.id)?.opciones.length > 0 && (
                          <View style={styles.optionsContainer}>
                            {currentGroupProducts
                              .find((p) => p.id === item.id)
                              .opciones.map((opcion) => {
                                const isOptionSelected = opcion.selected;
                                return (
                                  <TouchableOpacity
                                    key={opcion.id}
                                    style={[
                                      styles.optionRow,
                                      isOptionSelected && styles.selectedOptionRow,
                                    ]}
                                    onPress={() =>
                                      toggleOptionSelection(item.id, opcion.id)
                                    }
                                  >
                                    <Text style={styles.optionText}>
                                      {opcion.item_name}
                                    </Text>
                                    <Text style={styles.optionPrice}>
                                      ${opcion.price.toFixed(2)}
                                    </Text>
                                  </TouchableOpacity>
                                );
                              })}
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  }}
                />
                <Button
                  title={
                    currentStep < maxSteps
                      ? "Siguiente grupo"
                      : "Finalizar selección"
                  }
                  onPress={handleNextStep}
                />
              </>
            )}
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={resetModal}
            >
              <Text style={styles.cancelButtonText}>Cancelar</Text>
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
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  searchBar: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  textContainer: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    padding: 5,
    borderRadius: 5,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  createButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Fondo translúcido oscuro
  },
  modalContent: {
    width: "85%", // Ajustar el ancho del modal
    height: "60%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15, // Bordes redondeados
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5, // Sombra para Android
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10, // Bordes redondeados
    padding: 10,
    marginVertical: 10,
    width: "100%",
    backgroundColor: "#f9f9f9", // Fondo claro
  },
  saveButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 10, // Bordes redondeados
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#FF6347",
    padding: 12,
    borderRadius: 10, // Bordes redondeados
    alignItems: "center",
    width: "100%",
  },
  cancelButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  productListContainer: {
    flex: 1,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
    width: "100%",
  },
  selectedRow: {
    backgroundColor: "#007BFF",
    borderRadius: 5,
    padding: 5,
  },
  optionsContainer: {
    marginTop: 5,
    paddingLeft: 10,
  },
  optionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 5,
  },
  selectedOptionRow: {
    backgroundColor: "#FFD700", // Amarillo para opciones seleccionadas
    borderRadius: 5,
    padding: 5,
  },
  optionText: {
    fontSize: 14,
    color: "#555",
  },
  optionPrice: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
});