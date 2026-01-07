import express from "express"
import {createUser,getAllUsers,updateUser,getUniqueUser,deleteUniqueUser} from "../controllers/user.js"

const router = express.Router()


router.post("/create-user",createUser)

router.get("/get-all-users", getAllUsers)

router.get("get-unique-user/:id", getUniqueUser)

router.put("/update-user/:id", updateUser)

router.delete("/delete-user/:id",deleteUniqueUser)


export default router