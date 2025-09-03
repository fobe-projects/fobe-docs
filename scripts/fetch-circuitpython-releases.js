const fs = require("fs");
const path = require("path");

const OWNER = "adafruit";
const REPO = "circuitpython";
const API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/releases`;
const OUTPUT_DIR = path.join(__dirname, "..", "static", "releases");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "cpy-releases.json");

async function fetchCircuitPythonReleases() {
  console.log(`Fetching releases from ${OWNER}/${REPO}...`);
  try {
    const response = await fetch(API_URL, {
      headers: {
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "fobe-docusaurus-script",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch releases: ${response.status} ${response.statusText}`,
      );
    }

    const releases = await response.json();
    const filteredReleases = [];

    for (const release of releases) {
      const { html_url, id, tag_name, prerelease, updated_at } = release;
      filteredReleases.push({ html_url, id, tag_name, prerelease, updated_at });

      if (!prerelease) {
        // Stop after including the first non-prerelease version
        break;
      }
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(filteredReleases, null, 2));
    console.log(
      `Successfully saved ${filteredReleases.length} releases to ${path.relative(process.cwd(), OUTPUT_FILE)}`,
    );
  } catch (error) {
    console.error("Error fetching or saving releases:", error);
    if (!fs.existsSync(OUTPUT_FILE)) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify([]));
      console.log(
        `Created an empty releases file at ${path.relative(process.cwd(), OUTPUT_FILE)} to prevent build failure.`,
      );
    }
    process.exit(1);
  }
}

fetchCircuitPythonReleases();
