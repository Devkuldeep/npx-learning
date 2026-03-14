function helloWorld() {
  console.log("Hello, World!");
  console.log("npm start — runs the CLI directly");
  console.log("npm install -g . then hello — installs globally and runs as a command");
  console.log("After publishing to npm: npx npx-learning — runs it via npx");
  console.log("After publishing to npm: npx -hello — runs it via npx with the custom command name");
}

export { helloWorld };
