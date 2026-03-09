import { View, Text } from "react-native"
import { useLocalSearchParams } from "expo-router"

export default function ResultScreen() {

  const { image } = useLocalSearchParams()

  return (
    <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>

      <Text style={{color:"white"}}>Result Screen</Text>
      <Text>Image URI:</Text>
      <Text style={{color:"white"}} >{image}</Text>

    </View>
  )
}