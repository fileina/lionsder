const form = document.getElementById("form");
const postsDiv = document.getElementById("posts");

function showMsg(text, type){
  const msg = document.getElementById("msg");
  msg.textContent = text;
  msg.className = "msg " + type;
  msg.style.display = "block";
  setTimeout(()=> msg.style.display="none", 3000);
}

// ESCAPE XSS
function escapeHtml(text){
  return text.replace(/[&<>"']/g, m => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[m]));
}

// CREAR POST
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;

  const res = await fetch("/api/post", {
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ email, title, content })
  });

  const data = await res.json();

  if(res.status !== 200){
    showMsg(data.msg, "error");
    return;
  }

  form.reset();
  showMsg("Publicado", "success");
  loadPosts();
});

// CARGAR POSTS
async function loadPosts(){
  const res = await fetch("/api/posts");
  const data = await res.json();

  postsDiv.innerHTML = data.map(p => `
    <div class="post">
      <h3>${escapeHtml(p.title)}</h3>
      <p>${escapeHtml(p.content)}</p>
      <small>${escapeHtml(p.email)} | ${p.date}</small>
    </div>
  `).join("");
}

loadPosts();
