import { CourseExporter } from '../courses/export';

export class ExportJob {
  static async start(versionId: string): Promise<string> {
    return CourseExporter.initiateExport(versionId);
  }
}
