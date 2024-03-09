const FtpSrv = require('ftp-srv');

// Sample users with their passwords and permissions
const users = {
  'user1': { password: 'password1', root: '/path/to/user1/root' },
  'user2': { password: 'password2', root: '/path/to/user2/root' },
  // Add more users as needed
};

// Create FTP server instance
const ftpServer = new FtpSrv({
  url: 'ftp://127.0.0.1:21', // FTP server URL
  pasv_url: '127.0.0.1', // Passive mode URL (usually the same as the server URL)
  greeting: "Welcome to my FTP server", // Greeting message
  log: console.log, // Log function
});

// Event listener for client connected
ftpServer.on('client:connected', ({connectionId}) => {
  console.log(`Client connected: ${connectionId}`);
});

// Event listener for client disconnected
ftpServer.on('client:disconnected', ({connectionId}) => {
  console.log(`Client disconnected: ${connectionId}`);
});

// Event listener for authentication attempt
ftpServer.on('login', ({connectionId, username, password}, resolve, reject) => {
  // Check if user exists and password matches
  if (users[username] && users[username].password === password) {
    // Provide user's root directory as the current working directory
    resolve({ root: users[username].root });
    console.log(`User ${username} logged in (${connectionId})`);
  } else {
    // Reject login attempt if credentials are invalid
    reject(new Error('Invalid username or password'));
    console.log(`Login attempt failed for user ${username} (${connectionId})`);
  }
});

// Start the FTP server
ftpServer.listen()
  .then(() => {
    console.log('FTP server started');
  })
  .catch((err) => {
    console.error(`Error starting FTP server: ${err}`);
  });
