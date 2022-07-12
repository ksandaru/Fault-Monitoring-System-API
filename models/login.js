module.exports = (Sequelize, DataTypes) => {
    const Login = Sequelize.define("login", {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      },
      isPasswordReset: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: 0,
      }
    });
  
    return Login;
  };
  