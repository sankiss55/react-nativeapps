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

export default function GestionAdmin() {
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
      const q = query(collection(db, "usuarios"), where("campo", "==", "admin"));
      const querySnapshot = await getDocs(q);
      const usuariosData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setUsuarios(usuariosData);
    } catch (error) {
      console.error("Error al obtener usuarios:", error);
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
        // Actualizar usuario existente
        const userDoc = doc(db, "usuarios", editingId);
        await updateDoc(userDoc, { nombre, usuario, password, cafeteria });
        Toast.show({
          type: "success",
          title: "Éxito",
          textBody: "Usuario actualizado correctamente."
        });
      } else {
        // Crear nuevo usuario
        await addDoc(collection(db, "usuarios"), {
          nombre,
          usuario,
          password,
          cafeteria,
          campo: "admin",
        });
        Toast.show({
          type: "success",
          title: "Éxito",
          textBody: "Usuario creado correctamente."
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
      console.error("Error al guardar usuario:", error);
      Toast.show({
        type: "danger",
        title: "Error",
        textBody: "No se pudo guardar el usuario."
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
      <Text style={styles.title}>Gestión de Administradores</Text>
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
        <Text style={styles.addButtonText}>Agregar Administrador</Text>
      </TouchableOpacity>
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>{editingId ? "Editar Usuario" : "Agregar Usuario"}</Text>
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
                {editingId ? "Actualizar Usuario" : "Agregar Usuario"}
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
  editButton: {
    backgroundColor: "#4CAF50",
    padding: 10,
    borderRadius: 10,
  },
  deleteButton: {
    backgroundColor: "#F44336",
    padding: 10,
    borderRadius: 10,
  },
  buttonText: {
    color: "#FFF",
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
    width: "90%",
    maxWidth: 400,
    backgroundColor: "#FFF",
    padding: 25,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 10,
    alignSelf: "center",
  },
  addButton: {
    marginTop: 20,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#6B4226",
    alignSelf: "center",
  },
  addButtonText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  modalSaveButton: {
    marginVertical: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    alignSelf: "stretch",
  },
  modalCancelButton: {
    marginVertical: 10,
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: "#F44336",
    alignSelf: "stretch",
  },
  modalButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
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
  selectListBox: {
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: "#FFF",
    height: 50,
    justifyContent: "center",
  },
  selectListDropdown: {
    borderColor: "#CCC",
    borderWidth: 1,
    borderRadius: 10,
    backgroundColor: "#FFF",
  },
});