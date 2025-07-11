import Head from "next/head";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { useState } from "react";
import styles from "@/styles/Main.module.css";

export default function Home() {
  const { data: session, status, update } = useSession();
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  if (status === "loading") return <p>Loading...</p>;

  // Manuel yetkilendirme kontrolü
  const checkApprovalStatus = async () => {
    if (!session) return;

    setCheckingStatus(true);
    setStatusMessage(null);

    try {
      // Session'ı yenile
      await update();

      setStatusMessage({
        type: "success",
        message: "Yetki durumunuz güncellendi!",
      });

      // Mesajı bir süre sonra temizle
      setTimeout(() => {
        setStatusMessage(null);
      }, 3000);
    } catch (error) {
      setStatusMessage({
        type: "error",
        message: "Kontrol sırasında bir hata oluştu.",
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  return (
    <>
      <Head>
        <title>Product Management</title>
        <meta name="description" content="Product Management Sistemi" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className={styles.container}>
        <header className={styles.header}>
          <h1>Product Management</h1>

          <div style={{ marginTop: "20px" }}>
            {session ? (
              <div
                style={{
                  padding: "20px",
                  background: "#f8f9fa",
                  borderRadius: "8px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  textAlign: "center",
                  maxWidth: "500px",
                  margin: "0 auto",
                }}
              >
                {/* Kullanıcı Profil Alanı */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "15px",
                    marginBottom: "20px",
                  }}
                >
                  <div
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      background: "#6c757d",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                      fontWeight: "bold",
                      fontSize: "1.2rem",
                    }}
                  >
                    {session.user?.name?.charAt(0) ||
                      session.user?.email?.charAt(0) ||
                      "U"}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <h3
                      style={{
                        margin: 0,
                        fontSize: "1.3rem",
                        fontWeight: "600",
                        color: "#333",
                      }}
                    >
                      Hoş geldiniz!
                    </h3>
                    <p
                      style={{
                        margin: "5px 0 0 0",
                        fontSize: "1rem",
                        color: "#666",
                      }}
                    >
                      {session.user?.name || session.user?.email}
                    </p>
                  </div>
                </div>

                {/* Etiketler */}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      backgroundColor:
                        session.user?.role === "admin" ? "#4caf50" : "#ff9800",
                      color: "white",
                    }}
                  >
                    {session.user?.role === "admin" ? "Admin" : "Kullanıcı"}
                  </span>
                  <span
                    style={{
                      padding: "8px 16px",
                      borderRadius: "8px",
                      fontSize: "0.85rem",
                      fontWeight: "600",
                      backgroundColor: session.user?.isApproved
                        ? "#4caf50"
                        : "#f44336",
                      color: "white",
                    }}
                  >
                    {session.user?.isApproved ? "Onaylı" : "Onay Bekliyor"}
                  </span>
                </div>

                {/* Yetkilendirme Kontrol Butonu */}
                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <button
                    onClick={checkApprovalStatus}
                    disabled={checkingStatus}
                    style={{
                      padding: "12px 24px",
                      background: checkingStatus ? "#9e9e9e" : "#007bff",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      cursor: checkingStatus ? "not-allowed" : "pointer",
                      fontWeight: "600",
                      fontSize: "0.95rem",
                    }}
                  >
                    {checkingStatus ? (
                      <>Kontrol Ediliyor...</>
                    ) : (
                      <>Yetki Durumunu Kontrol Et</>
                    )}
                  </button>

                  {/* Durum Mesajı */}
                  {statusMessage && (
                    <div
                      style={{
                        marginTop: "15px",
                        padding: "10px 15px",
                        borderRadius: "6px",
                        backgroundColor:
                          statusMessage.type === "success"
                            ? "#d4edda"
                            : "#f8d7da",
                        border: `1px solid ${
                          statusMessage.type === "success"
                            ? "#c3e6cb"
                            : "#f5c6cb"
                        }`,
                        color:
                          statusMessage.type === "success"
                            ? "#155724"
                            : "#721c24",
                        fontSize: "0.9rem",
                        textAlign: "center",
                      }}
                    >
                      {statusMessage.message}
                    </div>
                  )}
                </div>

                {session.user?.role !== "admin" &&
                  !session.user?.isApproved && (
                    <div
                      style={{
                        backgroundColor: "#fff3cd",
                        border: "1px solid #ffeeba",
                        borderRadius: "8px",
                        padding: "12px",
                        marginBottom: "15px",
                        textAlign: "center",
                      }}
                    >
                      <p
                        style={{
                          margin: 0,
                          color: "#856404",
                          fontSize: "0.9rem",
                        }}
                      >
                        Hesabınız henüz onaylanmamış. Ürün ve kategori işlemleri
                        için admin onayı bekleniyor.
                      </p>
                    </div>
                  )}
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    marginTop: "18px",
                  }}
                >
                  <button
                    onClick={() => signOut()}
                    style={{
                      padding: "12px 24px",
                      backgroundColor: "#dc3545",
                      color: "white",
                      border: "none",
                      borderRadius: "12px",
                      cursor: "pointer",
                      fontSize: "1rem",
                      fontWeight: "600",
                      transition: "all 0.3s ease",
                      boxShadow: "0 4px 15px rgba(220, 53, 69, 0.3)",
                    }}
                    onMouseOver={(e) => {
                      e.target.style.transform = "translateY(-2px)";
                      e.target.style.boxShadow =
                        "0 6px 20px rgba(220, 53, 69, 0.4)";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.transform = "translateY(0)";
                      e.target.style.boxShadow =
                        "0 4px 15px rgba(220, 53, 69, 0.3)";
                    }}
                  >
                    Çıkış Yap
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "20px",
                  padding: "30px",
                  background: "linear-gradient(135deg, #f8f9fa, #e9ecef)",
                  borderRadius: "20px",
                  border: "1px solid #ddd",
                }}
              >
                <div style={{ textAlign: "center", marginBottom: "10px" }}>
                  <h2
                    style={{
                      margin: "0 0 10px 0",
                      color: "#333",
                      fontSize: "1.5rem",
                      fontWeight: "700",
                    }}
                  >
                    Hoş Geldiniz!
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      color: "#666",
                      fontSize: "1.1rem",
                    }}
                  >
                    Sistemi kullanmak için giriş yapın
                  </p>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "15px",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  <Link href="/auth/signin">
                    <button
                      style={{
                        padding: "14px 28px",
                        background: "linear-gradient(135deg, #667eea, #764ba2)",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.3)",
                        minWidth: "140px",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 6px 20px rgba(102, 126, 234, 0.4)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 4px 15px rgba(102, 126, 234, 0.3)";
                      }}
                    >
                      Giriş Yap
                    </button>
                  </Link>
                  <Link href="/auth/signup">
                    <button
                      style={{
                        padding: "14px 28px",
                        background: "linear-gradient(135deg, #28a745, #20c997)",
                        color: "white",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        transition: "all 0.3s ease",
                        boxShadow: "0 4px 15px rgba(40, 167, 69, 0.3)",
                        minWidth: "140px",
                      }}
                      onMouseOver={(e) => {
                        e.target.style.transform = "translateY(-2px)";
                        e.target.style.boxShadow =
                          "0 6px 20px rgba(40, 167, 69, 0.4)";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.transform = "translateY(0)";
                        e.target.style.boxShadow =
                          "0 4px 15px rgba(40, 167, 69, 0.3)";
                      }}
                    >
                      Kayıt Ol
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        {session && (
          <div className={styles.mainActions}>
            {(session.user?.role === "admin" || session.user?.isApproved) && (
              <>
                <Link href="/categories" className={styles.mainButton}>
                  <h2>Kategori Yönetimi</h2>
                  <p>Kategorileri yönet</p>
                </Link>
                <Link href="/products" className={styles.mainButton}>
                  <h2>Ürün Yönetimi</h2>
                  <p>Ürünleri yönet</p>
                </Link>
              </>
            )}
            {session.user?.role === "admin" && (
              <Link href="/admin/users" className={styles.mainButton}>
                <h2> Admin Panel</h2>
                <p>Kullanıcıları yönet</p>
              </Link>
            )}
            {session.user?.role !== "admin" && !session.user?.isApproved && (
              <div
                className={styles.mainButton}
                style={{
                  backgroundColor: "#f8f9fa",
                  border: "2px dashed #dee2e6",
                  cursor: "default",
                  opacity: 0.7,
                }}
              >
                <h2 style={{ color: "#6c757d" }}>Onay Bekleniyor</h2>
                <p style={{ color: "#6c757d" }}>
                  Admin onayı sonrası erişebileceksiniz
                </p>
              </div>
            )}
          </div>
        )}

        <style jsx>{`
          /* Basit CSS stilleri */
        `}</style>
      </div>
    </>
  );
}
