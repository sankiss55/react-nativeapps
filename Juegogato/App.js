import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, SafeAreaView, View, TouchableOpacity , Image} from 'react-native';
import { Row, Grid, Col } from "react-native-easy-grid";
import Icon from 'react-native-vector-icons/Ionicons';
import { crear_elementos } from './funcionesJS';
import { useState, useEffect } from 'react';

export default function App() {
  const combinacionesGanadoras = [
    // Filas
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
  
    // Columnas
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
  
    // Diagonales
    [0, 4, 8],
    [2, 4, 6],
  ];
  const [contenedor_ganador, set_contenedor_ganador]=useState(false);
  const [marcado1, setmarcador1]=useState(0);
  const [marcado2, setmarcador2]=useState(0);
  const [convinacion_jugador1, setconvinacion_jugador1]=useState('');
  const [convinacion_jugador2, setconvinacion_jugador2]=useState('');
  const [jugador,setjugador]=useState(1);
 const [elementos, setelementos]=useState([]);
 function crear_elementos(){
  const elementos=[];
  let contador=0
  for(let i=0; i<3; i++){
   for(let j=0;j<3;j++){
    
    elementos.push({
      id:contador,
      icon:'',
    });
    contador++;
   }
  }
  setelementos(elementos);
 }
  useEffect(()=>{
crear_elementos();
  },[]);
  function verificacion_ganar(jugador, player){
    for(let i=0; i<combinacionesGanadoras.length;i++){
        
  let ganador=0;
for(let j=0; j<3;j++){

  if(jugador.split('').length<3){
    
    return;
  }
  for (let index = 0; index < jugador.split('').length; index++) {
    const element = jugador.split('')[index];
    if(combinacionesGanadoras[i][j]== element){
      console.log(element);
      ganador++;
      if(ganador==3){
        set_contenedor_ganador(true);
        player==1?setmarcador1(marcado1+1):setmarcador2(marcado2+1);
        return true;
      }
    }
  }
 
}
    }
  }
  function recetear(){
    const nuevos_elementos = elementos.map((i) => ({
      ...i,
      icon: '',
    }));
    setelementos(nuevos_elementos);
    
    setconvinacion_jugador1('');
    setconvinacion_jugador2('');
  }
  function crear_iconos(id) {
    let ganador_true=false;
    const actualizacion_text = elementos.map((i) => {
      if (i.id === id && i.icon === '') {
        const nuevoIcono = jugador === 1 ? 'close-outline' : 'ellipse-outline';
        
        if (jugador === 1) {
          const nuevaCombinacion = convinacion_jugador1 + id;
          setconvinacion_jugador1(nuevaCombinacion);
         ganador_true= verificacion_ganar(nuevaCombinacion, jugador);
        } else {
          const nuevaCombinacion = convinacion_jugador2 + id;
          setconvinacion_jugador2(nuevaCombinacion);
         ganador_true= verificacion_ganar(nuevaCombinacion, jugador);
        }
  
        setjugador(jugador === 1 ? 2 : 1);
  
        return { ...i, icon: nuevoIcono };
      }
      return i;
    });
    if (ganador_true == true) {
    recetear();
        
     }else{
      setelementos(actualizacion_text);
     }
   
  
  }
  function reiniciar_marcador(){
    setmarcador1(0);
    setmarcador2(0);
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle='dark-content' translucent />
      <View style={styles.container_marcador}>
     
        <Grid>
          <Col>
            <Row style={styles.vs}>
            <Text>
  User 1  <Icon name='person-circle-outline' size={20} color={'rgb(0, 0, 0)'}/>
</Text>

            </Row>
            <Row style={styles.vs}>
              <Text style={styles.vs}>{marcado1}</Text>
            </Row>
          </Col>
          <Col style={styles.vs}>
            <Text style={styles.vs}>VS</Text>
          </Col>
          <Col>
            <Row style={styles.vs}>
              <Text> User 2  <Icon name='person-circle-outline' size={20} color={'rgb(0, 0, 0)'}/></Text>
            </Row>
            <Row style={styles.vs}>
              <Text>{  marcado2}
</Text>
            </Row>
          </Col>
        </Grid>
      </View>
      <View style={styles.contenedorgato}>
  <Grid>
    {
      Array.from({ length: 3 }).map((_, rowIndex) => (
        <Row key={rowIndex} size={1}>
          {
            elementos.slice(rowIndex * 3, rowIndex * 3 + 3).map(item => (
              <Col onPress={()=>crear_iconos(item.id)} key={item.id} style={styles.border_row} size={1}>
               
                <Icon name={item.icon} size={90} color={'rgb(225,225,225)'}/>
              </Col>
            ))
          }
        </Row>
      ))
    }
  </Grid>
</View>
<View style={styles.reset}>

<TouchableOpacity onPress={recetear}>
 <Icon  style={styles.tou}  name='refresh-outline' size={30} color={'black'}/>
 <Text>Reiniciar Juego</Text>
</TouchableOpacity>
<TouchableOpacity   onPress={reiniciar_marcador}>
 <Icon  style={styles.tou}  name='flag-outline' size={30} color={'black'}/>
 <Text>Reiniciar Marcador</Text>
</TouchableOpacity>
</View>
<View style={[styles.ganador, { display: contenedor_ganador==true ? 'flex' : 'none' }]}>
  <TouchableOpacity style={{position:'absolute', top:'10%', left:'10%', width:30}} onPress={()=>{set_contenedor_ganador(false)}}> <Icon name='close-circle-outline' size={30} /></TouchableOpacity>

  <Text style={{fontSize:30, textAlign:'center'}}>
    Ganaste !!!!
  </Text>
  <Image
        source={require('./assets/tenor.gif')}
        style={{ width: 200, height: 200 }}
      />
  
</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  vs: {
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
  },
  container_marcador: {
    position: 'absolute',
    top: 100,
    width: '80%',
    marginLeft: '50%',
    transform: [{ translateX: '-50%' }],
    height: 'auto',
  },
  contenedorgato: {
    backgroundColor: 'black',
    borderRadius: '5%',
    width: 300,
    height: 300,
    marginLeft: '50%',
    marginTop: '50%',
    transform: [
      { translateX: '-50%' },
      { translateY: '30%' }
    ],
  },
  container: {
    position: 'relative',
    flex: 1,
  },
  border_row: {
    borderWidth: 1,
    borderColor: 'rgb(255, 255, 255)',
  },
  text: {
    color: 'white',
    fontSize: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  reset:{
marginTop:'50%',
marginLeft:'20%',
width:'100%', 
display:'flex',
flexDirection:'row',
gap:50,
  },
  tou:{

    display:'flex',
    textAlign:'center',
    justifyContent:'center',
    alignContent:'center'
  },
  ganador:{
    position:'relative',
    backgroundColor:'rgb(245, 242, 235)',
   padding:50,
   display:'flex',
   justifyContent:'center',
   alignContent:'center',
    borderRadius:20,
    
position:'absolute',
top:'50%',
left:'50%',
transform:[{translateX:'-50%'},{translateY:'-50%'}]
  }
});
