module.exports = (sequelize, DataTypes) => {
    const Assessment = sequelize.define(
      "Assessment",
      {
        id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        course_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "courses",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        lecture_id: {
          type: DataTypes.UUID,
          allowNull: false,
          references: {
            model: "lectures",
            key: "id",
          },
          onDelete: "CASCADE",
        },
        assessment_data: {
          type: DataTypes.JSONB, //  Stores a JSON object
          allowNull: false,
        },
        created_at: {
          type: DataTypes.DATE,
          defaultValue: DataTypes.NOW,
        },
      },
      {
        tableName: "assessments",
        timestamps: false,
      }
    );
  
    return Assessment;
  };
  