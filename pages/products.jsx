import { useState, useEffect } from "react";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import axios from "axios";
import styles from "@/styles/Main.module.css";

export default function Products() {
  const router = useRouter();
  const { category } = router.query;

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    description: "",
    image: "",
    category: category || "",
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (category) {
      setSelectedCategory(category);
      setFormData((prev) => ({ ...prev, category }));
    }
  }, [category]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/product");
      setProducts(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Ürünler yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("/api/category");
      setCategories(response.data);
    } catch (err) {
      console.error("Kategoriler yüklenirken hata:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.price || !formData.category) {
      setError("Ürün adı, fiyat ve kategori gereklidir");
      return;
    }

    try {
      if (editingProduct) {
        const response = await axios.put(
          `/api/product/${editingProduct._id}`,
          formData
        );
        setProducts(
          products.map((product) =>
            product._id === editingProduct._id ? response.data : product
          )
        );
        setEditingProduct(null);
      } else {
        const response = await axios.post("/api/product", formData);
        setProducts([...products, response.data]);
      }

      setFormData({
        name: "",
        price: "",
        description: "",
        image: "",
        category: "",
      });
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Ürün işlenirken hata oluştu");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description || "",
      image: product.image || "",
      category: product.category._id,
    });
    setShowForm(true);
  };

  const handleDelete = async (productId) => {
    if (!confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      return;
    }

    try {
      await axios.delete(`/api/product/${productId}`);
      setProducts(products.filter((product) => product._id !== productId));
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Ürün silinirken hata oluştu");
    }
  };

  const handleCancelEdit = () => {
    setEditingProduct(null);
    setFormData({
      name: "",
      price: "",
      description: "",
      image: "",
      category: "",
    });
    setShowForm(false);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const filteredProducts = selectedCategory
    ? products.filter((product) => product.category._id === selectedCategory)
    : products;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(price);
  };

  if (loading) return <div className={styles.loading}>Yükleniyor...</div>;
  if (error) return <div className={styles.error}>Hata: {error}</div>;

  return (
    <>
      <Head>
        <title>Ürünler - Product Management</title>
        <meta name="description" content="Ürünleri yönetin" />
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
          <h1>Ürünler</h1>
          <div className={styles.headerActions}>
            <Link href="/" className={styles.navButton}>
              Ana Sayfa
            </Link>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.categoryFilter}
            >
              <option value="">Tüm Kategoriler</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <button
              onClick={() =>
                editingProduct ? handleCancelEdit() : setShowForm(!showForm)
              }
              className={styles.addButton}
            >
              {showForm ? "İptal" : "Yeni Ürün Ekle"}
            </button>
          </div>
        </header>

        {showForm && (
          <form onSubmit={handleSubmit} className={styles.form}>
            <h2 className={styles.formTitle}>
              {editingProduct ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
            </h2>
            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label htmlFor="name">Ürün Adı</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  minLength={2}
                  maxLength={100}
                  placeholder="Ürün adını girin"
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="price">Fiyat (TL)</label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  min={0}
                  max={1000000}
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">Kategori</label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                required
              >
                <option value="">Kategori seçin</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Açıklama</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                maxLength={1000}
                placeholder="Ürün açıklaması (opsiyonel)"
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
              {editingProduct ? "Ürünü Güncelle" : "Ürün Ekle"}
            </button>
          </form>
        )}

        <div className={styles.grid}>
          {filteredProducts.map((product) => (
            <div key={product._id} className={styles.card}>
              {product.image && (
                <div className={styles.imageContainer}>
                  <Image
                    src={product.image}
                    alt={product.name}
                    className={styles.productImage}
                    width={300}
                    height={200}
                    style={{ objectFit: "cover" }}
                  />
                </div>
              )}
              <div className={styles.cardContent}>
                <h3>{product.name}</h3>
                <div className={styles.price}>{formatPrice(product.price)}</div>
                <div className={styles.category}>{product.category?.name}</div>
                {product.description && (
                  <p className={styles.description}>{product.description}</p>
                )}
                <div className={styles.cardActions}>
                  <button
                    onClick={() => handleEdit(product)}
                    className={styles.editButton}
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(product._id)}
                    className={styles.deleteButton}
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className={styles.emptyState}>
            <p>
              {selectedCategory
                ? "Bu kategoride henüz ürün bulunmuyor."
                : "Henüz ürün eklenmemiş."}
            </p>
            <button
              onClick={() => setShowForm(true)}
              className={styles.addButton}
            >
              İlk Ürünü Ekle
            </button>
          </div>
        )}
      </div>
    </>
  );
}
