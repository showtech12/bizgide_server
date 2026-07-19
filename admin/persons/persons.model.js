const { Model, DataTypes } = require("sequelize");
const sequelize = require("../../config/database");

class Persons extends Model {}

Persons.init(
  {
    contact_type: {
      type: DataTypes.STRING,
    },
    ptype: {
      type: DataTypes.STRING,
    },
    la_id: {
      type: DataTypes.INTEGER,
    },
    full_name: {
      type: DataTypes.STRING,
    },
    sex: {
      type: DataTypes.STRING,
    },
    address: {
      type: DataTypes.TEXT,
    },
    dob: {
      type: DataTypes.STRING,
    },
    phone_no: {
      type: DataTypes.STRING,
    },
    city: {
      type: DataTypes.STRING,
    },
   
    state: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING,
    },
    act_no: {
      type: DataTypes.STRING,
    },
    passport: {
      type: DataTypes.TEXT,
    },
    isActive: {
      type: DataTypes.INTEGER,
    },
    postal_code: {
      type: DataTypes.STRING,
    },
    store_id: {
      type: DataTypes.INTEGER,
    },
    reg_date: {
      type: DataTypes.STRING,
    },
    last_date_modified: {
      type: DataTypes.STRING,
    },
    flg: {
      type: DataTypes.STRING,
    },
  },
  {
    sequelize,
    modelName: "persons",
    timestamps: false,

    indexes: [
      // Customer/Supplier name search
      {
        name: "idx_persons_name",
        fields: ["full_name"],
      },

      // Phone lookup
      {
        name: "idx_persons_phone",
        fields: ["phone_no"],
      },

      // Email lookup
      {
        name: "idx_persons_email",
        fields: ["email"],
      },

      

      // Store filtering
      {
        name: "idx_persons_store",
        fields: ["store_id"],
      },

      // Customer or Supplier
      {
        name: "idx_persons_contact_type",
        fields: ["contact_type"],
      },

      // Customer type
      {
        name: "idx_persons_ptype",
        fields: ["ptype"],
      },

      // Active customers
      {
        name: "idx_persons_active",
        fields: ["isActive"],
      },

      // Store + Contact Type
      {
        name: "idx_persons_store_contact",
        fields: ["store_id", "contact_type"],
      },

      // Store + Name
      {
        name: "idx_persons_store_name",
        fields: ["store_id", "full_name"],
      },

      // Store + Phone
      {
        name: "idx_persons_store_phone",
        fields: ["store_id", "phone_no"],
      },

      // Store + Active
      {
        name: "idx_persons_store_active",
        fields: ["store_id", "isActive"],
      },
    ],
  }
);
module.exports = Persons;
