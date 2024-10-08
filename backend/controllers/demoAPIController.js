const query = require("../config/database");
const bcryptjs = require("bcryptjs");
const msgCode = require("../constants/msgCode");
const nodemailer = require("nodemailer");

const CreateTask = async (req, res) => {
  const { username, password, appAcronym, taskName, taskDescription } =
    req.body;

  let { taskPlan, taskNotes } = req.body;

  const allowedFields = [
    "username",
    "password",
    "appAcronym",
    "taskName",
    "taskDescription",
    "taskPlan",
    "taskNotes",
  ];

  const bodyFields = Object.keys(req.body);
  const hasExtraFields = bodyFields.some(
    (field) => !allowedFields.includes(field)
  );

  if (hasExtraFields) {
    return res.status(400).json({ msgCode: msgCode.INVALID_KEY });
  }

  if (!username || !password) {
    return res.status(400).json({ msgCode: msgCode.INVALID_INPUT });
  }

  if (!appAcronym || !taskName) {
    return res.status(400).json({ msgCode: msgCode.INVALID_INPUT });
  }

  if (taskName.length < 1 || taskName.length > 255) {
    return res.status(400).json({ msgCode: msgCode.INVALID_INPUT });
  }

  try {
    await query("START TRANSACTION");

    const [accountQuery] = await query(
      `SELECT * FROM accounts
      WHERE username = ?`,
      [username]
    );
    // catch invalid username
    if (!accountQuery) {
      return res.status(400).json({ msgCode: msgCode.INVALID_CREDENTIALS });
    }

    if (accountQuery.accountStatus == "Disabled") {
      return res.status(401).json({ msgCode: msgCode.INVALID_CREDENTIALS });
    }

    const passwordMatch = await bcryptjs.compare(
      password,
      accountQuery.password
    );

    if (!passwordMatch) {
      return res.status(401).json({ msgCode: msgCode.INVALID_CREDENTIALS });
    }

    // fetch app permits
    const [appPermits] = await query(
      `SELECT App_permit_Create, App_permit_Open, App_permit_toDoList,
        App_permit_Doing, App_permit_Done
        FROM Application
        WHERE App_Acronym = ?`,
      [appAcronym]
    );

    // Application does not have corresponding app acronym
    if (!appPermits) {
      return res.status(400).json({ msgCode: msgCode.NOT_FOUND });
    }

    if (!appPermits.App_permit_Create) {
      return res.status(404).json({ msgCode: msgCode.INVALID_STATE_CHANGE });
    }

    // Query user's usergroup
    const getUserGroup = await query(
      `SELECT usergroup
            FROM user_group
            WHERE username = ?`,
      [username]
    );

    // convert usergroup result to an array
    UserGroup = getUserGroup.map((group) => group.usergroup);

    // check if user has required group to create task
    if (!UserGroup.includes(appPermits.App_permit_Create)) {
      return res.status(403).json({
        msgCode: msgCode.NOT_AUTHORIZED,
      });
    }

    if (taskPlan === "") {
      taskPlan = null;
    }

    if (taskPlan && taskPlan !== null) {
      const planExistQuery = await query(
        `SELECT *
        FROM plan
        WHERE Plan_MVP_Name = ?`,
        [taskPlan]
      );

      console.log("planExistQuery", planExistQuery);

      if (planExistQuery.length === 0) {
        return res.status(400).json({ msgCode: msgCode.NOT_FOUND });
      }
    }

    // Query app RNumber
    const [appRNumberQuery] = await query(
      `
      SELECT App_Rnumber
      FROM Application
      WHERE App_Acronym = ?`,
      [appAcronym]
    );

    // initialise other variables to populate the tables
    const taskState = "open";
    const taskCreator = username;
    const taskOwner = username;
    const taskId = `${appAcronym}_${appRNumberQuery.App_Rnumber}`;

    let currentDate = new Date();
    const taskCreateDate = Math.floor(currentDate.getTime() / 1000);

    // check if state open is in Open
    if (taskState !== "open") {
      return res.status(400).json({ msgCode: msgCode.INVALID_STATE_CHANGE });
    }

    console.log("taskPlan", taskPlan);

    // console.log("planExistQuery", planExistQuery);

    // if task notes input is not empty than add timestamp to it
    const day = String(currentDate.getDate()).padStart(2, "0");
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const year = currentDate.getFullYear();
    let timestampDate = `${day}/${month}/${year}`;

    if (taskNotes) {
      taskNotes = `Date: ${timestampDate} \nCommented By: ${username}\n${taskNotes}\n\n [Task State: open]\n####################\n\n`;
    }

    // insert into table if usergroup matches
    const result = await query(
      `INSERT INTO task(Task_id, Task_plan, Task_app_Acronym, Task_name,
      Task_description, Task_notes, Task_state, Task_creator, Task_owner, Task_createDate)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        taskId,
        taskPlan,
        appAcronym,
        taskName,
        taskDescription,
        taskNotes,
        taskState,
        taskCreator,
        taskOwner,
        taskCreateDate,
      ]
    );

    const [resultOutputQuery] = await query(
      `SELECT *
      FROM task
      WHERE Task_id = ?`,
      [taskId]
    );

    if (result.affectedRows > 0) {
      // increment app RNumber
      await query(
        `UPDATE application
        SET App_Rnumber = App_Rnumber + 1
        WHERE App_Acronym = ?`,
        [appAcronym]
      );
    }

    // const taskParameters = {
    //   Task_id: taskId,
    //   Task_plan: taskPlan,
    //   Task_app_Acronym: appAcronym,
    //   Task_name: taskName,
    //   Task_description: taskDescription,
    //   Task_notes: taskNotes,
    //   Task_state: taskState,
    //   Task_creator: taskCreator,
    //   Task_owner: taskOwner,
    //   Task_createDate: taskCreateDate,
    // };

    const taskParameters = {
      Task_id: taskId,
    };

    await query("COMMIT");

    return res
      .status(200)
      .json({ msgCode: msgCode.SUCCESS, result: taskParameters });
  } catch (error) {
    await query("ROLLBACK");

    // if (error.code === "ER_DUP_ENTRY") {
    //   return res.status(400).json({ msgCode: msgCode.ENTRY_EXISTS });
    // }
    return res.status(500).json({ msgCode: msgCode.INTERNAL });
  }
};

const GetTaskByState = async (req, res) => {
  if (Object.keys(req.query).length !== 0) {
    return res.status(400).json({ msgCode: msgCode.INVALID_INPUT });
  }

  const { username, password, appAcronym, taskState } = req.body;

  const allowedFields = ["username", "password", "appAcronym", "taskState"];

  const bodyFields = Object.keys(req.body);
  const hasExtraFields = bodyFields.some(
    (field) => !allowedFields.includes(field)
  );

  if (hasExtraFields) {
    return res.status(400).json({ msgCode: msgCode.INVALID_KEY });
  }

  if (!username || !password) {
    return res.status(400).json({ msgCode: msgCode.INVALID_INPUT });
  }

  if (!appAcronym || !taskState) {
    return res.status(400).json({ msgCode: msgCode.INVALID_INPUT });
  }

  try {
    await query("START TRANSACTION");

    const [accountQuery] = await query(
      `SELECT * 
      FROM accounts
      WHERE username = ?`,
      [username]
    );

    if (!accountQuery) {
      return res.status(401).json({ msgCode: msgCode.INVALID_CREDENTIALS });
    }

    if (accountQuery.accountStatus === "Disabled") {
      return res.status(401).json({ msgCode: msgCode.INVALID_CREDENTIALS });
    }

    const passwordMatch = await bcryptjs.compare(
      password,
      accountQuery.password
    );

    if (!passwordMatch) {
      return res.status(401).json({ msgCode: msgCode.INVALID_CREDENTIALS });
    }

    // check if app exists
    const [applicationQuery] = await query(
      `SELECT * 
      FROM application
      WHERE App_Acronym = ?`,
      [appAcronym]
    );

    if (!applicationQuery) {
      return res.status(400).json({ msgCode: msgCode.NOT_FOUND });
    }

    // check if the task state belong to the 5 states
    const validTaskStates = ["open", "todo", "doing", "done", "closed"];
    if (!validTaskStates.includes(taskState)) {
      return res.status(400).json({ msgCode: msgCode.INVALID_INPUT });
    }

    const tasks = await query(
      `SELECT *
      FROM task
      WHERE Task_app_Acronym = ? AND Task_State = ?`,
      [appAcronym, taskState]
    );

    // loop through task and fetch its respective plan color
    for (let task of tasks) {
      const planColorQuery = await query(
        `SELECT Plan_color
        FROM plan
        WHERE Plan_MVP_Name = ?`,
        [task.Task_plan]
      );

      // add the corresponding plan color value to task object, if no color set to null
      task.Plan_color = planColorQuery[0] ? planColorQuery[0].Plan_color : null;
    }

    await query("COMMIT");

    res.status(200).json({ msgCode: msgCode.SUCCESS, result: tasks });
  } catch (error) {
    await query("ROLLBACK");
    return res.status(500).json({ msgCode: msgCode.INTERNAL });
  }
};

const PromoteTask2Done = async (req, res) => {
  if (Object.keys(req.query).length !== 0) {
    return res.status(400).json({ msgCode: msgCode.INVALID_INPUT });
  }

  const { username, password, appAcronym, taskId } = req.body;
  let { taskNotes } = req.body;

  const allowedFields = [
    "username",
    "password",
    "appAcronym",
    "taskId",
    "taskNotes",
  ];

  const bodyFields = Object.keys(req.body);
  const hasExtraFields = bodyFields.some(
    (field) => !allowedFields.includes(field)
  );

  if (hasExtraFields) {
    return res.status(400).json({ msgCode: msgCode.INVALID_KEY });
  }

  if (!username || !password) {
    return res.status(400).json({ msgCode: msgCode.INVALID_INPUT });
  }

  if (!appAcronym || !taskId) {
    return res.status(400).json({ msgCode: msgCode.INVALID_INPUT });
  }

  try {
    const [accountQuery] = await query(
      `SELECT *
      FROM accounts
      WHERE username = ?`,
      [username]
    );

    if (!accountQuery) {
      return res.status(401).json({ msgCode: msgCode.INVALID_CREDENTIALS });
    }

    if (accountQuery.accountStatus === "Disabled") {
      return res.status(401).json({ msgCode: msgCode.INVALID_CREDENTIALS });
    }

    const passwordMatch = await bcryptjs.compare(
      password,
      accountQuery.password
    );

    if (!passwordMatch) {
      return res.status(401).json({ msgCode: msgCode.INVALID_CREDENTIALS });
    }

    const [applicationQuery] = await query(
      `SELECT *
      FROM application
      WHERE App_Acronym = ?`,
      [appAcronym]
    );

    console.log("applicationQuery", applicationQuery);

    if (!applicationQuery) {
      return res.status(400).json({ msgCode: msgCode.NOT_FOUND });
    }

    //fetch app permits for task at doing state
    const [appPermitDoingQuery] = await query(
      `SELECT App_permit_Doing
    FROM Application
    WHERE App_Acronym = ?`,
      [appAcronym]
    );

    // Query user's usergroup
    const userGroupQuery = await query(
      `SELECT usergroup
          FROM user_group
          WHERE username = ?`,
      [username]
    );

    // convert userGroupQuery into a single array
    const userGroup = userGroupQuery.map((group) => group.usergroup);

    // check if user has required group to promote task to Done state
    if (!userGroup.includes(appPermitDoingQuery.App_permit_Doing)) {
      return res.status(403).json({
        msgCode: msgCode.NOT_AUTHORIZED,
      });
    }

    // Check if task exists
    const [taskQuery] = await query(
      `SELECT *
      FROM task
      WHERE Task_id = ?`,
      [taskId]
    );

    // console.log("taskExistQuery", taskQuery);

    if (!taskQuery) {
      res.status(400).json({ msgCode: msgCode.INVALID_INPUT });
    }

    // check if task state is in doing
    // const [TaskStateQuery] = await query(
    //   `SELECT Task_state
    //   FROM task
    //   WHERE Task_id = ?`,
    //   [taskId]
    // );

    if (taskQuery.Task_state === "doing") {
      // append new notes to current notes
      const currentDate = new Date();

      const day = String(currentDate.getDate()).padStart(2, "0");
      const month = String(currentDate.getMonth() + 1).padStart(2, "0");
      const year = currentDate.getFullYear();

      let timestampDate = `${day}/${month}/${year}`;

      taskNotes =
        `Date: ${timestampDate} \nCommented By: ${username}\n${taskNotes}\n\n[Task State changed from doing to done]\n##################\n` +
        taskQuery.Task_notes;

      const taskStateDone = "done";

      await query("START TRANSACTION");

      await query(
        `UPDATE task
      SET Task_state = ?, Task_notes = ?, Task_owner = ?
      WHERE Task_id = ?`,
        [taskStateDone, taskNotes, username, taskId]
      );

      const emailQuery = await query(
        `SELECT a.email FROM accounts a
      JOIN user_group u ON u.username = a.username
      JOIN application app ON (u.usergroup = 'PL' OR
      app.App_permit_Done = u.usergroup)
      WHERE app.App_Acronym = ?
      AND (u.usergroup = 'PL' OR
      u.usergroup = app.App_permit_Done)`,
        [appAcronym]
      );

      console.log("emailQuery", emailQuery);

      const emails = emailQuery.map((user) => user.email);

      console.log("emails", emails);

      // fix user management system
      // if (emails.length === 0) {
      //   return res
      //     .status(404)
      //     .json({ message: "No user with PL role or permit_Done found " });
      // }

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.email_user,
          pass: process.env.pass,
        },
      });

      const mailOptions = {
        from: process.env.email_user,
        to: emails.join(","),
        subject: "Task for review",
        text: `Task ID ${taskId} in application ${appAcronym} is pending for your review.
        Please check the respective TMS.`,
      };

      transporter
        .sendMail(mailOptions)
        .then((e) => {
          console.log(e.messageId);
        })
        .catch((e) => {
          console.error(e);
        });

      // // Check updated task
      // const [resultOutputQuery] = await query(
      //   `SELECT *
      // FROM task
      // WHERE Task_id = ?`,
      //   [taskId]
      // );

      const resultOutputQuery = {
        Task_id: taskId,
        Task_state: taskStateDone,
      };

      await query("COMMIT");

      return res
        .status(200)
        .json({ msgCode: msgCode.SUCCESS, result: resultOutputQuery });
    } else {
      return res.status(400).json({ msgCode: msgCode.INVALID_STATE_CHANGE });
    }
  } catch (error) {
    await query("ROLLBACK");
    console.error("Error promoting task:", error);
    return res.status(500).json({ msgCode: msgCode.INTERNAL });
  }
};

module.exports = {
  CreateTask,
  GetTaskByState,
  PromoteTask2Done,
};
