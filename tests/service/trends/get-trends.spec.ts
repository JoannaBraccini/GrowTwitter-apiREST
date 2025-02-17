// tests/services/TrendsService.test.ts
import axios from "axios";
import { TrendsService } from "../../../src/services/trends.service";

// Mocka o axios
jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("Get Trends TrendsService", () => {
  const createSut = () => new TrendsService();

  it("deve retornar os dados das tendências corretamente", async () => {
    const sut = createSut();

    // Mock da resposta da API
    const mockData = "<html>Mock Trends Data</html>";
    mockedAxios.get.mockResolvedValueOnce({ data: mockData });

    const result = await sut.getTrends();

    expect(mockedAxios.get).toHaveBeenCalledWith("https://trends24.in/brazil/");
    expect(result).toEqual({
      code: 200,
      ok: true,
      message: "Trends retrieved successfully",
      data: mockData,
    });
  });

  it("deve lançar um erro quando a requisição falhar", async () => {
    const sut = createSut();
    mockedAxios.get.mockRejectedValueOnce(new Error("Erro de rede"));

    const result = await sut.getTrends();

    expect(result.code).toBe(500);
  });
});
