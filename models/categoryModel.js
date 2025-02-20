module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true
      }
    }, {
      tableName: 'categories',
      timestamps: false
    });
  
    Category.associate = models => {
        Category.hasMany(models.Course, { foreignKey: 'category_id', as: 'Courses' });  // One-to-Many
      };
  
    return Category;
  };
  