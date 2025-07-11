import { getToken } from "next-auth/jwt";

export async function requireAuth(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    return {
      error: true,
      status: 401,
      message: "Giriş yapmanız gerekiyor.",
    };
  }

  return {
    error: false,
    user: token,
  };
}

export async function requireAdmin(req) {
  const authResult = await requireAuth(req);

  if (authResult.error) {
    return authResult;
  }

  if (authResult.user.role !== "admin") {
    return {
      error: true,
      status: 403,
      message: "Bu işlem için admin yetkisi gerekiyor.",
    };
  }

  return {
    error: false,
    user: authResult.user,
  };
}

export async function requireOwnershipOrAdmin(req, userId) {
  const authResult = await requireAuth(req);

  if (authResult.error) {
    return authResult;
  }

  const isOwner = authResult.user.id === userId;
  const isAdmin = authResult.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return {
      error: true,
      status: 403,
      message: "Bu veriye erişim yetkiniz yok.",
    };
  }

  return {
    error: false,
    user: authResult.user,
    isOwner,
    isAdmin,
  };
}
