import { View, Text, Button, Image, TouchableOpacity, ActivityIndicator, Alert } from "react-native"
import * as ImagePicker from "expo-image-picker"
import { useState } from "react"
import { router } from "expo-router"
import CameraCapture from "../components/CameraView"
import { predictDisease } from "../services/api"

export default function UploadScreen() {

  const [image, setImage] = useState<string | null>(null)
  const [showCamera, setShowCamera] = useState(false)
  const [loading,setLoading] = useState(false)

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permission.granted) {
        alert("Gallery permission required")
        return
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality:1
    })

    if (!result.canceled) {
      setImage(result.assets[0].uri)
    }

  }

   const handleCapture = (uri: string) => {
    setImage(uri)
    setShowCamera(false)
  }

  const runPrediction = async () => {
    
    if (!image) return
    
    try{
        setLoading(true)
        const result = await predictDisease(image)
        router.push({
        pathname:"/result",
        params:{
          image,
          disease: result.disease,
          confidence: result.confidence_pct,
          time : result.latency_s
        }
      })
        
    } catch (error: any) {
         if(error.response){
        Alert.alert("Prediction Error", error.response.data.error)
      } else {
        Alert.alert("Network Error","Check server connection")
      }

    }finally {
        setLoading(false)
    }
  }

   if (showCamera) {
    return (
        <View style={{ flex: 1 }}>
        <CameraCapture
            onCapture={handleCapture}
            onCancel={() => setShowCamera(false)}
        />
        </View>
    )
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

    {/* Gallery button */}
    {!image ? (
      <TouchableOpacity onPress={pickImage}
        style={{
            backgroundColor: "#2E7D32",
            padding: 12,
            marginTop: 15,
            borderRadius: 8
        }}
      >
        <Text style={{color:"white", fontWeight:"bold"}}>Pick Image</Text>
      </TouchableOpacity>
    ) : (
      <Button title="Clear Image" onPress={() => setImage(null)} />
    )}

    {/* Camera button */}
    {!image && (
      <TouchableOpacity   onPress={() => setShowCamera(true)}
        style={{
            backgroundColor: "#1565C0",
            padding: 12,
            marginTop: 10,
            borderRadius: 8
        }}
      >
        <Text style={{color:"white", fontWeight:"bold"}}>Open Camera</Text>
      </TouchableOpacity>
    )}

    {image && (
        <TouchableOpacity
            onPress={runPrediction}
            style={{
            backgroundColor:"#2E7D32",
            padding:12,
            marginTop:10,
            borderRadius:8,
            opacity: loading ? 0.6 : 1
            }}
            disabled={loading}
        >
            <Text style={{color:"white",fontWeight:"bold"}}>Analyse</Text>
        </TouchableOpacity>
    )}
    {loading && (
        <ActivityIndicator size="large" style={{marginTop:20}} />
    )}

  </View>
)
}