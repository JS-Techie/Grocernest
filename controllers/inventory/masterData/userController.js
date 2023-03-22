const { sequelize } = require("../../../models");
const db = require("../../../models");
const bcrypt = require("bcryptjs");
const validator = require("email-validator");
const validateDate = require("validate-date");

const getRoleList = require("../../../services/inventory/fetchRoleArray");
const { Op } = require("sequelize");

const User = db.UserModel;
const Role = db.RoleModel;
const UserRole = db.UserRoleModel;
const Location = db.LkpLocationModel;

const saveUser = async (req, res, next) => {
  const {
    password,
    gender,
    role,
    initials,
    locationId,
    dob,
    confirmPassword,
    fullName,
    mobileNo,
    email,
    userType,
  } = req.body;
  const { user_id } = req;
  try {
    if (password !== confirmPassword) {
      return res.status(200).send({
        status: 400,
        message: "Passwords do not match",
        data: [],
      });
    }
    const userObject = await User.findOne({
      where: { email },
    });
    if (userObject) {
      return res.status(200).send({
        status: 400,
        message: "User already exists",
        data: [],
      });
    }

    const locationObject = await Location.findOne({
      where: { id: locationId },
    });
    if (!locationObject) {
      return res.status(200).send({
        status: 400,
        message: "Location object not found",
        data: [],
      });
    }

    //hash password and store hashed pwd in DB
    let salt = bcrypt.genSaltSync(10);
    let encryptedPassword = bcrypt.hashSync(password, salt);

    let dateOfBirth = `${dob.split("/")[2]}-${dob.split("/")[1]}-${
      dob.split("/")[0]
    }`;
    // console.log(
    //   "When we split a string we get an ",
    //   typeof dateOfBirth.split("/")
    // );
    const createUser = await User.create({
      full_name: fullName,
      email: email,
      password: encryptedPassword,
      mobile_no: mobileNo,
      gender,
      date_of_birth: dateOfBirth,
      type_cd: userType,
      location_id: locationId,
      active_ind: "Y",
      created_by: user_id,
      created_at: Date.now(),
    });

    //Find current user

    const currentUser = await User.findOne({
      where: {
        email: email,
      },
    });

    const createUserRole = await UserRole.create({
      user_id: currentUser.id,
      role_id: role,
      created_by: user_id,
      created_at: Date.now(),
      active_ind: "Y",
    });
    return res.status(200).send({
      status: 200,
      message: "Successfully saved the new user",
      data: currentUser.id,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , Please try again in sometimes",
      data: error.message,
    });
  }
};

const updateUser = async (req, res, next) => {
  const {
    gender,
    role,
    initials,
    locationId,
    dob,
    fullName,
    mobileNo,
    email,
    userType,
  } = req.body;
  const userId = req.params.userId;
  // console.log("checking the fetched data by printing it :::=", userId, typeof(userId));
  // const { user_id } = req;
  try {
    if (
      initials == "" ||
      mobileNo == "" ||
      fullName == "" ||
      gender == "" ||
      !locationId ||
      !role ||
      !userType ||
      !dob ||
      email == ""
    ) {
      return res.status(200).send({
        status: 400,
        message: "PLease enter all the required details",
        data: [],
      });
    }
    if (!validator.validate(email)) {
      return res.status(200).send({
        status: 400,
        message: "Please enter correct email ID",
        data: [],
      });
    }

    if (
      !validateDate(
        dob,
        (responseType = "boolean"),
        (dateFormat = "dd/mm/yyyy")
      )
    ) {
      return res.status(200).send({
        status: 400,
        message: "Please enter correct Date of birth",
        data: [],
      });
    }
    const userObject = await User.findOne({
      where: { id: userId },
    });
    // console.log("user object after the query of the user table:===:", userObject);
    if (!userObject) {
      return res.status(200).send({
        status: 400,
        message: "Requested user id does not exist",
        data: [],
      });
    }

    const locationObject = await User.findOne({
      where: { location_id: locationId },
    });

    // console.log("the location object of the user table ====-->",locationObject);

    if (!locationObject) {
      return res.status(200).send({
        status: 400,
        message: "Location object doesnot exist",
        data: [],
      });
    }
    let dateOfBirth = `${dob.split("/")[2]}-${dob.split("/")[1]}-${
      dob.split("/")[0]
    }`;

    //update with same email address
    const sameUserArray = await User.findAll({
      attributes: ["id"],
      where: {
        email: email,
      },
    });
    let idCheckflag = false;

    for (var i = 0; i < sameUserArray.length; i++) {
      var user = sameUserArray[i];
      if (user.id !== userId) {
        // console.log("the array item user id: ", user.id);
        // console.log("the req body id: ", userId);
        idCheckflag = true;
        // console.log("the flag within loop : ", idCheckflag);
      }
    }

    // console.log("the flag finally: ",idCheckflag);

    if (idCheckflag) {
      return res.status(200).send({
        status: 400,
        message: "User email is not same",
        data: [],
      });
    }

    const updateUser = await User.update(
      {
        gender: gender,
        mobile_no: mobileNo,
        full_name: fullName,
        email: email,
        date_of_birth: dateOfBirth,
        type_cd: userType,
      },
      { where: { id: userId } }
    );

    // console.log("the returned object of the updated user from the query : ", updateUser);
    const updatedUser = await User.findOne({
      where: { id: userId },
    });

    const userRoles = await UserRole.findAll({
      where: { user_id: userId },
    });
    if (userRoles.length === 0) {
      return res.status(200).send({
        status: 400,
        message: "User role doesnt exist",
        data: [],
      });
    }
    return res.status(200).send({
      status: 200,
      message: "Successfully updated the user",
      data: updatedUser.id,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong, try agian later",
      data: error.message,
    });
  }
};
const getAllUser = async (req, res, next) => {
  try {
    const [allUser, metadata] =
      await sequelize.query(`select t_user.id , t_user.full_name , t_lkp_location.loc_name ,t_user.email , t_user.mobile_no , t_user.gender , t_user.date_of_birth , t_user.type_cd ,t_user.location_id ,t_user.active_ind from (t_user
            inner join t_lkp_location on t_lkp_location.id = t_user.location_id )`);
    if (allUser.length === 0) {
      return res.status(200).send({
        status: 404,
        message: "All users not found",
        data: [],
      });
    }
    // const [currentRoles, metadata2] = await sequelize.query(``)
    const promises = allUser.map(async (current) => {
      const userRoles = await UserRole.findAll({
        where: { user_id: current.id },
      });

      let userRolePromises = [];

      if (userRoles.length > 0) {
        userRolePromises = userRoles.map(async (currentUserRole) => {
          const currentRole = await Role.findOne({
            where: { id: currentUserRole.role_id },
          });

          return {
            createdBy: currentRole.created_by,
            createdAt: currentRole.created_at,
            updatedBy: currentRole.updated_by,
            updatedAt: currentRole.created_at,
            isActive: currentRole.active_ind,
            roleId: currentRole.id,
            roleName: currentRole.role_name,
            roleDesc: currentRole.role_desc,
            userType: currentRole.user_type,
          };
        });
      }

      const userRoleResolved = await Promise.all(userRolePromises);
      return {
        userId: current.id,
        newPassword: null,
        captcha: null,
        fullName: current.full_name,
        email: current.email,
        password: current.password,
        mobileNo: current.mobile_no,
        gender: current.gender,
        dob: current.date_of_birth,
        type: current.type_cd,
        status: null,
        isActive: current.active_ind,
        locationId: current.location_id,
        locationName: current.loc_name,
        serverDate: null,
        roleList: userRoleResolved,
        moduleList: [],
      };
    });
    const resolved = await Promise.all(promises);

    return res.status(200).send({
      status: 200,
      message: "Successfully fetched all the users",
      data: resolved,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong , Please try again in sometimes",
      data: error.message,
    });
  }
};

const getBasicUserDetails = async (req, res, next) => {
  const { user_id } = req;
  try {
    const userObject = await User.findOne({
      where: { id: user_id, active_ind: "Y" },
    });

    if (!userObject) {
      return res.status(200).send({
        status: 404,
        message: "Could not find requested user",
        data: [],
      });
    }

    const locationObject = await Location.findOne({
      where: { id: userObject.location_id },
    });

    const roleList = await getRoleList(user_id);

    return res.status(200).send({
      status: 200,
      message: "Successfully fetched all the basic user details",
      data: {
        userId: userObject.id,
        newPassword: null,
        captcha: null,
        fullName: userObject.full_name,
        email: userObject.email,
        password: userObject.password,
        mobileNo: userObject.mobile_no,
        gender: userObject.gender,
        dob: userObject.date_of_birth,
        type: userObject.type_cd,
        status: null,
        isActive: userObject.active_ind,
        locationId: userObject.location_id,
        locationName: locationObject.loc_name,
        serverDate: null,
        roleList: roleList,
        moduleList: [],
      },
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong, please try again later",
      data: error.message,
    });
  }
};

const getUserDetails = async (req, res, next) => {
  const { userId } = req.params;
  try {
    const userObject = await User.findOne({
      where: { id: userId, active_ind: "Y" },
    });

    if (!userObject) {
      return res.status(200).send({
        status: 404,
        message: "Requested user not found",
        data: [],
      });
    }

    const locationObject = await Location.findOne({
      where: { id: userObject.location_id },
    });

    if (!locationObject) {
      return res.status(200).send({
        status: 404,
        message: "Location not found for current user",
        data: [],
      });
    }

    const roleResolved = await getRoleList(userId);

    return res.status(200).send({
      status: 200,
      message: "Got the userobject",
      data: {
        userId: userObject.id,
        newPassword: null,
        captcha: null,
        fullName: userObject.full_name,
        email: userObject.email,
        password: userObject.password,
        mobileNo: userObject.mobile_no,
        gender: userObject.gender,
        dob: userObject.date_of_birth,
        type: userObject.type_cd,
        status: null,
        isActive: userObject.active_ind,
        locationId: userObject.location_id,
        locationName: locationObject.loc_name,
        serverDate: null,
        roleList: roleResolved,
        moduleList: [],
      },
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong, please try again in sometimes",
      data: error.message,
    });
  }
};

const tellerList = async (req, res, next) => {
  try {
    const [currentRoles, metadata] =
      await sequelize.query(`select t_user.id , t_user.full_name from ((t_user 
            inner join t_user_role on t_user_role.user_id = t_user.id )
            inner join t_role on t_role.id  = t_user_role.role_id) where t_role.role_name = 'POS_USER'`);

    const promises = currentRoles.map((current) => {
      return {
        id: current.id,
        tellerName: current.full_name,
      };
    });
    const resolved = await Promise.all(promises);
    return res.status(200).send({
      status: 200,
      message: "Successfully fetched all the tellerList",
      data: resolved,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Try again later",
      data: error.message,
    });
  }
};

const activateUser = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    if (!userId) {
      return res.status(200).send({
        status: 400,
        message: "UserId not found",
        data: [],
      });
    }

    const userObject = await User.findOne({
      where: { id: userId },
    });
    // console.log("the object user from the user table ========>", userObject);
    if (!userObject) {
      return res.status(200).send({
        status: 400,
        message: "userObject not found",
        data: [],
      });
    }
    const updateUser = await User.update(
      {
        active_ind: "Y",
      },
      {
        where: { id: userId },
      }
    );
    const updatedUser = await User.findOne({
      where: { id: userId },
    });
    // const [updatedUser, metadata] = await sequelize.query(`select t_user.id, t_user.full_name , t_user.email,t_user.email ,t_user.password ,t_user.mobile_no , t_user.gender ,t_user.date_of_birth ,t_user.type_cd ,t_user.active_ind ,t_user.created_by ,t_user.updated_by ,t_user.created_at ,t_user.updated_at , t_user.location_id ,t_lkp_location.loc_name  from(t_user inner join t_lkp_location on t_lkp_location.id = t_user.location_id)`)
    return res.status(200).send({
      status: 200,
      message: "Successfully activated the requested user",
      data: userObject.id,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong, please try again later",
      data: error.message,
    });
  }
};

const deactivateUser = async (req, res, next) => {
  const userId = req.params.userId;
  try {
    if (!userId) {
      return res.status(200).send({
        status: 400,
        message: "UserId not found",
        data: [],
      });
    }

    const userObject = await User.findOne({
      where: { id: userId },
    });
    if (!userObject) {
      return res.status(200).send({
        status: 400,
        message: "userObject not found",
        data: [],
      });
    }
    const updateUser = await User.update(
      {
        active_ind: "N",
      },
      {
        where: { id: userId },
      }
    );
    const updatedUser = await User.findOne({
      where: { id: userId },
    });
    return res.status(200).send({
      status: 200,
      message: "Successfully activated the requested user",
      data: updatedUser.id,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Successfully deactivated the requested user",
      data: error.message,
    });
  }
};

const getActiveUsers = async (req, res, next) => {
  try {
    const [activeUser, metadata] =
      await sequelize.query(`select t_user.id , t_user.full_name , t_lkp_location.loc_name ,t_user.email , t_user.mobile_no , t_user.gender , t_user.date_of_birth , t_user.type_cd ,t_user.location_id ,t_user.active_ind from (t_user
            inner join t_lkp_location on t_lkp_location.id = t_user.location_id ) where t_user.active_ind = 'Y'`);
    if (activeUser.length === 0) {
      return res.status(200).send({
        status: 400,
        message: "Active Users not found",
        data: [],
      });
    }
    const promises = activeUser.map(async (current) => {
      const userRoles = await UserRole.findAll({
        where: { user_id: current.id },
      });

      let userRolePromises = [];

      if (userRoles.length > 0) {
        userRolePromises = userRoles.map(async (currentUserRole) => {
          const currentRole = await Role.findOne({
            where: { id: currentUserRole.role_id },
          });

          return {
            createdBy: currentRole.created_by,
            createdAt: currentRole.created_at,
            updatedBy: currentRole.updated_by,
            updatedAt: currentRole.created_at,
            isActive: currentRole.active_ind,
            roleId: currentRole.id,
            roleName: currentRole.role_name,
            roleDesc: currentRole.role_desc,
            userType: currentRole.user_type,
          };
        });
      }

      const userRoleResolved = await Promise.all(userRolePromises);
      return {
        userId: current.id,
        newPassword: null,
        captcha: null,
        fullName: current.full_name,
        email: current.email,
        password: current.password,
        mobileNo: current.mobile_no,
        gender: current.gender,
        dob: current.date_of_birth,
        type: current.type_cd,
        status: null,
        isActive: current.active_ind,
        locationId: current.location_id,
        locationName: current.loc_name,
        serverDate: null,
        roleList: userRoleResolved,
        moduleList: [],
      };
    });
    const resolved = await Promise.all(promises);

    return res.status(200).send({
      status: 200,
      message: "Successfully fetched all the users",
      data: resolved,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong, please try again later",
      data: error.message,
    });
  }
};

const getDeactivateUsers = async (req, res, next) => {
  try {
    const [deactiveUser, metadata] =
      await sequelize.query(`select t_user.id , t_user.full_name , t_lkp_location.loc_name ,t_user.email , t_user.mobile_no , t_user.gender , t_user.date_of_birth , t_user.type_cd ,t_user.location_id ,t_user.active_ind from (t_user
            inner join t_lkp_location on t_lkp_location.id = t_user.location_id ) where t_user.active_ind = 'N'`);
    if (deactiveUser.length === 0) {
      return res.status(200).send({
        status: 400,
        message: "Deactive Users not found",
        data: [],
      });
    }
    const promises = deactiveUser.map(async (current) => {
      const userRoles = await UserRole.findAll({
        where: { user_id: current.id },
      });

      let userRolePromises = [];

      if (userRoles.length > 0) {
        userRolePromises = userRoles.map(async (currentUserRole) => {
          const currentRole = await Role.findOne({
            where: { id: currentUserRole.role_id },
          });

          return {
            createdBy: currentRole.created_by,
            createdAt: currentRole.created_at,
            updatedBy: currentRole.updated_by,
            updatedAt: currentRole.created_at,
            isActive: currentRole.active_ind,
            roleId: currentRole.id,
            roleName: currentRole.role_name,
            roleDesc: currentRole.role_desc,
            userType: currentRole.user_type,
          };
        });
      }

      const userRoleResolved = await Promise.all(userRolePromises);
      return {
        userId: current.id,
        newPassword: null,
        captcha: null,
        fullName: current.full_name,
        email: current.email,
        password: current.password,
        mobileNo: current.mobile_no,
        gender: current.gender,
        dob: current.date_of_birth,
        type: current.type_cd,
        status: null,
        isActive: current.active_ind,
        locationId: current.location_id,
        locationName: current.loc_name,
        serverDate: null,
        roleList: userRoleResolved,
        moduleList: [],
      };
    });
    const resolved = await Promise.all(promises);

    return res.status(200).send({
      status: 200,
      message: "Successfully fetched all the users",
      data: resolved,
    });
  } catch (error) {
    return res.status(200).send({
      status: 500,
      message: "Something went wrong, please try again in sometime",
      data: error.message,
    });
  }
};
module.exports = {
  saveUser,
  getAllUser,
  updateUser,
  getBasicUserDetails,
  getUserDetails,
  tellerList,
  activateUser,
  deactivateUser,
  getActiveUsers,
  getDeactivateUsers,
};
