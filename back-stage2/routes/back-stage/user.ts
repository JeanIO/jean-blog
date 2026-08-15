import Router from "@koa/router"
import * as userController from "../../controllers/user.js"

const userRouter = new Router()

userRouter.get("/", userController.getUsers)
userRouter.get("/:id", userController.getUserById)
userRouter.post("/", userController.createUser)
userRouter.put("/:id", userController.updateUser)
userRouter.delete("/:id", userController.deleteUser)

export default userRouter