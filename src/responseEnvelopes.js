exports.errorEnvelope = error => ({ error: { message: String(error) } });

exports.itemEnvelope = data => ({ data });

exports.collectionEnvelope = (data, totalCount) => ({
  data,
  summary: { total_count: totalCount },
});
