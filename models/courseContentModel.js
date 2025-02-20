module.exports = (sequelize, DataTypes) => {
    const CourseContent = sequelize.define('CourseContent', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      course_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        }
      },
      file_path: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      content_type: {
        type: DataTypes.STRING(100),
        allowNull: false
      }
    }, {
      tableName: 'course_content',
      timestamps: false
    });
  
    CourseContent.associate = models => {
      CourseContent.belongsTo(models.Course, { foreignKey: 'course_id' });
    };
  
    return CourseContent;
  };
  