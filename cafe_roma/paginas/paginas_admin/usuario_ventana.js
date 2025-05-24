import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { collection, getDocs, addDoc, deleteDoc, updateDoc, doc, query, where } from "firebase/firestore";
import firebaseConfig from "../../config_firebase/config";
import { Toast } from "react-native-alert-notification";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { SelectList } from "react-native-dropdown-select-list";

export default function GestionVentanilla() {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);
  const [usuarios, setUsuarios] = useState([]);
  const [nombre, setNombre] = useState("");
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [cafeteria, setCafeteria] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [cafeterias, setCafeterias] = useState([]);

  const fetchUsuarios = async () => {
    try {
      const q = query(collection(db, "usuarios"), where("campo", "==", "cajero"));
      const querySnapshot = await getDocs(q);
      const usuariosData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Error al obtener cajeros:", error);
    }
  };

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

  const handleAddOrUpdate = async () => {
    if (!nombre || !usuario || !password || !cafeteria) {
      Toast.show({
        type: "danger",
        title: "Error",
        textBody: "Por favor, completa todos los campos."
      });
      return;
    }

    try {
      if (editingId) {
        // Actualizar cajero existente
        const userDoc = doc(db, "usuarios", editingId);
        await updateDoc(userDoc, { nombre, usuario, password, cafeteria });
        Toast.show({
          type: "success",
          title: "Éxito",
          textBody: "Cajero actualizado correctamente."
        });
      } else {
        // Crear nuevo cajero
        await addDoc(collection(db, "usuarios"), {
          nombre,
          usuario,
          password,
          cafeteria,
          campo: "cajero", // Cambiado a "cajero"
        });
        Toast.show({
          type: "success",
          title: "Éxito",
          textBody: "Cajero creado correctamente."
        });
      }
      fetchUsuarios();
      setNombre("");
      setUsuario("");
      setPassword("");
      setCafeteria("");
      setEditingId(null);
      setModalVisible(false);
    } catch (error) {
      console.error("Error al guardar cajero:", error);
      Toast.show({
        type: "danger",
        title: "Error",
        textBody: "No se pudo guardar el cajero."
      });
    }
  };

  const handleDelete = async (id) => {
    try {
      const userDoc = doc(db, "usuarios", id);
      await deleteDoc(userDoc);
      Toast.show({
        type: "success",
        title: "Éxito",
        textBody: "Usuario eliminado correctamente."
      });
      fetchUsuarios();
    } catch (error) {
      console.error("Error al eliminar usuario:", error);
      Toast.show({
        type: "danger",
        title: "Error",
        textBody: "No se pudo eliminar el usuario."
      });
    }
  };

  const handleEdit = (usuario) => {
    setNombre(usuario.nombre);
    setUsuario(usuario.usuario);
    setPassword(usuario.password);
    setCafeteria(usuario.cafeteria);
    setEditingId(usuario.id);
    setModalVisible(true);
  };

  const handleCancel = () => {
    setNombre("");
    setUsuario("");
    setPassword("");
    setCafeteria("");
    setEditingId(null);
    setModalVisible(false);
  };

  const filteredUsuarios = usuarios.filter((usuario) =>
    usuario.nombre.toLowerCase().includes(searchText.toLowerCase())
  );

  useEffect(() => {
    fetchUsuarios();
    fetchCafeterias();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Cajeros</Text>
      <TextInput
        style={styles.searchInput}
        placeholder="Buscar por nombre"
        value={searchText}
        onChangeText={setSearchText}
      />
      <FlatList
        data={filteredUsuarios}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text style={styles.text}>{item.nombre}</Text>
            <Text style={styles.text}>{item.usuario}</Text>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEdit(item)}
            >
              <Text style={styles.buttonText}>Editar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDelete(item.id)}
            >
              <Text style={styles.buttonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.addButtonText}>Agregar Cajero</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>{editingId ? "Editar Cajero" : "Agregar Cajero"}</Text>
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
              setSelected={setCafeteria}
              data={cafeterias}
              placeholder="Seleccionar Cafetería"
              boxStyles={styles.selectListBox}
              dropdownStyles={styles.selectListDropdown}
              defaultOption={editingId ? { key: cafeteria, value: cafeteria } : null}
            />
            <TouchableOpacity
              style={styles.modalSaveButton}
              onPress={handleAddOrUpdate}
            >
              <Text style={styles.modalButtonText}>
                {editingId ? "Actualizar Cajero" : "Agregar Cajero"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalCancelButton}
              onPress={handleCancel}
            >
              <Text style={styles.modalButtonText}>Cancelar</Text>
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginVertical: 10,
    backgroundColor: "#fff",
    fontSize: 16,
    width:'100%',
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    backgroundColor: "#fff",
    borderRadius: 5,
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
  },
  editButton: {
    backgroundColor: "#007BFF",
    padding: 5,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: "#FF0000",
    padding: 5,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
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
  modalSaveButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  modalCancelButton: {
    backgroundColor: "#FF0000",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  modalButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  searchInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  selectListBox: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
    width:'100%',
    backgroundColor: "#fff",
  },
  selectListDropdown: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#fff",
  },
});