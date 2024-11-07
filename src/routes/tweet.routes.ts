import { Router } from "express";
import { TweetController } from "../controllers/tweet.controller";
import { AuthMiddleware } from "../middlewares/auth/auth.middleware";
import { TweetMiddleware } from "../middlewares/tweet.middleware";
import { ValidateUuidMiddleware } from "../middlewares/validate-uuid.middleware";

export class TweetRoutes {
  public static execute(): Router {
    const router = Router();

    //CREATE TWEET/REPLY
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
    //FIND ALL TWEETS/SEARCH
    router.get("/tweets", [AuthMiddleware.validate], TweetController.findAll);

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

    //LIKE TWEET
    router.post("/tweets/:id/like"),
      [AuthMiddleware.validate, ValidateUuidMiddleware.validate],
      TweetController.like;

    //UNLIKE TWEET
    router.delete("/tweets/:id/like"),
      [AuthMiddleware.validate, ValidateUuidMiddleware.validate],
      TweetController.like;

    //RETWEET
    router.post("/tweets/:id/retweet"),
      [AuthMiddleware.validate, ValidateUuidMiddleware.validate];

    //DELETE RETWEET
    router.delete("/tweets/:id/retweet", [
      AuthMiddleware.validate,
      ValidateUuidMiddleware.validate,
    ]);

    return router;
  }
}
