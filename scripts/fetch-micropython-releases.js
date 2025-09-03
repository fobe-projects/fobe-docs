const fs = require("fs");
const path = require("path");

const OWNER = "fobe-projects";
const REPO = "micropython";
const RELEASES_API_URL = `https://api.github.com/repos/${OWNER}/${REPO}/releases`;
const OUTPUT_DIR = path.join(__dirname, "..", "static", "releases");
const OUTPUT_FILE = path.join(OUTPUT_DIR, "mpy-releases.json");

async function fetchFromApi(apiUrl, entityName) {
  console.log(`Fetching ${entityName} from ${OWNER}/${REPO}...`);
  const response = await fetch(apiUrl, {
    headers: {
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "fobe-docusaurus-script",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Failed to fetch ${entityName}: ${response.status} ${response.statusText}`,
    );
  }
  return response.json();
}

async function main() {
  try {
    const releases = await fetchFromApi(RELEASES_API_URL, "releases");

    console.log(releases[0]);

    // Process the 10 most recent releases
    const finalData = releases
      .slice(0, 10)
      .map(({ html_url, id, tag_name, prerelease, updated_at }) => {
        const date_fm = updated_at
          ? updated_at.substring(0, 10).replace(/-/g, "")
          : null;
        return {
          html_url,
          id,
          tag_name,
          prerelease,
          updated_at,
          date_fm,
        };
      });

    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(finalData, null, 2));
    console.log(
      `Successfully saved ${finalData.length} items to ${path.relative(process.cwd(), OUTPUT_FILE)}`,
    );
  } catch (error) {
    console.error("Error during script execution:", error);
    if (!fs.existsSync(OUTPUT_FILE)) {
      fs.writeFileSync(OUTPUT_FILE, JSON.stringify([]));
      console.log(
        `Created an empty releases file at ${path.relative(process.cwd(), OUTPUT_FILE)} to prevent build failure.`,
      );
    }
    process.exit(1);
  }
}

main();
