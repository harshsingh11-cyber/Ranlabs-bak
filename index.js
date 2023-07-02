import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';


const SECRET_KEY = "NOTESAPI";
const app = express();
const port = 4000;

dotenv.config();
app.use(cors());



const pass = process.env.MONGO_PASS;
app.use(express.json());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));



mongoose
    .connect(`mongodb+srv://harsh:${pass}@harsh-singh.yo9whrd.mongodb.net/ToDoApp?retryWrites=true&w=majority`)
    .then(() => console.log(`Connected to The MongoDB`))
    .catch((err) => console.log("error found", err));

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    },
    username: {
        type: String,
        require: true
    }
});
const userModel = mongoose.model('user', userSchema);

// mongoose
//     .connect(`mongodb+srv://harsh:${pass}@harsh-singh.yo9whrd.mongodb.net/ToDoApp?retryWrites=true&w=majority`)
//     .then(() => console.log(`Connected to The MongoDB`))
//     .catch((err) => console.log("error found", err));

const autherSchema = new mongoose.Schema({
    name: String,
    photo: String,
    file: String,
    address: String,
    education: String,
    isbn: Number,
});
const authModel = mongoose.model('auth', autherSchema);


async function signup(req, res) {
    const { username, email, pass} = req.body;
    try {
        const existingUser = await userModel.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({ message: "User already exists" });
        }
        const hashPassword = await bcrypt.hash(pass, 10);
        const result = await userModel.create({
            email: email,
            password: hashPassword,
            username: username,
        });
        const token = jwt.sign({ email: result.email, id: result._id }, SECRET_KEY);
        res.status(200).json({ user: result, token: token });
    }
    catch (error) {
        console.log("error");
        alert("some problem with mongoDb");
        res.status(500).json({ message: "Somthing went wrong" , error });
    }
}

async function signin(req, res) {
    const { email, pass } = req.body;
    try {
        const existingUser = await userModel.findOne({ email: email });
        if (!existingUser) {
            return res.status(404).json({ message: "User not found" });
        }
        const matchPassword = await bcrypt.compare(pass, existingUser.password);
        if (!matchPassword) {
            return res.status(400).json({ message: "Invalid Credentials" });

        }
        const token = jwt.sign({ email: existingUser.email, id: existingUser._id }, SECRET_KEY);
        res.status(200).json({ user: existingUser, token: token });
    }
    catch (error) {
        console.log("error");
        alert("some problem rise");
        res.status(500).json({ message: "Somthing went wrong" });
    }
}

async function registration(req,res){
    const { name,base64String,file,address,education,isbn } = req.body;
    console.log(name,base64String,file,address,education,isbn);
    try {
        const result = await authModel.create({
           name : name,
           photo : base64String,
           file : file,
           address : address,
           education : education,
           isbn : isbn,
        });
        res.status(200).json(result);
}
catch(error){
    console.log("Error found");
}
}




async function getData(req,res){
        try {
          const users = await authModel.find();
          res.json(users);
        } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ error: 'Internal Server Error' });
        }
}

app.get('/', (req, res) => {
    res.send("hello guys..");
})

app.post('/signup', signup);
app.post('/signin', signin);

app.post('/regi',registration);
app.get('/regi', getData);



app.listen(port, () => {
    console.log("server is started");
});
