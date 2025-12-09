import { prisma } from '../../config/database';

export const listSkills = async () => prisma.skill.findMany();

export const replaceFreelancerSkills = async (userId: number, skillIds: number[]) => {
  await prisma.freelancerSkill.deleteMany({ where: { freelancerId: userId } });
  const data = skillIds.map((skillId) => ({ freelancerId: userId, skillId }));
  return prisma.freelancerSkill.createMany({ data });
};
