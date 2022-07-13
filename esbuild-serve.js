const esbuild = require("esbuild");
const inlineImage = require("esbuild-plugin-inline-image");

esbuild
  .serve(
    {
      servedir: "public",
      port: 3000,
    },
    {
      entryPoints: ["./src/index.js"],
      outfile: "./public/dist/app.js",
      // minify: true,
      bundle: true,
      loader: {
        ".js": "jsx",
      },
      plugins: [inlineImage()],
      // splitting: true,
      format: "esm",
    }
  )
  .catch(() => process.exit(1));
