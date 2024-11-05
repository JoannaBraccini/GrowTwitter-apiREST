import { Router } from "express";
import { TweetController } from "../controllers/tweet.controller";
import { AuthMiddleware } from "../middlewares/auth/auth.middleware";
import { TweetMiddleware } from "../middlewares/tweet.middleware";

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
    //FIND TWEETS
    router.get("/tweets", [], TweetController.findAll);

    //FIND ONE TWEET (id)

    //UPDATE TWEET

    //DELETE TWEET

    return router;
  }
}
