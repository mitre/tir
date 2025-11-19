import { DataTypes } from "sequelize";
import { sequelize } from "../umzug.js";

export const up = async () => {
  const upMigration = await sequelize.transaction();
  try {
    // ControlNumber table
    await sequelize.getQueryInterface().createTable(
      "ControlNumbers",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        number: {
          type: DataTypes.TEXT,
          unique: true,
          allowNull: false,
        },
        lastUpdate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      { transaction: upMigration },
    );

    // ControlFamily table
    await sequelize.getQueryInterface().createTable(
      "ControlFamilies",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        lastUpdate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      { transaction: upMigration },
    );

    // ControlClass table
    await sequelize.getQueryInterface().createTable(
      "ControlClasses",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        lastUpdate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      { transaction: upMigration },
    );

    // ControlPriority table
    await sequelize.getQueryInterface().createTable(
      "ControlPriorities",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        level: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        lastUpdate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      { transaction: upMigration },
    );

    // ControlRevision table
    await sequelize.getQueryInterface().createTable(
      "ControlRevisions",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        filename: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        hash: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        importComplete: {
          type: DataTypes.BOOLEAN,
          allowNull: false,
        },
        lastUpdate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      { transaction: upMigration },
    );

    // Baseline table
    await sequelize.getQueryInterface().createTable(
      "Baselines",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        name: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        lastUpdate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      { transaction: upMigration },
    );

    // Control table
    await sequelize.getQueryInterface().createTable(
      "Controls",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        ControlNumberId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "ControlNumbers",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        ControlFamilyId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "ControlFamilies",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        title: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        ControlClassId: {
          type: DataTypes.INTEGER,
          references: {
            model: "ControlClasses",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        ControlPriorityId: {
          type: DataTypes.INTEGER,
          references: {
            model: "ControlPriorities",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        guidance: {
          type: DataTypes.TEXT,
        },
        ControlRevisionId: {
          type: DataTypes.INTEGER,
          references: {
            model: "ControlRevisions",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        lastUpdate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      { transaction: upMigration },
    );

    // ControlReferences table
    await sequelize.getQueryInterface().createTable(
      "ControlReferences",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        href: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        text: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        shortName: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        lastUpdate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      { transaction: upMigration },
    );

    await sequelize.getQueryInterface().createTable(
      "Control_ControlReferences",
      {
        ControlId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Controls",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        ControlReferenceId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "ControlReferences",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
      },
      { transaction: upMigration },
    );

    // ControlBaselines table
    await sequelize.getQueryInterface().createTable(
      "Control_Baselines",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        ControlId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Controls",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        BaselineId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Baselines",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
      },
      { transaction: upMigration },
    );

    // ControlBaselines table
    await sequelize.getQueryInterface().createTable(
      "ControlStatements",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        ControlId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Controls",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        parentId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "ControlStatements",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        number: {
          type: DataTypes.TEXT,
        },
        description: {
          type: DataTypes.TEXT,
        },
        lastUpdate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      { transaction: upMigration },
    );

    // ControlRelatedControls table
    await sequelize.getQueryInterface().createTable(
      "ControlRelatedControls",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        ControlId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Controls",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        relatedControl: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        lastUpdate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      { transaction: upMigration },
    );

    // ControlEnhancements table
    await sequelize.getQueryInterface().createTable(
      "ControlEnhancements",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        ControlId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Controls",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        enhancementIdentifier: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        privacyImpact: {
          type: DataTypes.TEXT,
        },
        title: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        guidance: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        lastUpdate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      { transaction: upMigration },
    );

    // EnhancementBaselines table
    await sequelize.getQueryInterface().createTable(
      "ControlEnhancement_Baselines",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        ControlEnhancementId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "ControlEnhancements",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        BaselineId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Baselines",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
      },
      { transaction: upMigration },
    );
    // ControlEnhancementStatements table
    await sequelize.getQueryInterface().createTable(
      "ControlEnhancementStatements",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        ControlEnhancementId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "ControlEnhancements",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        parentId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "ControlEnhancementStatements",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        number: {
          type: DataTypes.TEXT, // e.g., AC-2(3)(a)
        },
        description: {
          type: DataTypes.TEXT, // statement text
        },
        lastUpdate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      { transaction: upMigration },
    );
    // EnhancementRelatedControls table
    await sequelize.getQueryInterface().createTable(
      "EnhancementRelatedControls",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        ControlEnhancementId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "ControlEnhancements",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        relatedControl: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        lastUpdate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      { transaction: upMigration },
    );

    // EnhancementWithdrawn table
    await sequelize.getQueryInterface().createTable(
      "EnhancementWithdrawns",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        ControlEnhancementId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "ControlEnhancements",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        incorporatedInto: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Controls",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        lastUpdate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      { transaction: upMigration },
    );

    // ControlWithdrawn table
    await sequelize.getQueryInterface().createTable(
      "ControlWithdrawns",
      {
        id: {
          type: DataTypes.INTEGER,
          allowNull: false,
          primaryKey: true,
          autoIncrement: true,
        },
        ControlId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Controls",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        incorporatedInto: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "Controls",
            key: "id",
          },
          onUpdate: "CASCADE",
          onDelete: "CASCADE",
        },
        lastUpdate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        creationDate: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
      },
      { transaction: upMigration },
    );
    await upMigration.commit();
  } catch (error) {
    await upMigration.rollback();
    throw error;
  }
};
export const down = async () => {
  const downMigration = await sequelize.transaction();
  try {
    await sequelize.getQueryInterface().dropTable("ControlWithdrawns", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("EnhancementWithdrawns", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("EnhancementRelatedControls", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("ControlEnhancementStatements", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("ControlEnhancement_Baselines", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("ControlEnhancements", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("ControlRelatedControls", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("ControlStatements", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("Control_Baselines", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("Control_ControlReferences", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("ControlReferences", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("Controls", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("Baselines", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("ControlRevisions", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("ControlPriorities", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("ControlClasses", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("ControlFamilies", {
      transaction: downMigration,
    });
    await sequelize.getQueryInterface().dropTable("ControlNumbers", {
      transaction: downMigration,
    });
    await downMigration.commit();
  } catch (error) {
    await downMigration.rollback();
    throw error;
  }
};
