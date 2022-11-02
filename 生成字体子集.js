const replaceSVG = (text) => {
  text = text.replace(
    / transform="matrix\(1 0 0 1 (\d+) (\d+)\)" class=".+"/,
    ' x="$1" y="$2"'
  );
  return text;
};

let fontAPI = `https://lab.magiconch.com/api/fontmin`;
const generateFontURL = (name, text) => {
  text += "0";
  text = text.replace(/\s/g, "");
  text = Array.from(new Set(text)).sort().join("");

  if (!text) return requestAnimationFrame(onOver);

  console.log(text);

  const unicode = str2utf8(text).join();
  const fontURL = `${fontAPI}?name=${name}&unicode=${unicode}&type=woff`;

  return fontURL;
};

const getFontFromText = (name, text, onOver = (_) => {}) => {
  const fontURL = generateFontURL(name, text);
  loadFont(name, fontURL, (_) => {
    onOver(_);
  });
};

const loadFont = async (fontName, fontURL, callback) => {
  const fontFace = new FontFace(fontName, `url(${fontURL})`);
  fontFace
    .load()
    .then((fontFace) => {
      document.fonts.add(fontFace);
      callback(fontFace);
    })
    .catch((e) => {
      callback();
    });
};
function str2utf8(str) {
  return str.split("").map((s) => s.charCodeAt(0));
}

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
  .use(Fontmin.glyph({ text: mintext, hinting: false }))
  .use(Fontmin.ttf2woff({ deflate: true }));

fontmin.run(function (err, files) {
  if (err) {
    throw err;
  }
});
