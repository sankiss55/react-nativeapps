
import React from 'react';
import { Alert, StatusBar,Animated } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { useRef, useState, useEffect } from 'react';
import { StyleSheet, SafeAreaView, Text, View, ScrollView, TouchableOpacity } from 'react-native';
import DateTimePicker from 'react-native-modal-datetime-picker';
import * as SQLite from 'expo-sqlite';
import { Switch } from 'react-native-paper';
import Toast from 'react-native-toast-message';
const bd=SQLite.openDatabaseSync('despertador.db');
export default function Alarma() {
  const [time, setTime] = useState(new Date());
  const [show, setShow] = useState(false);
  const showTimepicker = () => setShow(true);
  const [estado_alarma, setestado_alarma]=useState([]);
  const [estado_alarma_agrandar_componente, setestado_alarma_agrandar_componente]=useState({});
  const [consultabd, setconsultabd]=useState([]);

function eliminar_alarma(id){
console.log(id);
bd.execAsync(`Delete from alarmas where id=${id}`).then(function(respuesta){
  console.log(respuesta);
  Toast.show({
    position:'top',
    visibilityTime:3000,
    autoHide:true,
    type: 'error',
    
    text1: 'La alarma se agrego ha eliminado'
  });
  agregar_elemtos_UI();
}).catch(function(err){
console.log(err);
});
}

  function click_contenedor(id) {
    const isExpanded = estado_alarma_agrandar_componente[id] && estado_alarma_agrandar_componente[id]._value === 300; 
    const newHeight = isExpanded ? 200 : 300; // Alterna entre grande y chico
  
    Animated.timing(estado_alarma_agrandar_componente[id], {
      toValue: newHeight,
      duration: 200,
      useNativeDriver: false, // No se puede animar height con native driver
    }).start();
  }
  function agregar_elemtos_UI() {
    bd.getAllAsync('SELECT * FROM alarmas')
      .then(function(resultado) {
        setconsultabd(resultado);
  
        setestado_alarma_agrandar_componente((prevState) => {
          const animaciones = { ...prevState };
  
          for (let i = 0; i < resultado.length; i++) {
            const element = resultado[i];
            if (!animaciones[element.id]) {
              animaciones[element.id] = new Animated.Value(200);
            }
          }
  
          return animaciones;
        });
      })
      .catch(function(error) {
        console.error(error);
      });
  }
  
  
  function estado_alarma_fn(valor, id){
    setestado_alarma(prevEstado =>
      prevEstado.map(alarma =>
          alarma.id === id ? { ...alarma, activo: valor ? 1 : 0 } : alarma
      )
  );
  bd.execAsync(`UPDATE alarmas SET activo = ${valor ? 1 : 0} WHERE id = ${id}`)
  .then(() => {
    console.log(`Alarma ${valor} actualizada en la base de datos`);
    Toast.show({
      position:'top',
      visibilityTime:3000,
      autoHide:true,
      type: 'success',
      
      text1: valor==true? 'La alarma se ha activado': 'La alarma se ha desactivado',
     
    });
    agregar_elemtos_UI();
  })
  .catch(err => console.error("Error al actualizar alarma:", err));
 //  estado_alarma==false? setestado_alarma(true):setestado_alarma(false);
  }
  
  function guardar(hora, fecha) {
    let traerdia=new Date().getDay();
    console.log(traerdia);
      bd.execAsync(`INSERT INTO alarmas(hora,activo, lunes,martes,miercoles,jueves,viernes,sabado,domingo) VALUES('${hora>12? hora-12: hora}:${fecha==''? '00' : fecha} ${hora>=12 ? 'PM' : 'AM'}', 1,${traerdia==1?1:0},${traerdia==2?1:0},${traerdia==3?1:0},${traerdia==4?1:0},${traerdia==5?1:0},${traerdia==6?1:0},${traerdia==7?1:0})`)
      .then(function() {
          console.log('ejecucion exitosa');
          Toast.show({
            position:'top',
            
            visibilityTime:3000,
            autoHide:true,
            type: 'success',
            
            text1: 'La alarma se agrego exitozamente'
          });
          agregar_elemtos_UI();
      })
      .catch(function (err) {
          console.error("Error en " + err);
      });
  
  }
  useEffect(function(){
 bd.execAsync(`
  CREATE TABLE IF NOT EXISTS alarmas (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hora TEXT NOT NULL,
     lunes INTEGER NOT NULL,martes INTEGER NOT NULL,miercoles INTEGER NOT NULL,jueves INTEGER NOT NULL,viernes  INTEGER NOT NULL , sabado INTEGER NOT NULL,domingo  INTEGER NOT NULL,
    activo INTEGER NOT NULL DEFAULT 1 
  );
`).then(function(){
  console.log('conexion');
  agregar_elemtos_UI();
}).catch(function(error){
  console.error("error en: "+error);
});
  },[]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'rgba(53,22,143,255)' }}>
      <StatusBar barStyle='dark-content' backgroundColor="rgba(88,55,186,255)" translucent />

      <View style={{ flexDirection: 'row', backgroundColor: 'rgba(146,106,255,255)', padding: 10, marginTop: StatusBar.currentHeight }}>
        <View style={{ flex: 1 }}>
          <Text style={{ color: 'white', fontSize: 20 }}>Alarmas Santiago</Text>
        </View>
        <TouchableOpacity>
          <Icon name='menu-outline' size={30} style={{ color: 'white' }} />
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1, padding: 2, position: 'relative' }}>
      <ScrollView style={{ backgroundColor: 'rgb(67, 0, 138)', flexDirection: 'column' }}>
  {consultabd.map((item) => (
    <Animated.View 
    key={item.id}
    style={[
      styles.contenedor_alarma,
      { 
        backgroundColor: item.activo == 0 ? 'rgba(88,55,186,255)' : 'rgba(146,106,255,255)',
        height: estado_alarma_agrandar_componente[item.id] || new Animated.Value(200) 
      }
    ]}
  >
    <TouchableOpacity style={{ width:'100%', height:'100%'}} onPress={() => click_contenedor(item.id)} >
      <View style={{alignItems:'flex-end'}}>
        <TouchableOpacity style={{width:40}}>
          <Icon name='caret-down-circle-outline' size={30} style={{ color: 'white' }} />
        </TouchableOpacity>
      </View>
      
      <View style={{overflow:'hidden', flex:1,}}>
        <Text style={{ color: 'white', fontSize: 30, fontWeight: '800' }}>{item.hora}</Text>
        <Text style={{color:'rgb(199, 199, 199)', fontWeight:500, marginTop:20}}>Programado para el:{item.lunes==1&&'Lunes '} {item.martes==1&&'Martes '} {item.miercoles==1&&'Miercoles '} {item.jueves==1&&'Jueves '} {item.viernes==1&&'Viernes '} {item.sabado==1&&'Sabado '} {item.domingo==1&&'Domingo '}</Text>
      </View>
  
      <View style={{display:'flex', flexDirection:'row'}} >
        <TouchableOpacity onPress={(valor)=>eliminar_alarma(item.id)} style={{width:40, flex:1}}>
          <Icon name='close-circle-outline' size={30} style={{ color: 'white' }} />
        </TouchableOpacity>
        <Switch 
          onValueChange={(valor) => estado_alarma_fn(valor, item.id)}
          trackColor={{false: '#767577', true: 'rgba(188,165,255,255)'}}
          ios_backgroundColor="#3e3e3e"
          value={item.activo === 1}
        />
      </View>
    </TouchableOpacity>
  </Animated.View>
  
  ))}
</ScrollView>


        <TouchableOpacity onPress={showTimepicker} style={styles.botonAgregar}>
          <Icon style={{ color: 'white', padding: 10 }} name='add-outline' size={55} />
        </TouchableOpacity>

        {show && (
          <DateTimePicker
            isVisible={show}
            mode="time"
            is24Hour={true}
            onConfirm={(selectedDate) => {
              guardar(selectedDate.getHours(), selectedDate.getMinutes());
              setShow(false);
              setTime(selectedDate);
            }}

            onCancel={() => setShow(false)}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  contenedor_alarma:{
    position:'relative',
     backgroundColor: 'rgba(146,106,255,255)', margin: 10, paddingTop:10, paddingBottom:10, paddingLeft:20, paddingRight:20, borderRadius: 20, height: 200, display:'flex'
  },
  alarma: {
    height: 80,
    backgroundColor: 'rgba(146,106,255,255)',
    borderRadius: 20,
    margin: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
  },
  horaTexto: {
    
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
  },
  botonAgregar: {
    backgroundColor: 'rgba(162,71,252,255)',
    shadowOpacity: 0.7,
    shadowColor: '#000',
    shadowRadius: 10,
    elevation: 10,
    borderRadius: 25,
    position: 'absolute',
    bottom: 20,
    right: 20,
  },
});
