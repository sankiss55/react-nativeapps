import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Button, Modal, TextInput, TouchableOpacity, Platform, UIManager } from "react-native";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, query, where, onSnapshot, addDoc, getDocs, deleteDoc, doc } from "firebase/firestore";
import { AlertNotificationRoot, ALERT_TYPE, Toast, Dialog } from "react-native-alert-notification";
import firebaseConfig from "../../config_firebase/config";
import { SelectList } from "react-native-dropdown-select-list";
import axios from "axios";
import accessToken from "../../config_loyverce/config";
import { Checkbox } from "react-native-paper"; // Importa Checkbox de react-native-paper

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(false);
}

export default function Usuarios_categoria() {
  const [usuarios, setUsuarios] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [cafeterias, setCafeterias] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedCafeteria, setSelectedCafeteria] = useState("");
  const [selectedCategorias, setSelectedCategorias] = useState([]); // Cambia a un array para selección múltiple
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [campo, setCampo] = useState("");
  const [searchText, setSearchText] = useState(""); // Estado para el texto del buscador
  const [filteredUsuarios, setFilteredUsuarios] = useState([]); // Estado para los usuarios filtrados

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  useEffect(() => {
    const q = query(collection(db, "usuarios"), where("campo", "!=", "admin"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const usuariosData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsuarios(usuariosData);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCafeterias = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "cafeteria"));
        const cafeteriasData = querySnapshot.docs.map((doc) => ({
          key: doc.id,
          value: doc.data().cafeteria,
        }));
        setCafeterias(cafeteriasData);
      } catch (error) {
        console.error("Error al obtener cafeterías:", error);
      }
    };

    const fetchCategorias = async () => {
      try {
        const response = await axios.get("https://api.loyverse.com/v1.0/categories", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const categoriasData = response.data.categories.map((cat) => ({
          key: cat.id,
          value: cat.name,
        }));
        setCategorias(categoriasData);
      } catch (error) {
        console.error("Error al obtener categorías:", error);
      }
    };

    fetchCafeterias();
    fetchCategorias();
  }, []);

  useEffect(() => {
    // Filtrar usuarios cuando cambia el texto del buscador
    const filtered = usuarios.filter(
      (usuario) =>
        usuario.nombre.toLowerCase().includes(searchText.toLowerCase()) ||
        usuario.usuario.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredUsuarios(filtered);
  }, [searchText, usuarios]);

  const toggleCategoria = (categoriaKey) => {
    setSelectedCategorias((prevSelected) =>
      prevSelected.includes(categoriaKey)
        ? prevSelected.filter((key) => key !== categoriaKey) // Quitar si ya está seleccionado
        : [...prevSelected, categoriaKey] // Agregar si no está seleccionado
    );
  };

  const handleCrearUsuario = async () => {
    if (!nombre || !usuario || !password || !selectedCafeteria || selectedCategorias.length === 0) {
      Toast.show({
        type: ALERT_TYPE.WARNING,
        title: "Error",
        textBody: "Por favor, completa todos los campos.",
      });
      return;
    }

    try {
      await addDoc(collection(db, "usuarios"), {
        nombre,
        usuario,
        password,
        cafeteria: selectedCafeteria,
        campo, // Guardar el campo ingresado por el usuario
        categorias: selectedCategorias, // Guardar las categorías seleccionadas como un array
      });

      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Éxito",
        textBody: "Usuario creado correctamente.",
      });

      setModalVisible(false);
      setNombre("");
      setUsuario("");
      setPassword("");
      setSelectedCafeteria("");
      setSelectedCategorias([]);
    } catch (error) {
      console.error("Error al crear usuario:", error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "No se pudo crear el usuario.",
      });
    }
  };

  const handleEliminarUsuario = async (usuarioId) => {
    try {
      await deleteDoc(doc(db, "usuarios", usuarioId)); // Elimina el documento del usuario
      Toast.show({
        type: ALERT_TYPE.SUCCESS,
        title: "Éxito",
        textBody: "Usuario eliminado correctamente.",
      });
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      Toast.show({
        type: ALERT_TYPE.DANGER,
        title: "Error",
        textBody: "No se pudo eliminar el usuario.",
      });
    }
  };

  return (
    <AlertNotificationRoot>
      <View style={styles.container}>
        <Text style={styles.title}>Usuarios</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar usuarios..."
          value={searchText}
          onChangeText={setSearchText}
        />
        <FlatList
          data={filteredUsuarios} // Usar la lista filtrada
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.text}>{item.nombre}</Text>
              <Text style={styles.text}>{item.campo}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => handleEliminarUsuario(item.id)}
              >
                <Text style={styles.deleteButtonText}>Eliminar</Text>
              </TouchableOpacity>
            </View>
          )}
        />
        <Button title="Crear Usuario" onPress={() => setModalVisible(true)} />
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Crear Usuario</Text>
              <TextInput
                style={styles.input}
                placeholder="Nombre"
                value={nombre}
                onChangeText={setNombre}
              />
              <TextInput
                style={styles.input}
                placeholder="Usuario"
                value={usuario}
                onChangeText={setUsuario}
              />
              <TextInput
                style={styles.input}
                placeholder="Contraseña"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
              />
              <SelectList
                setSelected={setSelectedCafeteria}
                data={cafeterias}
                placeholder="Seleccionar Cafetería"
                boxStyles={styles.selectListBox}
              />
              <TextInput
                style={styles.input}
                placeholder="Campo"
                value={campo}
                onChangeText={setCampo}
              />
              <Text style={styles.modalTitle}>Seleccionar Categorías</Text>
              {categorias.map((categoria) => (
                <View key={categoria.key} style={styles.checkboxContainer}>
                  <Checkbox
                    status={selectedCategorias.includes(categoria.key) ? "checked" : "unchecked"}
                    onPress={() => toggleCategoria(categoria.key)}
                  />
                  <Text style={styles.checkboxText}>{categoria.value}</Text>
                </View>
              ))}
              <TouchableOpacity style={styles.saveButton} onPress={handleCrearUsuario}>
                <Text style={styles.saveButtonText}>Guardar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelButton} onPress={() => setModalVisible(false)}>
                <Text style={styles.cancelButtonText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>
    </AlertNotificationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
    backgroundColor: "#FFF",
    borderRadius: 10,
    marginBottom: 10,
  },
  text: {
    fontSize: 18,
    color: "#333",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#FFF",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    height: 50,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#FFF",
    fontSize: 16,
  },
  selectListBox: {
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#FFF",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  saveButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#F44336",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkboxText: {
    fontSize: 16,
    color: "#333",
  },
  deleteButton: {
    backgroundColor: "#F44336",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  searchInput: {
    height: 50,
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#FFF",
    fontSize: 16,
  },
});