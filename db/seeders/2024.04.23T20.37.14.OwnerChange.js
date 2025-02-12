import { DateTime } from "luxon";
import { DataTypes } from "sequelize";
export const up = async ({ context: sequelize }) => {
    const now = DateTime.now().toISO();
    const schemaPrefix = sequelize.getDialect() === "postgres" ? "public." : "";
    try {
        await sequelize.query(`
      UPDATE ${schemaPrefix}"TierRoles"
      SET name = CASE id 
        WHEN 1 THEN 'Temp Owner'
        WHEN 2 THEN 'Temp Co-owner' 
        WHEN 3 THEN 'Temp Editor'
      END, 
      "lastUpdate" = '${now}' 
      WHERE id IN (1, 2, 3);
      `);
        await sequelize.query(`
      UPDATE ${schemaPrefix}"TierRoles" 
      SET name = CASE id 
        WHEN 1 THEN 'Owner' 
        WHEN 2 THEN 'Co-owner'
        WHEN 3 THEN 'Editor' 
      END, 
      "lastUpdate" = '${now}'
      WHERE id IN (1, 2, 3);
      `);
        await sequelize.query(`
      INSERT INTO ${schemaPrefix}"TierRoles" (id, name, "creationDate", "lastUpdate") 
      VALUES (4, 'Reviewer', '${now}', '${now}');
      `);
        await sequelize.query(`
      UPDATE ${schemaPrefix}"Tier_Users" 
      SET "TierRoleId" = "TierRoleId" + 1 
      WHERE "TierRoleId" >= 1;
      `);
        await sequelize.query(`
      DELETE FROM ${schemaPrefix}"Tier_Users"
      WHERE ("UserId", "TierId") IN (
      SELECT "ownerId", id FROM "Tiers" WHERE "ownerId" IS NOT NULL);
      `);
        await sequelize.query(`
      INSERT INTO ${schemaPrefix}"Tier_Users" ("TierId", "UserId", "TierRoleId")
      SELECT id, "ownerId", 1 FROM ${schemaPrefix}"Tiers" WHERE "ownerId" IS NOT NULL;
      `);
        await sequelize.query(`
      UPDATE ${schemaPrefix}"BoundaryRoles" 
      SET name = CASE id 
        WHEN 1 THEN 'Temp Owner' 
        WHEN 2 THEN 'Temp Co-owner' 
        WHEN 3 THEN 'Temp Editor' 
      END, "lastUpdate" = '${now}' 
      WHERE id IN (1, 2, 3);
      `);
        await sequelize.query(`
      UPDATE ${schemaPrefix}"BoundaryRoles" 
      SET name = CASE id 
        WHEN 1 THEN 'Owner' 
        WHEN 2 THEN 'Co-owner' 
        WHEN 3 THEN 'Editor'
      END, "lastUpdate" = '${now}' 
      WHERE id IN (1, 2, 3);
      `);
        await sequelize.query(`
      INSERT INTO ${schemaPrefix}"BoundaryRoles" (id, name, "creationDate", "lastUpdate") 
      VALUES (4, 'Reviewer', '${now}', '${now}');
      `);
        await sequelize.query(`
      UPDATE ${schemaPrefix}"Boundary_Users" 
      SET "BoundaryRoleId" = "BoundaryRoleId" + 1 WHERE "BoundaryRoleId" >= 1;
      `);
        await sequelize.query(`
      DELETE FROM ${schemaPrefix}"Boundary_Users"
      WHERE ("UserId", "BoundaryId") IN (
      SELECT "ownerId", id FROM "Boundaries" WHERE "ownerId" IS NOT NULL);
      `);
        await sequelize.query(`
      INSERT INTO ${schemaPrefix}"Boundary_Users" ("BoundaryId", "UserId", "BoundaryRoleId") 
      SELECT id, "ownerId", 1 FROM ${schemaPrefix}"Boundaries" WHERE "ownerId" IS NOT NULL;
      `);
        if (sequelize.getDialect() === "postgres") {
            await sequelize.getQueryInterface().removeColumn("Tiers", "ownerId");
            await sequelize.getQueryInterface().removeColumn("Boundaries", "ownerId");
        }
        if (sequelize.getDialect() === "sqlite") {
            await sequelize.query(`PRAGMA foreign_keys = OFF;`);
            await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "Boundaries_backup" (
          "id" INTEGER PRIMARY KEY AUTOINCREMENT, 
          "name" VARCHAR(255) NOT NULL UNIQUE, 
          "lastUpdate" VARCHAR(29) NOT NULL, 
          "creationDate" VARCHAR(29) NOT NULL, 
          "TierId" INTEGER NOT NULL REFERENCES "Tiers" ("id") ON DELETE CASCADE ON UPDATE CASCADE, 
          "StigLibraryId" INTEGER REFERENCES "StigLibraries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, 
          "PolicyDocumentId" INTEGER NOT NULL REFERENCES "PolicyDocuments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, 
          "ClassificationId" INTEGER REFERENCES "Classifications" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, 
          "caveats" VARCHAR(50)
        );`);
            await sequelize.query(`
        INSERT INTO "Boundaries_backup" 
        SELECT "id", "name", "lastUpdate", "creationDate", "TierId", "StigLibraryId", "PolicyDocumentId", "ClassificationId", "caveats" 
        FROM "Boundaries";
        `);
            await sequelize.query(`DROP TABLE "Boundaries";`);
            await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "Boundaries" (
          "id" INTEGER PRIMARY KEY AUTOINCREMENT, 
          "name" VARCHAR(255) NOT NULL UNIQUE, 
          "lastUpdate" VARCHAR(29) NOT NULL, 
          "creationDate" VARCHAR(29) NOT NULL, 
          "TierId" INTEGER NOT NULL REFERENCES "Tiers" ("id") ON DELETE CASCADE ON UPDATE CASCADE, 
          "StigLibraryId" INTEGER REFERENCES "StigLibraries" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, 
          "PolicyDocumentId" INTEGER NOT NULL REFERENCES "PolicyDocuments" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, 
          "ClassificationId" INTEGER REFERENCES "Classifications" ("id") ON DELETE RESTRICT ON UPDATE CASCADE, 
          "caveats" VARCHAR(50)
        );`);
            await sequelize.query(`
        INSERT INTO "Boundaries" 
        SELECT "id", "name", "lastUpdate", "creationDate", "TierId", "StigLibraryId", "PolicyDocumentId", "ClassificationId", "caveats" 
        FROM "Boundaries_backup";
        `);
            await sequelize.query(`DROP TABLE "Boundaries_backup";`);
            await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "Tiers_backup" (
          "id" INTEGER PRIMARY KEY AUTOINCREMENT, 
          "name" VARCHAR(255) NOT NULL UNIQUE, 
          "parentId" INTEGER REFERENCES "Tiers_backup" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "lastUpdate" VARCHAR(29) NOT NULL, 
          "creationDate" VARCHAR(29) NOT NULL
        );`);
            await sequelize.query(`
        INSERT INTO "Tiers_backup" 
        SELECT "id", "name", "parentId", "lastUpdate", "creationDate"
        FROM "Tiers"
        ORDER BY "id" ASC;
        `);
            await sequelize.query(`DROP TABLE "Tiers";`);
            await sequelize.query(`
        CREATE TABLE IF NOT EXISTS "Tiers" (
          "id" INTEGER PRIMARY KEY AUTOINCREMENT, 
          "name" VARCHAR(255) NOT NULL UNIQUE, 
          "parentId" INTEGER REFERENCES "Tiers" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
          "lastUpdate" VARCHAR(29) NOT NULL, 
          "creationDate" VARCHAR(29) NOT NULL
        );`);
            await sequelize.query(`
        INSERT INTO "Tiers" 
        SELECT "id", "name", "parentId", "lastUpdate", "creationDate"
        FROM "Tiers_backup"
        ORDER BY "id" ASC;
        `);
            await sequelize.query(`DROP TABLE "Tiers_backup";`);
        }
    }
    catch (error) {
        console.log(error);
    }
    finally {
        if (sequelize.getDialect() === "sqlite") {
            await sequelize.query(`PRAGMA foreign_keys = ON;`);
        }
    }
};
export const down = async ({ context: sequelize }) => {
    const now = DateTime.now().toISO();
    const schemaPrefix = sequelize.getDialect() === "postgres" ? "public." : "";
    try {
        await sequelize.getQueryInterface().addColumn("Tiers", "ownerId", {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        });
        await sequelize.getQueryInterface().addColumn("Boundaries", "ownerId", {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: "Users",
                key: "id",
            },
            onUpdate: "CASCADE",
            onDelete: "CASCADE",
        });
        await sequelize.query(`
        UPDATE ${schemaPrefix}"Boundaries"
        SET "ownerId" = (
          SELECT "UserId"
          FROM "Boundary_Users"
          WHERE "Boundary_Users"."BoundaryId" = "Boundaries"."id"
            AND "BoundaryRoleId" = 1
          LIMIT 1
        )
        WHERE EXISTS (
          SELECT 1
          FROM "Boundary_Users"
          WHERE "Boundary_Users"."BoundaryId" = "Boundaries"."id"
            AND "BoundaryRoleId" = 1
        );
      `);
        await sequelize.query(`
        UPDATE ${schemaPrefix}"Tiers"
        SET "ownerId" = (
          SELECT "UserId"
          FROM "Tier_Users"
          WHERE "Tier_Users"."TierId" = "Tiers"."id"
            AND "TierRoleId" = 1
          LIMIT 1
        )
        WHERE EXISTS (
          SELECT 1
          FROM "Tier_Users"
          WHERE "Tier_Users"."TierId" = "Tiers"."id"
            AND "TierRoleId" = 1
        );
      `);
        await sequelize.query(`
        DELETE FROM ${schemaPrefix}"Boundary_Users"
        WHERE "BoundaryRoleId" = 1;
      `);
        await sequelize.query(`
        DELETE FROM ${schemaPrefix}"Tier_Users"
        WHERE "TierRoleId" = 1;
      `);
        await sequelize.query(`
        UPDATE ${schemaPrefix}"Boundary_Users"
        SET "BoundaryRoleId" = "BoundaryRoleId" - 1
        WHERE "BoundaryRoleId" > 1;
      `);
        await sequelize.query(`
        UPDATE ${schemaPrefix}"Tier_Users"
        SET "TierRoleId" = "TierRoleId" - 1
        WHERE "TierRoleId" > 1;
      `);
        await sequelize.query(`
        DELETE FROM ${schemaPrefix}"BoundaryRoles"
        WHERE id = 4;
      `);
        await sequelize.query(`
      DELETE FROM ${schemaPrefix}"TierRoles"
      WHERE id = 4;
      `);
        await sequelize.query(`
      UPDATE ${schemaPrefix}"TierRoles" 
      SET name = CASE id 
        WHEN 1 THEN "Temp Co-owner" 
        WHEN 2 THEN "Temp Editor" 
        WHEN 3 THEN "Temp Reviewer" 
      END, "lastUpdate" = "${now}" 
      WHERE id IN (1, 2, 3);
      `);
        await sequelize.query(`
      UPDATE ${schemaPrefix}"TierRoles" 
      SET name = CASE id 
        WHEN 1 THEN "Co-owner" 
        WHEN 2 THEN "Editor" 
        WHEN 3 THEN "Reviewer" 
      END, "lastUpdate" = "${now}" 
      WHERE id IN (1, 2, 3);
      `);
        await sequelize.query(`
      UPDATE ${schemaPrefix}"BoundaryRoles" 
      SET name = CASE id 
        WHEN 1 THEN "Temp Co-owner" 
        WHEN 2 THEN "Temp Editor" 
        WHEN 3 THEN "Temp Reviewer" 
      END, "lastUpdate" = "${now}" 
      WHERE id IN (1, 2, 3);
      `);
        await sequelize.query(`
      UPDATE ${schemaPrefix}"BoundaryRoles" 
      SET name = CASE id 
        WHEN 1 THEN "Co-owner" 
        WHEN 2 THEN "Editor" 
        WHEN 3 THEN "Reviewer" 
      END, "lastUpdate" = "${now}" 
      WHERE id IN (1, 2, 3);
      `);
    }
    catch (error) {
        console.log(error);
        throw error;
    }
};
