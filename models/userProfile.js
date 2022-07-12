module.exports = (Sequelize, DataTypes) => {
    const UserProfile = Sequelize.define("userProfile", {
      fullName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      nic: {
        type: DataTypes.STRING,
        allowNull: true,
      },
     
      district: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    
    });
  
    return UserProfile;
  };
  