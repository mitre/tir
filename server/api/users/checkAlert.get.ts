import { Op } from "sequelize";
import { DateTime } from "luxon";
import {
  Boundary,
  Boundary_User,
  Evaluation,
  EvaluationItem,
  Milestone,
  Stig,
  StigData,
  User,
} from "../../../db/models";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const currentUserId = query.userId;
  const now = DateTime.now().toISODate();
  const boundaryIds = [];

  const currentUser = await User.findByPk(currentUserId);

  const boundary = await Boundary.findAll({
    where: [{ ownerId: currentUserId?.toString() }],
    attributes: ["name", "id"],
  });
  if (boundary) {
    for (let i = 0; i < boundary.length; i++) {
      boundaryIds.push(boundary[i].id);
    }
  }

  // const boundaryUser = await Boundary_User.findAll({
  //   where: [{ UserId: currentUserId?.toString() }],
  //   attributes: ["BoundaryId"],
  // });

  const user = await User.findAll({
    where: [{ id: currentUserId?.toString() }],
    include: [
      {
        model: Boundary,
      },
    ],
  });
  if (user) {
    for (let i = 0; i < user.length; i++) {
      for (let j = 0; j < user[i].dataValues.Boundaries.length; j++) {
        boundaryIds.push(user[i].dataValues.Boundaries[j].id);
      }
    }
  }

  const evaluationDates = await EvaluationItem.findAll({
    where: [{ Scheduled_Completion_Date: { [Op.ne]: null } }],
    attributes: ["Scheduled_Completion_Date", "id"],
    include: [
      {
        model: Evaluation,
        where: [{ BoundaryId: boundaryIds }],
        attributes: ["id"],
        include: [
          {
            model: Boundary,
            attributes: ["name"],
          },
          {
            model: Stig,
            attributes: ["title"],
          },
        ],
      },
      {
        model: StigData,
        attributes: ["vuln_num"],
      },
    ],
  });

  if (evaluationDates) {
    for (let i = 0; i < evaluationDates.length; i++) {
      const start = DateTime.fromISO(now);
      const end = DateTime.fromISO(evaluationDates[i].Scheduled_Completion_Date);
      const diffInDays = end.diff(start, "days");

      if (diffInDays.days <= 30) {
        const currentAlerts = await EvaluationItem.findAll({
          where: { id: evaluationDates[i].id },
          include: [
            {
              model: User,
              where: { id: currentUserId },
              required: true,
            },
          ],
        });
        if (currentAlerts.length === 0) {
          await $fetch("/api/config/alert", {
            method: "POST",
            body: {
              userId: parseInt(currentUserId?.toString()),
              daysLeft: diffInDays.days,
              dueDate: end.toISODate(),
              category: "POAM Due Date",
              message: `Due date is in ${diffInDays.days} Days:
               Boundary: ${evaluationDates[i].dataValues.Evaluation.dataValues.Boundary.name} 
               Stig: ${evaluationDates[i].dataValues.Evaluation.dataValues.Stig.title} 
               Vuln Num: ${evaluationDates[i].dataValues.StigDatum.vuln_num}`,
            },
          });
          await evaluationDates[i].addUser(currentUser.id);
        }
      }
    }
  }
  const milestoneDates = await Milestone.findAll({
    attributes: ["item", "completion_date", "id"],
    include: [
      {
        model: EvaluationItem,
        attributes: ["id"],
        required: true,
        include: [
          {
            model: Evaluation,
            where: [{ BoundaryId: boundaryIds }],
            attributes: ["id", "BoundaryId"],
            required: true,
            include: [
              {
                model: Boundary,
                attributes: ["name"],
              },
              {
                model: Stig,
                attributes: ["title"],
              },
            ],
          },
          {
            model: StigData,
            attributes: ["vuln_num"],
          },
        ],
      },
    ],
  });

  if (milestoneDates) {
    for (let i = 0; i < milestoneDates.length; i++) {
      const start = DateTime.fromISO(now);
      const end = DateTime.fromISO(milestoneDates[i].completion_date);
      const diffInDays = end.diff(start, "days");

      if (diffInDays.days <= 30) {
        const currentAlerts = await Milestone.findAll({
          where: { id: milestoneDates[i].id },
          include: [
            {
              model: User,
              where: { id: currentUserId },
              required: true,
            },
          ],
        });
        if (currentAlerts.length === 0) {
          await $fetch("/api/config/alert", {
            method: "POST",
            body: {
              userId: parseInt(currentUserId?.toString()),
              daysLeft: diffInDays.days,
              dueDate: end.toISODate(),
              category: "Milestone Due Date",
              message: `Due date is in ${diffInDays.days} Days:
              Boundary: ${milestoneDates[i].dataValues.EvaluationItems[0].dataValues.Evaluation.dataValues.Boundary.name}
              Stig: ${milestoneDates[i].dataValues.EvaluationItems[0].dataValues.Evaluation.dataValues.Stig.title}
              Vuln Num: ${milestoneDates[i].dataValues.EvaluationItems[0].dataValues.StigDatum.vuln_num}`,
            },
          });
          await milestoneDates[i].addUser(currentUser.id);
        }
      }
    }
  }

  return { Complete: true };
});
