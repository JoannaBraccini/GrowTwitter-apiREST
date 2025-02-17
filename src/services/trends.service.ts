import axios from "axios";
import { ResponseApi } from "../types/response";

export class TrendsService {
  // Método para buscar os dados das tendências
  public async getTrends(): Promise<ResponseApi> {
    try {
      const response = await axios.get("https://trends24.in/brazil/");
      return {
        ok: true,
        code: 200,
        message: "Trends retrieved successfully",
        data: response.data,
      }; // Retorna os dados das tendências
    } catch (error: any) {
      return {
        ok: false,
        code: 500,
        message: `Internal server error: ${error.message}`,
      };
    }
  }
}
