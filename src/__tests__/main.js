require("connect-pg-simple");
const path = require("path");

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

describe("main", () => {
  const originalConsoleLog = console.log;

  beforeEach(() => {
    console.log = jest.fn();
  });

  afterEach(() => {
    console.log = originalConsoleLog;
  });

  it("should run the database schema migrations, log a message and start listening", async () => {
    mockQuery(
      "CREATE TABLE IF NOT EXISTS test (\n  id BIGSERIAL PRIMARY KEY\n);\n",
      [],
      []
    );
    const server = await main({
      corsOrigin: "http://cors-origin",
      hostname: "0.0.0.0",
      port: "12345",
      schemaPath: path.resolve(__dirname, "../__fixtures__/schema.sql"),
      sessionSecret: "test secret",
    });
    expect(console.log).toHaveBeenCalledWith(
      `Server running at http://0.0.0.0:12345/`
    );
    server.close();
  });

  it("should not start if the schema file can't be read", async () => {
    const server = await main({
      corsOrigin: "http://cors-origin",
      hostname: "0.0.0.0",
      port: "12345",
      schemaPath: "bad-file-path.sql",
      sessionSecret: "test secret",
    });
    expect(server).toBeUndefined();
    if (typeof server !== "undefined") {
      server.close();
    }
  });

  it("should not start if the schema migration fails", async () => {
    mockQuery(
      "CREATE TABLE IF NOT EXISTS test (\n  id BIGSERIAL PRIMARY KEY\n);\n",
      [],
      new Error("test error")
    );
    const server = await main({
      corsOrigin: "http://cors-origin",
      hostname: "0.0.0.0",
      port: "12345",
      schemaPath: path.resolve(__dirname, "../__fixtures__/schema.sql"),
      sessionSecret: "test secret",
    });
    expect(server).toBeUndefined();
    if (typeof server !== "undefined") {
      server.close();
    }
  });
});
