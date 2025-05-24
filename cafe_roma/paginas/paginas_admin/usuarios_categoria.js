import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Button, Modal, TextInput, TouchableOpacity, Platform, UIManager, ScrollView } from "react-native";
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
        <Text style={styles.title}>Gestión de Usuarios</Text>

        <TextInput
          style={styles.searchBar}
          placeholder="Buscar usuarios..."
          value={searchText}
          onChangeText={setSearchText}
        />

        <FlatList
          data={filteredUsuarios}
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

        <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
          <Text style={styles.addButtonText}>Crear Usuario</Text>
        </TouchableOpacity>

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
                boxStyles={styles.selectList}
              />
              <TextInput
                style={styles.input}
                placeholder="Campo"
                value={campo}
                onChangeText={setCampo}
              />
              <Text style={styles.modalTitle}>Seleccionar Categorías</Text>
             <ScrollView   style={{
    maxHeight: 160,
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    paddingRight: 5,
  }}
  showsVerticalScrollIndicator={true} > 
  {categorias.map((categoria) => (
    <View key={categoria.key} style={styles.checkboxContainer}>
      <Checkbox
        status={selectedCategorias.includes(categoria.key) ? 'checked' : 'unchecked'}
        onPress={() => toggleCategoria(categoria.key)}
      />
      <Text style={styles.checkboxText}>{String(categoria.value)}</Text>

    </View>
  ))}
</ScrollView>

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
    backgroundColor: "#f9f9f9",
    borderRadius: 5,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    color: "#333",
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
  addButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 10,
  },
  addButtonText: {
    color: "#fff",
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
    borderRadius: 5,
    borderColor: "#ccc",
    marginVertical: 10,
    width: "100%",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    width: "100%",
  },
  saveButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  cancelButton: {
    backgroundColor: "#FF0000",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  cancelButtonText: {
    color: "#fff",
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
});