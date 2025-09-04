const fs = require("fs");
const path = require("path");

const REPOS = [
  { owner: "fobe-projects", repo: "micropython" },
  { owner: "fobe-projects", repo: "circuitpython" },
  { owner: "fobe-projects", repo: "meshtastic-firmware" },
];

const OUTPUT_DIR = path.join(__dirname, "..", "static", "releases");

async function fetchFromApi(apiUrl, owner, repo, entityName) {
  console.log(`Fetching ${entityName} from ${owner}/${repo}...`);
  const response = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "fobe-docusaurus-script",
      // "GITHUB_TOKEN": ""// sample: use token in dev
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${entityName} from ${owner}/${repo}: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

async function processRepo(owner, repo) {
  const RELEASES_API_URL = `https://api.github.com/repos/${owner}/${repo}/releases`;
  const releases = await fetchFromApi(
    RELEASES_API_URL,
    owner,
    repo,
    "releases",
  );

  // console.log(releases[0]);
  const finalData = [];
  const seenTags = new Set();

  for (const r of releases.slice(0, 10)) {
    if (r.prerelease && repo === "micropython") {
      const prereleaseData = {};
      for (const asset of r.assets || []) {
        // Parse version number from asset.name
        // Example: FOBE_IDEA_MESH_TRACKER_C1-v1.27.0-preview.97.g0cd5ea202.tar.xz
        const match = asset.name && asset.name.match(/-v([\w.-]+)\.tar\.xz$/);
        console.log(match);
        if (match) {
          const fullVersion = `v${match[1]}`;
          if (fullVersion == r.tag_name) {
            continue;
          }
          // If this version is different from the release's tag_name, it's a new build version
          if (!prereleaseData[fullVersion]) {
            prereleaseData[fullVersion] = {
              tag_name: r.tag_name,
              html_url: r.html_url,
              build: fullVersion,
              prerelease: r.prerelease,
              updated_at: asset.updated_at,
              date_fm: asset.updated_at
                ? asset.updated_at.substring(0, 10).replace(/-/g, "")
                : null,
              assets: [asset.name],
            };
          } else {
            prereleaseData[fullVersion].assets.push(asset.name);
          }
        }
      }
      Object.keys(prereleaseData).forEach((key) => {
        finalData.push(prereleaseData[key]);
        seenTags.add(key);
      });
    } else {
      // 基础版本
      const baseItem = {
        tag_name: r.tag_name,
        html_url: r.html_url,
        build: r.tag_name,
        prerelease: r.prerelease,
        updated_at: r.updated_at,
        date_fm: r.updated_at
          ? r.updated_at.substring(0, 10).replace(/-/g, "")
          : null,
        assets: r.assets.map((d) => d.name),
      };
      finalData.push(baseItem);
      seenTags.add(r.tag_name);
    }
  }

  const outputFile = path.join(OUTPUT_DIR, `${repo}-releases.json`);
  fs.writeFileSync(outputFile, JSON.stringify(finalData, null, 2));
  console.log(
    `Successfully saved ${finalData.length} items to ${path.relative(process.cwd(), outputFile)}`,
  );
}

async function main() {
  try {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    for (const { owner, repo } of REPOS) {
      await processRepo(owner, repo);
    }
  } catch (error) {
    console.error("Error during script execution:", error);
    process.exit(1);
  }
}

main();
