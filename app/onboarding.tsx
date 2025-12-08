

import { Link } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Index() {
  return (
    <ScrollView 
      
    >
      <View style={styles.container}>
      <View style={styles.box}> <Text>Mon essai 1 </Text></View>
      <View style={styles.box}> <Text>Mon essai 2</Text></View>
      <View style={styles.box}> <Text>Mon essai 3</Text></View>
      <View style={styles.box}> <Text>Mon essai 4</Text></View>

      <Link href="/onboarding" asChild>
       <Pressable style={{ padding: 10, backgroundColor: 'blue[100]', borderRadius: 8 }}>
    <Text style={{ color: 'white' }}>Accéder</Text>
  </Pressable>
      </Link>
      <Text style={styles.text}>Edit app/index.tsx to edit this screen.</Text>
    </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, // prend tout l’écran
   flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  box: {
    backgroundColor: '#ff0000',
    width: 180,
    height: 100,
    padding: 10,
    margin: 1,
    borderRadius: 15,
  },
  text: {
    padding: 10,
    fontSize: 16,
    color: '#888888',
  },
});
