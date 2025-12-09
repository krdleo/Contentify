import { prisma } from '../../config/database';

export const listNotifications = async (userId: number) => prisma.notification.findMany({ where: { userId } });
export const markNotificationRead = async (userId: number, id: number) =>
  prisma.notification.update({ where: { id }, data: { isRead: true } });
export const markAllRead = async (userId: number) =>
  prisma.notification.updateMany({ where: { userId }, data: { isRead: true } });
