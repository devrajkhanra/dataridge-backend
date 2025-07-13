import fs from "fs";
import path from "path";
import { FastifyInstance } from "fastify";
import { LaborRoles } from "../types/labor.types";

export class FileService {
  private rolesFilePath: string;

  constructor(fastify: FastifyInstance) {
    this.rolesFilePath = path.join(__dirname, "../labor_roles_equipment.json");
  }

  readDesignations(): string[] {
    try {
      const data = fs.readFileSync(this.rolesFilePath, "utf8");
      const json: LaborRoles = JSON.parse(data);
      return json.designations;
    } catch (err) {
      throw new Error(`Failed to read designations: ${(err as Error).message}`);
    }
  }

  saveDesignation(designation: string): void {
    try {
      const data = fs.readFileSync(this.rolesFilePath, "utf8");
      const json: LaborRoles = JSON.parse(data);
      if (!json.designations.includes(designation)) {
        json.designations.push(designation);
        fs.writeFileSync(
          this.rolesFilePath,
          JSON.stringify(json, null, 2),
          "utf8"
        );
      }
    } catch (err) {
      throw new Error(`Failed to save designation: ${(err as Error).message}`);
    }
  }
}
