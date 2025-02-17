import { TrendsService } from "../../../src/services/trends.service";
import { createServer } from "../../../src/express.server";
import supertest from "supertest";

const server = createServer();
const endpoint = "/trends";

describe("GET /trends", () => {
  it("deve retornar 200 e os dados das tendências corretamente", async () => {
    const mockData = "<html>Mock Trends Data</html>";
    const mockService = {
      ok: true,
      code: 200,
      message: "Trends retrieved successfully",
      data: mockData,
    };

    jest
      .spyOn(TrendsService.prototype, "getTrends")
      .mockResolvedValue(mockService);
    const response = await supertest(server).get(endpoint);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      ok: true,
      //   message: "Trends retrieved successfully",
      data: mockData,
    });
  });
  //Controller
  it("Deve retornar status 500 quando ocorrer erro de exceção", async () => {
    // Simulando um erro no controller
    jest
      .spyOn(TrendsService.prototype, "getTrends")
      .mockImplementationOnce(() => {
        throw new Error("Exception");
      });

    const response = await supertest(server).get(endpoint);

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      ok: false,
      message: "An unexpected error occurred: Exception",
    });
  });
});
