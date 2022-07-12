module.exports = (Sequelize, DataTypes) => {
    const Fault = Sequelize.define("fault", {
      fault: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      monthOccured: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      yearOccured: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      longitude: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      latitude: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      imageFileName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      imageUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    });
    return Fault;
  };
  