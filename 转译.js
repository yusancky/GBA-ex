const levelsStyleText = `
#countrys>*[level="5"]{fill:#FF7E7E;}
#countrys>*[level="4"]{fill:#FFB57E;}
#countrys>*[level="3"]{fill:#FFE57E;}
#countrys>*[level="2"]{fill:#A8FFBE;}
#countrys>*[level="1"]{fill:#88AEFF;}
#countrys>*[level="w"]{fill:#edd1ff;}
`;

const replaceSVG = (text) => {
  text = text.replace(
    / transform="matrix\(1 0 0 1 (\d+)(?:\.\d+)? (\d+)(?:\.\d+)?\)" class="(.+)"/g,
    ' x="$1" y="$2" class="$3"'
  );
  text = text.replace(/<!--.+?-->/g, "");
  text = text.replace(/\n+/g, "\n");
  text = text.replace(/ xml:space="preserve"/g, "");
  text = text.replace(/ style="enable-background:new 0 0 \d+ \d+;?"/g, "");
  text = text.replace(/width="\d+px" height="\d+px"/g, "");
  text = text.replace(/ x="0px" y="0px"/g, "");
  text = text.replace(/ id="图层_1"/g, "");
  text = text.replace(/ version="1.1"/g, "");
  text = text.replace(/ xmlns:xlink="http:\/\/www\.w3\.org\/1999\/xlink"/g, "");
  text = text.replace(
    /<rect y="0" class=".+?" width="2000" height="1210"\/?>/g,
    ""
  );

  text = text.replace(
    /<polygon id="(.+?)" class="(.+?)" points="([^"]+)\s{0,}"\/>/g,
    (all, id, c, p) => {
      return `<path id="${id}" class="${c}" d="M${p
        .trim()
        .replace(/[\n\r]/g, " ")
        .replace(/\s+/g, " ")}z" />`;
    }
  );
  text = text.replace(
    /<rect id="(.+?)" x="(\d+)" y="(\d+)" class="(.+?)" width="(\d+)" height="(\d+)"\/>/g,
    (all, id, x, y, c, w, h) => {
      // console.log(x,y,w,h)
      return `<path id="${id}" class="${c}" d="M${x} ${y}h${w}v${h}H${x}Z" />`;
    }
  );

  text = text.replace(
    /<style type="text\/css">/,
    "<style></style><style>" + levelsStyleText
  );
  return text;
};
const ver = Math.floor(+new Date() / 10000).toString(36);
const replaceVersion = (text) => text.replace(/\{version\}/g, ver);

const {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
  copyFileSync,
} = require("fs");

const Less = require("less");

const reader = async (_) => {
  let xml = readFileSync("GBA-ex.svg", "utf8");

  xml = replaceSVG(xml);
  writeFileSync("GBA-ex-fixed.svg", xml);

  if (!existsSync("dist")) mkdirSync("dist");

  let html = readFileSync("html/index.html", "utf8");

  html = html.replace(
    /<!--svg-->/,
    xml.replace(/^<\?xml version="1.0" encoding="utf-8"\?>\n/, "")
  );
  html = html.replace(/\n\s+viewBox=/, " viewBox=");
  html = html.replace(/\n\s{0,}\n/g, "\n");
  html = html.replace(/\s+"/g, '"');
  html = html.replace(/\s+\/>/g, "/>");
  html = html.replace(/(\d+)\s+([\dvV]+)/g, "$1 $2");

  html = html.replace(/<style[\s\S]+<\/style>/gi, (all) =>
    all.replace(/\n\s{0,}/g, "")
  );
  html = replaceVersion(html);
  const { minify } = require("html-minifier");

  const options = {
    includeAutoGeneratedTags: true,
    removeAttributeQuotes: true,
    removeComments: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    removeStyleLinkTypeAttributes: true,
    sortClassName: true,
    useShortDoctype: true,
    collapseWhitespace: true,
  };

  html = minify(html, options);

  writeFileSync("dist/index.html", html, "utf8");

  const UglifyJS = require("uglify-js");

  let jsText = readFileSync("html/脚本.js", "utf8");

  jsText = replaceVersion(jsText);
  jsText = jsText.replace(/<!--.+?-->/g, "");
  jsText = jsText.replace(/^\s{0,}\/\/.+/g, "");
  jsText = `(_=>{${jsText}})()`;
  const minified = UglifyJS.minify(
    {
      "脚本.js": jsText,
    },
    {
      // drop_console: true,
      // pass: 3
    }
  );
  if (!minified.code) {
    throw minified;
  }
  jsText = minified.code;
  writeFileSync("dist/脚本.js", jsText, "utf8");

  const cssText = await Less.render(readFileSync("html/样式.less", "utf8"), {
    optimization: 1,
    compress: true,
    yuicompress: false,
  });
  writeFileSync("dist/样式.css", cssText.css, "utf8");
  copyFileSync("html/LXGWWenKaiGB-Regular.ttf", "dist/字体.ttf");
  copyFileSync("html/favicon.ico", "dist/favicon.ico");
};

reader();
