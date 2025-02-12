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
  EvalDates_User,
  MilestoneDates_User,
} from "../../../db/models";

export default defineEventHandler(async (event) => {
  const checkResult = await userCheck(event, undefined, undefined, undefined);
  if (checkResult) {
    const now = DateTime.now().toISODate();
    const boundaryIds = [];

    const user = await User.findAll({
      where: [{ id: checkResult.user.id }],
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
              attributes: ["id", "name"],
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
                where: { id: checkResult.user.id },
                required: true,
              },
            ],
          });
          if (currentAlerts.length === 0) {
            const boundaryUsers = await Boundary_User.findAll({
              where: {
                BoundaryId: evaluationDates[i].dataValues.Evaluation.dataValues.Boundary.id,
              },
            });
            const evalDatesUser = await EvalDates_User.findOne({
              where: { EvaluationItemId: evaluationDates[i].dataValues.id },
            });
            if (evalDatesUser) {
              await evaluationDates[i].addUser(checkResult.user.id);
              await $fetch("/api/config/alert", {
                method: "POST",
                body: {
                  BoundaryUsers: [{ UserId: checkResult.user.id }],
                  UserId: checkResult.user.id,
                  NotificationCategoryId: 2,
                  message: `Due date is in ${diffInDays.days} Days:
                 Boundary: ${evaluationDates[i].dataValues.Evaluation.dataValues.Boundary.name} 
                 Stig: ${evaluationDates[i].dataValues.Evaluation.dataValues.Stig.title} 
                 Vuln Num: ${evaluationDates[i].dataValues.StigDatum.vuln_num}`,
                  dueDate: end.toISODate(),
                  daysLeft: diffInDays.days,
                },
              });
            } else {
              await $fetch("/api/config/alert", {
                method: "POST",
                body: {
                  BoundaryUsers: boundaryUsers,
                  UserId: checkResult.user.id,
                  NotificationCategoryId: 2,
                  message: `Due date is in ${diffInDays.days} Days:
                 Boundary: ${evaluationDates[i].dataValues.Evaluation.dataValues.Boundary.name} 
                 Stig: ${evaluationDates[i].dataValues.Evaluation.dataValues.Stig.title} 
                 Vuln Num: ${evaluationDates[i].dataValues.StigDatum.vuln_num}`,
                  dueDate: end.toISODate(),
                  daysLeft: diffInDays.days,
                },
              });

              for (let j = 0; j < boundaryUsers.length; j++) {
                await evaluationDates[i].addUser(boundaryUsers[j].UserId);
              }
            }
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
                  attributes: ["id", "name"],
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
                where: { id: checkResult.user.id },
                required: true,
              },
            ],
          });
          if (currentAlerts.length === 0 && milestoneDates[i].EvaluationItem) {
            const boundaryUsers = await Boundary_User.findAll({
              where: {
                BoundaryId:
                  milestoneDates[i].dataValues.EvaluationItem.Evaluation.dataValues.Boundary.id,
              },
            });
            const milestoneDatesUser = await MilestoneDates_User.findOne({
              where: { MilestoneId: milestoneDates[i].dataValues.id },
            });
            if (milestoneDatesUser) {
              await milestoneDates[i].addUser(checkResult.user.id);
              await $fetch("/api/config/alert", {
                method: "POST",
                body: {
                  BoundaryUsers: [{ UserId: checkResult.user.id }],
                  UserId: checkResult.user.id,
                  daysLeft: diffInDays.days,
                  dueDate: end.toISODate(),
                  NotificationCategoryId: 1,
                  message: `Due date is in ${diffInDays.days} Days:
                Boundary: ${milestoneDates[i].EvaluationItem.Evaluation.dataValues.Boundary.name}
                Stig: ${milestoneDates[i].dataValues.EvaluationItem.dataValues.Evaluation.dataValues.Stig.title}
                Vuln Num: ${milestoneDates[i].dataValues.EvaluationItem.dataValues.StigDatum.vuln_num}`,
                },
              });
            } else {
              await $fetch("/api/config/alert", {
                method: "POST",
                body: {
                  BoundaryUsers: boundaryUsers,
                  UserId: checkResult.user.id,
                  daysLeft: diffInDays.days,
                  dueDate: end.toISODate(),
                  NotificationCategoryId: 1,
                  message: `Due date is in ${diffInDays.days} Days:
                Boundary: ${milestoneDates[i].EvaluationItem.Evaluation.dataValues.Boundary.name}
                Stig: ${milestoneDates[i].dataValues.EvaluationItem.dataValues.Evaluation.dataValues.Stig.title}
                Vuln Num: ${milestoneDates[i].dataValues.EvaluationItem.dataValues.StigDatum.vuln_num}`,
                },
              });

              for (let j = 0; j < boundaryUsers.length; j++) {
                await milestoneDates[i].addUser(boundaryUsers[j].UserId);
              }
            }
          }
        }
      }
    }

    return { Complete: true };
  } else {
    throw createError({
      statusCode: 401,
      statusMessage: "Insufficient Permissions.",
    });
  }
});
