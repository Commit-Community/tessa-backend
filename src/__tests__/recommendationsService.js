const {
  createRecommendation,
  isRecommendationIdValid,
  listLatestChangedRecommendations,
  updateRecommendation,
} = require("../recommendationsService");
const { mockQuery } = require("../db");

jest.mock("../db");

describe("recommendationsService", () => {
  describe("listLatestChangedRecommendations", () => {
    it("should list recommendations that were recently created or updated", async () => {
      const recommendationId = 1;
      const markdown = "test markdown";
      const skillId = 2;
      const skillName = "test skill name";
      const skillDescription = "test skill description";
      const facetId = 3;
      const facetName = "test facet name";
      const facetRecommendationPrompt = "test facet recommendation prompt";
      const recommendations = [
        {
          id: recommendationId,
          markdown,
          skill_id: skillId,
          skill_name: skillName,
          skill_description: skillDescription,
          facet_id: facetId,
          facet_name: facetName,
          facet_recommendation_prompt: facetRecommendationPrompt,
        },
      ];
      mockQuery(
        "SELECT recommendation_id, MAX(created_at) AS latest_created_at FROM recommendation_changes GROUP BY recommendation_id ORDER BY latest_created_at DESC LIMIT 6;",
        [],
        [
          {
            recommendation_id: recommendationId,
            latest_created_at: "2000-01-01T00:00:00Z",
          },
        ]
      );
      mockQuery(
        `
      SELECT
        recommendations.id AS id,
        markdown,
        skills.id AS skill_id,
        skills.name AS skill_name,
        skills.description AS skill_description,
        facets.id as facet_id,
        facets.name AS facet_name,
        facets.recommendation_prompt AS facet_recommendation_prompt
      FROM
        recommendations
        JOIN skills ON recommendations.skill_id = skills.id
        JOIN facets ON recommendations.facet_id = facets.id
      WHERE
        recommendations.id IN ($1);
    `,
        [recommendationId],
        recommendations
      );
      expect(await listLatestChangedRecommendations()).toEqual([
        {
          id: recommendationId,
          markdown,
          skill: {
            id: skillId,
            name: skillName,
            description: skillDescription,
          },
          facet: {
            id: facetId,
            name: facetName,
            recommendation_prompt: facetRecommendationPrompt,
          },
        },
      ]);
    });

    it("should not query for recommendations details if there are no recommendation changes", async () => {
      mockQuery(
        "SELECT recommendation_id, MAX(created_at) AS latest_created_at FROM recommendation_changes GROUP BY recommendation_id ORDER BY latest_created_at DESC LIMIT 6;",
        [],
        []
      );
      expect(await listLatestChangedRecommendations()).toEqual([]);
    });
  });

  describe("isRecommendationIdValid", () => {
    it("should resolve to true if a recommendation with the given id is in the database", async () => {
      const recommendationId = 1;
      mockQuery(
        "SELECT id FROM recommendations WHERE id = $1;",
        [recommendationId],
        [{ id: recommendationId }]
      );
      expect(await isRecommendationIdValid(recommendationId)).toEqual(true);
    });

    it("should resolve to false if a recommendation with the given id is not in the database", async () => {
      const recommendationId = 1;
      mockQuery(
        "SELECT id FROM recommendations WHERE id = $1;",
        [recommendationId],
        []
      );
      expect(await isRecommendationIdValid(recommendationId)).toEqual(false);
    });
  });

  describe("createRecommendation", () => {
    it("should insert a recommendation into the database with the given data, track the change, and return the recommendation", async () => {
      const id = 1;
      const markdown = "test markdown";
      const skillId = 2;
      const facetId = 3;
      const userId = 4;
      const recommendation = {
        id,
        markdown,
        skill_id: skillId,
        facet_id: facetId,
      };
      mockQuery(
        "INSERT INTO recommendations (markdown, skill_id, facet_id) VALUES ($1, $2, $3) RETURNING id, markdown, skill_id, facet_id;",
        [markdown, skillId, facetId],
        [recommendation]
      );
      mockQuery(
        "INSERT INTO recommendation_changes (markdown, recommendation_id, user_id) VALUES ($1, $2, $3);",
        [markdown, id, userId],
        []
      );
      expect(
        await createRecommendation(markdown, skillId, facetId, userId)
      ).toEqual(recommendation);
    });

    it("should return successfully but log an error if tracking the change fails", async () => {
      const originalConsoleLog = console.log;
      console.log = jest.fn();
      const id = 1;
      const markdown = "test markdown";
      const skillId = 2;
      const facetId = 3;
      const userId = 4;
      const recommendation = {
        id,
        markdown,
        skill_id: skillId,
        facet_id: facetId,
      };
      mockQuery(
        "INSERT INTO recommendations (markdown, skill_id, facet_id) VALUES ($1, $2, $3) RETURNING id, markdown, skill_id, facet_id;",
        [markdown, skillId, facetId],
        [recommendation]
      );
      const errorMessage = "test failure";
      mockQuery(
        "INSERT INTO recommendation_changes (markdown, recommendation_id, user_id) VALUES ($1, $2, $3);",
        [markdown, id, userId],
        new Error(errorMessage)
      );
      expect(
        await createRecommendation(markdown, skillId, facetId, userId)
      ).toEqual(recommendation);
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(errorMessage)
      );
      console.log = originalConsoleLog;
    });
  });

  describe("updateRecommendation", () => {
    it("should update a recommendation in the database with the given data, track the change, and return the recommendation", async () => {
      const id = 1;
      const markdown = "test markdown";
      const userId = 2;
      const recommendation = { id, markdown, skill_id: 3, facet_id: 4 };
      mockQuery(
        "UPDATE recommendations SET markdown = $1 WHERE id = $2 RETURNING id, markdown, skill_id, facet_id;",
        [markdown, id],
        [recommendation]
      );
      mockQuery(
        "INSERT INTO recommendation_changes (markdown, recommendation_id, user_id) VALUES ($1, $2, $3);",
        [markdown, id, userId],
        []
      );
      expect(await updateRecommendation(id, markdown, userId)).toEqual(
        recommendation
      );
    });

    it("should return successfully but log an error if tracking the change fails", async () => {
      const originalConsoleLog = console.log;
      console.log = jest.fn();
      const id = 1;
      const markdown = "test markdown";
      const userId = 2;
      const recommendation = { id, markdown, skill_id: 3, facet_id: 4 };
      mockQuery(
        "UPDATE recommendations SET markdown = $1 WHERE id = $2 RETURNING id, markdown, skill_id, facet_id;",
        [markdown, id],
        [recommendation]
      );
      const errorMessage = "test failure";
      mockQuery(
        "INSERT INTO recommendation_changes (markdown, recommendation_id, user_id) VALUES ($1, $2, $3);",
        [markdown, id, userId],
        new Error(errorMessage)
      );
      expect(await updateRecommendation(id, markdown, userId)).toEqual(
        recommendation
      );
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining(errorMessage)
      );
      console.log = originalConsoleLog;
    });
  });
});
