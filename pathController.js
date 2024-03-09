const fs = require("fs");
const path = require("path");

const usersFolderRoot = `${process.cwd()}/Users`;

const checkPath = (path) => {
  const newPath = path;
  if (fs.existsSync(newPath)) {
    return newPath;
  } else {
    fs.mkdir(newPath, (err) => {
      if (!err) {
        return newPath;
      } else {
        throw Error(err);
      }
    });
  }
};

module.exports = { checkPath };
