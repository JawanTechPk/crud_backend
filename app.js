import express from "express";
import mongoose from "mongoose";
import UserModel from "./models/UserSchema.js";
import bcrypt from "bcryptjs";

const app = express();
const PORT = 5000 || process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uri = "mongodb+srv://admin:admin@crudapp.ael8koi.mongodb.net/";

mongoose.connect(uri);

mongoose.connection.on("connected", () => console.log("MongoDB Connected"));
mongoose.connection.on("error", (err) => console.log("MongoDB Error", err));

app.get("/", (request, response) => {
  response.json({
    message: "SERVER UP",
  });
});

app.post("/api/signup", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    if (!firstName || !lastName || !email || !password) {
      res.json("required fields are missing!");
      return;
    }

    const emailExist = await UserModel.findOne({ email });
    console.log("emailExist", emailExist);
    if (emailExist !== null) {
      res.json({
        message: "Email already exist",
      });
      return;
    }

    const hashPassword = await bcrypt.hash(password, 10);

    const obj = {
      ...req.body,
      password: hashPassword,
    };
    const response = await UserModel.create(obj);
    console.log("response", response);
    res.json({
      message: "user Successfully SIGNUP!",
    });
  } catch (error) {
    res.json({
      message: error.message,
    });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.json("required fields are missing!");
      return;
    }

    const emailExist = await UserModel.findOne({ email });

    console.log(emailExist, "emailExist");
    if (!emailExist) {
      res.json({
        message: "Invalid email & password",
      });
      return;
    }

    const comparePass = await bcrypt.compare(password, emailExist.password);

    if (!comparePass) {
      res.json({
        message: "Invalid email & password",
      });
      return;
    }

    res.json({
      message: "successfully login",
      data: emailExist,
    });
  } catch (error) {
    res.json({
      message: error.message,
    });
  }
});

app.listen(PORT, () =>
  console.log(`server running on http://localhost:${PORT}`)
);
