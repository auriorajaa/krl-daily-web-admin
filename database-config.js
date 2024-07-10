// Import fungsi yang dibutuhkan dan dipakai
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-analytics.js";
import { getStorage, uploadBytes, getDownloadURL, ref as storageRef, deleteObject } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";
import { getDatabase, set, get, update, remove, push, ref as databaseRef, child, onValue, orderByChild } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
   apiKey: "AIzaSyCK3kLmd_lxGaqFGeS6GUCZP6swuBCLktw",
   authDomain: "krl-daily.firebaseapp.com",
   databaseURL: "https://krl-daily-default-rtdb.asia-southeast1.firebasedatabase.app",
   projectId: "krl-daily",
   storageBucket: "krl-daily.appspot.com",
   messagingSenderId: "1075273500230",
   appId: "1:1075273500230:web:c647cdee49e11d4e5a2c47",
   measurementId: "G-5988RVML3J"
};

// Menginisialisasi Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Menginisialisasi Storage
const storage = getStorage(app);

// Menginisialisasi Database
const db = getDatabase();

// Proses Admin Signin
document.addEventListener("DOMContentLoaded", () => {

   document.getElementById('admin-submit').addEventListener('click', function (event) {
      event.preventDefault(); // Mencegah form dari pengiriman default

      var email = document.getElementById('admin-email').value;
      var password = document.getElementById('admin-password').value;

      if (email === 'admin@admin.com' && password === 'krladmin123') {
         // Jika email dan password benar, arahkan ke halaman admin
         window.location.href = 'pages/admin-home.html';
      } else {
         // Jika email atau password salah, tampilkan pesan kesalahan
         alert('Email atau password salah. Silakan coba lagi.');
      }
   });
});

// PROSES MEMBUAT ARTIKEL
document.addEventListener("DOMContentLoaded", () => {
   // Mendapatkan elemen input
   const articleTitleInput = document.querySelector("#article-title");
   const articleCategoryInput = document.querySelector("#article-category");
   const articleContentInput = document.querySelector("#content-article");
   const articleImageInput = document.querySelector("#file_input");

   // Tombol submit
   const createArticleBtn = document.querySelector("#create-article-btn");

   // Inisialisasi fungsi untuk membuat artikel
   const createArticle = async () => {
      // Mendapatkan file gambar yang diunggah
      const imageFile = articleImageInput.files[0];
      ``
      // Jika input tidak terisi maka tampilkan pesan error 
      if (!imageFile || !articleTitleInput.value || !articleCategoryInput.value || !articleContentInput.value) {
         alert("Please fill out all fields");
         return;
      }

      // Upload gambar ke Firebase Storage
      const storageReference = storageRef(storage, `Images/${imageFile.name}`);
      await uploadBytes(storageReference, imageFile);

      // Mendapatkan URL gambar yang diunggah
      const imageURL = await getDownloadURL(storageReference);

      // Menyimpan data artikel ke Firebase Realtime Database
      await set(push(databaseRef(db, "Articles")), {
         ArticleTitle: articleTitleInput.value,
         ArticleCategory: articleCategoryInput.value,
         ArticleContent: articleContentInput.value,
         ArticleImage: imageURL, // Menyimpan URL gambar
         CreatedAt: new Date().toISOString()
      })
         .then(() => {
            // Menampilkan pesan sukses
            alert("Article created successfully!");
            window.location.reload();
         })
         .catch((error) => {
            // Menampilkan pesan error
            alert("Error creating article: " + error);
         });
   };

   // Menjalankan fungsi createRecipe ketika tombol create recipe ditekan
   createArticleBtn.addEventListener("click", (event) => {
      event.preventDefault(); // Mencegah halaman untuk reload atau action default lainnya
      createArticle();
   });
});

// PROSES MENAMPILKAN ARTIKEL DI HALAMAN HOME
document.addEventListener("DOMContentLoaded", () => {
   // Mendapatkan referensi tabel yang diinginkan dari database
   const articleRef = databaseRef(db, "Articles");

   // Mendapatkan elemen HTML yang akan dimanipulasi
   const displayArticleContainer = document.querySelector("#display-article");

   // Mendapatkan data artikel untuk ditampilkan di halaman home
   onValue(articleRef, (snapshot) => {
      // Mendapatkan data article
      const data = snapshot.val();

      // Menghapus konten yang ada (untuk mencegah duplikasi)
      displayArticleContainer.innerHTML = "";

      const maxWords = 22; // Jumlah kata maksimum yang diinginkan

      // Function to get the first few words
      function getFirstWords(text, maxWords) {
         // Split teks menjadi kata-kata
         const words = text.split(/\s+/);

         // Ambil bagian pertama dari array kata-kata sesuai dengan jumlah maksimum kata
         const truncatedWords = words.slice(0, maxWords);

         // Gabungkan kembali menjadi kalimat
         return truncatedWords.join(' ');
      }

      // Mengubah objek data menjadi array untuk diurutkan
      const dataArray = Object.entries(data);

      // Mengurutkan artikel berdasarkan tanggal pembuatan (CreatedAt) dari yang terbaru
      dataArray.sort((a, b) => {
         const dateA = new Date(a[1].CreatedAt);
         const dateB = new Date(b[1].CreatedAt);
         return dateB - dateA;
      });

      // Melakukan iterasi setiap entri di dalam data yang sudah diurutkan
      dataArray.forEach(([uid, articleData]) => {
         const articleCard = document.createElement("div");
         articleCard.className = `itemBox ${articleData.ArticleCategory.toLowerCase()}`;

         // Memotong konten artikel menjadi beberapa kalimat pertama
         const truncatedContent = getFirstWords(articleData.ArticleContent, maxWords);

         // Menampilkan elemen HTML
         articleCard.innerHTML = `
               <a href="admin-article.html?uid=${uid}" class="hover:border-b hover:border-red-500 flex flex-col gap-2 py-2 transform transition-transform duration-500 ease-in-out hover:scale-110">
                   <img src="${articleData.ArticleImage}" alt="" class="rounded-md object-cover w-full h-56">
                   <h1 class="text-lg font-bold tracking-tight pt-2">${articleData.ArticleTitle}</h1>
                   <div class="flex flex-row justify-between">
                       <p class="text-sm text-gray-600 italic">${articleData.ArticleCategory}</p>
                       <p class="text-sm text-gray-600 italic">${new Date(articleData.CreatedAt).toLocaleDateString()}</p>
                   </div>
                   <p class="text-sm py-2 text-gray-700">${truncatedContent}...</p>
               </a>
           `;

         // Menambahkan elemen HTML ke dalam div parents
         displayArticleContainer.appendChild(articleCard);
      });
   }, (errorObject) => {
      console.log("Error getting data: " + errorObject.code);
   });
});
























// FUNGSI MENAMPILKAN DAFTAR KATEGORI DI HOME PAGE
document.addEventListener("DOMContentLoaded", () => {
   // Referensi tabel Categories di Firebase Realtime Database
   const categoryRef = databaseRef(db, "Categories");

   // Mendapatkan elemen ul untuk menambahkan kategori
   const categoryList = document.getElementById("category-list");

   // Mendapatkan data kategori dari Firebase Realtime Database
   onValue(categoryRef, (snapshot) => {
      // Mendapatkan data kategori
      const categories = snapshot.val();

      // Menghapus kategori yang ada (kecuali "All") untuk mencegah duplikasi
      categoryList.innerHTML = '<li data-filter="all" class="list active cursor-pointer focus:outline-none focus:ring-4 font-medium text-md py-2">All</li>';

      // Melakukan iterasi setiap entri di dalam data kategori
      for (const key in categories) {
         const category = categories[key];

         const categoryItem = document.createElement("li");
         categoryItem.dataset.filter = category.toLowerCase(); // Pastikan data-filter sesuai dengan kategori
         categoryItem.className = "list cursor-pointer capitalize hover:underline focus:outline-none focus:ring-4 font-medium text-md py-2";
         categoryItem.textContent = category;
         categoryList.appendChild(categoryItem);
      }
   }, (errorObject) => {
      console.log("Error getting data: " + errorObject.code);
   });
});


// FUNGSI MENAMPILKAN PILIHAN KATEGORI DI ADD ARTIKEL
document.addEventListener("DOMContentLoaded", () => {
   // Mendapatkan referensi tabel Categories dari Firebase
   const categoryRef = databaseRef(db, "Categories");

   // Mendapatkan elemen select untuk menambahkan kategori
   const categorySelect = document.getElementById("article-category");

   // Mendapatkan data kategori dari tabel Categories
   onValue(categoryRef, (snapshot) => {
      // Menghapus kategori yang ada kecuali "Select Category" untuk mencegah duplikasi
      categorySelect.innerHTML = '<option>Pilih Kategori</option>';

      // Memeriksa apakah data snapshot ada
      if (snapshot.exists()) {
         const data = snapshot.val();

         // Melakukan iterasi setiap entri di dalam data
         for (const key in data) {
            if (data.hasOwnProperty(key)) {
               let category = data[key];
               category = capitalizeWords(category); // Capitalize category

               // Membuat elemen option untuk setiap kategori
               const categoryOption = document.createElement("option");
               categoryOption.value = category;
               categoryOption.textContent = category;
               categorySelect.appendChild(categoryOption);
            }
         }
      } else {
         console.log("No data available in Categories");
      }
   }, (errorObject) => {
      console.error("Error getting data: " + errorObject.code);
   });
});

// Fungsi untuk capitalizing kategori
function capitalizeWords(str) {
   return str.replace(/\b\w/g, char => char.toUpperCase());
}

document.addEventListener("DOMContentLoaded", () => {
   // Referensi elemen input dan tombol
   const addCategoryBtn = document.getElementById("add-category-btn");
   const newCategoryInput = document.getElementById("new-category");

   // Referensi ke tabel Categories di Firebase Realtime Database
   const categoryRef = databaseRef(db, "Categories");

   addCategoryBtn.addEventListener("click", () => {
      const newCategory = newCategoryInput.value.trim();

      if (newCategory) {
         // Cek apakah kategori sudah ada di database
         get(categoryRef).then((snapshot) => {
            const data = snapshot.val();
            const existingCategories = Object.values(data || {});

            // Ubah kategori yang sudah ada menjadi huruf kecil
            const lowerCaseExistingCategories = existingCategories.map(category => category.toLowerCase());

            // Ubah kategori baru menjadi huruf kecil
            const lowerCaseNewCategory = newCategory.toLowerCase();

            // Cek apakah kategori baru sudah ada dalam daftar
            if (lowerCaseExistingCategories.includes(lowerCaseNewCategory)) {
               alert("Category already exists!");
            } else {
               // Tambahkan kategori baru dengan menggunakan push untuk menghasilkan UID otomatis
               push(categoryRef, newCategory)
                  .then(() => {
                     alert("Category added successfully!");
                     newCategoryInput.value = ''; // Clear the input field
                  })
                  .catch((error) => {
                     console.error("Error adding category:", error);
                  });
            }
         }).catch((error) => {
            console.error("Error checking categories:", error);
         });
      } else {
         alert("Please enter a category name.");
      }
   });
});
