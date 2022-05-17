const mockedQueries = new Map();

exports.query = async (sql, bindings) => {
  for (const mockedQuery of mockedQueries.keys()) {
    const coalescedBindings = bindings || [];
    if (
      mockedQuery.sql === sql &&
      coalescedBindings.length === mockedQuery.bindings.length &&
      coalescedBindings.every(
        (binding, index) => binding === mockedQuery.bindings[index]
      )
    ) {
      mockedQueries.set(mockedQuery, true);
      if (mockedQuery.rowsOrError instanceof Error) {
        throw mockedQuery.rowsOrError;
      }
      return {
        rowCount: mockedQuery.rowsOrError.length,
        rows: mockedQuery.rowsOrError,
      };
    }
  }
  throw new Error(
    `A query was called in a test without being mocked first.\n\nThe sql and bindings of the query that was called were:\n\tsql = ${JSON.stringify(
      sql
    )}\n\tbindings = ${JSON.stringify(
      bindings
    )}\n\nTo fix this, call mockQuery(sql, bindings, rowsOrError) with the above sql and bindings in the test before the function that calls the database.`
  );
};

exports.mockQuery = (sql, bindings, rowsOrError) => {
  if (typeof sql !== "string") {
    throw new Error("The sql parameter of mockQuery must be a string");
  }
  if (!Array.isArray(bindings)) {
    throw new Error("The bindings parameter of mockQuery must be an Array");
  }
  if (!Array.isArray(rowsOrError) && !(rowsOrError instanceof Error)) {
    throw new Error(
      "The rowsOrError parameter of mockQuery must be an Array or an error"
    );
  }
  mockedQueries.set({ sql, bindings, rowsOrError }, false);
};

afterEach(() => {
  for (const [{ bindings, rowsOrError, sql }, wasCalled] of mockedQueries) {
    if (!wasCalled) {
      throw new Error(
        `A query was mocked in a test and never got called.\n\nThe sql, bindings, and rowsOrError of the mocked query were:\n\tsql = ${JSON.stringify(
          sql
        )}\n\tbindings = ${JSON.stringify(
          bindings
        )}\n\trowsOrError = ${JSON.stringify(
          rowsOrError
        )}\n\nTo fix this, check to see if there is another error saying, "A query was called in a test without being mocked first." If there is, that could mean there's a typo in the mocked query. If not, it might indicate a problem with the unit under test.`
      );
    }
  }
  mockedQueries.clear();
});
