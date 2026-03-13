  const params = new URLSearchParams(window.location.search);
    const nomor = params.get("nomor");

    const surahHeader = document.getElementById("surahHeader");
    const bismillahContainer = document.getElementById("bismillahContainer");
    const ayatList = document.getElementById("ayatList");
    const navButtons = document.getElementById("navButtons");
    const prevBtn = document.getElementById("prevBtn");
    const nextBtn = document.getElementById("nextBtn");
    const prevSurahName = document.getElementById("prevSurahName");
    const nextSurahName = document.getElementById("nextSurahName");

    let tafsirData = {};

    // Simpan bacaan terakhir
    localStorage.setItem('lastRead', JSON.stringify({
      nomor: nomor,
      nama: '',
      timestamp: new Date().toISOString()
    }));

    // Fetch tafsir dan surah bersamaan
    Promise.all([
      fetch(`https://equran.id/api/v2/tafsir/${nomor}`).then(res => res.json()),
      fetch(`https://equran.id/api/v2/surat/${nomor}`).then(res => res.json())
    ])
    .then(([tafsirResponse, surahResponse]) => {
      // Simpan tafsir data
      tafsirResponse.data.tafsir.forEach(t => {
        tafsirData[t.ayat] = t.teks;
      });

      const detail = surahResponse.data;

      // Update localStorage dengan nama surah
      localStorage.setItem('lastRead', JSON.stringify({
        nomor: nomor,
        nama: detail.namaLatin,
        timestamp: new Date().toISOString()
      }));

      // Header Surah
      surahHeader.innerHTML = `
        <div class="surah-arabic">${detail.nama}</div>
        <div class="surah-title">${detail.namaLatin}</div>
        <div class="surah-meaning">${detail.arti}</div>
        <div class="surah-info">
          <span>📍 ${detail.tempatTurun}</span>
          <span>📄 ${detail.jumlahAyat} Ayat</span>
        </div>
      `;

      // Bismillah (kecuali surah At-Taubah)
      if (nomor != 9 && nomor != 1) {
        bismillahContainer.innerHTML = `
          <div class="bismillah">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</div>
        `;
      }

      // Ayat-ayat
      detail.ayat.forEach((a, index) => {
        const card = document.createElement("div");
        card.className = "ayat-card";
        card.style.animationDelay = `${index * 0.05}s`;

        const hasTafsir = tafsirData[a.nomorAyat];

        card.innerHTML = `
          <div class="ayat-number">${a.nomorAyat}</div>
          <div class="ayat-arabic">${a.teksArab}</div>
          <div class="ayat-latin">${a.teksLatin}</div>
          <div class="ayat-translation">${a.teksIndonesia}</div>
          ${hasTafsir ? `
            <button class="tafsir-toggle" onclick="showTafsir(${a.nomorAyat})">
              📚 Lihat Tafsir
            </button>
          ` : ''}
        `;

        ayatList.appendChild(card);
      });

      // Setup navigation buttons
      setupNavigation();
    })
    .catch(err => {
      surahHeader.innerHTML = '<div class="loading">Gagal memuat data</div>';
    });

    function showTafsir(ayatNumber) {
      const tafsir = tafsirData[ayatNumber];
      if (tafsir) {
        document.getElementById('modalTitle').innerHTML = `✨ Tafsir Ayat ${ayatNumber}`;
        document.getElementById('modalBody').innerHTML = tafsir;
        document.getElementById('tafsirModal').classList.add('show');
        document.body.style.overflow = 'hidden';
      }
    }

    function closeModal(event) {
      if (!event || event.target.id === 'tafsirModal') {
        document.getElementById('tafsirModal').classList.remove('show');
        document.body.style.overflow = 'auto';
      }
    }

    function setupNavigation() {
      const currentNo = parseInt(nomor);
      navButtons.style.display = 'flex';

      // Previous button
      if (currentNo > 1) {
        prevBtn.disabled = false;
        fetch(`https://equran.id/api/v2/surat/${currentNo - 1}`)
          .then(res => res.json())
          .then(data => {
            prevSurahName.textContent = data.data.namaLatin;
          });
      } else {
        prevBtn.disabled = true;
      }

      // Next button
      if (currentNo < 114) {
        nextBtn.disabled = false;
        fetch(`https://equran.id/api/v2/surat/${currentNo + 1}`)
          .then(res => res.json())
          .then(data => {
            nextSurahName.textContent = data.data.namaLatin;
          });
      } else {
        nextBtn.disabled = true;
      }
    }

    function navigateSurah(direction) {
      const currentNo = parseInt(nomor);
      const newNo = direction === 'prev' ? currentNo - 1 : currentNo + 1;
      
      if (newNo >= 1 && newNo <= 114) {
        window.location.href = `detail.html?nomor=${newNo}`;
      }
    }

    function kembali() {
      window.location.href = "index.html";
    }

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