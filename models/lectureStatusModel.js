module.exports = (sequelize, DataTypes) => {
    const LectureStatus = sequelize.define(
        "LectureStatus",
        {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
            },
            user_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "users",
                    key: "id",
                },
            },
            lecture_id: {
                type: DataTypes.UUID,
                allowNull: false,
                references: {
                    model: "lectures",
                    key: "id",
                },
            },
            status: {
                type: DataTypes.STRING, //  Changed from ENUM to STRING
                allowNull: false,
                defaultValue: "pending",
                validate: {
                    isIn: [["completed", "pending"]], // Enforce CHECK constraint at Sequelize level
                },
            },
            created_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
            updated_at: {
                type: DataTypes.DATE,
                defaultValue: DataTypes.NOW,
            },
        },
        {
            tableName: "lecture_status",
            timestamps: false, // Since we handle timestamps manually
        }
    );

    return LectureStatus;
};
