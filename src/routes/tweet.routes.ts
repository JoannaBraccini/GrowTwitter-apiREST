import { AuthMiddleware } from "../middlewares/auth/auth.middleware";
import { Router } from "express";
import { TweetController } from "../controllers/tweet.controller";
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
        TweetMiddleware.validateLength,
      ],
      TweetController.create
    );
    //FIND ALL TWEETS (with optional content search)
    router.get("/tweets", TweetController.findAll); //sem validação de token para visualizar

    //FEED (tweet do usuário e usuários seguidos)
    router.get(
      "/tweets/feed",
      AuthMiddleware.validate,
      TweetController.findFeed
    );

    //FIND ONE TWEET (by id)
    router.get(
      "/tweets/:id",
      [AuthMiddleware.validate, ValidateUuidMiddleware.validate],
      TweetController.findOne
    );

    //UPDATE TWEET (by id)
    router.put(
      "/tweets/:id",
      [
        AuthMiddleware.validate,
        ValidateUuidMiddleware.validate,
        TweetMiddleware.validateTypes,
        TweetMiddleware.validateLength,
      ],
      TweetController.update
    );

    //DELETE TWEET (by id)
    router.delete(
      "/tweets/:id",
      [AuthMiddleware.validate, ValidateUuidMiddleware.validate],
      TweetController.remove
    );

    //LIKE ACTIONS TWEET (by id)
    router.patch(
      "/tweets/like/:id",
      [AuthMiddleware.validate, ValidateUuidMiddleware.validate],
      TweetController.like
    );

    //RETWEET ACTIONS (by id)
    router.patch(
      "/tweets/retweet/:id",
      [AuthMiddleware.validate, ValidateUuidMiddleware.validate],
      TweetController.retweet
    );

    return router;
  }
}
