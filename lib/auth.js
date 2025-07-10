import { getToken } from "next-auth/jwt";
import User from "../model/UserModel";
import DBConnect from "../lib/database";

// Kullanıcı bilgisini token'dan al
export async function getUserFromToken(req) {
  try {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    return token
      ? { id: token.id, email: token.email, role: token.role }
      : null;
  } catch (error) {
    console.error("Token parse error:", error);
    return null;
  }
}

// Rol kontrolü middleware'i
export async function checkRole(req, allowedRoles = []) {
  try {
    // JWT token'ı al
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

    if (!token) {
      return { error: "Oturum açmanız gerekiyor", status: 401 };
    }

    await DBConnect();
    const user = await User.findById(token.id);

    if (!user) {
      return { error: "Kullanıcı bulunamadı", status: 404 };
    }

    // Aktif kullanıcı kontrolü
    if (!user.active) {
      return {
        error: "Hesabınız deaktif edilmiş. Admin ile iletişime geçin.",
        status: 403,
      };
    }

    // Rol kontrolü
    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      return {
        error: `Bu işlem için ${allowedRoles.join(" veya ")} rolü gerekiyor`,
        status: 403,
      };
    }

    return { user, success: true };
  } catch (error) {
    console.error("Role check error:", error);
    return { error: "Yetkilendirme hatası", status: 500 };
  }
}

// Admin kontrolü
export async function requireAdmin(req) {
  return await checkRole(req, ["admin"]);
}

// Market veya Admin kontrolü
export async function requireMarketOrAdmin(req) {
  return await checkRole(req, ["admin", "market"]);
}

// Giriş yapmış kullanıcı kontrolü
export async function requireAuth(req) {
  return await checkRole(req, []); // Sadece giriş yapmış olması yeterli
}
