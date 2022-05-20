const { errorEnvelope } = require("../responseEnvelopes");
const { handleNotFound, handleErrors } = require("../errorHandlers");
const {
  NotFoundError,
  HttpError,
  InternalServerError,
} = require("../httpErrors");

describe("errorHandlers", () => {
  describe("handleNotFound", () => {
    it("should set the response to a 404 with an error object", () => {
      const status = jest.fn();
      const json = jest.fn();
      handleNotFound(
        {},
        {
          status,
          json,
        }
      );
      expect(status).toHaveBeenCalledWith(404);
      expect(json).toHaveBeenCalledWith(
        errorEnvelope(NotFoundError.prototype.message)
      );
    });
  });

  describe("handleErrors", () => {
    it("should delegate to the next handler if headers have been sent", () => {
      const next = jest.fn();
      const err = new Error();
      handleErrors(err, {}, { headersSent: true }, next);
      expect(next).toHaveBeenCalledWith(err);
    });

    it("should set the response using the configured status and message if the error is an HttpError", () => {
      const originalConsoleLog = console.log;
      console.log = jest.fn();
      const status = jest.fn();
      const json = jest.fn();
      class ImATeapotError extends HttpError {}
      ImATeapotError.prototype.status = 418;
      ImATeapotError.prototype.message = "I'm a teapot";
      const err = new ImATeapotError();
      handleErrors(err, {}, { headersSent: false, json, status }, jest.fn());
      expect(status).toHaveBeenCalledWith(ImATeapotError.prototype.status);
      expect(json).toHaveBeenCalledWith(
        errorEnvelope(ImATeapotError.prototype.message)
      );
      expect(console.log).not.toHaveBeenCalled();
      console.log = originalConsoleLog;
    });

    it("should log an HttpError with status >= 500", () => {
      const originalConsoleLog = console.log;
      console.log = jest.fn();
      const status = jest.fn();
      const json = jest.fn();
      const err = new InternalServerError();
      handleErrors(err, {}, { headersSent: false, json, status }, jest.fn());
      expect(console.log).toHaveBeenCalled();
      console.log = originalConsoleLog;
    });

    it("should set the response to an InternalServerError if the error is not an HttpError", () => {
      const originalConsoleLog = console.log;
      console.log = jest.fn();
      const status = jest.fn();
      const json = jest.fn();
      const err = new Error();
      handleErrors(err, {}, { headersSent: false, json, status }, jest.fn());
      expect(status).toHaveBeenCalledWith(500);
      expect(json).toHaveBeenCalledWith(
        errorEnvelope(InternalServerError.prototype.message)
      );
      expect(console.log).toHaveBeenCalled();
      console.log = originalConsoleLog;
    });
  });
});
