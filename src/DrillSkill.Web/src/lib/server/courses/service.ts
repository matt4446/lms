import { prisma } from '$lib/server/db';
import type { Course, CourseVersion, VersionStatus, Prisma } from '@prisma/client';

export type CreateCourseInput = {
  title: string;
  description?: string;
  ownerId: string;
};

export type UpdateCourseVersionInput = {
  title?: string;
  description?: string;
  coverImage?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  content?: Prisma.InputJsonValue;
};

export class CourseService {
  
  async createCourse(input: CreateCourseInput) {
    return await prisma.$transaction(async (tx) => {
      const course = await tx.course.create({
        data: {
          title: input.title,
          description: input.description,
          ownerId: input.ownerId,
          versions: {
            create: {
              versionNumber: 1,
              title: input.title,
              description: input.description,
              status: 'DRAFT'
            }
          }
        },
        include: {
          versions: true
        }
      });
      return course;
    });
  }

  async getCourse(id: string) {
    return await prisma.course.findUnique({
      where: { id },
      include: {
        versions: {
          orderBy: { versionNumber: 'desc' }
        },
        publishedVersion: true
      }
    });
  }

  async listCourses(ownerId: string) {
    return await prisma.course.findMany({
      where: { ownerId },
      orderBy: { updatedAt: 'desc' },
      include: {
        publishedVersion: true,
        versions: {
          where: { status: 'DRAFT' },
          take: 1
        }
      }
    });
  }

  async getCourseVersion(courseId: string, versionNumber: number) {
    return await prisma.courseVersion.findUnique({
      where: {
        courseId_versionNumber: {
          courseId,
          versionNumber
        }
      }
    });
  }

  async updateCourseVersion(versionId: string, input: UpdateCourseVersionInput) {
    return await prisma.courseVersion.update({
      where: { id: versionId },
      data: {
        title: input.title,
        description: input.description,
        coverImage: input.coverImage,
        startDate: input.startDate,
        endDate: input.endDate,
        content: input.content ?? undefined
      }
    });
  }

  async publishVersion(courseId: string, versionId: string) {
    return await prisma.$transaction(async (tx) => {
      // 1. Update version status
      const version = await tx.courseVersion.update({
        where: { id: versionId },
        data: { status: 'PUBLISHED' }
      });

      // 2. Update course published version
      await tx.course.update({
        where: { id: courseId },
        data: { 
          published: true,
          publishedVersionId: version.id
        }
      });

      return version;
    });
  }

  async createDraftFromPublished(courseId: string) {
    // TODO: Implement
    throw new Error('Not implemented');
  }

  async deleteCourse(id: string) {
    return await prisma.course.delete({
      where: { id }
    });
  }
}

export const courseService = new CourseService();
