import { prisma } from '../../config/database';

export const getMyBusinessProfile = async (userId: number) =>
  prisma.businessProfile.findUnique({ where: { id: userId }, include: { projects: true, engagements: true } });

export const updateBusinessProfile = async (
  userId: number,
  data: Partial<{
    companyName: string;
    contactPersonName?: string;
    gstin?: string;
    websiteUrl?: string;
    industry?: string;
    sizeBucket?: string;
    logoUrl?: string;
    description?: string;
  }>
) =>
  prisma.businessProfile.update({ where: { id: userId }, data });

export const getBusinessPublic = async (id: number) =>
  prisma.businessProfile.findUnique({ where: { id }, include: { projects: true } });
