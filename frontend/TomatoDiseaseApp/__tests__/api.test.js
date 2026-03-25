import axios from "axios"
import { predictDisease } from "../services/api"

jest.mock("axios", () => {
  const mockAxiosInstance = {
    post: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  }

  return {
    create: jest.fn(() => mockAxiosInstance),
  }
})

const mockAxiosInstance = axios.create()


describe("predictDisease", () => {

  it("returns prediction data", async () => {

    mockAxiosInstance.post.mockResolvedValueOnce({
      data: {
        disease: "Tomato_healthy",
        confidence_pct: 95.0,
      },
    })

    const result = await predictDisease("file://image.jpg")

    expect(result.disease).toBe("Tomato_healthy")
    expect(result.confidence_pct).toBe(95.0)
  })

  it("sends request with FormData", async () => {

    mockAxiosInstance.post.mockResolvedValueOnce({
      data: {},
    })

    await predictDisease("file://image.jpg")

    expect(mockAxiosInstance.post).toHaveBeenCalledWith(
      "/predict",
      expect.any(FormData),
      expect.objectContaining({
        headers: { "Content-Type": "multipart/form-data" },
      })
    )
  })

  it("handles server error", async () => {

    mockAxiosInstance.post.mockRejectedValueOnce(
      Object.assign(new Error(), {
        response: {
          status: 503,
          data: { error: "Model not loaded" },
        },
      })
    )

    await expect(
      predictDisease("file://image.jpg")
    ).rejects.toBeDefined()
  })

})