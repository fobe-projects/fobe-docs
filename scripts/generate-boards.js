#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Generate boards.json script
// Traverse static/boards/*/board.json files and extract basic info to generate summary boards.json

// Define paths
const boardsDir = path.join(__dirname, "..", "static", "boards");
const outputPath = path.join(boardsDir, "boards.json");

/**
 * Read and parse board.json file
 * @param {string} boardPath - board directory path
 * @returns {Object|null} - parsed board info or null if error
 */
function readBoardConfig(boardPath) {
  const configPath = path.join(boardPath, "board.json");

  try {
    if (!fs.existsSync(configPath)) {
      console.warn(`Warning: ${configPath} does not exist`);
      return null;
    }

    const content = fs.readFileSync(configPath, "utf8");
    const boardConfig = JSON.parse(content);

    // Extract required fields
    const { id, name, manufacturer, image } = boardConfig;

    // Validate required fields
    if (!id || !name || !manufacturer) {
      console.warn(
        `Warning: ${configPath} missing required fields (id, name, manufacturer)`,
      );
      return null;
    }

    return {
      id,
      name,
      manufacturer,
      image: image || "", // image field is optional
    };
  } catch (error) {
    console.error(`Error: Failed to read ${configPath}:`, error.message);
    return null;
  }
}

/**
 * Scan boards directory and generate boards.json
 */
function generateBoardsJson() {
  try {
    // Check if boards directory exists
    if (!fs.existsSync(boardsDir)) {
      console.error(`Error: boards directory does not exist: ${boardsDir}`);
      process.exit(1);
    }

    // Read all entries in boards directory
    const entries = fs.readdirSync(boardsDir, { withFileTypes: true });

    // Filter directories (exclude boards.json file)
    const boardDirs = entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name);

    console.log(`Found ${boardDirs.length} board directories:`, boardDirs);

    // Process each board directory
    const boards = [];
    for (const dirName of boardDirs) {
      const boardPath = path.join(boardsDir, dirName);
      const boardInfo = readBoardConfig(boardPath);

      if (boardInfo) {
        boards.push(boardInfo);
        console.log(
          `✓ Successfully processed: ${boardInfo.name} (${boardInfo.id})`,
        );
      }
    }

    // Sort by id
    boards.sort((a, b) => a.id.localeCompare(b.id));

    // Generate JSON file
    const jsonContent = JSON.stringify(boards, null, 2);
    fs.writeFileSync(outputPath, jsonContent, "utf8");

    console.log(`\n✅ Successfully generated boards.json file:`);
    console.log(`   Path: ${outputPath}`);
    console.log(`   Contains ${boards.length} boards`);

    // Show preview of generated content
    console.log("\n📋 Generated content preview:");
    boards.forEach((board) => {
      console.log(`   - ${board.name} (${board.id})`);
    });
  } catch (error) {
    console.error("❌ Generation failed:", error.message);
    process.exit(1);
  }
}

// Main function
function main() {
  console.log("🚀 Starting boards.json generation...\n");
  generateBoardsJson();
}

// If running this script directly
if (require.main === module) {
  main();
}

module.exports = { generateBoardsJson, readBoardConfig };
