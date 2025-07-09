import Head from "next/head";
import Link from "next/link";
import styles from "@/styles/Main.module.css";

export default function Home() {
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
        </header>

        <div className={styles.mainActions}>
          <Link href="/categories" className={styles.mainButton}>
            <h2>Kategori Yönetimi</h2>
            <p>Kategorileri yönet</p>
          </Link>
          <Link href="/products" className={styles.mainButton}>
            <h2>Ürün Yönetimi</h2>
            <p>Ürünleri yönet</p>
          </Link>
        </div>
      </div>
    </>
  );
}
