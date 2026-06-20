// ==============================================================================
// Content
// ==============================================================================
// Each "file" is an array of markdown source lines. The editor renders them
// with a line-number gutter and light syntax coloring, so the page reads like
// real source open in an editor rather than a styled webpage.

const FILES = {
  "about.md": [
    "# About",
    "",
    "Dongzhe Wei — Software Engineer.",
    "",
    "Building practical tools for learning, automation, and applied AI.",
    "I like tools that start useful and stay understandable: prove the",
    "core behavior end to end, then grow the system only where the",
    "workflow actually asks for it."
  ],
  "projects.md": [
    "# Projects",
    "",
    "## anki-study",
    "Private study app for problems, sources, solutions, and review notes.",
    "",
    "## dongzhewei.com",
    "This site — a personal IDE you can click around and type into.",
    "",
    "## profile-agents",
    "Experiments in grounded assistants that answer from real context."
  ],
  "writing.md": [
    "# Writing",
    "",
    "Notes, eventually. I want this to come from real work logs —",
    "software engineering, learning workflows, automation, and applied",
    "AI. No generic filler."
  ],
  "apps.md": [
    "# Apps",
    "",
    "- [anki.dongzhewei.com](https://anki.dongzhewei.com) — personal study system behind Cloudflare Access."
  ],
  "contact.md": [
    "# Contact",
    "",
    "- email: [dongzhewei37@gmail.com](mailto:dongzhewei37@gmail.com)",
    "- github: [github.com/DongzheLi](https://github.com/DongzheLi)"
  ],
  "resume.md": [
    "# Resume",
    "",
    "Available on request. Email me for the current version.",
    "",
    "[Request resume](mailto:dongzhewei37@gmail.com?subject=Resume%20request)"
  ]
};

const NOW = "Anki-style study tools, useful personal infrastructure, and small applied-AI workflows.";

// ==============================================================================
// Shared helpers
// ==============================================================================

function esc(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

// A deliberately tiny markdown renderer: enough for headings, list items,
// links, bold, and inline code. We escape first, then apply inline rules to
// the escaped text (our URLs contain no HTML-significant characters).
function renderInline(text) {
  return esc(text)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/`([^`]+)`/g, '<span class="md-code">$1</span>');
}

// Turn the line array into a real styled document: headings, paragraphs, and
// lists as proper block elements, rather than printing the markdown source.
function renderFile(name) {
  let html = "";
  let para = [];
  let list = [];

  const flushPara = () => {
    if (para.length) html += `<p>${para.join(" ")}</p>`;
    para = [];
  };
  const flushList = () => {
    if (list.length) html += `<ul>${list.map((li) => `<li>${li}</li>`).join("")}</ul>`;
    list = [];
  };

  for (const line of FILES[name]) {
    if (/^##\s/.test(line)) {
      flushPara();
      flushList();
      html += `<h2>${renderInline(line.replace(/^##\s/, ""))}</h2>`;
    } else if (/^#\s/.test(line)) {
      flushPara();
      flushList();
      html += `<h1>${renderInline(line.replace(/^#\s/, ""))}</h1>`;
    } else if (/^\s*-\s/.test(line)) {
      flushPara();
      list.push(renderInline(line.replace(/^\s*-\s/, "")));
    } else if (line.trim() === "") {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(renderInline(line));
    }
  }

  flushPara();
  flushList();
  return html;
}

const docIcon =
  '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M13 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V9z"/><path d="M13 3v6h6"/></svg>';

// ==============================================================================
// Explorer + editor tabs
// ==============================================================================
// openFile() is the single entry point shared by the file tree, the terminal,
// and the assistant, so navigation always stays consistent.

const filesEl = document.getElementById("files");
const tabsEl = document.getElementById("tabs");
const editorEl = document.getElementById("editor");
const statusFileEl = document.getElementById("statusFile");

let openTabs = [];
let activeFile = null;

// Build the file tree from FILES so the list never drifts from the content.
Object.keys(FILES).forEach((name) => {
  const li = document.createElement("li");
  li.className = "file";
  li.dataset.file = name;
  li.innerHTML = `${docIcon}<span>${name}</span>`;
  filesEl.appendChild(li);
});

function renderTabs() {
  tabsEl.innerHTML = openTabs
    .map(
      (name) =>
        `<div class="tab ${name === activeFile ? "is-active" : ""}" data-tab="${name}">` +
        `${docIcon}<span>${name}</span>` +
        `<span class="tab-close" data-close="${name}">×</span></div>`
    )
    .join("");
}

function renderEditor() {
  if (!activeFile) {
    editorEl.innerHTML =
      '<div class="editor-empty"><div><h1>Dongzhe Wei</h1>' +
      "<p>Open a file from the Explorer, run a command in the Terminal,<br>" +
      "or ask the Assistant on the right.</p></div></div>";
    statusFileEl.textContent = "Markdown";
    return;
  }
  editorEl.innerHTML = `<article class="doc">${renderFile(activeFile)}</article>`;
  editorEl.scrollTop = 0;
  statusFileEl.textContent = "Markdown";
}

function openFile(name) {
  if (!FILES[name]) return;
  if (!openTabs.includes(name)) openTabs.push(name);
  activeFile = name;
  renderTabs();
  renderEditor();
  document.querySelectorAll(".file").forEach((f) => {
    f.classList.toggle("is-active", f.dataset.file === name);
  });
}

function closeTab(name) {
  const i = openTabs.indexOf(name);
  if (i === -1) return;
  openTabs.splice(i, 1);
  if (activeFile === name) {
    activeFile = openTabs[i] || openTabs[i - 1] || null;
  }
  renderTabs();
  renderEditor();
  document.querySelectorAll(".file").forEach((f) => {
    f.classList.toggle("is-active", f.dataset.file === activeFile);
  });
}

filesEl.addEventListener("click", (event) => {
  const file = event.target.closest(".file");
  if (file) openFile(file.dataset.file);
});

tabsEl.addEventListener("click", (event) => {
  const close = event.target.closest(".tab-close");
  if (close) {
    event.stopPropagation();
    closeTab(close.dataset.close);
    return;
  }
  const tab = event.target.closest(".tab");
  if (tab) openFile(tab.dataset.tab);
});

// ==============================================================================
// Terminal
// ==============================================================================
// File-name commands open the matching document in the editor; the rest print
// inline. This makes the terminal a launcher that drives the same editor.

const outputEl = document.getElementById("output");
const inputEl = document.getElementById("cmdline");
const bodyEl = document.getElementById("terminalBody");
const terminalHistory = [];
let historyIndex = 0;

const FILE_COMMANDS = ["about", "projects", "writing", "apps", "contact", "resume"];

function printHTML(html) {
  const line = document.createElement("div");
  line.className = "line";
  line.innerHTML = html;
  outputEl.appendChild(line);
}

function echoPrompt(command) {
  printHTML(`<span class="ps1">dongzhewei@web:~$</span> ${esc(command)}`);
}

function runCommand(raw) {
  const command = raw.trim().toLowerCase();
  if (!command) return;

  terminalHistory.push(raw);
  historyIndex = terminalHistory.length;
  echoPrompt(raw);

  if (FILE_COMMANDS.includes(command)) {
    openFile(`${command}.md`);
    printHTML(`<span class="muted">opening</span> <span class="green">${command}.md</span>`);
  } else if (command === "help") {
    printHTML(
      [
        '<span class="accent">commands</span>',
        "  ls / help   show this list",
        "  about       open about.md",
        "  projects    open projects.md",
        "  writing     open writing.md",
        "  apps        open apps.md",
        "  contact     open contact.md",
        "  resume      open resume.md",
        "  now         current focus",
        "  clear       clear terminal"
      ].join("\n")
    );
  } else if (command === "ls") {
    printHTML(Object.keys(FILES).map((f) => `<span class="green">${f}</span>`).join("  "));
  } else if (command === "now") {
    printHTML(esc(NOW));
  } else if (command === "clear") {
    outputEl.innerHTML = "";
  } else {
    printHTML(
      `<span class="error">command not found:</span> ${esc(raw)}\n<span class="muted">try: help</span>`
    );
  }

  bodyEl.scrollTop = bodyEl.scrollHeight;
}

inputEl.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    event.preventDefault();
    const value = inputEl.value;
    inputEl.value = "";
    runCommand(value);
  }
  if (event.key === "ArrowUp") {
    event.preventDefault();
    historyIndex = Math.max(0, historyIndex - 1);
    inputEl.value = terminalHistory[historyIndex] || "";
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    historyIndex = Math.min(terminalHistory.length, historyIndex + 1);
    inputEl.value = terminalHistory[historyIndex] || "";
  }
});

bodyEl.addEventListener("click", (event) => {
  if (event.target.closest("a")) return;
  if (window.getSelection().toString()) return;
  inputEl.focus();
});

// ==============================================================================
// Assistant
// ==============================================================================
// A local, rule-based stand-in "equipped with my knowledge" — it keyword-matches
// against the same profile content the files use. No network call.
// TODO: swap agentReply() for a real model endpoint grounded on this content.

const chatEl = document.getElementById("chat");
const chatForm = document.getElementById("chatForm");
const chatInput = document.getElementById("chatInput");

function addMessage(role, html) {
  const el = document.createElement("div");
  el.className = `msg ${role}`;
  el.innerHTML = html;
  chatEl.appendChild(el);
  chatEl.scrollTop = chatEl.scrollHeight;
}

function agentReply(text) {
  const q = text.toLowerCase();

  if (/(project|work|built|building|made)/.test(q))
    return "His main projects: <strong>anki-study</strong> (a private study app), <strong>dongzhewei.com</strong> (this IDE-style site), and <strong>profile-agents</strong> (grounded assistants). Open <code>projects.md</code> for details.";
  if (/(contact|email|reach|hire|talk|message)/.test(q))
    return 'Reach him at <a href="mailto:dongzhewei37@gmail.com">dongzhewei37@gmail.com</a> or on <a href="https://github.com/DongzheLi">GitHub</a>. See <code>contact.md</code>.';
  if (/(resume|cv|experience|background)/.test(q))
    return 'His resume is available on request — <a href="mailto:dongzhewei37@gmail.com?subject=Resume%20request">email for the current version</a>.';
  if (/(app|anki|study|hosted|tool)/.test(q))
    return 'He runs <a href="https://anki.dongzhewei.com">anki.dongzhewei.com</a>, a personal study system behind Cloudflare Access. See <code>apps.md</code>.';
  if (/(writing|blog|notes|post|article)/.test(q))
    return "Writing is coming from real work logs — software engineering, learning workflows, automation, and applied AI. See <code>writing.md</code>.";
  if (/(now|current|focus|working on|these days)/.test(q))
    return `Right now: ${esc(NOW)}`;
  if (/(who|about|yourself|tell me|skills|do you do)/.test(q))
    return "Dongzhe is a software engineer building practical tools for learning, automation, and applied AI. His bias is to prove the core behavior end to end, then grow only where the workflow asks. Open <code>about.md</code>.";
  if (/(hi|hello|hey|yo)\b/.test(q))
    return "Hey! Ask me about his projects, apps, background, or how to get in touch.";

  return "I'm a lightweight assistant trained on Dongzhe's profile. Try asking about his <strong>projects</strong>, <strong>apps</strong>, <strong>background</strong>, or how to <strong>contact</strong> him.";
}

function ask(text) {
  const clean = text.trim();
  if (!clean) return;
  addMessage("user", esc(clean));
  // A small delay reads as "thinking" and keeps the exchange legible.
  setTimeout(() => addMessage("bot", agentReply(clean)), 280);
}

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();
  ask(chatInput.value);
  chatInput.value = "";
});

// Suggestion chips give first-time visitors an obvious way in.
chatEl.addEventListener("click", (event) => {
  const chip = event.target.closest(".chat-chip");
  if (chip) ask(chip.textContent);
});

addMessage(
  "bot",
  "<p>👋 I'm an assistant equipped with Dongzhe's knowledge — his projects, work, and background.</p>" +
    "<p>Ask me anything.</p>" +
    '<div class="chat-suggest">' +
    '<button class="chat-chip">What projects has he built?</button>' +
    '<button class="chat-chip">What is he working on now?</button>' +
    '<button class="chat-chip">How do I contact him?</button>' +
    "</div>"
);

// ==============================================================================
// Activity bar wiring + boot
// ==============================================================================

document.querySelectorAll(".act").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.dataset.act === "chat") chatInput.focus();
    if (btn.dataset.act === "explorer") inputEl.blur();
  });
});

renderEditor(); // start on the welcome state
inputEl.focus();
