import { Request, Response } from "express";
import { TrendsService } from "../services/trends.service";

export class TrendsController {
  public static async findAll(req: Request, res: Response): Promise<void> {
    try {
      const trendsService = new TrendsService();
      const response = await trendsService.getTrends(); // Chama o serviço para buscar as trends

      res.status(200).json({
        ok: true,
        data: response.data, // Retorna os dados das tendências
      });
    } catch (error: any) {
      res.status(500).json({
        ok: false,
        message: `An unexpected error occurred: ${error.message}`,
      });
    }
  }
}
