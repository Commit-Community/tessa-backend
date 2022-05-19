class HttpError extends Error {}
HttpError.prototype.message = "An error occurred while processing the request.";
HttpError.prototype.status = 500;
exports.HttpError = HttpError;

class BadRequestError extends HttpError {}
BadRequestError.prototype.message =
  "The request could not be completed with the given parameters.";
BadRequestError.prototype.status = 400;
exports.BadRequestError = BadRequestError;

class UnauthorizedError extends HttpError {}
UnauthorizedError.prototype.message =
  "You are not allowed access to the requested resource.";
UnauthorizedError.prototype.status = 401;
exports.UnauthorizedError = UnauthorizedError;

class NotFoundError extends HttpError {}
NotFoundError.prototype.message = "The requested resource does not exist.";
NotFoundError.prototype.status = 404;
exports.NotFoundError = NotFoundError;

class UnprocessableEntityError extends HttpError {}
UnprocessableEntityError.prototype.message =
  "The content body of the request is not valid.";
UnprocessableEntityError.prototype.status = 422;
exports.UnprocessableEntityError = UnprocessableEntityError;

class InternalServerError extends HttpError {}
exports.InternalServerError = InternalServerError;
