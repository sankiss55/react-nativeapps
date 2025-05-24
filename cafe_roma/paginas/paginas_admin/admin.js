
import { StyleSheet, Text, Touchable, TouchableOpacity, View } from "react-native";
import Options_admin from "../../components/options_admin";
import { Svg, Path } from 'react-native-svg';
import { Col, Row, Grid } from "react-native-easy-grid";
import { useFonts } from '@expo-google-fonts/poppins/useFonts';
import { useNavigation } from "@react-navigation/native";
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';
import { ScrollView } from "react-native-gesture-handler";


export default function Admin({route}){
    const navigate=useNavigation();
      const {usuario}=route.params;
  let [fontsLoaded] = useFonts({
    Poppins_400Regular, 
  });
const navigation = useNavigation();
return(
  
  
   <ScrollView style={style.container}>
    <View style={style.container_top}>
        <TouchableOpacity style={style.btn_salir} onPress={()=>{
            navigation.navigate('Admin');
            navigation.reset({
                index:0,
                routes:[{name:'Admin'}]
            })
        }} >
            <Text style={{ fontFamily: "Poppins_400Regular", fontSize: 14, fontWeight:'bold', color: "black", }}>
                Salir
            </Text>
            <Svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><Path d="M200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h280v80H200v560h280v80H200Zm440-160-55-58 102-102H360v-80h327L585-622l55-58 200 200-200 200Z"/></Svg>
        </TouchableOpacity>
    </View>
     <Text style={{   fontFamily: "Poppins_400Regular", fontSize: 30, color: "black", marginLeft:20,marginTop: 50 }}>
        Hola, {usuario}
    </Text>
    <Text style={{   fontFamily: "Poppins_400Regular", color: "black", fontSize:20, marginLeft:20,marginTop: 10 }}>
        Panel de Gestion
    </Text>
    <Grid style={style.grid}>
     <Row style={{ height: 200 }}>
         <Options_admin text={'Gestión completa de mesas'}  onPress={()=>{
    navigate.navigate('mesas');
}}    icon={<Svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="#000000"><Path d="M440-80v-520H80l400-280 400 280H520v520h-80Zm40-600h146-292 146ZM120-80v-210L88-466l78-14 30 160h164v240h-80v-160h-80v160h-80Zm480 0v-240h164l30-160 78 14-32 176v210h-80v-160h-80v160h-80ZM334-680h292L480-782 334-680Z"/></Svg>} title={'Mesas'} color={"#C2E0F2"} />
     
        
<Options_admin text={'Gestión completa de usuarios'} onPress={()=>{
    navigate.navigate('Usuarios_categoria');
}}  icon={<Svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="#000000"><Path d="M360-390q-21 0-35.5-14.5T310-440q0-21 14.5-35.5T360-490q21 0 35.5 14.5T410-440q0 21-14.5 35.5T360-390Zm240 0q-21 0-35.5-14.5T550-440q0-21 14.5-35.5T600-490q21 0 35.5 14.5T650-440q0 21-14.5 35.5T600-390ZM480-160q134 0 227-93t93-227q0-24-3-46.5T786-570q-21 5-42 7.5t-44 2.5q-91 0-172-39T390-708q-32 78-91.5 135.5T160-486v6q0 134 93 227t227 93Zm0 80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-54-715q42 70 114 112.5T700-640q14 0 27-1.5t27-3.5q-42-70-114-112.5T480-800q-14 0-27 1.5t-27 3.5ZM177-581q51-29 89-75t57-103q-51 29-89 75t-57 103Zm249-214Zm-103 36Z"/></Svg>} title={'Usuarios'} color={'#FEE8A1'} />
      </Row>
<Row style={{ height: 200,}}>
      <Options_admin text={'Gestión completa de Aministradores'} onPress={()=>{navigate.navigate('GestionAdmin')}}  icon={<Svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="#000000"><Path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z"/></Svg>} title={'Aministradores'} color={'#AEF2BF'} />
       <Options_admin text={'Gestión completa de Promociones'}  icon={<Svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><Path d="m520-260 140-140q11-11 17.5-26t6.5-32q0-34-24-58t-58-24q-19 0-37.5 11T520-492q-30-28-47-38t-35-10q-34 0-58 24t-24 58q0 17 6.5 32t17.5 26l140 140Zm336-130L570-104q-12 12-27 18t-30 6q-15 0-30-6t-27-18L103-457q-11-11-17-25.5T80-513v-287q0-33 23.5-56.5T160-880h287q16 0 31 6.5t26 17.5l352 353q12 12 17.5 27t5.5 30q0 15-5.5 29.5T856-390ZM513-160l286-286-353-354H160v286l353 354ZM260-640q25 0 42.5-17.5T320-700q0-25-17.5-42.5T260-760q-25 0-42.5 17.5T200-700q0 25 17.5 42.5T260-640Zm220 160Z"/></Svg>} title={'Promociones'} onPress={()=>{
navigate.navigate('promos');
       }} color={'#F9DECD'} />
</Row>

<Row style={{ height: 200,}}>
      <Options_admin text={'Gestión completa de Cajeros'} onPress={()=>{navigate.navigate('Qr')}}  icon={<Svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="#000000"><Path d="M200-400v-80h80v80h-80Zm-80-80v-80h80v80h-80Zm360-280v-80h80v80h-80ZM180-660h120v-120H180v120Zm-60 60v-240h240v240H120Zm60 420h120v-120H180v120Zm-60 60v-240h240v240H120Zm540-540h120v-120H660v120Zm-60 60v-240h240v240H600ZM360-400v-80h-80v-80h160v160h-80Zm40-200v-160h80v80h80v80H400Zm-190-90v-60h60v60h-60Zm0 480v-60h60v60h-60Zm480-480v-60h60v60h-60Zm-50 570v-120H520v-80h120v-120h80v120h120v80H720v120h-80Z"/></Svg>} title={'Crea Qr'} color={'#CCA9DD'} />
         <Options_admin text={'Gestion completa de  Cajero(a) '} onPress={()=>{navigate.navigate('GestionVentanilla')}}  icon={<Svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#000000"><Path d="M280-640q-33 0-56.5-23.5T200-720v-80q0-33 23.5-56.5T280-880h400q33 0 56.5 23.5T760-800v80q0 33-23.5 56.5T680-640H280Zm0-80h400v-80H280v80ZM160-80q-33 0-56.5-23.5T80-160v-40h800v40q0 33-23.5 56.5T800-80H160ZM80-240l139-313q10-22 30-34.5t43-12.5h376q23 0 43 12.5t30 34.5l139 313H80Zm260-80h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Zm0-80h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Zm0-80h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Zm120 160h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Zm0-80h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Zm0-80h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Zm120 160h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Zm0-80h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Zm0-80h40q8 0 14-6t6-14q0-8-6-14t-14-6h-40q-8 0-14 6t-6 14q0 8 6 14t14 6Z"/></Svg>} title={'Cajeros'} color={'#EA899A'} />
</Row>
    </Grid>
   </ScrollView>
  
)
}
const style= StyleSheet.create({
    container_top:{
        marginTop:'10%',
        display:'flex',
        justifyContent:'space-between',
        alignItems:'flex-end',
        alignContent:'flex-end',
    },
    btn_salir:{
        borderRadius:10,
        borderWidth:2,
        borderColor:'black',
        width:100,
        height:40,
        marginRight:20,
        padding:10,
display:'flex',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center',
    },
    grid:{
        display:'flex',
        gap:10,
        margin:20,
    },
   
    container:{
        flex:1,
    }
})
