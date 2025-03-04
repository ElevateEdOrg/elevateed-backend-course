module.exports = (sequelize, DataTypes) => {
    const Lecture = sequelize.define('Lecture', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        course_id: {
            type: DataTypes.UUID,
            allowNull: false,
            references: {
                model: 'courses', // Table name
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        video_path: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        pdf_path: {
            type: DataTypes.TEXT
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
    }, {
        tableName: 'lectures',
        timestamps: false,

    });


    Lecture.associate = models => {

        Lecture.belongsTo(models.Course, { foreignKey: 'course_id', as: 'course' });

        Lecture.belongsToMany(models.User, { through: models.LectureStatus, foreignKey: "lecture_id", as: "UsersProgress" });

    };


    return Lecture;
};
