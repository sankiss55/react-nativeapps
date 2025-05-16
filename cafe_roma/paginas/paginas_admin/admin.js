
import { StyleSheet, Text, Touchable, TouchableOpacity, View } from "react-native";
import Options_admin from "../../components/options_admin";
import { Svg, Path } from 'react-native-svg';
import { Col, Row, Grid } from "react-native-easy-grid";
import { useFonts } from '@expo-google-fonts/poppins/useFonts';
import { useNavigation } from "@react-navigation/native";
import { Poppins_400Regular } from '@expo-google-fonts/poppins/400Regular';



export default function Admin(){
      
  let [fontsLoaded] = useFonts({
    Poppins_400Regular, 
  });
const navigation = useNavigation();
return(
  
  
   <View style={style.container}>
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
        Hola, Santiago
    </Text>
    <Text style={{   fontFamily: "Poppins_400Regular", color: "black", fontSize:20, marginLeft:20,marginTop: 10 }}>
        Panel de Gestion
    </Text>
    <Grid style={style.grid}>
     <Row style={{ height: 200 }}>
         <Options_admin text={'Gestión completa de mesas'}  icon={<Svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="#000000"><Path d="M440-80v-520H80l400-280 400 280H520v520h-80Zm40-600h146-292 146ZM120-80v-210L88-466l78-14 30 160h164v240h-80v-160h-80v160h-80Zm480 0v-240h164l30-160 78 14-32 176v210h-80v-160h-80v160h-80ZM334-680h292L480-782 334-680Z"/></Svg>} title={'Mesas'} color={"#C2E0F2"} />
     
        
<Options_admin text={'Gestión completa de usuarios'}  icon={<Svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="#000000"><Path d="M360-390q-21 0-35.5-14.5T310-440q0-21 14.5-35.5T360-490q21 0 35.5 14.5T410-440q0 21-14.5 35.5T360-390Zm240 0q-21 0-35.5-14.5T550-440q0-21 14.5-35.5T600-490q21 0 35.5 14.5T650-440q0 21-14.5 35.5T600-390ZM480-160q134 0 227-93t93-227q0-24-3-46.5T786-570q-21 5-42 7.5t-44 2.5q-91 0-172-39T390-708q-32 78-91.5 135.5T160-486v6q0 134 93 227t227 93Zm0 80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm-54-715q42 70 114 112.5T700-640q14 0 27-1.5t27-3.5q-42-70-114-112.5T480-800q-14 0-27 1.5t-27 3.5ZM177-581q51-29 89-75t57-103q-51 29-89 75t-57 103Zm249-214Zm-103 36Z"/></Svg>} title={'Usuarios'} color={'#FEE8A1'} />
      </Row>
<Row style={{ height: 200,}}>
      <Options_admin text={'Gestión completa de Aministradores'}  icon={<Svg xmlns="http://www.w3.org/2000/svg" height="34px" viewBox="0 -960 960 960" width="34px" fill="#000000"><Path d="M234-276q51-39 114-61.5T480-360q69 0 132 22.5T726-276q35-41 54.5-93T800-480q0-133-93.5-226.5T480-800q-133 0-226.5 93.5T160-480q0 59 19.5 111t54.5 93Zm246-164q-59 0-99.5-40.5T340-580q0-59 40.5-99.5T480-720q59 0 99.5 40.5T620-580q0 59-40.5 99.5T480-440Zm0 360q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q53 0 100-15.5t86-44.5q-39-29-86-44.5T480-280q-53 0-100 15.5T294-220q39 29 86 44.5T480-160Zm0-360q26 0 43-17t17-43q0-26-17-43t-43-17q-26 0-43 17t-17 43q0 26 17 43t43 17Zm0-60Zm0 360Z"/></Svg>} title={'Aministradores'} color={'#AEF2BF'} />
</Row>

    
    </Grid>
   </View>
  
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
