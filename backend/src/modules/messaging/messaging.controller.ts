import { Response } from 'express';
import { z } from 'zod';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { failure, success } from '../../utils/response';
import { createConversation, createMessage, getConversation, listMessages, listUserConversations } from './messaging.service';
import { createNotification } from '../notifications/notification.service';

const conversationSchema = z.object({
  participantIds: z.array(z.number().int()).min(1),
  projectId: z.number().int().optional(),
  engagementId: z.number().int().optional()
});

const messageSchema = z.object({
  messageText: z.string().min(1),
  attachmentUrl: z.string().url().optional()
});

export const createConversationHandler = async (req: AuthenticatedRequest, res: Response) => {
  const parsed = conversationSchema.safeParse(req.body);
  if (!parsed.success) return failure(res, 'VALIDATION_ERROR', 'Invalid request body', undefined, 422);
  const userId = req.user?.id;
  if (!userId) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const participants = Array.from(new Set([...parsed.data.participantIds, userId]));
  const conversation = await createConversation(userId, participants, parsed.data.projectId, parsed.data.engagementId);
  return success(res, conversation, 201);
};

export const listConversationsHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const conversations = await listUserConversations(req.user.id);
  return success(res, conversations);
};

export const getConversationHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const conversation = await getConversation(Number(req.params.id), req.user.id);
  if (!conversation) return failure(res, 'NOT_FOUND', 'Conversation not found', undefined, 404);
  return success(res, conversation);
};

export const listMessagesHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const { after, page = '1', pageSize = '20' } = req.query;
  const conversationId = Number(req.params.id);
  const messages = await listMessages(conversationId, after as string | undefined, Number(page), Number(pageSize));
  return success(res, { items: messages, page: Number(page), pageSize: Number(pageSize) });
};

export const sendMessageHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const parsed = messageSchema.safeParse(req.body);
  if (!parsed.success) return failure(res, 'VALIDATION_ERROR', 'Invalid request body', undefined, 422);
  const conversation = await getConversation(Number(req.params.id), req.user.id);
  if (!conversation) return failure(res, 'NOT_FOUND', 'Conversation not found', undefined, 404);
  const message = await createMessage(Number(req.params.id), req.user.id, parsed.data.messageText, parsed.data.attachmentUrl);
  await Promise.all(
    conversation.participants
      .filter((p) => p.userId !== req.user!.id)
      .map((p) => createNotification(p.userId, 'MESSAGE_RECEIVED', { conversationId: conversation.id, messageId: message.id }))
  );
  return success(res, message, 201);
};
