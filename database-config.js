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
            window.location.href = 'admin-home.html';
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
   const displayArticleContainer = document.querySelector("#display-recent-article");

   // Mendapatkan data artikel untuk ditampilkan di halaman home
   onValue(articleRef, (snapshot) => {
      // Mendapatkan data article
      const data = snapshot.val();

      // Menghapus konten yang ada (untuk mencegah duplikasi)
      displayArticleContainer.innerHTML = "";

      // Mengubah objek data menjadi array untuk diurutkan
      const dataArray = Object.entries(data);

      // Mengurutkan artikel berdasarkan tanggal pembuatan (CreatedAt) dari yang terbaru
      dataArray.sort((a, b) => {
         const dateA = new Date(a[1].CreatedAt);
         const dateB = new Date(b[1].CreatedAt);
         return dateB - dateA;
      });

      // Menampilkan maksimal 6 artikel terbaru
      const maxArticles = 6;
      const displayedArticles = dataArray.slice(0, maxArticles);

      // Melakukan iterasi setiap entri di dalam data yang sudah diurutkan
      displayedArticles.forEach(([uid, articleData]) => {
         const articleCard = document.createElement("div");
         articleCard.className = "flex items-center";

         // Menampilkan elemen HTML
         articleCard.innerHTML = `
            <a href="admin-article.html?uid=${uid}" class="flex items-center">
               <img src="${articleData.ArticleImage}" alt="" class="object-cover w-24 h-24 mr-4">
               <div>
                  <h1 class="text-lg font-bold">${articleData.ArticleTitle}</h1>
                  <p class="text-sm text-gray-600 italic">${new Date(articleData.CreatedAt).toLocaleDateString()}</p>
               </div>
            </a>
         `;

         // Menambahkan elemen HTML ke dalam div parents
         displayArticleContainer.appendChild(articleCard);
      });
   }, (errorObject) => {
      console.log("Error getting data: " + errorObject.code);
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
               <a href="admin-article.html?uid=${uid}" class="hover:border-y hover:border-red-500 flex flex-col gap-2 py-2">
                   <img src="${articleData.ArticleImage}" alt="" class="object-cover w-full h-56">
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

// PROSES MENAMPILKAN ARTIKEL DI HALAMAN ARTIKEL DETAIL
document.addEventListener("DOMContentLoaded", () => {

   // Membuat fungsi untuk mendapatkan query dari URL
   function getQueryParam(param) {
      // Menyimpan URL saat ini ke dalam variabel
      const urlParams = new URLSearchParams(window.location.search);

      // Memberikan value dari function getQueryParam menjadi URL yang sedang dibuka
      return urlParams.get(param);
   }

   function displayComments(uid) {
      const commentsRef = databaseRef(db, `Articles/${uid}/Comments`);

      get(commentsRef).then((snapshot) => {
         const commentsList = document.getElementById("comments-list");
         commentsList.innerHTML = ""; // Clear previous comments

         if (snapshot.exists()) {
            const commentsData = snapshot.val();

            // Iterate through comments and display them
            for (const commentKey in commentsData) {
               const comment = commentsData[commentKey];
               const commentElement = document.createElement("li");
               commentElement.classList.add("py-2", "border-b", "border-gray-200");
               commentElement.innerHTML = `
                      <p class="text-sm text-gray-500">Comment by: ${comment.displayName}</p>
                      <p class="text-gray-800 mb-2">${comment.text}</p>
                      <button class="text-red-500 hover:text-red-700 delete-comment-btn" data-comment-id="${commentKey}">Delete</button>
                  `;
               commentsList.appendChild(commentElement);
            }

            // Attach event listener for delete comment buttons
            const deleteCommentButtons = document.querySelectorAll(".delete-comment-btn");
            deleteCommentButtons.forEach(button => {
               button.addEventListener("click", (event) => {
                  const commentId = event.target.dataset.commentId;
                  const confirmDelete = confirm("Are you sure you want to delete this comment?");
                  if (confirmDelete) {
                     deleteComment(uid, commentId);
                  }
               });
            });
         } else {
            const noCommentsElement = document.createElement("p");
            noCommentsElement.classList.add("text-gray-500", "italic");
            noCommentsElement.textContent = "Tidak ada komen untuk saat ini";
            commentsList.appendChild(noCommentsElement);
         }
      }).catch((error) => {
         console.log("Error getting comments: " + error);
      });
   }


   // Fungsi untuk mendapatkan artikel berdasarkan UID
   function getArticle(uid) {
      const articleRef = databaseRef(db, `Articles/${uid}`);

      return get(articleRef);
   }

   // Mendapatkan referensi UID Artikel yang sedang dibuka dari URL
   const uid = getQueryParam("uid");

   // Pengkondisian untuk menampilkan artikel yang sedang dibuka berdasarkan UID nya
   if (uid) {
      // Mendapatkan artikel
      getArticle(uid).then((snapshot) => {
         // Pengkondisian untuk menampilkan artikel jika UID yang diinginkan ada di tabel
         if (snapshot.exists()) {
            const articleData = snapshot.val();

            document.getElementById("article-image").src = articleData.ArticleImage;
            document.getElementById("article-title").innerText = articleData.ArticleTitle;
            document.getElementById("article-category").innerText = articleData.ArticleCategory;
            document.getElementById("article-content").innerText = articleData.ArticleContent;
            document.getElementById("article-created-at").innerText = new Date(articleData.CreatedAt).toLocaleDateString();

            // Mendapatkan elemen Edit This Article di navbar
            const editArticleLink = document.querySelector("#edit-article");

            // Merubah href dari tag di navbar menjadi URL yang diinginkan
            if (editArticleLink) {
               editArticleLink.href = `admin-edit-article.html?uid=${uid}`;
            }

            // Tampilkan komentar
            displayComments(uid);
         } else {
            console.log("No data available for this article");
         }
      }).catch((error) => {
         console.log("Error getting article data: " + error);
      });
   } else {
      console.log("No UID available for this article");
   }

   // Fungsi untuk menghapus komentar berdasarkan UID artikel dan UID komentar
   function deleteComment(articleUid, commentUid) {
      const commentRef = databaseRef(db, `Articles/${articleUid}/Comments/${commentUid}`);
      remove(commentRef).then(() => {
         alert("Comment deleted successfully");
         // Refresh comments after deletion
         window.location.reload();
      }).catch((error) => {
         console.error("Error deleting comment: ", error);
      });
   }

});

// PROSES MENAMPILKAN ARTIKEL DI HALAMAN EDIT ARTIKEL
document.addEventListener("DOMContentLoaded", () => {
   // Mendapatkan referensi tabel Categories dari Firebase
   const categoryRef = databaseRef(db, "Categories");

   // Mendapatkan elemen select untuk menambahkan kategori
   const categorySelect = document.getElementById("category-article-input");

   // Mendapatkan elemen HTML lainnya
   const displayCurrentThumbnailImage = document.querySelector("#display-thumbnail-image");
   const articleUIDInput = document.querySelector("#article-uid");
   const articleTitleInput = document.querySelector("#article-title-input");
   const articleContentInput = document.querySelector("#content-article-input");
   const articleImageInput = document.querySelector("#file_input_edit");
   const updateArticleButton = document.querySelector("#edit-article-btn");
   const deleteArticleButton = document.querySelector("#delete-article-btn");

   // Mendapatkan UID dari query parameter URL
   function getQueryParam(param) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(param);
   }

   const uid = getQueryParam("uid");

   if (uid) {
      const articleRef = databaseRef(db, `Articles/${uid}`);

      get(articleRef).then((snapshot) => {
         if (snapshot.exists()) {
            const articleData = snapshot.val();
            categorySelect.value = articleData.ArticleCategory;
            articleUIDInput.value = uid;
            articleTitleInput.value = articleData.ArticleTitle;
            simplemde.value(articleData.ArticleContent);
            displayCurrentThumbnailImage.src = articleData.ArticleImage;
         } else {
            console.log("No data available");
         }
      }).catch((error) => {
         console.log("Error getting data: ", error);
      });
   } else {
      console.log("No UID provided");
   }

   // Fungsi untuk update artikel
   function updateArticle() {
      const imageFile = articleImageInput.files[0];
      const articleRef = databaseRef(db, `Articles/${articleUIDInput.value}`);

      function updateRecipeData(imageURL) {
         update(articleRef, {
            ArticleTitle: articleTitleInput.value,
            ArticleCategory: categorySelect.value,
            ArticleContent: articleContentInput.value,
            ArticleImage: imageURL || displayCurrentThumbnailImage.src
         }).then(() => {
            alert("Article updated successfully!");
            window.location.href = "admin-home.html";
         }).catch((error) => {
            console.error("Error updating article: ", error);
         });
      }

      if (imageFile) {
         const storageImageRef = storageRef(storage, `Images/${imageFile.name}`);
         uploadBytes(storageImageRef, imageFile).then(() => {
            return getDownloadURL(storageImageRef);
         }).then((imageURL) => {
            updateRecipeData(imageURL);
         }).catch((error) => {
            console.error("Error uploading image: ", error);
         });
      } else {
         updateRecipeData();
      }
   }

   // Event listener untuk tombol update
   updateArticleButton.addEventListener("click", (event) => {
      event.preventDefault();
      updateArticle();
   });

   // Fungsi untuk hapus artikel
   function deleteArticle() {
      const articleRef = databaseRef(db, `Articles/${articleUIDInput.value}`);

      get(articleRef).then((snapshot) => {
         if (snapshot.exists()) {
            const articleData = snapshot.val();
            const imageURL = articleData.ArticleImage;

            remove(articleRef).then(() => {
               alert("Article deleted successfully!");

               if (imageURL) {
                  const imageName = decodeURIComponent(imageURL.split('/o/')[1].split('?')[0]);
                  const storageImageRef = storageRef(storage, imageName);

                  deleteObject(storageImageRef).then(() => {
                     console.log("Image deleted successfully from storage.");
                  }).catch((error) => {
                     console.error("Error deleting image from storage: ", error);
                  });
               }

               window.location.href = "admin-home.html";
            }).catch((error) => {
               console.error("Error deleting article: ", error);
               alert("Failed to delete article. Please try again.");
            });
         } else {
            console.log("No data available for the given UID.");
            alert("Article not found. Please check the UID.");
         }
      }).catch((error) => {
         console.error("Error retrieving article: ", error);
      });
   }

   // Event listener untuk tombol delete
   deleteArticleButton.addEventListener("click", (event) => {
      event.preventDefault();
      const confirmDelete = confirm("Are you sure you want to delete this article? This process can't be undone.");
      if (confirmDelete) {
         deleteArticle();
      }
   });
});
