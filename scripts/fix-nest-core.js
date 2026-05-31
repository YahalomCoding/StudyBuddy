const fs = require("fs");
const path = require("path");

const filePath = path.join(
  __dirname,
  "..",
  "node_modules",
  "@nestjs",
  "core",
  "errors",
  "exceptions",
  "invalid-exception-filter.exception.js"
);

const fileContents = `"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvalidExceptionFilterException = void 0;
class InvalidExceptionFilterException extends Error {
  constructor() {
    super("Invalid exception filter passed to @UseFilters() decorator.");
  }
}
exports.InvalidExceptionFilterException = InvalidExceptionFilterException;
`;

if (!fs.existsSync(filePath)) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, fileContents, "utf8");
  console.log("Patched missing @nestjs/core invalid-exception-filter file.");
}
