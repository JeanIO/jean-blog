import Router from "@koa/router"
import { login, logout } from "../../controllers/auth.js"

const authRouter = new Router()

// POST /api/back-stage/login
authRouter.post("/login", login)
// POST /api/back-stage/logout
authRouter.post("/logout", logout)

export default authRouter
