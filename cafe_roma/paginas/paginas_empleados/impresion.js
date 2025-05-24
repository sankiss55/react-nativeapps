import React from 'react';
import { Button, Alert, View, StyleSheet, Linking } from 'react-native';
import * as FileSystem from 'expo-file-system';
import { printToFileAsync } from 'expo-print';
import { Asset } from 'expo-asset';
export default function Impresion() {
  const enviarReciboARawBT = async () => {
    try {
        const asset = Asset.fromModule(require('./../../img/logo.png')); // pon aquí la ruta relativa a tu imagen
      await asset.downloadAsync();

      // Lee la imagen en base64
      const base64Img = await FileSystem.readAsStringAsync(asset.localUri, { encoding: FileSystem.EncodingType.Base64 });

        //<img src="https://raw.githubusercontent.com/github/explore/main/topics/react/react.png" style="width:150px; height:auto; margin-bottom: 20px;" />
      const html = `
  <div style="text-align:center;">
 <img src="data:image/png;base64,${base64Img}" style="width:350px; height:auto; margin-bottom: 20px;" />
    <hr />
  </div>

  
`;



      // Genera el PDF y obtiene la ruta local
      const { uri } = await printToFileAsync({ html });

      // Lee el PDF como base64
      const pdfBase64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Construye la URL para RawBT
      const intentUrl = `rawbt:data:application/pdf;base64,${pdfBase64}`;

      // Verifica si RawBT está instalado
      const canOpen = await Linking.canOpenURL(intentUrl');
      if (!canOpen) {
        Alert.alert('Error', 'RawBT no está instalado o no es compatible.');
        return;
      }

      // Abre RawBT con el PDF base64
      await Linking.openURL(intentUrl);
    } catch (error) {
      console.error('Error al enviar el recibo a RawBT:', error);
      Alert.alert('Error', `Ocurrió un error: ${error.message}`);
    }
  };

  return (
    <View style={styles.container}>
      <Button title="Imprimir Recibo" onPress={enviarReciboARawBT} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
