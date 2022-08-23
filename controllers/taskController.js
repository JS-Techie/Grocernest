const db = require("../models");

const Task = db.TaskModel;

const getAllTasks = async (req, res, next) => {
  const { user_id } = req.body;

  try {
    const tasks = await Task.findAll({
      where: { user_id },
    });

    if (tasks.length == 0) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "There are no tasks for current user",
      });
    }

    return res.status(200).send({
      success: true,
      data: tasks,
      message: "Found all tasks for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for the error",
    });
  }
};

const getTaskById = async (req, res, next) => {
  const { user_id } = req.body;
  const { id } = req.params;

  try {
    const task = await Task.findOne({
      where: { user_id, id },
    });

    if (!task) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "Requested task not found for current user",
      });
    }
    return res.status(200).send({
      success: true,
      data: task,
      message: "Found all tasks for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for the error",
    });
  }
};

const getTasksByStatus = async (req, res, next) => {
  const { user_id } = req.body;
  const { status } = req.params;

  try {
    const tasks = await Task.findAll({
      where: { user_id, status },
    });

    if (!tasks) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "Requested task not found for current user",
      });
    }
    return res.status(200).send({
      success: true,
      data: tasks,
      message: "Found all tasks for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for the error",
    });
  }
};

const editTaskStatus = async (req, res, next) => {
  const { user_id } = req.body;
  const { status, id } = req.params;

  try {
    const task = await Task.findOne({
      where: { user_id, id },
    });

    if (!task) {
      return res.status(200).send({
        success: true,
        data: [],
        message: "Requested task not found for current userr",
      });
    }

    const updateTaskStatus = await Task.update(
      {
        status,
      },
      {
        where: {
          user_id,
          id,
        },
      }
    );

    const updatedTask = await Task.findOne({
      where: { user_id, id },
    });

    return res.status(200).send({
      success: true,
      data: {
        oldTask: task,
        noOfUpdatedRows: updateTaskStatus,
        newTask: updatedTask,
      },
      message: "Found all tasks for current user",
    });
  } catch (error) {
    return res.status(400).send({
      success: false,
      data: error.message,
      message: "Please check data field for the error",
    });
  }
};

module.exports = { getAllTasks, getTaskById, getTasksByStatus, editTaskStatus };
