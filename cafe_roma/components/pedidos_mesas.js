import { StyleSheet, Text, View } from "react-native";
import { Grid, Col, Row } from "react-native-easy-grid";
import { Poppins_400Regular } from "@expo-google-fonts/poppins/400Regular";
export default function Pedidos_mesas({title, icon, text, color}){
    return(
        <View style={[style.container, {backgroundColor:color}]}>
<Grid>
    <Col style={style.icon_col}>
    <View style={style.icon}>
        
    {icon}
    </View>
    </Col>
    <Col>
    <Row>
            <Text></Text>
        </Row>
        <Row>
            <Text style={style.title}>{title}</Text>
        </Row>
        <Row>
            <Text  style={style.text}>{text}</Text>
        </Row>
    </Col>
</Grid>

        </View>
    )
}
const style=StyleSheet.create({
    title:{
fontSize:20,
fontWeight:'bold',
    },
    text:{
fontWeight:'600',
fontSize:15,
fontFamily:'Poppins_400Regular',
    },
    container:{
        borderRadius:20,
        width:'100%', 
        heigh:'100%',
    },
    icon_col:{
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        width:'30%',
        
    },
    icon:{
        backgroundColor:'white',
padding:20,
borderRadius:10,
    }
})