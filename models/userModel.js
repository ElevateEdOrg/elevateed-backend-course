module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(255),
      unique: true,
      allowNull: false,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    role: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        isIn: [['student', 'instructor', 'admin']]
      }
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'users',
    timestamps: false
  });

  User.associate = models => {
    // Users can enroll in multiple courses (Many-to-Many)
    User.belongsToMany(models.Course, { through: models.Enrollment, foreignKey: 'user_id', as: 'EnrolledCourses' });

    // Users can make multiple payments
    User.hasMany(models.Payment, { foreignKey: 'user_id', as: 'Payments' });
    
    // Users can be instructors of multiple courses
    User.hasMany(models.Course, { foreignKey: 'instructor_id', as: 'CoursesTaught' });
  };

  return User;
};
