import { View, Text, TouchableOpacity, StyleSheet } from "react-native"
import { useEffect, useState } from "react"
import { router } from "expo-router"
import { checkHealth } from "../services/api"

export default function HomeScreen() {

  const [serverStatus, setServerStatus] = useState("checking...")

  const checkServer = () => {
    checkHealth()
      .then(data => {
        if (data.model_loaded) {
          setServerStatus("Server Online")
        } else {
          setServerStatus("Server Running")
        }
      })
      .catch(() => setServerStatus("Server Unreachable"))
  }

  useEffect(() => {
    checkServer()

    const interval = setInterval(checkServer, 2000)

    return () => clearInterval(interval)
  }, [])

  return (
    <View style={styles.container}>

      <Text style={styles.title}>
        Tomato Disease Detector
      </Text>

      <Text style={styles.status}>
        {serverStatus}
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/upload" as any)}
      >
        <Text style={styles.buttonText}>
          Analyse Leaf
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
  title:{
    fontSize:24,
    marginBottom:20,
    color:"white",
    fontWeight:"bold"
  },
  status:{
    marginBottom:30,
    color:"white"
  },
  button:{
    backgroundColor:"#2E7D32",
    padding:15,
    borderRadius:10
  },
  buttonText:{
    color:"white",
    fontWeight:"bold"
  }
})