import axios from "axios"

const BASE_URL = "http://192.168.0.157:5000" 

//axios instance with base URL and timeout settings
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
})

export const checkHealth = async () => {
  const response = await apiClient.get("/health")
  return response.data
}

//to send image to backend for disease prediction
export const predictDisease = async (imageUri: string) => {

  const formData = new FormData()

  const filename = imageUri.split("/").pop() || "image.jpg"
  const ext = filename.split(".").pop()

  const mimeType =
    ext === "png"
      ? "image/png"
      : ext === "webp"
      ? "image/webp"
      : "image/jpeg"

  formData.append("image", {
    uri: imageUri,
    name: filename,
    type: mimeType,
  } as any)

  const response = await apiClient.post("/predict", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  })

  return response.data
}

export default apiClient