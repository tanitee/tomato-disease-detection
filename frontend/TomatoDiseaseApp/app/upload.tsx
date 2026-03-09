import { View, Text, Button, Image } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useState } from "react"
import { router } from "expo-router"

export default function UploadScreen() {

  const [image, setImage] = useState<string | null>(null)

  const pickImage = async () => {

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality:1
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }

  }

  return (
    <View style={{flex:1,justifyContent:"center",alignItems:"center"}}>

      <Text>Upload Tomato Leaf</Text>

    
      {!image ? (
        <Text style={{color:"white"}}>No image selected</Text>
        ) : (
            <Image
          source={{uri:image}}
          style={{width:360,height:400,marginTop:20}}
        />
        )}

      {!image ? (
        <Button title="Pick Image" onPress={pickImage} />
        ) : (
        <Button title="Clear Image" onPress={() => setImage(null)} />
        )}
       
       

      {image && (
        <Button
          title="Analyse"
          onPress={() =>
            router.push({
              pathname:"/result" as any,
              params:{image}
            })
          }
        />
      )}

       

    </View>
  )
}