const { readFileSync, writeFileSync } = require("fs");

const getTextFromHTMLFile = (filename) => {
  let html = readFileSync(filename, "utf8");
  const texts = [];

  const addTextFromMatch = (all, text) => {
    text = text.replace(/<.+?>/g, "");

    texts.push(text);
    return "";
  };
  html = html.replace(/<(?:path|rect) id="(.+?)"/g, addTextFromMatch);
  html = html.replace(/<text .+?>(.+?)<\/text>/g, addTextFromMatch);
  html = html.replace(/<a .+?>(.+?)<\/a>/g, addTextFromMatch);
  html = html.replace(/<h2 .+?>(.+?)<\/h2>/g, addTextFromMatch);
  html = html.replace(/<p>([\s\S]+?)<\/p>/g, addTextFromMatch);

  return texts.join("");
};

const mintext =
  `1234567890:` +
  getTextFromHTMLFile("html/index.html") +
  getTextFromHTMLFile("GBA-ex.svg");

var Fontmin = require("fontmin");

var fontmin = new Fontmin()
  .src("LXGWWenKaiGB-Regular.ttf")
  .dest("html")
  .use(Fontmin.glyph({ text: mintext, hinting: false }));

fontmin.run(function (err, files) {
  if (err) {
    throw err;
  }
});
