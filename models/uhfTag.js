module.exports = (Sequelize, DataTypes) => {
    const UhfTag = Sequelize.define("uhfTag", {
      uhfId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      locationId: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    
    });
  
    return UhfTag;
  };
  