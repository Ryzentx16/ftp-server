const ftpd = require("ftpd");
const fs = require("fs");
const path = require("path");
const { checkPath } = require("./pathController");

require("dotenv").config();

var keyFile;
var certFile;
var server;
const usersFolderRoot = `${process.cwd()}/Users`;
// use the IP and PORT from the .env file or default to localhost:21
var options = {
  host: process.env.IP || "127.0.0.1",
  port: process.env.PORT || 2110,
  tls: null,
};

// Check if SSL KEY / CERT are provided ELSE start without SSL support
if (process.env.KEY_FILE && process.env.CERT_FILE) {
  console.log("Running as FTPS server");
  if (process.env.KEY_FILE.charAt(0) !== "/") {
    keyFile = path.join(__dirname, process.env.KEY_FILE);
  }
  if (process.env.CERT_FILE.charAt(0) !== "/") {
    certFile = path.join(__dirname, process.env.CERT_FILE);
  }
  options.tls = {
    key: fs.readFileSync(keyFile),
    cert: fs.readFileSync(certFile),
    ca: !process.env.CA_FILES
      ? null
      : process.env.CA_FILES.split(":").map(function (f) {
          return fs.readFileSync(f);
        }),
  };
} else {
  console.log();
  console.log("###### To run as FTPS server, #####");
  console.log('### set "KEY_FILE", "CERT_FILE" ###');
  console.log('###### or "CA_FILES" env vars. ####');
  console.log();
}

// get ftp root directory listing
server = new ftpd.FtpServer(options.host, {
  getInitialCwd: function (connection, callback) {
    var userDir = `/home`;
    // if (fs.existsSync(userDir)) {
    //   callback(null, "/home");
    // } else {
    //   fs.mkdir(`${usersFolderRoot}/${connection.username}/home`, (err) => {
    //     if (err) {
    //       callback(null, "/home");
    //     } else {
    //       callback(err, "/home");
    //     }
    //   });
    // }
    checkPath(`${usersFolderRoot}\\${connection.username}`);
    callback(null, "/");
    // fs.chmod(usersFolderRoot + "\\", 0o777, console.log);
    console.log(usersFolderRoot + userDir);
  },
  getRoot: function (connection, callback) {
    var rootPath = `${usersFolderRoot}\\${connection.username}`;
    // if (fs.existsSync(rootPath)) {
    //   callback(null, rootPath);
    // } else {
    //   fs.mkdir(rootPath, (err) => {
    //     if (err) {
    //       callback(null, "/");
    //     } else {
    //       callback(err, "/");
    //     }
    //   });
    // }
    callback(null, checkPath(rootPath));
    // callback(null, rootPath);
    // fs.chmod(usersFolderRoot + "\\", 0o777, console.log);
    console.log(rootPath);
  },
  pasvPortRangeStart: 1040,
  pasvPortRangeEnd: 1050,
  tlsOptions: options.tls,
  tlsOnly: false,
  allowUnauthorizedTls: true,
  useWriteFile: false,
  useReadFile: false,
  uploadMaxSlurpSize: 7000, // N/A unless 'useWriteFile' is true.
  // allowedCommands: [
  //   "XMKD",
  //   "AUTH",
  //   "TLS",
  //   "SSL",
  //   "USER",
  //   "PASS",
  //   "PWD",
  //   "OPTS",
  //   "TYPE",
  //   "PORT",
  //   "PASV",
  //   "LIST",
  //   "CWD",
  //   "MKD",
  //   "SIZE",
  //   "STOR",
  //   "MDTM",
  //   "DELE",
  //   "QUIT",
  //   "SYST",
  //   "FEAT",
  // ],
});

server.on("error", function (error) {
  console.log("FTP Server error:", error);
});

const users = {
  user1: "1",
  user2: "2",
  user3: "3",
};

// verify user and password
server.on("client:connected", function (connection) {
  let username = null;

  console.log("client connected: " + connection.remoteAddress);

  connection.on("command:user", function (user, success, failure) {
    // API Check
    if (users[user]) {
      username = user;
      success();
    } else {
      failure();
    }
  });

  connection.on("command:pass", function (pass, success, failure) {
    // API Check
    if (pass == users[username]) {
      checkPath(`${usersFolderRoot}\\${username}`);
      checkPath(`${usersFolderRoot}\\${username}\\home`);
      success(username);
    } else {
      failure();
    }
  });
});

server.debugging = 4;
server.listen(options.port);
console.log("Listening on port " + options.port);
