const fs = require("fs");

const js = fs.readFileSync("dist/bookmarklet.js").toString();
const template = fs.readFileSync("src/template.html").toString();

const html = template.replace(/\$\{js\}/, js);

fs.writeFileSync("dist/index.html", html);
