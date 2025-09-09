const fs = require("fs");
const path = require("path");

const REPOS = [
  { owner: "fobe-projects", repo: "micropython" },
  { owner: "fobe-projects", repo: "circuitpython" },
  { owner: "fobe-projects", repo: "meshtastic-firmware" },
];

const OUTPUT_DIR = path.join(__dirname, "..", "src", "");

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

async function processRepo(owner, repo) {
  const RELEASES_API_URL = `https://api.github.com/repos/${owner}/${repo}/releases`;
  const releases = await fetchFromApi(RELEASES_API_URL);

  let PACKAGE_URL = `https://api.github.com/repos/fobe-projects/fobe-projects.github.io/contents/firmwares/${repo}`;
  if (repo == "meshtastic-firmware") {
    return; // no yet
  }
  let packages = await fetchFromApi(PACKAGE_URL);
  packages = packages.map((d) => d.name);
  // console.log(packages);

  // console.log(releases[0]);
  const finalData = [];
  const seenTags = new Set();

  for (const r of releases.slice(0, 10)) {
    if (r.prerelease) {
      const relatedPackages = packages.filter((d) => {
        if (!d.includes(r.tag_name)) return false;
        // Exclude plain prerelease tarballs (e.g., ...-preview.tar.xz, ...-beta.3.tar.xz)
        if (d.endsWith(`${r.tag_name}.tar.xz`)) return false;
        return true;
      });
      const groups = {};

      for (const pkg of relatedPackages) {
        let groupKey = null;
        // Match style: v1.27.0-preview.97.g4dd4407d9
        let match1 = pkg.match(/(v[\d.]+-preview\.\d+.[^.]+)/);
        if (match1) {
          groupKey = match1[1];
        }

        // Match style: 10.0.0-beta.3-2-g0c2a8f3219
        let match2 = pkg.match(
          /(\d+\.\d+\.\d+-beta\.\d+(?:-\d+-g[0-9a-f]+)?)/i,
        );
        if (match2) {
          groupKey = match2[1];
        }

        if (groupKey) {
          if (!groups[groupKey]) groups[groupKey] = [];
          groups[groupKey].push(pkg);
        }
      }

      for (const [groupKey, pkgs] of Object.entries(groups)) {
        const item = {
          tag_name: groupKey,
          html_url: r.html_url,
          build: groupKey,
          prerelease: r.prerelease,
          updated_at: r.updated_at,
          date_fm: (() => {
            const dates = pkgs
              .map((p) => {
                const m = p.match(/-(\d{8})-/);
                return m ? m[1] : null;
              })
              .filter(Boolean)
              .sort()
              .reverse();
            return dates.length > 0 ? dates[0] : null;
          })(),
          packages: pkgs,
        };
        finalData.push(item);
        seenTags.add(groupKey);
      }
    } else {
      const baseItem = {
        tag_name: r.tag_name,
        html_url: r.html_url,
        build: r.tag_name,
        prerelease: r.prerelease,
        updated_at: r.updated_at,
        date_fm: (() => {
          const dates = packages
            .filter((d) => d.includes(r.tag_name))
            .map((p) => {
              const m = p.match(/-(\d{8})-/);
              return m ? m[1] : null;
            })
            .filter(Boolean)
            .sort()
            .reverse();
          return dates.length > 0 ? dates[0] : null;
        })(),
        packages: packages.filter((d) => d.includes(r.tag_name)),
      };
      finalData.push(baseItem);
      seenTags.add(r.tag_name);
    }
  }

  return finalData;
}

async function main() {
  try {
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const repo_releases = {};
    for (const { owner, repo } of REPOS) {
      repo_releases[repo] = (await processRepo(owner, repo)) || [];
    }

    const outputFile = path.join(OUTPUT_DIR, "releases.json");
    fs.writeFileSync(outputFile, JSON.stringify(repo_releases, null, 2));
    console.log(
      `Successfully saved releases to ${path.relative(process.cwd(), outputFile)}`,
    );
  } catch (error) {
    console.error("Error during script execution:", error);
    process.exit(1);
  }
}

main();
