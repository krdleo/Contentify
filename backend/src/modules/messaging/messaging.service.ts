import { prisma } from '../../config/database';

export const createConversation = async (
  creatorId: number,
  participantIds: number[],
  projectId?: number,
  engagementId?: number
) => {
  const conversation = await prisma.conversation.create({
    data: {
      createdById: creatorId,
      projectId,
      engagementId,
      participants: {
        create: participantIds.map((id) => ({ userId: id }))
      }
    },
    include: { participants: true }
  });
  return conversation;
};

export const listUserConversations = (userId: number) =>
  prisma.conversation.findMany({
    where: { participants: { some: { userId } } },
    orderBy: { id: 'desc' },
    include: { participants: true }
  });

export const getConversation = (id: number, userId: number) =>
  prisma.conversation.findFirst({
    where: { id, participants: { some: { userId } } },
    include: { participants: true }
  });

export const listMessages = (conversationId: number, after?: string, page = 1, pageSize = 20) => {
  const skip = (page - 1) * pageSize;
  return prisma.message.findMany({
    where: { conversationId, ...(after ? { createdAt: { gt: new Date(after) } } : {}) },
    orderBy: { createdAt: 'asc' },
    skip,
    take: pageSize
  });
};

export const createMessage = async (conversationId: number, senderId: number, messageText: string, attachmentUrl?: string) =>
  prisma.message.create({ data: { conversationId, senderId, messageText, attachmentUrl } });
