exports.isValidId = (id) => Number.isInteger(id) && id > 0;

exports.isNonWhitespaceOnlyString = (str) =>
  typeof str === "string" && str.trim() !== "";
