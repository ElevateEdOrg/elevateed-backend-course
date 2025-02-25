module.exports = (sequelize, DataTypes) => {
  const Course = sequelize.define('Course', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    instructor_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    price: {
      type: DataTypes.NUMERIC(10, 2),
      allowNull: false,
      defaultValue: 0.00
    },
    category_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'categories',
        key: 'id'
      }
    },
    banner_image: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    welcome_msg: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    intro_video: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'courses',
    timestamps: false
  });

  Course.associate = models => {
    // Each Course belongs to one Category (Many-to-One)
    Course.belongsTo(models.Category, { foreignKey: 'category_id', as: 'Category' });

    // Each Course has one Instructor (Many-to-One)
    Course.belongsTo(models.User, { foreignKey: 'instructor_id', as: 'Instructor' });

    // Many-to-Many relationship between Users (Students) and Courses via Enrollment
    Course.belongsToMany(models.User, { through: models.Enrollment, foreignKey: 'course_id', as: 'EnrolledStudents' });

    // One-to-Many relationship with Lectures
    Course.hasMany(models.Lecture, { foreignKey: 'course_id', as: 'Lectures', onDelete: 'CASCADE' });

    // One-to-Many relationship with Payments
    Course.hasMany(models.Payment, { foreignKey: 'course_id', as: 'Payments' });
  };

  return Course;
};
