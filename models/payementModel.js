module.exports = (sequelize, DataTypes) => {
    const Payment = sequelize.define('Payment', {
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
      amount: {
        type: DataTypes.NUMERIC(10, 2),
        allowNull: false
      },
      method: {
        type: DataTypes.STRING(50),
        allowNull: false,
        validate: {
          isIn: [['credit_card', 'debit_card', 'paypal', 'upi', 'net_banking', 'other']]
        }
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
          isIn: [['pending', 'completed', 'failed', 'refunded']], 
        },
        defaultValue: 'pending'
      },
      payment_date: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
      }
    }, {
      tableName: 'payments',
      timestamps: false
    });
  
    Payment.associate = models => {
      Payment.belongsTo(models.User, { foreignKey: 'user_id' });
      Payment.belongsTo(models.Course, { foreignKey: 'course_id' });
    };
  
    return Payment;
  };
  