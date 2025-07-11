import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import axios from "axios";
import styles from "@/styles/Main.module.css";

export default function Categories() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    image: "",
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    fetchCategories();
  }, [session, status, router]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/category");
      setCategories(response.data);
    } catch (err) {
      // 403 hatası için özel mesaj
      if (err.response?.status === 403) {
        setError("Hesabınız henüz onaylanmamış. Kategori işlemleri için admin onayı bekleniyor.");
      } else {
        setError(
          err.response?.data?.error || "Kategoriler yüklenirken hata oluştu"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ name: "", description: "", image: "" });
    setShowForm(false);
    setEditingCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError("Kategori adı gereklidir");
      return;
    }

    try {
      if (editingCategory) {
        const response = await axios.put(
          `/api/category/${editingCategory._id}`,
          formData
        );
        setCategories(
          categories.map((cat) =>
            cat._id === editingCategory._id ? response.data : cat
          )
        );
      } else {
        const response = await axios.post("/api/category", formData);
        setCategories([...categories, response.data]);
      }

      resetForm();
      setError(null);
    } catch (err) {
      // 403 hatası için özel mesaj
      if (err.response?.status === 403) {
        setError("Hesabınız henüz onaylanmamış. Kategori oluşturmak için admin onayı gerekli.");
      } else {
        setError(err.response?.data?.error || "İşlem sırasında hata oluştu");
      }
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      image: category.image || "",
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId) => {
    if (!confirm("Bu kategoriyi silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await axios.delete(`/api/category/${categoryId}`);
      setCategories(categories.filter((cat) => cat._id !== categoryId));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Kategori silinirken hata oluştu");
    }
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  if (status === "loading" || loading) {
    return <div className={styles.loading}>Yükleniyor...</div>;
  }

  if (!session) {
    return null; // Redirect will happen in useEffect
  }

  if (error) return <div className={styles.error}>Hata: {error}</div>;

  return (
    <>
      <Head>
        <title>Kategoriler - Product Management</title>
        <meta name="description" content="Product kategorilerini yönetin" />
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
          <h1>Kategoriler</h1>
          <div className={styles.headerActions}>
            <Link href="/products" className={styles.navButton}>
              Ürünler
            </Link>
            <button
              onClick={() => {
                if (showForm && editingCategory) {
                  handleCancelEdit();
                } else {
                  setShowForm(!showForm);
                }
              }}
              className={styles.addButton}
            >
              {showForm ? "İptal" : "Yeni Kategori Ekle"}
            </button>
          </div>
        </header>

        {showForm && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Kategori Adı</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={2}
                maxLength={50}
                placeholder="Kategori adını girin"
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Açıklama</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={200}
                placeholder="Kategori açıklaması (opsiyonel)"
                rows={3}
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="image">Görsel URL</label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              {editingCategory ? "Kategoriyi Güncelle" : "Kategori Ekle"}
            </button>
          </form>
        )}

        <div className={styles.grid}>
          {categories.map((category) => (
            <div key={category._id} className={styles.card}>
              {category.image && (
                <div className={styles.imageContainer}>
                  <Image
                    src={category.image}
                    alt={category.name}
                    className={styles.productImage}
                    width={300}
                    height={200}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              <div className={styles.cardContent}>
                <h3>{category.name}</h3>
                {category.description && (
                  <p className={styles.description}>{category.description}</p>
                )}
                <div className={styles.productCount}>
                  {category.products ? category.products.length : 0} ürün
                </div>
                <div className={styles.cardActions}>
                  <button
                    onClick={() => handleEdit(category)}
                    className={styles.editButton}
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className={styles.deleteButton}
                  >
                    Sil
                  </button>
                  <Link
                    href={`/products?category=${category._id}`}
                    className={styles.viewButton}
                  >
                    Ürünleri Gör
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className={styles.emptyState}>
            <p>Henüz kategori eklenmemiş.</p>
            <button
              onClick={() => setShowForm(true)}
              className={styles.addButton}
            >
              İlk Kategoriyi Ekle
            </button>
          </div>
        )}
      </div>
    </>
  );
}
