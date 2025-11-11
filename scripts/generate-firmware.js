#!/usr/bin/env node

const fs = require("fs");
// const { release } = require("os");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "..", "static/boards", "");

async function fetchFromApi(apiUrl) {
  const response = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "fobe-docusaurus-script",
    },
  });

  if (!response.ok) {
    console.log(response.error);
    throw new Error(`Failed to fetch from ${apiUrl}`);
  }
  return response.json();
}

function extractDate(fileName) {
  const date = fileName.match(/-(\d{8})-/);
  if (date) {
    return date[1].replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
  }
  return null;
}

async function getFirmwareDirSha() {
  const requestUrl =
    "https://api.github.com/repos/fobe-projects/fobe-projects.github.io/git/trees/main";
  const treeStruct = await fetchFromApi(requestUrl);
  const fileTree = treeStruct.tree;
  return fileTree.find((d) => d.path == "firmwares").sha;
}

async function fetchReleaseNote(fw, tag) {
  // meshtastic-firmware
  if (fw == "meshtastic") {
    fw = "meshtastic-firmware";
  }
  const requestUrl = `https://api.github.com/repos/fobe-projects/${fw}/releases/tags/${tag}`;
  try {
    const relTag = await fetchFromApi(requestUrl);
    return relTag.body || "";
  } catch (err) {
    console.log(`Fetch release note(${fw} ${tag}) error: ${err}`);
    return "";
  }
}

async function loadFileTree(sha) {
  const requestUrl = `https://api.github.com/repos/fobe-projects/fobe-projects.github.io/git/trees/${sha}?recursive=1`;
  const treeStruct = await fetchFromApi(requestUrl);
  const fileTree = treeStruct.tree;

  const resObj = {};
  for (const d of fileTree) {
    const dirLevel = d.path.split("/");
    const fwId = dirLevel[0];
    if (dirLevel.length == 1 && d["type"] == "tree") {
      // ex: [micropython]
      resObj[fwId] = {
        name: fwId,
        releases: [],
      };
      if (fwId == "circuitpython") {
        resObj[fwId].name = "CircuitPython";
      } else if (fwId == "micropython") {
        resObj[fwId].name = "MicroPython";
      } else if (fwId == "meshtastic") {
        resObj[fwId].name = "Meshtastic";
      }
    } else if (dirLevel.length == 2 && d["type"] == "tree") {
      // ex: micropython/ [v1.26.0]
      if (dirLevel[1].includes("preview") || dirLevel[1].includes("beta")) {
        continue;
      }
      if (!resObj[fwId].releases.some((d) => d.tag_name == dirLevel[1])) {
        console.log(`Fetching release note for ${fwId} ${dirLevel[1]}...`);
        const note = await fetchReleaseNote(fwId, dirLevel[1]);
        resObj[fwId].releases.push({
          tag_name: dirLevel[1],
          note: note,
          dir: dirLevel[1],
          prerelease: false,
          packages: [],
          updated_at: "",
        });
      }
    } else if (dirLevel.length == 3) {
      // ex: micropython/v1.26.0/ [xxxx.tar.xz]
      const file_name = dirLevel[2];

      let matchKey = null;
      // Match style: v1.27.0-preview.97.g4dd4407d9
      let match1 = file_name.match(/(v[\d.]+-preview\.\d+.[^.]+)/);
      if (match1) matchKey = match1[1];
      // Match style: v1.27.0-preview (simple preview without build number)
      let match2 = file_name.match(/(v\d+\.\d+\.\d+-preview)(?!\.[\d])/);
      if (match2) matchKey = match2[1];
      // Match style: 10.0.0-beta.3-2-g0c2a8f3219 or 10.0.0-beta.3
      let match3 = file_name.match(
        /(\d+\.\d+\.\d+-beta\.\d+)(?:-\d+-g[0-9a-f]+)?/i,
      );
      if (match3) matchKey = match3[1];
      // Match style: v1.26.0-beta.1 or v1.26.0-alpha.1 or v1.26.0-rc.1
      let match4 = file_name.match(
        /(v\d+\.\d+\.\d+-(beta|alpha|rc)\.\d+)(?:-\d+-g[0-9a-f]+)?/i,
      );
      if (match4) matchKey = match4[1];

      if (matchKey) {
        const tarTag = resObj[fwId].releases.find(
          (d) => d.tag_name == matchKey,
        );
        if (!tarTag) {
          const note = await fetchReleaseNote(fwId, dirLevel[1]);
          resObj[fwId].releases.push({
            tag_name: matchKey,
            note,
            dir: dirLevel[1],
            prerelease: true,
            packages: [dirLevel[2]],
            updated_at: extractDate(file_name),
          });
        } else {
          const exDate = extractDate(file_name);
          if (tarTag.updated_at < exDate) tarTag.updated_at = exDate;

          tarTag.packages.push(dirLevel[2]);
        }
      } else {
        for (let i = 0; i < resObj[fwId].releases.length; i++) {
          const d = resObj[fwId].releases[i];
          if (d.tag_name == dirLevel[1]) {
            const exDate = extractDate(file_name);
            if (d.updated_at < exDate) d.updated_at = exDate;

            d.packages.push(dirLevel[2]);
            break;
          }
        }
      }
    }
  }

  // Sort each firmware's releases by tag_name in descending order
  for (const key in resObj) {
    resObj[key].releases.sort((a, b) =>
      b.tag_name.localeCompare(a.tag_name, undefined, { numeric: true }),
    );
  }

  return resObj;
}

async function main() {
  try {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const firmwareDirSha = await getFirmwareDirSha();
    const firmwareJson = await loadFileTree(firmwareDirSha);

    const outputFile = path.join(OUTPUT_DIR, "firmware.json");

    // console.log(outputFile);
    fs.writeFileSync(outputFile, JSON.stringify(firmwareJson, null, 2));
    console.log(
      `Successfully saved firmware JSON to ${path.relative(process.cwd(), outputFile)}`,
    );
  } catch (error) {
    console.error("Error during script execution:", error);
    process.exit(1);
  }
}

main();
