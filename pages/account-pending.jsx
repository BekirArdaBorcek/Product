import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Head from "next/head";

export default function AccountPending() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    // Eğer kullanıcı admin ise veya onaylı ise ana sayfaya yönlendir
    if (session.user.role === "admin" || session.user.isApproved) {
      router.push("/");
      return;
    }
  }, [session, status, router]);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  if (status === "loading") {
    return (
      <div style={{ textAlign: "center", padding: "50px" }}>
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Hesap Onay Bekliyor</title>
      </Head>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#f8f9fa",
          fontFamily: "'Inter', sans-serif",
        }}
      >
        <div
          style={{
            maxWidth: "500px",
            width: "100%",
            margin: "0 20px",
            padding: "40px",
            backgroundColor: "white",
            borderRadius: "15px",
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              margin: "0 auto 30px",
              backgroundColor: "#fff3cd",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "2.5rem",
            }}
          >
            ⏳
          </div>

          <h1
            style={{
              fontSize: "1.8rem",
              fontWeight: "700",
              color: "#2c3e50",
              marginBottom: "15px",
            }}
          >
            Hesabınız Onay Bekliyor
          </h1>

          <p
            style={{
              color: "#6c757d",
              fontSize: "1.1rem",
              lineHeight: "1.6",
              marginBottom: "30px",
            }}
          >
            Merhaba{" "}
            <strong>{session?.user?.name || session?.user?.email}</strong>!
            <br />
            Hesabınız başarıyla oluşturuldu ancak henüz admin onayı bekleniyor.
            Onay aldıktan sonra tüm özelliklere erişebileceksiniz.
          </p>

          <div
            style={{
              backgroundColor: "#e7f3ff",
              border: "1px solid #b8daff",
              borderRadius: "10px",
              padding: "20px",
              marginBottom: "30px",
            }}
          >
            <p
              style={{
                color: "#004085",
                fontSize: "0.95rem",
                margin: 0,
                lineHeight: "1.5",
              }}
            >
              <strong>Ne Yapmalısınız?</strong>
              <br />
              Sistem yöneticisi hesabınızı onayladığında otomatik olarak
              bilgilendirileceksiniz. Bu süreçte herhangi bir işlem yapmanıza
              gerek yoktur.
            </p>
          </div>

          <div
            style={{ display: "flex", gap: "15px", justifyContent: "center" }}
          >
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: "12px 24px",
                backgroundColor: "#007bff",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.95rem",
                transition: "background-color 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#0056b3";
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = "#007bff";
              }}
            >
              Durumu Kontrol Et
            </button>

            <button
              onClick={handleSignOut}
              style={{
                padding: "12px 24px",
                backgroundColor: "transparent",
                color: "#6c757d",
                border: "2px solid #e9ecef",
                borderRadius: "8px",
                cursor: "pointer",
                fontWeight: "600",
                fontSize: "0.95rem",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "#dc3545";
                e.target.style.color = "#dc3545";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "#e9ecef";
                e.target.style.color = "#6c757d";
              }}
            >
              Çıkış Yap
            </button>
          </div>

          <p
            style={{
              color: "#adb5bd",
              fontSize: "0.85rem",
              marginTop: "30px",
              marginBottom: 0,
            }}
          >
            Sorularınız için sistem yöneticisi ile iletişime geçebilirsiniz.
          </p>
        </div>
      </div>
    </>
  );
}
