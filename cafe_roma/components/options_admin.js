import { Col } from "react-native-easy-grid";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Svg, Path } from 'react-native-svg';
export default function Options_admin({ icon, title, text, color }) {
    return(
    <TouchableOpacity style={[style_options.container_options, { backgroundColor: color }]}>
            <View style={style_options.icon}>
            {icon}
           </View>
        <Text style={style_options.title}>
            {title}
            </Text>
            <Text style={style_options.text}>
{text}
                </Text>
                </TouchableOpacity>
       
           
    )
}
const style_options = StyleSheet.create({
    text:{
marginTop:10,
    },

    title:{
        fontSize:20,
        fontWeight:600,
    },
     icon:{
        backgroundColor:'white',
        padding:10,
        borderRadius:10,
        marginBottom:10,
        display:'flex',
        justifyContent:'center',
        alignItems:'center',
        
        width:50,
        height:50,
    },
    container_options:{
        
        borderRadius:20,
        height:200 ,
        width:'45%',
        marginTop:30,
        marginLeft:10,
display:'flex',
padding:20,
    },
})