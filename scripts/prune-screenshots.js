const fs = require("fs");
const path = require("path");

const screenshotDir = path.join(__dirname, "..", "static", "img", "screenshot");
const docsDir = path.join(__dirname, "..", "docs");

// Get all files in the docs directory
function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });
  return arrayOfFiles;
}

const docsFiles = getAllFiles(docsDir);

// Get screenshot files
const screenshots = fs.readdirSync(screenshotDir).filter((file) => {
  const ext = path.extname(file).toLowerCase();
  return [".png", ".jpg", ".jpeg", ".gif", ".svg"].includes(ext);
});

// Check if each screenshot is referenced
const unused = [];
screenshots.forEach((screenshot) => {
  const screenshotPath = path.join("static", "img", "screenshot", screenshot);
  let referenced = false;
  docsFiles.forEach((docFile) => {
    const content = fs.readFileSync(docFile, "utf8");
    if (content.includes(screenshotPath) || content.includes(screenshot)) {
      referenced = true;
    }
  });
  if (!referenced) {
    unused.push(path.join(screenshotDir, screenshot));
  }
});

// Delete unused ones
unused.forEach((file) => {
  console.log(`Deleting unused screenshot: ${file}`);
  fs.unlinkSync(file);
});

console.log("Done.");
