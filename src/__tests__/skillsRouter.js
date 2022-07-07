const { collectionEnvelope, itemEnvelope } = require("../responseEnvelopes");
const { createAppAgentForRouter, mockUserId } = require("../routerTestUtils");
const {
  findSkill,
  listSkills,
  createSkill,
  tagSkill,
  untagSkill,
  updateSkill,
} = require("../skillsService");
const skillsRouter = require("../skillsRouter");

jest.mock("../skillsService");
jest.mock("../authMiddleware");

describe("skillsRouter", () => {
  const appAgent = createAppAgentForRouter(skillsRouter);

  describe("GET /", () => {
    it("should respond with a collection of all the skills", (done) => {
      const skills = [
        {
          id: 1,
          name: "test name",
          description: "test description",
          tags: [],
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

  describe("POST /", () => {
    it("should create a skill with the given data", (done) => {
      const userId = 2;
      mockUserId(userId);
      const name = "test name";
      const description = "test description";
      const skill = { id: 1, name, description };
      createSkill.mockResolvedValueOnce(skill);
      appAgent
        .post("/")
        .send({ name, description })
        .expect(201, itemEnvelope(skill), (err) => {
          expect(createSkill).toHaveBeenCalledWith(name, description, userId);
          done(err);
        });
    });

    it("should respond with an unprocessable entity error if name is not sent", (done) => {
      appAgent
        .post("/")
        .send({ description: "test description" })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if name is not valid", (done) => {
      appAgent
        .post("/")
        .send({ name: "", description: "test description" })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if description is not sent", (done) => {
      appAgent.post("/").send({ name: "test name" }).expect(422, done);
    });

    it("should respond with an unprocessable entity error if description is not valid", (done) => {
      appAgent
        .post("/")
        .send({ name: "test name", description: "" })
        .expect(422, done);
    });

    it("should respond with an internal server error if the skill couldn't be created", (done) => {
      createSkill.mockRejectedValueOnce(new Error());
      appAgent
        .post("/")
        .send({ name: "test name", description: "test description" })
        .expect(500, done);
    });
  });

  describe("PUT /:id", () => {
    it("should update the skill with the specified ID with the given data", (done) => {
      const userId = 2;
      mockUserId(userId);
      const name = "test name";
      const description = "test description";
      const skill = { id: 1, name, description };
      findSkill.mockResolvedValueOnce(skill);
      updateSkill.mockResolvedValueOnce(skill);
      appAgent
        .put(`/${skill.id}`)
        .send({ name, description })
        .expect(200, itemEnvelope(skill), (err) => {
          expect(updateSkill).toHaveBeenCalledWith(
            skill.id,
            name,
            description,
            userId
          );
          done(err);
        });
    });

    it("should respond with a not found error if the skill identified by :id doesn't exist", (done) => {
      const skillId = 1;
      findSkill.mockResolvedValueOnce(undefined);
      appAgent.put(`/${skillId}`).expect(404, (err) => {
        expect(findSkill).toHaveBeenCalledWith(skillId);
        done(err);
      });
    });

    it("should respond with a bad request error if :id is not a valid id", (done) => {
      appAgent.put("/0").expect(400, (err) => {
        expect(findSkill).not.toHaveBeenCalled();
        done(err);
      });
    });

    it("should respond with an unprocessable entity error if name is not sent", (done) => {
      const skillId = 1;
      findSkill.mockResolvedValueOnce({ id: skillId });
      appAgent
        .put(`/${skillId}`)
        .send({ description: "test description" })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if name is not valid", (done) => {
      const skillId = 1;
      findSkill.mockResolvedValueOnce({ id: skillId });
      appAgent
        .put(`/${skillId}`)
        .send({ name: "", description: "test description" })
        .expect(422, done);
    });

    it("should respond with an unprocessable entity error if description is not sent", (done) => {
      const skillId = 1;
      findSkill.mockResolvedValueOnce({ id: skillId });
      appAgent.put(`/${skillId}`).send({ name: "test name" }).expect(422, done);
    });

    it("should respond with an unprocessable entity error if description is not valid", (done) => {
      const skillId = 1;
      findSkill.mockResolvedValueOnce({ id: skillId });
      appAgent
        .put(`/${skillId}`)
        .send({ name: "test name", description: "" })
        .expect(422, done);
    });

    it("should respond with an internal server error if the query for the skill fails", (done) => {
      const skillId = 1;
      findSkill.mockRejectedValueOnce(new Error());
      appAgent
        .put(`/${skillId}`)
        .send({ name: "test name", description: "test description" })
        .expect(500, done);
    });

    it("should respond with an internal server error if the skill couldn't be updated", (done) => {
      const skillId = 1;
      findSkill.mockResolvedValueOnce({ id: skillId });
      updateSkill.mockRejectedValueOnce(new Error());
      appAgent
        .put(`/${skillId}`)
        .send({ name: "test name", description: "test description" })
        .expect(500, done);
    });
  });

  describe("POST /:id/tags", () => {
    it("should add the named tag to the specified skill", (done) => {
      const skillId = 1;
      const tagName = "test";
      const skillTag = { id: "3", skill_id: "1", tag_id: "2" };
      findSkill.mockResolvedValueOnce({ id: skillId });
      tagSkill.mockResolvedValueOnce(skillTag);
      appAgent
        .post(`/${skillId}/tags`)
        .send({ tag_name: tagName })
        .expect(200, itemEnvelope(skillTag), (err) => {
          expect(findSkill).toHaveBeenCalledWith(skillId);
          expect(tagSkill).toHaveBeenCalledWith(skillId, tagName);
          done(err);
        });
    });

    it("should respond with a not found error if the skill identified by :id doesn't exist", (done) => {
      const skillId = 1;
      findSkill.mockResolvedValueOnce(undefined);
      appAgent.post(`/${skillId}/tags`).expect(404, (err) => {
        expect(findSkill).toHaveBeenCalledWith(skillId);
        done(err);
      });
    });

    it("should respond with an unprocessable entity error if the request body doesn't contain a tag_name property", (done) => {
      const skillId = 1;
      findSkill.mockResolvedValueOnce({ id: skillId });
      appAgent.post(`/${skillId}/tags`).send({}).expect(422, done);
    });

    it("should respond with an unprocessable entity error if the tag_name is not valid", (done) => {
      const skillId = 1;
      findSkill.mockResolvedValueOnce({ id: skillId });
      appAgent
        .post(`/${skillId}/tags`)
        .send({ tag_name: "" })
        .expect(422, done);
    });

    it("should respond with an internal server error if the query for the skill fails", (done) => {
      const skillId = 1;
      findSkill.mockRejectedValueOnce(new Error());
      appAgent.post(`/${skillId}/tags`).expect(500, done);
    });

    it("should respond with an internal server error if the skill fails to get tagged", (done) => {
      const skillId = 1;
      findSkill.mockResolvedValueOnce({ id: skillId });
      tagSkill.mockRejectedValueOnce(new Error());
      appAgent
        .post(`/${skillId}/tags`)
        .send({ tag_name: "test" })
        .expect(500, done);
    });

    it("should respond with a bad request error if :id is not a valid id", (done) => {
      appAgent.post("/0/tags").expect(400, (err) => {
        expect(findSkill).not.toHaveBeenCalled();
        done(err);
      });
    });
  });

  describe("DELETE /:skillId/tags/:tagId", () => {
    it("should delete the association between the tag and skill", (done) => {
      const skillId = 1;
      const tagId = 2;
      untagSkill.mockResolvedValueOnce(undefined);
      appAgent
        .delete(`/${skillId}/tags/${tagId}`)
        .expect(200, itemEnvelope({ success: true }), done);
    });

    it("should respond with a bad request error if :skillId is not a valid id", (done) => {
      appAgent.delete(`/0/tags/2`).expect(400, done);
    });

    it("should respond with a bad request error if :tagId is not a valid id", (done) => {
      appAgent.delete(`/1/tags/0`).expect(400, done);
    });

    it("should respond with an internal server error if the untagging operation fails", (done) => {
      untagSkill.mockRejectedValueOnce(new Error());
      appAgent.delete(`/1/tags/2`).expect(500, done);
    });
  });
});
