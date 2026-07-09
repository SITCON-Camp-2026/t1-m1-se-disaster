import { copyFile, mkdir } from "node:fs/promises";

const pagesRoutes = ["v1"];
const distRoot = new URL("../dist/", import.meta.url);
const appEntry = new URL("index.html", distRoot);

await Promise.all(
  pagesRoutes.map(async (route) => {
    const routeDir = new URL(`${route}/`, distRoot);
    await mkdir(routeDir, { recursive: true });
    await copyFile(appEntry, new URL("index.html", routeDir));
  }),
);

console.log(
  `Prepared GitHub Pages routes: ${pagesRoutes
    .map((route) => `/${route}/`)
    .join(", ")}`,
);
