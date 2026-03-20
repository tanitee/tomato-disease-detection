import { View, Text, TouchableOpacity, Image,  StyleSheet } from "react-native"
import { useLocalSearchParams } from "expo-router"
import { router } from "expo-router"

export default function ResultScreen() {

  const { image, disease, confidence } = useLocalSearchParams()

  return (
    <View style={styles.container}>

      <Image
        source={{uri:image as string}}
        style={styles.image}
      />

      <Text style = {styles.title}>
        Disease: {disease}
      </Text>

      <Text style = {styles.confidence}>
        Confidence: {confidence}%
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.replace("/upload")}
      >
        <Text style={styles.buttonText}>
          Try Another Image
        </Text>

      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({

  container:{
    flex:1,
    justifyContent:"center",
    alignItems:"center"
  },

  image:{
    width:220,
    height:220,
    marginBottom:20
  },

  title:{
    fontSize:24,
    fontWeight:"bold",
    marginBottom:10,
    color:"white"
  },

  confidence:{
    fontSize:18,
    marginBottom:30,
    color:"white"
  },

  button:{
    backgroundColor:"#1565C0",
    padding:12,
    borderRadius:8
  },

  buttonText:{
    color:"white",
    fontWeight:"bold"
  }

})