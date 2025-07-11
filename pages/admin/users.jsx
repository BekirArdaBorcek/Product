import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { useAuthRedirect } from "../../middleware/auth";

// Utility fonksiyonlar
const getProviderDisplay = (provider) => {
  const providers = {
    google: "Google",
    github: "GitHub",
    credentials: "Email",
  };
  return providers[provider] || provider;
};

const getProviderColor = (provider) => {
  const colors = {
    google: "#ea4335",
    github: "#333",
    credentials: "#007bff",
  };
  return colors[provider] || "#007bff";
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return {
    date: date.toLocaleDateString("tr-TR"),
    time: date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
};

export default function AdminPanel() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  useEffect(() => {
    const authCheck = useAuthRedirect(session, status, router, false); // Admin sayfası için onay kontrolü yok
    if (authCheck.loading || authCheck.redirect) return;

    if (session.user.role !== "admin") {
      router.push("/");
      return;
    }

    fetchUsers();
  }, [session, status, router]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/user-stats");
      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      } else {
        setError(data.error || "Kullanıcılar yüklenirken hata oluştu");
      }
    } catch (error) {
      setError("Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const updateUserRole = useCallback(async (userId, newRole) => {
    setUpdating(userId);
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, role: newRole } : user
          )
        );

        setError("");
      } else {
        setError(data.error || "Rol güncellenirken hata oluştu");
      }
    } catch (error) {
      setError("Bir hata oluştu");
    } finally {
      setUpdating(null);
    }
  }, []);

  const updateUserApproval = useCallback(async (userId, isApproved) => {
    setUpdating(userId);
    try {
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, isApproved }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user._id === userId ? { ...user, isApproved } : user
          )
        );

        setError("");
      } else {
        setError(data.error || "Onay durumu güncellenirken hata oluştu");
      }
    } catch (error) {
      setError("Bir hata oluştu");
    } finally {
      setUpdating(null);
    }
  }, []);

  const deleteUser = async (userId) => {
    if (!confirm("Bu kullanıcıyı silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch("/api/user", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (response.ok) {
        setUsers(users.filter((user) => user._id !== userId));
      } else {
        setError(data.error || "Kullanıcı silinirken hata oluştu");
      }
    } catch (error) {
      setError("Bir hata oluştu");
    }
  };

  if (status === "loading" || loading) {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!session || session.user.role !== "admin") {
    return null;
  }

  return (
    <>
      <Head>
        <title>Admin Panel - Kullanıcı Yönetimi</title>
        <style jsx>{`
          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </Head>

      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "20px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
            padding: "25px",
            backgroundColor: "#f8f9fa",
            borderRadius: "15px",
            color: "#2c3e50",
            boxShadow: "0 4px 15px rgba(0, 0, 0, 0.1)",
            border: "1px solid #e9ecef",
          }}
        >
          <div>
            <h1
              style={{
                margin: "0 0 5px 0",
                fontSize: "2rem",
                fontWeight: "700",
              }}
            >
              Admin Panel
            </h1>
            <p
              style={{
                margin: 0,
                opacity: 0.9,
                fontSize: "1rem",
              }}
            >
              Kullanıcı yönetimi ve rol düzenleme
            </p>
          </div>
          <Link href="/">
            <button
              style={{
                padding: "12px 24px",
                backgroundColor: "#fff",
                color: "#2c3e50",
                border: "2px solid #e9ecef",
                borderRadius: "10px",
                cursor: "pointer",
                fontWeight: "600",
              }}
            >
              Ana Sayfaya Dön
            </button>
          </Link>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: "#f8d7da",
              color: "#721c24",
              padding: "20px",
              borderRadius: "12px",
              marginBottom: "25px",
              border: "1px solid #f5c6cb",
              display: "flex",
              alignItems: "center",
              gap: "15px",
            }}
          >
            <div style={{ fontSize: "1.5rem" }}>⚠️</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: "600", marginBottom: "5px" }}>
                Hata!
              </div>
              <div style={{ opacity: 0.9 }}>{error}</div>
            </div>
            <button
              onClick={() => setError("")}
              style={{
                backgroundColor: "#721c24",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                color: "white",
                fontSize: "18px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ×
            </button>
          </div>
        )}

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "15px",
            padding: "30px",
            boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
            border: "1px solid #e9ecef",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "25px",
              paddingBottom: "15px",
              borderBottom: "2px solid #f8f9fa",
            }}
          >
            <h2
              style={{
                margin: 0,
                color: "#2c3e50",
                fontSize: "1.5rem",
                fontWeight: "600",
              }}
            >
              Kullanıcı Listesi
              <span
                style={{
                  marginLeft: "10px",
                  padding: "4px 12px",
                  backgroundColor: "#667eea",
                  color: "white",
                  borderRadius: "20px",
                  fontSize: "0.8rem",
                  fontWeight: "500",
                }}
              >
                {users.length}
              </span>
            </h2>
          </div>

          {users.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "60px 20px",
                color: "#6c757d",
                backgroundColor: "#f8f9fa",
                borderRadius: "10px",
                border: "2px dashed #dee2e6",
              }}
            >
              <div style={{ fontSize: "3rem", marginBottom: "15px" }}>👤</div>
              <p style={{ fontSize: "1.1rem", margin: 0 }}>
                Henüz kullanıcı yok.
              </p>
            </div>
          ) : (
            <div
              style={{
                overflowX: "auto",
                borderRadius: "12px",
                border: "1px solid #e9ecef",
                backgroundColor: "#fff",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.95rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      backgroundColor: "#f8f9fa",
                      color: "#2c3e50c6",
                      borderBottom: "2px solid #e9ecef",
                    }}
                  >
                    <th
                      style={{
                        padding: "18px 15px",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Kullanıcı
                    </th>
                    <th
                      style={{
                        padding: "18px 15px",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Email
                    </th>
                    <th
                      style={{
                        padding: "18px 15px",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Rol
                    </th>
                    <th
                      style={{
                        padding: "18px 15px",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Onay Durumu
                    </th>
                    <th
                      style={{
                        padding: "18px 15px",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Provider
                    </th>
                    <th
                      style={{
                        padding: "18px 15px",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Kategoriler
                    </th>
                    <th
                      style={{
                        padding: "18px 15px",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Ürünler
                    </th>
                    <th
                      style={{
                        padding: "18px 15px",
                        textAlign: "left",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      Kayıt Tarihi
                    </th>
                    <th
                      style={{
                        padding: "18px 15px",
                        textAlign: "center",
                        fontWeight: "600",
                        fontSize: "0.9rem",
                        letterSpacing: "0.5px",
                      }}
                    >
                      İşlemler
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, index) => (
                    <tr
                      key={user._id}
                      style={{
                        backgroundColor:
                          index % 2 === 0 ? "#ffffff" : "#f8f9fa",
                        borderBottom: "1px solid #e9ecef",
                      }}
                    >
                      <td
                        style={{
                          padding: "18px 15px",
                          borderRight: "1px solid #f0f0f0",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "12px",
                          }}
                        >
                          <div
                            style={{
                              width: "40px",
                              height: "40px",
                              borderRadius: "50%",
                              background:
                                "linear-gradient(135deg, #667eea, #764ba2)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontWeight: "600",
                              fontSize: "1.1rem",
                            }}
                          >
                            {(user.name || user.email || "U")
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                          <div>
                            <div
                              style={{
                                fontWeight: "600",
                                color: "#2c3e50",
                                marginBottom: "2px",
                              }}
                            >
                              {user.name || "Belirsiz"}
                            </div>
                            {user._id === session.user.id && (
                              <span
                                style={{
                                  fontSize: "0.7rem",
                                  backgroundColor: "#17a2b8",
                                  color: "white",
                                  padding: "2px 6px",
                                  borderRadius: "10px",
                                }}
                              >
                                Siz
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "18px 15px",
                          color: "#495057",
                          borderRight: "1px solid #f0f0f0",
                        }}
                      >
                        <div
                          style={{
                            fontFamily: "monospace",
                            fontSize: "0.9rem",
                            color: "#6c757d",
                          }}
                        >
                          {user.email}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "18px 15px",
                          borderRight: "1px solid #f0f0f0",
                        }}
                      >
                        <select
                          value={user.role}
                          onChange={(e) =>
                            updateUserRole(user._id, e.target.value)
                          }
                          disabled={
                            updating === user._id ||
                            user._id === session.user.id
                          }
                          style={{
                            padding: "8px 12px",
                            border: "2px solid #e9ecef",
                            borderRadius: "8px",
                            backgroundColor:
                              user.role === "admin" ? "#d4edda" : "#fff3cd",
                            color:
                              user.role === "admin" ? "#155724" : "#856404",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                            cursor:
                              user._id === session.user.id
                                ? "not-allowed"
                                : "pointer",
                            transition: "all 0.3s ease",
                            minWidth: "100px",
                          }}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                        </select>
                        {updating === user._id && (
                          <div
                            style={{
                              display: "inline-block",
                              marginLeft: "8px",
                              width: "16px",
                              height: "16px",
                              border: "2px solid #f3f3f3",
                              borderTop: "2px solid #667eea",
                              borderRadius: "50%",
                              animation: "spin 1s linear infinite",
                            }}
                          />
                        )}
                      </td>
                      <td
                        style={{
                          padding: "18px 15px",
                          borderRight: "1px solid #f0f0f0",
                        }}
                      >
                        <select
                          value={user.isApproved ? "approved" : "pending"}
                          onChange={(e) =>
                            updateUserApproval(
                              user._id,
                              e.target.value === "approved"
                            )
                          }
                          disabled={
                            updating === user._id ||
                            user._id === session.user.id ||
                            user.role === "admin"
                          }
                          style={{
                            padding: "8px 12px",
                            border: "2px solid #e9ecef",
                            borderRadius: "8px",
                            backgroundColor: user.isApproved
                              ? "#d4edda"
                              : "#fff3cd",
                            color: user.isApproved ? "#155724" : "#856404",
                            fontWeight: "600",
                            fontSize: "0.85rem",
                            cursor:
                              user._id === session.user.id ||
                              user.role === "admin"
                                ? "not-allowed"
                                : "pointer",
                            transition: "all 0.3s ease",
                            minWidth: "120px",
                          }}
                        >
                          <option value="pending">Onay Bekliyor</option>
                          <option value="approved">Onaylı</option>
                        </select>
                        {updating === user._id && (
                          <div
                            style={{
                              display: "inline-block",
                              marginLeft: "8px",
                              width: "16px",
                              height: "16px",
                              border: "2px solid #f3f3f3",
                              borderTop: "2px solid #667eea",
                              borderRadius: "50%",
                              animation: "spin 1s linear infinite",
                            }}
                          />
                        )}
                      </td>
                      <td
                        style={{
                          padding: "18px 15px",
                          borderRight: "1px solid #f0f0f0",
                        }}
                      >
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "20px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            backgroundColor: getProviderColor(user.provider),
                            color: "white",
                          }}
                        >
                          {getProviderDisplay(user.provider)}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "18px 15px",
                          borderRight: "1px solid #f0f0f0",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "15px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            backgroundColor: "#e3f2fd",
                            color: "#1976d2",
                          }}
                        >
                          {user.categoryCount || 0}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "18px 15px",
                          borderRight: "1px solid #f0f0f0",
                          textAlign: "center",
                        }}
                      >
                        <span
                          style={{
                            padding: "6px 12px",
                            borderRadius: "15px",
                            fontSize: "0.8rem",
                            fontWeight: "600",
                            backgroundColor: "#f3e5f5",
                            color: "#7b1fa2",
                          }}
                        >
                          {user.productCount || 0}
                        </span>
                      </td>
                      <td
                        style={{
                          padding: "18px 15px",
                          color: "#6c757d",
                          borderRight: "1px solid #f0f0f0",
                        }}
                      >
                        <div style={{ fontSize: "0.9rem" }}>
                          {formatDate(user.createdAt).date}
                        </div>
                        <div
                          style={{
                            fontSize: "0.75rem",
                            color: "#adb5bd",
                            marginTop: "2px",
                          }}
                        >
                          {formatDate(user.createdAt).time}
                        </div>
                      </td>
                      <td
                        style={{
                          padding: "18px 15px",
                          textAlign: "center",
                        }}
                      >
                        {user._id !== session.user.id ? (
                          <button
                            onClick={() => deleteUser(user._id)}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#dc3545",
                              color: "white",
                              border: "none",
                              borderRadius: "8px",
                              cursor: "pointer",
                              fontSize: "0.85rem",
                              fontWeight: "600",
                              transition: "all 0.3s ease",
                            }}
                            onMouseEnter={(e) => {
                              e.target.style.backgroundColor = "#c82333";
                              e.target.style.transform = "translateY(-2px)";
                            }}
                            onMouseLeave={(e) => {
                              e.target.style.backgroundColor = "#dc3545";
                              e.target.style.transform = "translateY(0)";
                            }}
                          >
                            Sil
                          </button>
                        ) : (
                          <span
                            style={{
                              color: "#6c757d",
                              fontSize: "0.8rem",
                              fontStyle: "italic",
                            }}
                          >
                            -
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div
          style={{
            marginTop: "20px",
            padding: "15px",
            backgroundColor: "#e9ecef",
            borderRadius: "5px",
            fontSize: "14px",
            color: "#6c757d",
          }}
        >
          <strong>Not:</strong> Kendi rolünüzü değiştiremez veya kendi
          hesabınızı silemezsiniz. Yeni kullanıcılar varsayılan olarak onaysız
          olarak kaydolur ve admin onayı bekler. Admin kullanıcıları onay
          kontrolünden muaftır.
        </div>
      </div>
    </>
  );
}
