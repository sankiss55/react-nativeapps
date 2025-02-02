import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>
        Ingresa tu nombre
      </Text>
      <TextInput placeholder='Ingresa' style={styles.textinput} />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  textinput:{
    borderWidth: 1,
    width:"80%",
    borderRadius:50, padding:20
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
