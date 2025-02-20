module.exports = (sequelize, DataTypes) => {
    const Enrollment = sequelize.define('Enrollment', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      course_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'courses',
          key: 'id'
        }
      },
      enrolled_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      },
      progress: {
        type: DataTypes.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.00,
        validate: {
          min: 0,
          max: 100
        }
      }
    }, {
      tableName: 'enrollments',
      timestamps: false
    });
  
    Enrollment.associate = models => {
      Enrollment.belongsTo(models.User, { foreignKey: 'user_id', as: 'Student' });
      Enrollment.belongsTo(models.Course, { foreignKey: 'course_id', as: 'Course' });
    };
  
    return Enrollment;
  };
  