const express = require("express");
const mongoose = require("mongoose");
const path = require("path");

const app = express();
app.use(express.json());

// SERVIR FRONTEND
app.use(express.static(path.join(__dirname, "public")));

// ===== CONEXIÓN DB =====
mongoose.connect("mongodb://127.0.0.1:27017/sololeones")
.then(() => console.log("MongoDB conectado"))
.catch(err => console.log(err));

// ===== MODELO =====
const Post = mongoose.model("Post", {
  email: String,
  title: String,
  content: String,
  date: String
});

// VALIDACIÓN EMAIL
function validarEmail(email){
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

// CREAR POST
app.post("/api/post", async (req, res) => {
  const { email, title, content } = req.body;

  if (!email || !title || !content) {
    return res.status(400).json({ msg: "Todos los campos son obligatorios" });
  }

  if (!validarEmail(email)) {
    return res.status(400).json({ msg: "Email inválido" });
  }

  if(content.length > 500){
    return res.status(400).json({ msg: "Contenido demasiado largo" });
  }

  await new Post({
    email,
    title,
    content,
    date: new Date().toLocaleString()
  }).save();

  res.json({ msg: "Publicación creada" });
});

// OBTENER POSTS
app.get("/api/posts", async (req, res) => {
  const posts = await Post.find().sort({ _id: -1 });
  res.json(posts);
});

// SERVIDOR
app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});
