const fs = require("fs");

const js = fs.readFileSync("dist/dist.js").toString();

const md = `<a href='javascript:${js}'>followers</a>`;

fs.writeFileSync("README.md", md);
