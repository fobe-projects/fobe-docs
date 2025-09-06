require("dotenv").config();

const { themes } = require("prism-react-renderer");
const path = require("node:path");

const gtmContainerId = "GTM-PQDT48Z5"; // cspell: disable-line

module.exports = {
  title: "FoBE Documentation",
  tagline: "High performance, composable, headless commerce API.",
  url: "https://fobe-projects.github.io",
  baseUrl: "/",
  onBrokenAnchors: "throw",
  // Used for publishing and more
  projectName: "fobe-documentation-web",
  organizationName: "fobe-projects",
  deploymentBranch: "gh-pages",
  trailingSlash: false,
  favicon: "img/favicon.png",

  future: {
    v4: {
      removeLegacyPostBuildHeadAttribute: true,
    },
    experimental_faster: true,
  },

  markdown: {
    mermaid: true,
    parseFrontMatter: async (params) => {
      const result = await params.defaultParseFrontMatter(params);

      result.frontMatter.pagination_prev = null;
      result.frontMatter.pagination_next = null;

      // Tweak the API Reference pages because they are affecting our SEO
      // `api_reference` variable is set at the level of mdx file generations from the schema
      // while this code here is run later at the build stage
      if (result.frontMatter?.api_reference == true) {
        // We are going to change the title, make sure to keep the sidebar_label intact
        result.frontMatter.sidebar_label = result.frontMatter.title;

        // Generate a custom title for each of the API Reference files based on the category
        // This should generate entries like Objects: Product or Queries: Product
        let category_path = path.dirname(params.filePath).split("/");
        let category_name_from_path = category_path[category_path.length - 1];
        let category_title_mapping = {
          directives: "Directive",
          enums: "Enum",
          inputs: "Input Type",
          interfaces: "Interface",
          mutations: "Mutation",
          objects: "Object",
          queries: "Query",
          scalars: "Scalar",
          subscriptions: "Subscription",
          unions: "Union",
        };
        let category_name = category_title_mapping[category_name_from_path];
        result.frontMatter.title =
          result.frontMatter.title + " " + category_name;

        // For GraphQL pages that don't have description we don't want to duplicate the meta description tag
        // Ideally we should make sure each element from the schema does have a description
        // But for now we're just going to make sure we don't have duplicates
        result.frontMatter.description =
          category_name + ": " + result.frontMatter.title;
        if (params.fileContent.includes("No description")) {
          result.frontMatter.description =
            result.frontMatter.title + " - no description";
        }
      }

      return result;
    },
  },
  themes: ["@docusaurus/theme-mermaid"],

  plugins: [
    [
      "@graphql-markdown/docusaurus",
      {
        schema: "./schema.graphql",
        rootPath: "./docs", // docs will be generated under rootPath/baseURL
        baseURL: "api-reference",
        homepage: "./template/api-reference.mdx",
        linkRoot: "../../../",
        loaders: {
          GraphQLFileLoader: "@graphql-tools/graphql-file-loader",
        },
        groupByDirective: {
          directive: "doc",
          field: "category",
          fallback: "Miscellaneous",
        },
        docOptions: {
          frontMatter: {
            api_reference: true,
          },
        },
        printTypeOptions: {
          hierarchy: "entity",
        },
      },
    ],
    // Disabling due to known bug which causes slowdowns in the build process
    // https://github.com/facebook/docusaurus/discussions/11199
    function disableExpensiveBundlerOptimizationPlugin() {
      return {
        name: "disable-expensive-bundler-optimizations",
        configureWebpack(_config, isServer) {
          return {
            optimization: {
              concatenateModules: false,
            },
          };
        },
      };
    },
    async function githubReleaseProxy(context, options) {
      return {
        name: "github-release-proxy",
        configureWebpack(config, isServer, utils) {
          return {
            devServer: {
              proxy: {
                "/api/github": {
                  target: "https://github.com",
                  changeOrigin: true,
                  pathRewrite: { "^/api/github": "" },
                  secure: false,
                  selfHandleResponse: true,
                  onProxyRes: async (proxyRes, req, res) => {
                    if (
                      proxyRes.statusCode === 302 &&
                      proxyRes.headers.location
                    ) {
                      const redirectUrl = proxyRes.headers.location;
                      try {
                        const r = await fetch(redirectUrl);
                        const buffer = await r.arrayBuffer();
                        res.writeHead(200, {
                          "Content-Type": "application/octet-stream",
                        });
                        res.end(Buffer.from(buffer));
                      } catch (err) {
                        res.writeHead(500);
                        res.end(`Proxy error: ${err.message}`);
                      }
                    } else {
                      // 默认把内容 pipe 回去
                      proxyRes.pipe(res);
                    }
                  },
                },
              },
            },
          };
        },
      };
    },
  ],

  themeConfig: {
    metadata: [
      {
        name: "keywords",
        content:
          "fobe, documentation, api, graphql, commerce, headless, ecommerce, fobe_studio, developer, docs",
      }, // cspell: disable-line
      {
        name: "description",
        content:
          "FoBE Studio Documentation - High performance, composable, headless commerce API. Complete developer guide and API reference.",
      }, // cspell: disable-line
      { name: "author", content: "FoBE Studio" },
      { name: "robots", content: "index, follow" },
      { name: "language", content: "en" },

      { property: "og:type", content: "website" },
      { property: "og:site_name", content: "FoBE Documentation" },
      {
        property: "og:title",
        content: "FoBE Documentation - Headless Commerce API",
      },
      {
        property: "og:description",
        content:
          "High performance, composable, headless commerce API. Complete developer guide and API reference for building modern ecommerce applications.",
      }, // cspell: disable-line
      {
        property: "og:image",
        content: "https://fobe-projects.github.io/img/og-image.png",
      },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:url", content: "https://fobe-projects.github.io" },
      { property: "og:locale", content: "en_US" },

      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:site", content: "@fobe_studio" },
      { name: "twitter:creator", content: "@fobe_studio" },
      {
        name: "twitter:title",
        content: "FoBE Documentation - Headless Commerce API",
      },
      {
        name: "twitter:description",
        content:
          "High performance, composable, headless commerce API. Complete developer guide and API reference.",
      },
      {
        name: "twitter:image",
        content: "https://fobe-projects.github.io/img/twitter-image.png",
      },

      { name: "viewport", content: "width=device-width, initial-scale=1.0" },
      { name: "theme-color", content: "#0c7d7b" },

      { name: "canonical", content: "https://fobe-projects.github.io" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "default" },
      { name: "format-detection", content: "telephone=no" },
    ],

    announcementBar: {
      id: "announcement-bar",
      content: `
        <span>
          🔧 Let's build together. Join FoBE Studio dev community on Discord.
        </span>
        <a
    			target="_blank"
    			href="https://discord.gg/XjPDqEWyC7"
    		>
    			Join the community
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 25 20">
            <path fill="currentColor" d="M20.83 2.27A19.55 19.55 0 0 0 15.88.7c-.21.39-.46.9-.64 1.32a18.18 18.18 0 0 0-5.48 0c-.17-.41-.43-.93-.64-1.32-1.74.3-3.4.83-4.96 1.56A20.77 20.77 0 0 0 .6 16.17a19.8 19.8 0 0 0 6.07 3.12c.5-.68.93-1.4 1.3-2.14a13.3 13.3 0 0 1-2.04-1l.5-.4a14 14 0 0 0 12.14 0l.5.4c-.65.39-1.33.73-2.05 1 .38.75.81 1.47 1.3 2.14 1.98-.62 4-1.56 6.08-3.11a20.7 20.7 0 0 0-3.57-13.91ZM8.51 13.37c-1.18 0-2.15-1.1-2.15-2.45S7.3 8.47 8.5 8.47s2.18 1.1 2.16 2.45c0 1.35-.95 2.46-2.16 2.46Zm7.98 0c-1.19 0-2.16-1.1-2.16-2.45s.95-2.45 2.16-2.45c1.2 0 2.18 1.1 2.15 2.45 0 1.35-.95 2.46-2.15 2.46Z"/>
          </svg>
    		</a>
      `,
      backgroundColor: "#E0E3FF",
      textColor: "#5865F2",
      isCloseable: true,
    },

    algolia: {
      appId: "KOMJIOT8N0", // cspell: disable-line
      apiKey: "1cbe9bcb1d974a5c73e4146543eb8335",
      indexName: "docs_fobestudio_com", // cspell: disable-line
      placeholder: "Search FoBE Documentation",
      contextualSearch: true,
    },

    colorMode: {
      respectPrefersColorScheme: true,
    },

    /* Colors for website */
    colors: {
      primaryColor: "#0c7d7b",
      secondaryColor: "#5d623c",
    },

    docs: {
      sidebar: {
        autoCollapseCategories: true,
      },
    },

    mermaid: {
      theme: {
        light: "neutral",
        dark: "dark",
      },
    },

    navbar: {
      hideOnScroll: true,
      logo: {
        alt: "FoBE Studio",
        src: "img/logo.svg",
        srcDark: "img/logo-white.svg",
        className: "fobe-logo",
      },
      items: [
        {
          type: "search",
          position: "left",
        },
        {
          to: "https://store.fobestudio.com",
          label: "Store 🛍️",
          position: "right",
          className: "store-button-cta",
        },
      ],
    },

    prism: {
      theme: themes.oceanicNext,
      additionalLanguages: ["json", "bash"],
    },
  },
  customFields: {
    sentryDSN: process.env.SENTRY_DSN,
  },
  presets: [
    [
      "@docusaurus/preset-classic",
      {
        theme: {
          customCss: [require.resolve("./src/css/theme.css")],
        },
        sitemap: {
          lastmod: "datetime",
          changefreq: "daily",
          priority: 0.5,
        },
        docs: {
          breadcrumbs: false,
          routeBasePath: "/",
          path: "docs",
          editUrl: function ({ version, versionDocsDirPath, docPath }) {
            return `https://github.com/fobe-projects/fobe-documentation-web/edit/main/docs/${docPath}`;
          },
          sidebarPath: "sidebars.js",
        },
        ...(gtmContainerId && {
          googleTagManager: {
            containerId: gtmContainerId,
          },
        }),
      },
    ],
  ],
};
