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

  // Admin kullanıcıları onay kontrolünden muaf tut
  if (token.role !== "admin" && !token.isApproved) {
    return {
      error: true,
      status: 403,
      message: "Hesabınız henüz onaylanmamış. Lütfen admin onayını bekleyin.",
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

// Client-side auth check fonksiyonu (React bileşenlerinde kullanım için)
export function useAuthRedirect(
  session,
  status,
  router,
  requireApproval = true
) {
  if (status === "loading") return { loading: true };

  if (!session) {
    router.push("/auth/signin");
    return { redirect: true };
  }

  // Admin kullanıcıları onay kontrolünden muaf
  if (
    requireApproval &&
    session.user.role !== "admin" &&
    !session.user.isApproved
  ) {
    router.push("/account-pending");
    return { redirect: true };
  }

  return { loading: false, redirect: false };
}
