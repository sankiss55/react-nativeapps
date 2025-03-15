import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useState } from "react";
export default function useestate(){
    const [number, setnumber]=useState(0);

    const sumar =(e)=>{
        console.log(e.target);
setnumber(77);
    }
    return(
<View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{number}</Text>
      <TouchableOpacity onPress={sumar} style={{backgroundColor:'red'}}>
        <Text>
            haz click aqui
        </Text>
      </TouchableOpacity>
    </View>
    );
}