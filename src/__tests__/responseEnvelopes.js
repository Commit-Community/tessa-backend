const {
  collectionEnvelope,
  errorEnvelope,
  itemEnvelope,
} = require("../responseEnvelopes");

describe("responseEnvelopes", () => {
  describe("collectionEnvelope", () => {
    it("should return an object with the collection as data", () => {
      const collection = [{ id: 1 }];
      expect(collectionEnvelope(collection, 1)).toEqual({
        data: collection,
        summary: { total_count: 1 },
      });
    });
  });

  describe("errorEnvelope", () => {
    it("should return an object with an error object with the error message", () => {
      const error = new Error("test message");
      expect(errorEnvelope(error)).toEqual({
        error: {
          message: "Error: test message",
        },
      });
    });
  });

  describe("itemEnvelope", () => {
    it("should return an object with the item as data", () => {
      const item = { id: 1 };
      expect(itemEnvelope(item)).toEqual({
        data: item,
      });
    });
  });
});
