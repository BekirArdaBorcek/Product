import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import Link from "next/link";
import axiosInstance from "../lib/axios";
import { useSession, signIn, signOut } from "next-auth/react";
import styles from "@/styles/Main.module.css";

export default function Admin() {
  const { data: session, status } = useSession();
  const [mounted, setMounted] = useState(false);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalCategories: 0,
    totalProducts: 0,
    adminUsers: 0,
    marketUsers: 0,
    regularUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
  });

  const isAdmin = session?.user?.role === "admin";

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchUserInfo = useCallback(async () => {
    try {
      if (!session?.user?.id) {
        return;
      }

      const response = await axiosInstance.get("/api/auth/me");
      setUserInfo(response.data);
      setError(null); // Clear any previous errors
    } catch (err) {
      if (err.response?.status === 401) {
        // Session'dan bilgileri al
        if (session?.user) {
          setUserInfo({
            id: session.user.id,
            email: session.user.email,
            name: session.user.name,
            role: session.user.role,
            active: session.user.active,
            provider: "session",
          });
        }
        setError("API kimlik doğrulama hatası - Session verisi kullanılıyor");
      } else {
        setError(`API hatası: ${err.response?.data?.error || err.message}`);
      }
    }
  }, [session]);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/user");
      setUsers(response.data);
    } catch (err) {
      setError(
        err.response?.data?.error || "Kullanıcılar yüklenirken hata oluştu"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const [usersRes, categoriesRes, productsRes] = await Promise.all([
        axiosInstance.get("/api/user"),
        axiosInstance.get("/api/category"),
        axiosInstance.get("/api/product"),
      ]);

      const userStats = usersRes.data.reduce(
        (acc, user) => {
          acc.totalUsers++;

          // Aktif/deaktif sayımı
          if (user.active) {
            acc.activeUsers++;
          } else {
            acc.inactiveUsers++;
          }

          // Rol sayımı
          switch (user.role) {
            case "admin":
              acc.adminUsers++;
              break;
            case "market":
              acc.marketUsers++;
              break;
            default:
              acc.regularUsers++;
          }
          return acc;
        },
        {
          totalUsers: 0,
          adminUsers: 0,
          marketUsers: 0,
          regularUsers: 0,
          activeUsers: 0,
          inactiveUsers: 0,
        }
      );

      setStats({
        ...userStats,
        totalCategories: categoriesRes.data.length,
        totalProducts: productsRes.data.length,
      });
    } catch (err) {
      // Stats fetch error - silent fail
    }
  }, []);

  useEffect(() => {
    if (status === "loading") {
      return;
    }

    if (status === "authenticated" && session) {
      fetchUserInfo();

      if (isAdmin) {
        fetchUsers();
        fetchStats();
      }
    }
  }, [status, fetchUserInfo, fetchUsers, fetchStats, session, isAdmin]);

  // Admin durumu değiştiğinde data fetch et
  useEffect(() => {
    if (status === "authenticated" && session && isAdmin) {
      fetchUsers();
      fetchStats();
    }
  }, [isAdmin, fetchUsers, fetchStats]);

  const handleRoleChange = async (userId, newRole) => {
    if (!session || !isAdmin) {
      setError("Bu işlem için admin yetkisi gerekli");
      return;
    }

    try {
      await axiosInstance.put(`/api/user/${userId}`, { role: newRole });
      fetchUsers(); // Refresh users list
      fetchStats(); // Refresh stats
      setError(null); // Clear any existing errors
    } catch (err) {
      setError(err.response?.data?.error || "Rol güncelleme hatası");
    }
  };

  const handleActiveToggle = async (userId, currentActive) => {
    if (!session || !isAdmin) {
      setError("Bu işlem için admin yetkisi gerekli");
      return;
    }

    const action = currentActive ? "deaktif" : "aktif";
    if (
      !confirm(`Bu kullanıcıyı ${action} etmek istediğinizden emin misiniz?`)
    ) {
      return;
    }

    try {
      await axiosInstance.put(`/api/user/${userId}`, {
        active: !currentActive,
      });
      fetchUsers(); // Refresh users list
      fetchStats(); // Refresh stats
      setError(null); // Clear any existing errors
    } catch (err) {
      setError(err.response?.data?.error || "Durum güncelleme hatası");
    }
  };

  if (!mounted || status === "loading") {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Yükleniyor...</div>
      </div>
    );
  }

  if (status === "unauthenticated" || !session) {
    return (
      <div className={styles.container}>
        <div className={styles.authRequired}>
          <h1>Admin Paneli</h1>
          <p>Bu sayfaya erişim için giriş yapmanız gerekiyor.</p>
          <div style={{ marginTop: "1rem" }}>
            <Link href="/login" className={styles.signInButton}>
              Giriş Yap
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className={styles.container}>
        <div className={styles.accessDenied}>
          <h1>Erişim Engellendi</h1>
          <p>Bu sayfaya erişim yetkiniz yok. Admin rolü gerekli.</p>
          <p>Mevcut rolünüz: {session.user.role}</p>
          <Link href="/" className={styles.navButton}>
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Admin Paneli - Product Management</title>
        <meta name="description" content="Admin yönetim paneli" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        {error && (
          <div className={styles.error}>
            {error}
            <button
              onClick={() => setError(null)}
              style={{
                marginLeft: "1rem",
                background: "transparent",
                border: "none",
                color: "#c53030",
                cursor: "pointer",
              }}
            >
              ✕
            </button>
          </div>
        )}

        <header className={styles.header}>
          <h1>Admin Paneli</h1>
          <div className={styles.headerActions}>
            <Link href="/" className={styles.navButton}>
              Ana Sayfa
            </Link>
            <Link href="/products" className={styles.navButton}>
              Ürünler
            </Link>
            <Link href="/categories" className={styles.navButton}>
              Kategoriler
            </Link>
            <span className={styles.userInfo}>
              Hoş geldin, {session.user.name || session.user.email} (
              {session.user.role})
            </span>
            <button onClick={() => signOut()} className={styles.signOutButton}>
              Çıkış Yap
            </button>
          </div>
        </header>

        {/* İstatistikler */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <h3>Toplam Kullanıcı</h3>
            <div className={styles.statNumber}>{stats.totalUsers}</div>
          </div>
          <div className={styles.statCard}>
            <h3>Aktif Kullanıcı</h3>
            <div className={styles.statNumber}>{stats.activeUsers}</div>
          </div>
          <div className={styles.statCard}>
            <h3>Deaktif Kullanıcı</h3>
            <div className={styles.statNumber}>{stats.inactiveUsers}</div>
          </div>
          <div className={styles.statCard}>
            <h3>Toplam Kategori</h3>
            <div className={styles.statNumber}>{stats.totalCategories}</div>
          </div>
          <div className={styles.statCard}>
            <h3>Toplam Ürün</h3>
            <div className={styles.statNumber}>{stats.totalProducts}</div>
          </div>
          <div className={styles.statCard}>
            <h3>Admin Kullanıcı</h3>
            <div className={styles.statNumber}>{stats.adminUsers}</div>
          </div>
          <div className={styles.statCard}>
            <h3>Market Kullanıcı</h3>
            <div className={styles.statNumber}>{stats.marketUsers}</div>
          </div>
          <div className={styles.statCard}>
            <h3>Normal Kullanıcı</h3>
            <div className={styles.statNumber}>{stats.regularUsers}</div>
          </div>
        </div>

        {/* Kullanıcı Yönetimi */}
        <div className={styles.section}>
          <h2>Kullanıcı Yönetimi</h2>
          {loading ? (
            <div className={styles.loading}>Kullanıcılar yükleniyor...</div>
          ) : (
            <div className={styles.userTable}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>İsim</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Durum</th>
                    <th>Provider</th>
                    <th>Kayıt Tarihi</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      className={!user.active ? styles.inactiveUser : ""}
                    >
                      <td>{user.name || "-"}</td>
                      <td>{user.email}</td>
                      <td>
                        <select
                          value={user.role}
                          onChange={(e) =>
                            handleRoleChange(user._id, e.target.value)
                          }
                          className={styles.roleSelect}
                          disabled={!user.active}
                        >
                          <option value="user">User</option>
                          <option value="market">Market</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td>
                        <button
                          onClick={() =>
                            handleActiveToggle(user._id, user.active)
                          }
                          className={
                            user.active
                              ? styles.activeButton
                              : styles.inactiveButton
                          }
                        >
                          {user.active ? "Aktif" : "Deaktif"}
                        </button>
                      </td>
                      <td>{user.provider || "credentials"}</td>
                      <td>
                        {user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString("tr-TR")
                          : "-"}
                      </td>
                      <td>
                        <div className={styles.actionButtons}>
                          <button
                            onClick={() =>
                              handleActiveToggle(user._id, user.active)
                            }
                            className={
                              user.active
                                ? styles.deactivateButton
                                : styles.activateButton
                            }
                          >
                            {user.active ? "Deaktif Et" : "Aktif Et"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
