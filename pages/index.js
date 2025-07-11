import Head from "next/head";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import styles from "@/styles/Main.module.css";

export default function Home() {
  const { data: session, status } = useSession();

  if (status === "loading") return <p>Loading...</p>;

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
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "15px",
                  padding: "20px",
                  background: "linear-gradient(135deg, #e8f5e8, #f0f8ff)",
                  borderRadius: "15px",
                  border: "1px solid #ddd",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontSize: "1.1rem",
                    color: "#333",
                    fontWeight: "600",
                  }}
                >
                  Hoş geldiniz, {session.user?.name || session.user?.email}!
                  {session.user?.role === "admin" && (
                    <span
                      style={{
                        marginLeft: "10px",
                        padding: "4px 8px",
                        backgroundColor: "#28a745",
                        color: "white",
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                      }}
                    >
                      Admin
                    </span>
                  )}
                </p>
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    flexWrap: "wrap",
                    justifyContent: "center",
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
            <Link href="/categories" className={styles.mainButton}>
              <h2>Kategori Yönetimi</h2>
              <p>Kategorileri yönet</p>
            </Link>
            <Link href="/products" className={styles.mainButton}>
              <h2>Ürün Yönetimi</h2>
              <p>Ürünleri yönet</p>
            </Link>
            {session.user?.role === "admin" && (
              <Link href="/admin/users" className={styles.mainButton}>
                <h2> Admin Panel</h2>
                <p>Kullanıcıları yönet</p>
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
