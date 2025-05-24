import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Modal } from "react-native";
import { SelectList } from "react-native-dropdown-select-list";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, query, where, onSnapshot } from "firebase/firestore";
import firebaseConfig from "../../config_firebase/config";
import { Toast, AlertNotificationRoot } from "react-native-alert-notification";

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Mesas() {
  const [cafeterias, setCafeterias] = useState([]);
  const [selectedCafeteria, setSelectedCafeteria] = useState("");
  const [nombreMesa, setNombreMesa] = useState("");
  const [mesas, setMesas] = useState([]);
  const [filteredMesas, setFilteredMesas] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

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

    fetchCafeterias();
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "mesas"), (snapshot) => {
      const mesasData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMesas(mesasData);
      setFilteredMesas(
        mesasData.filter((mesa) =>
          mesa.nombre_mesa.toLowerCase().includes(searchText.toLowerCase())
        )
      );
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, [searchText]);

  const agregarMesa = async () => {
    if (!selectedCafeteria || !nombreMesa) {
      Toast.show({
        type: "WARNING",
        title: "Error",
        textBody: "Selecciona una cafetería y escribe un nombre para la mesa.",
      });
      return;
    }

    try {
      await addDoc(collection(db, "mesas"), {
        cafeteria: selectedCafeteria,
        nombre_mesa: nombreMesa,
      });
      setNombreMesa("");
      setModalVisible(false);
      Toast.show({
        type: "SUCCESS",
        title: "Éxito",
        textBody: "Mesa agregada correctamente.",
      });
    } catch (error) {
      console.error("Error al agregar mesa:", error);
      Toast.show({
        type: "DANGER",
        title: "Error",
        textBody: "No se pudo agregar la mesa.",
      });
    }
  };

  const eliminarMesa = async (id) => {
    try {
      await deleteDoc(doc(db, "mesas", id));
      Toast.show({
        type: "SUCCESS",
        title: "Éxito",
        textBody: "Mesa eliminada correctamente.",
      });
      setMesas(mesas.filter((mesa) => mesa.id !== id));
    } catch (error) {
      console.error("Error al eliminar mesa:", error);
      Toast.show({
        type: "DANGER",
        title: "Error",
        textBody: "No se pudo eliminar la mesa.",
      });
    }
  };

  return (
    <AlertNotificationRoot>
    <View style={styles.container}>
      <Text style={styles.title}>Gestión de Mesas</Text>

      <TextInput
        style={styles.searchBar}
        placeholder="Buscar mesas..."
        value={searchText}
        onChangeText={setSearchText}
      />

      <FlatList
        data={filteredMesas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.mesaItem}>
            <Text style={styles.mesaText}>{item.nombre_mesa} - {item.cafeteria}</Text>
            <TouchableOpacity style={styles.deleteButton} onPress={() => eliminarMesa(item.id)}>
              <Text style={styles.deleteButtonText}>Eliminar</Text>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Text style={styles.addButtonText}>Agregar Mesa</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" transparent={true}>
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Agregar Nueva Mesa</Text>

            <SelectList
              setSelected={(key) => {
                const selected = cafeterias.find((cafeteria) => cafeteria.key === key);
                setSelectedCafeteria(selected ? selected.value : "");
              }}
              data={cafeterias}
              placeholder="Selecciona una cafetería"
              boxStyles={styles.selectList}
            />

            <TextInput
              style={styles.input}
              placeholder="Nombre de la mesa"
              value={nombreMesa}
              onChangeText={setNombreMesa}
            />

            <TouchableOpacity style={styles.saveButton} onPress={agregarMesa}>
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
  mesaItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  mesaText: {
    fontSize: 16,
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
});