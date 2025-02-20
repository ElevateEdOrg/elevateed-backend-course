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
    
        // Other relations
        Course.belongsTo(models.User, { foreignKey: 'instructor_id', as: 'Instructor' });
        Course.hasMany(models.CourseContent, { foreignKey: 'course_id' });
        Course.hasMany(models.Payment, { foreignKey: 'course_id' });
      };
    
  
    return Course;
  };
  