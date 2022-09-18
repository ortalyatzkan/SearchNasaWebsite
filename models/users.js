'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  Users.init({
    firstName:{type: DataTypes.STRING,
    validate:{notEmpty: true}},

    lastName: {type:DataTypes.STRING,
    validate:{notEmpty: true}},

    email: {type:DataTypes.STRING,
      validate:{isEmail: true, notEmpty: true}},

    password: {type:DataTypes.STRING,
    validate:{len: [8,]}
    }
  }, {
    sequelize,
    modelName: 'Users',
  });
  return Users;
};