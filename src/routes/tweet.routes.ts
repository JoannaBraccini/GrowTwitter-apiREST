import { Router } from "express";
import { TweetController } from "../controllers/tweet.controller";
import { AuthMiddleware } from "../middlewares/auth/auth.middleware";
import { TweetMiddleware } from "../middlewares/tweet.middleware";
import { ValidateUuidMiddleware } from "../middlewares/validate-uuid.middleware";

export class TweetRoutes {
  public static execute(): Router {
    const router = Router();

    //CREATE TWEET
    router.post(
      "/tweets",
      [
        AuthMiddleware.validate,
        TweetMiddleware.validateRequired,
        TweetMiddleware.validateTypes,
        TweetMiddleware.validateLenght,
      ],
      TweetController.create
    );
    //FIND ALL TWEETS
    router.get("/tweets", [AuthMiddleware.validate], TweetController.findAll);

    //FIND TWEETS BY CONTENT (query)
    router.get(
      "/tweets/?query",
      [AuthMiddleware.validate],
      TweetController.findMany
    );
    //FIND ONE TWEET (id)
    router.get(
      "/tweets/:id",
      [AuthMiddleware.validate, ValidateUuidMiddleware.validate],
      TweetController.findOne
    );

    //UPDATE TWEET
    router.put(
      "/tweets/:id",
      [
        AuthMiddleware.validate,
        ValidateUuidMiddleware.validate,
        TweetMiddleware.validateTypes,
        TweetMiddleware.validateLenght,
      ],
      TweetController.update
    );

    //DELETE TWEET
    router.delete("/tweets/:id", [
      AuthMiddleware.validate,
      ValidateUuidMiddleware.validate,
    ]);

    return router;
  }
}
