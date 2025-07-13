import * as fs from "fs/promises";
import * as path from "path";

export class DesignationsService {
  private rolesFilePath: string;

  constructor() {
    this.rolesFilePath = path.join(__dirname, "../../roles.json");
  }

  async readDesignations(): Promise<string[]> {
    try {
      const data = await fs.readFile(this.rolesFilePath, "utf-8");
      return JSON.parse(data) as string[];
    } catch (error) {
      console.error("Error reading designations:", error);
      return [];
    }
  }

  async saveDesignation(designation: string): Promise<void> {
    try {
      const designations = await this.readDesignations();
      if (!designations.includes(designation)) {
        designations.push(designation);
        await fs.writeFile(
          this.rolesFilePath,
          JSON.stringify(designations, null, 2)
        );
      }
    } catch (error) {
      console.error("Error saving designation:", error);
      throw error;
    }
  }
}
