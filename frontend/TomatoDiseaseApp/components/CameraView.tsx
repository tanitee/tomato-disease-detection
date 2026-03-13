import { CameraView, useCameraPermissions } from "expo-camera"
import { useRef, useState } from "react"
import { View, Text, TouchableOpacity, StyleSheet } from "react-native"

export default function CameraCapture({ onCapture, onCancel }: any) {

  const [permission, requestPermission] = useCameraPermissions()
  const cameraRef = useRef<any>(null)

  const takePhoto = async () => {
    if (!cameraRef.current) return

    const photo = await cameraRef.current.takePictureAsync()
    onCapture(photo.uri)
  }

  if (!permission) {
    return <View />
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text>Camera permission required</Text>

        <TouchableOpacity onPress={requestPermission}>
          <Text>Grant Permission</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={onCancel}>
          <Text>Cancel</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>

        <CameraView ref={cameraRef} style={styles.camera} />

        {/* Capture button */}
        <TouchableOpacity style={styles.capture} onPress={takePhoto}>
        <Text style={{fontWeight:"bold"}}>Capture</Text>
        </TouchableOpacity>

        {/* Back button */}
        <TouchableOpacity style={styles.back} onPress={onCancel}>
        <Text style={{color:"white"}}>Back</Text>
        </TouchableOpacity>

  </View>
  )
}

const styles = StyleSheet.create({

  camera: {
    flex: 1
  },

  capture: {
    position: "absolute",
    bottom: 40,
    alignSelf: "center",
    backgroundColor: "white",
    padding: 15,
    borderRadius: 10
  },

  back: {
    position: "absolute",
    top: 60,
    left: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
    borderRadius: 6
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }

})