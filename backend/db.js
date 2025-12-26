const neo4j = require("neo4j-driver");

const driver = neo4j.driver(
  "bolt://127.0.0.1:7687",
  neo4j.auth.basic("neo4j", "thejeesh"),
  {
    encrypted: "ENCRYPTION_OFF"
  }
);

module.exports = driver;
