require("connect-pg-simple");
const path = require("path");
const fs = require("fs");

const main = require("../main");
const { mockQuery } = require("../db");

jest.mock(
  "connect-pg-simple",
  () => () =>
    function () {
      this.on = jest.fn();
    }
);
jest.mock("../db");

describe("server", () => {
  it("should run the database schema migrations, log a message and start listening", async () => {
    const originalConsoleLog = console.log;
    console.log = jest.fn();
    const schemaPath = path.resolve(__dirname, "../schema.sql");
    const schemaSQL = await fs.promises.readFile(schemaPath, "utf8");
    mockQuery(schemaSQL, [], []);
    const server = await main(
      "0.0.0.0",
      "12345",
      "http://cors-origin",
      "test secret"
    );
    expect(console.log).toHaveBeenCalledWith(
      `Server running at http://0.0.0.0:12345/`
    );
    server.close();
    console.log = originalConsoleLog;
  });
});
