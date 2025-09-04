import { useEffect,useState } from "react";

const CACHE_KEY = "firmware_tags_cache";
const CACHE_TTL = 1000 * 60 * 60; // 1 hour // API rate limit exceeded // 未经身份验证的请求每小时 60 个请求

// fetch firmware tags and translated into local storage as json
export function useFirmwareTags() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        // 1. First read from cache
        const cached = localStorage.getItem(CACHE_KEY);
        if (cached) {
          const { timestamp, payload } = JSON.parse(cached);
          if (Date.now() - timestamp < CACHE_TTL) {
            setData(payload);
            setLoading(false);
            return;
          }
        }

        // 2. Cache expired → request GitHub
        const repos = [
          { owner: "fobe-projects", repo: "micropython" },
          { owner: "fobe-projects", repo: "circuitpython" },
          { owner: "fobe-projects", repo: "meshtastic-firmware" },
        ];

        const results = {};
        for (const { owner, repo } of repos) {
          const url = `/api/api-github/repos/${owner}/${repo}/releases`;
          const res = await fetch(url, {
            headers: {
              Accept: "application/vnd.github.v3+json",
              "User-Agent": "fobe-docusaurus-script",
              // "GITHUB_TOKEN": ""// sample: use token in dev
            },
          });
          const releases = await res.json();
          const finalData = [];
          const seenTags = new Set();
          for (const r of (releases || []).slice(0, 10)) {
            if (r.prerelease && repo === "micropython") {
              const prereleaseData = {};
              for (const asset of r.assets || []) {
                // Parse version number from asset.name
                // Example: FOBE_IDEA_MESH_TRACKER_C1-v1.27.0-preview.97.g0cd5ea202.tar.xz
                const match =
                  asset.name && asset.name.match(/-v([\w.-]+)\.tar\.xz$/);
                // console.log(match);
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
              // Base version
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
          results[repo] = finalData;
        }

        // 3. Write to cache
        localStorage.setItem(
          CACHE_KEY,
          JSON.stringify({ timestamp: Date.now(), payload: results }),
        );

        setData(results);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  return { data, loading, error };
}
