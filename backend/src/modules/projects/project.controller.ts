import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authMiddleware';
import { failure, success } from '../../utils/response';
import { createProject, getProject, listMyProjects, listProjects } from './project.service';

export const createProjectHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  try {
    const project = await createProject(req.user.id, req.body);
    return success(res, project, 201);
  } catch (error: any) {
    if (error?.message === 'INVALID_DEADLINE_DATE') {
      return failure(res, 'INVALID_DEADLINE_DATE', 'Invalid deadline date format', undefined, 400);
    }
    return failure(res, 'INTERNAL_ERROR', 'Unable to create project', undefined, 500);
  }
};

export const listProjectsHandler = async (req: AuthenticatedRequest, res: Response) => {
  const page = Number(req.query.page) || 1;
  const pageSize = Number(req.query.pageSize) || 20;
  const { items, total } = await listProjects({ page, pageSize, category: req.query.category as string | undefined });
  return success(res, { items, page, pageSize, total });
};

export const getProjectHandler = async (req: AuthenticatedRequest, res: Response) => {
  const project = await getProject(Number(req.params.id));
  if (!project) return failure(res, 'NOT_FOUND', 'Project not found', undefined, 404);
  return success(res, project);
};

export const listMyProjectsHandler = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) return failure(res, 'UNAUTHORIZED', 'Login required', undefined, 401);
  const projects = await listMyProjects(req.user.id);
  return success(res, projects);
};
