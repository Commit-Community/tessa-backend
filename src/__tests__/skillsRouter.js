const { collectionEnvelope, itemEnvelope } = require("../responseEnvelopes");
const { createAppAgentForRouter } = require("../routerTestUtils");
const { findSkill, listSkills } = require("../skillsService");
const skillsRouter = require("../skillsRouter");

jest.mock("../skillsService");

describe("skillsRouter", () => {
  const appAgent = createAppAgentForRouter(skillsRouter);

  describe("GET /", () => {
    it("should respond with a collection of all the skills", (done) => {
      const skills = [
        {
          id: 1,
          name: "test name",
          description: "test description",
        },
      ];
      listSkills.mockResolvedValueOnce(skills);
      appAgent.get("/").expect(200, collectionEnvelope(skills, 1), (err) => {
        expect(listSkills).toHaveBeenCalled();
        done(err);
      });
    });

    it("should respond with an internal server error if there is an error querying for the skills", (done) => {
      listSkills.mockRejectedValueOnce(new Error());
      appAgent.get("/").expect(500, done);
    });
  });

  describe("GET /:id", () => {
    it("should respond with the skill identified by :id", (done) => {
      const skillId = 1;
      const skill = {
        id: skillId,
        name: "test name",
        description: "test description",
        tags: [],
        recommendations: [],
      };
      findSkill.mockResolvedValueOnce(skill);
      appAgent.get(`/${skillId}`).expect(200, itemEnvelope(skill), (err) => {
        expect(findSkill).toHaveBeenCalledWith(skillId);
        done(err);
      });
    });

    it("should respond with a not found error if the skill identified by :id doesn't exist", (done) => {
      const skillId = 1;
      findSkill.mockResolvedValueOnce(undefined);
      appAgent.get(`/${skillId}`).expect(404, (err) => {
        expect(findSkill).toHaveBeenCalledWith(skillId);
        done(err);
      });
    });

    it("should respond with a bad request error if :id is not a valid id", (done) => {
      appAgent.get("/0").expect(400, (err) => {
        expect(findSkill).not.toHaveBeenCalled();
        done(err);
      });
    });

    it("should respond with an internal server error if there is an error querying for the skill", (done) => {
      findSkill.mockRejectedValueOnce(new Error());
      appAgent.get("/1").expect(500, done);
    });
  });
});
