const { Router } = require("express");

const { BadRequestError, NotFoundError } = require("./httpErrors");
const { collectionEnvelope, itemEnvelope } = require("./responseEnvelopes");
const { findSkill, listSkills } = require("./skillsService");
const { isValidId } = require("./validators");

const skillsRouter = new Router();

skillsRouter.get("/", async (req, res) => {
  const skills = await listSkills();
  res.json(collectionEnvelope(skills, skills.length));
});

skillsRouter.get("/:id", async (req, res, next) => {
  const { id } = req.params;
  const skillId = Number(id);
  if (!isValidId(skillId)) {
    next(new BadRequestError(`"${id}" is not a valid skill id.`));
    return;
  }
  const skill = await findSkill(skillId);
  if (!skill) {
    next(new NotFoundError(`A skill with the id "${id}" could not be found.`));
    return;
  }
  res.json(itemEnvelope(skill));
});

module.exports = skillsRouter;
