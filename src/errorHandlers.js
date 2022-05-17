const { errorEnvelope } = require("./responseEnvelopes");
const {
  HttpError,
  InternalServerError,
  NotFoundError,
} = require("./httpErrors");

exports.handleNotFound = (req, res) => {
  res.status(NotFoundError.prototype.status);
  res.json(errorEnvelope(NotFoundError.prototype.message));
};

exports.handleErrors = (err, req, res, next) => {
  if (res.headersSent) {
    next(err);
    return;
  }
  console.log(err);
  if (err instanceof HttpError) {
    res.status(err.status);
    res.json(errorEnvelope(err.message));
  } else {
    res.status(InternalServerError.prototype.status);
    res.json(errorEnvelope(InternalServerError.prototype.message));
  }
};
