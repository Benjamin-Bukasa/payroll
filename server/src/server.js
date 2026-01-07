import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';


//import routes
import authRoutes from "./routes/authRoutes.js"
import adminRoutes from "./routes/adminRoutes.js";

//load environment variables
dotenv.config();

//initialize express app
const app = express();
const PORT = process.env.PORT || 5000;



//middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//routes
app.use("/neosys/api/auth", authRoutes)
app.use("/neosys/api/admin", adminRoutes);




app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});