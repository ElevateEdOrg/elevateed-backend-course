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
    review_text: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    liked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    share_count: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    student_score: {
      type: DataTypes.INTEGER,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 50
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
    },
    course_rating: {
      type: DataTypes.DECIMAL(5, 2),
      allowNull: false,
      defaultValue: 0.00,
      validate: {
        min: 0,
        max: 5
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'enrollments',
    timestamps: true,  // Enables Sequelize's automatic `createdAt` and `updatedAt` management
    underscored: true
  });

  Enrollment.associate = models => {
    Enrollment.belongsTo(models.User, { foreignKey: 'user_id', as: 'Student' });
    Enrollment.belongsTo(models.Course, { foreignKey: 'course_id', as: 'Course' });
  };

  return Enrollment;
};
