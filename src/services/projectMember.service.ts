import { ProjectMemberRepository } from "../repositories/projectMember.repo";
import { UserRepository } from "../repositories/user.repo";
import { ProjectRepository } from "../repositories/project.repo";

export const addMember = async (
  projectId: string,
  userId: string | undefined,
  email: string | undefined,
  requesterId: string,
) => {
  const project = await ProjectRepository.findByIdForAdmin(projectId);
  if (!project) throw { status: 404, message: "Project not found" };

  let resolvedUserId = userId;

  if (!resolvedUserId && email) {
    const user = await UserRepository.findByEmail(email);
    if (!user)
      throw { status: 404, message: "No user found with that email" };
    resolvedUserId = user.id;
  }

  if (!resolvedUserId) {
    throw { status: 400, message: "Either userId or email is required" };
  }

  const user = await UserRepository.findById(resolvedUserId);
  if (!user) throw { status: 404, message: "User not found" };

  const existing = await ProjectMemberRepository.findByProjectAndUser(
    projectId,
    resolvedUserId,
  );
  if (existing)
    throw { status: 409, message: "User is already a member of this project" };

  const member = ProjectMemberRepository.create({
    projectId,
    userId: resolvedUserId,
  });
  return ProjectMemberRepository.save(member);
};

export const removeMember = async (
  projectId: string,
  userId: string,
) => {
  const project = await ProjectRepository.findByIdForAdmin(projectId);
  if (!project) throw { status: 404, message: "Project not found" };

  const existing = await ProjectMemberRepository.findByProjectAndUser(
    projectId,
    userId,
  );
  if (!existing)
    throw { status: 404, message: "User is not a member of this project" };

  await ProjectMemberRepository.remove(existing);
  return { message: "Member removed successfully" };
};

export const getProjectMembers = async (projectId: string) => {
  const project = await ProjectRepository.findByIdForAdmin(projectId);
  if (!project) throw { status: 404, message: "Project not found" };

  return ProjectMemberRepository.findByProject(projectId);
};
