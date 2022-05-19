const { isValidId, isNonWhitespaceOnlyString } = require("../validators");

describe("validators", () => {
  describe("isValidId", () => {
    it("should return true if the input is a whole number greater than or equal to 1", () => {
      expect(isValidId(1)).toBe(true);
    });

    it("should return false if the input is not a whole number", () => {
      expect(isValidId(1.1)).toBe(false);
    });

    it("should return false if the input is less than 1", () => {
      expect(isValidId(0)).toBe(false);
    });

    it("should return false if the input is not a number", () => {
      expect(isValidId("1")).toBe(false);
    });
  });

  describe("isNonWhitespaceOnlyString", () => {
    it("should return true if there is text in the string", () => {
      expect(isNonWhitespaceOnlyString(" a ")).toBe(true);
    });

    it("should return false if the input is not a string", () => {
      expect(isNonWhitespaceOnlyString(1)).toBe(false);
    });

    it("should return false if the input is the empty string", () => {
      expect(isNonWhitespaceOnlyString("")).toBe(false);
    });

    it("should return false if the input is only whitespace", () => {
      expect(isNonWhitespaceOnlyString("\t \r\n")).toBe(false);
    });
  });
});
