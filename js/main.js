   const surahList = document.getElementById("surahList");
    const searchInput = document.getElementById("searchInput");
    const lastReadBanner = document.getElementById("lastReadBanner");
    let allSurah = [];

    const lastRead = JSON.parse(localStorage.getItem('lastRead'));
    if (lastRead) {
      lastReadBanner.style.display = 'block';
      lastReadBanner.className = 'last-read-banner';
      lastReadBanner.innerHTML = `
        <div class="last-read-title">📖 Terakhir Dibaca</div>
        <div class="last-read-content">
          <span>${lastRead.nama}</span>
          <span style="font-size: 1.5rem;">→</span>
        </div>
      `;
      lastReadBanner.onclick = () => {
        window.location.href = `detail.html?nomor=${lastRead.nomor}`;
      };
    }

    fetch("https://equran.id/api/v2/surat")
      .then(res => res.json())
      .then(data => {
        allSurah = data.data;
        displaySurah(allSurah);
      })
      .catch(err => {
        surahList.innerHTML = '<div class="loading">Gagal memuat data</div>';
      });

    function displaySurah(surahData) {
      surahList.innerHTML = '';
      
      surahData.forEach((surah, index) => {
        const card = document.createElement("div");
        card.className = "surah-card";
        card.style.animationDelay = `${index * 0.05}s`;

        card.innerHTML = `
          <div class="surah-header">
            <div class="surah-number">${surah.nomor}</div>
            <div class="surah-arabic">${surah.nama}</div>
          </div>
          <div class="surah-info">
            <div class="surah-name">${surah.namaLatin}</div>
            <div class="surah-details">
              <span>📍 ${surah.tempatTurun}</span>
              <span>📄 ${surah.jumlahAyat} Ayat</span>
            </div>
          </div>
        `;

        card.addEventListener("click", () => {
          localStorage.setItem('lastRead', JSON.stringify({
            nomor: surah.nomor,
            nama: surah.namaLatin,
            timestamp: new Date().toISOString()
          }));
          window.location.href = `detail.html?nomor=${surah.nomor}`;
        });

        surahList.appendChild(card);
      });
    }

    searchInput.addEventListener('input', (e) => {
      const searchTerm = e.target.value.toLowerCase();
      const filtered = allSurah.filter(surah => 
        surah.namaLatin.toLowerCase().includes(searchTerm) ||
        surah.nama.includes(searchTerm) ||
        surah.nomor.toString().includes(searchTerm)
      );
      displaySurah(filtered);
    });

    // Register service worker
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('Service Worker registered successfully:', registration);
          })
          .catch(error => {
            console.log('Service Worker registration failed:', error);
          });
      });
    }