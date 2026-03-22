const express = require("express");
const mongoose = require("mongoose");

const app = express();
app.use(express.json());

// ===== CONEXIÓN A MONGODB =====
mongoose.connect("mongodb://127.0.0.1:27017/sololeones", {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB conectado"))
.catch(err => console.log(err));

// ===== MODELO =====
const Post = mongoose.model("Post", {
  email: String,
  title: String,
  content: String,
  date: String
});

// ===== VALIDACIÓN EMAIL =====
function validarEmail(email){
  return /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email);
}

// ===== API CREAR POST =====
app.post("/api/post", async (req, res) => {
  const { email, title, content } = req.body;

  if (!email || !title || !content) {
    return res.status(400).json({ msg: "Todos los campos son obligatorios" });
  }

  if (!validarEmail(email)) {
    return res.status(400).json({ msg: "Email inválido" });
  }

  await new Post({
    email,
    title,
    content,
    date: new Date().toLocaleString()
  }).save();

  res.json({ msg: "Publicación creada" });
});

// ===== API OBTENER POSTS =====
app.get("/api/posts", async (req, res) => {
  const posts = await Post.find().sort({ _id: -1 });
  res.json(posts);
});

// ===== FRONTEND =====
app.get("/", (req, res) => {
res.send(`
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<title>SoloLeones | Publica contenido viral</title>

<meta name="description" content="Publica ideas virales fácilmente en SoloLeones. Contenido rápido, impactante y compartible.">
<meta name="keywords" content="blog, contenido viral, publicaciones, mentalidad">

<style>
*{margin:0;padding:0;box-sizing:border-box;}

body{
  font-family:Arial;
  background:#0d0d0d;
  color:white;
}

.container{
  max-width:700px;
  margin:auto;
  padding:20px;
}

header{
  text-align:center;
  padding:30px 0;
}

header h1{
  color:#00ffcc;
  font-size:2.5em;
}

header p{
  color:#aaa;
}

form{
  background:#1a1a1a;
  padding:20px;
  border-radius:10px;
  margin-bottom:20px;
}

input, textarea{
  width:100%;
  padding:12px;
  margin:8px 0;
  border-radius:5px;
  border:1px solid #00ffcc;
  background:#222;
  color:white;
}

button{
  width:100%;
  padding:12px;
  background:#00ffcc;
  border:none;
  font-weight:bold;
  cursor:pointer;
  border-radius:5px;
}

button:hover{
  background:#00e6b8;
}

.posts{
  margin-top:20px;
}

.post{
  background:#1a1a1a;
  padding:15px;
  margin-bottom:15px;
  border-radius:8px;
  border-left:4px solid #00ffcc;
}

.post h3{
  color:#00ffcc;
}

.post p{
  margin:10px 0;
}

small{
  color:#aaa;
}

.msg{
  text-align:center;
  padding:10px;
  margin-bottom:10px;
  display:none;
}

.error{background:#ff4444;}
.success{background:#00cc66;color:black;}
</style>

</head>

<body>

<div class="container">

<header>
  <h1>🦁 SoloLeones</h1>
  <p>Publica ideas virales en segundos</p>
</header>

<div id="msg" class="msg"></div>

<form onsubmit="event.preventDefault(); crear();">
  <input id="email" placeholder="Tu correo">
  <input id="title" placeholder="Título impactante">
  <textarea id="content" placeholder="Escribe algo que haga pensar..."></textarea>
  <button type="submit">Publicar</button>
</form>

<h2>Publicaciones</h2>
<div id="posts" class="posts"></div>

</div>

<script>

// ESCAPE XSS
function escapeHtml(text){
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// MENSAJES
function showMsg(text, type){
  const div = document.getElementById("msg");
  div.textContent = text;
  div.className = "msg " + type;
  div.style.display = "block";
  setTimeout(()=> div.style.display="none", 3000);
}

// CREAR POST
async function crear(){

  if(!email.value || !title.value || !content.value){
    showMsg("Completa todos los campos", "error");
    return;
  }

  const res = await fetch("/api/post", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({
      email: email.value,
      title: title.value,
      content: content.value
    })
  });

  const data = await res.json();

  if(res.status !== 200){
    showMsg(data.msg, "error");
    return;
  }

  email.value="";
  title.value="";
  content.value="";

  showMsg("Publicado correctamente", "success");
  cargar();
}

// CARGAR POSTS
async function cargar(){
  const res = await fetch("/api/posts");
  const data = await res.json();

  posts.innerHTML = data.map(p => \`
    <div class="post">
      <h3>\${escapeHtml(p.title)}</h3>
      <p>\${escapeHtml(p.content)}</p>
      <small>\${escapeHtml(p.email)} | \${p.date}</small>
    </div>
  \`).join("");
}

cargar();

</script>

</body>
</html>
`);
});

// ===== SERVIDOR =====
app.listen(3000, () => {
  console.log("Servidor corriendo en http://localhost:3000");
});
