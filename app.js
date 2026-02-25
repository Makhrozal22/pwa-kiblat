// Koordinat Ka'bah (Mekkah)
const KABAH_LAT = 21.4225;
const KABAH_LNG = 39.8262;

// Elemen DOM
const btnLokasi = document.getElementById("btnlokasi");
const hasil = document.getElementById("hasil");
const needle = document.querySelector(".needle");

/* ======================================================
   NAVIGATION (BOTTOM NAV)
====================================================== */
function showPage(pageId) {
   
    document.querySelectorAll(".page").forEach(page => {
        page.classList.remove("active");
    });

    // Tampilkan page yang dipilih
    document.getElementById(pageId).classList.add("active");

    // Update tombol aktif
    document.querySelectorAll(".bottom-nav button").forEach(btn => {
        btn.classList.remove("active");
    });

    event.currentTarget.classList.add("active");
}

/* ======================================================
   AMBIL LOKASI USER
====================================================== */
btnLokasi.addEventListener("click", () => {
    if (!navigator.geolocation) {
        hasil.innerText = "Browser tidak mendukung GPS";
        return;
    }

    hasil.innerText = "Mengambil lokasi...";

    navigator.geolocation.getCurrentPosition(
        successLocation,
        errorLocation,
        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }
    );
});

function successLocation(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;

    hasil.innerHTML = `
        Latitude : ${lat.toFixed(6)} <br>
        Longitude : ${lng.toFixed(6)}
    `;

    // Hitung arah kiblat
    const arahKiblat = hitungArahKiblat(lat, lng);

    // Putar kompas
    putarKompas(arahKiblat);

    // Ambil jadwal sholat
    ambilJadwalSholat(lat, lng);
}

function errorLocation(error) {
    hasil.innerText = "Gagal mengambil lokasi";
    console.error(error);
}

/* ======================================================
   HITUNG ARAH KIBLAT
====================================================== */
function hitungArahKiblat(lat, lng) {

    const latRad = degToRad(lat);
    const lngRad = degToRad(lng);
    const kabahLatRad = degToRad(KABAH_LAT);
    const kabahLngRad = degToRad(KABAH_LNG);

    const y = Math.sin(kabahLngRad - lngRad);
    const x =
        Math.cos(latRad) * Math.tan(kabahLatRad) -
        Math.sin(latRad) * Math.cos(kabahLngRad - lngRad);

    let bearing = Math.atan2(y, x);
    bearing = radToDeg(bearing);
    bearing = (bearing + 360) % 360;

    return bearing;
}

/* ======================================================
   PUTAR JARUM KOMPAS
====================================================== */
function putarKompas(derajat) {
    needle.classList.add("rotating");

    // Rotasi jarum
    needle.style.transform = `translate(-50%, -50%) rotate(${derajat}deg)`;

    setTimeout(() => {
        needle.classList.remove("rotating");
    }, 500);
}

/* ======================================================
   JADWAL SHOLAT (API)
====================================================== */
function ambilJadwalSholat(lat, lng) {
    
    const url = `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`;

    fetch(url)
        .then(res => res.json())
        .then(data => {
            const jadwal = data.data.timings;
            const tanggal = data.data.date.readable;
            const kota = data.data.meta.timezone;

            document.getElementById("subuh").innerText = jadwal.Fajr;
            document.getElementById("dzuhur").innerText = jadwal.Dhuhr;
            document.getElementById("ashar").innerText = jadwal.Asr;
            document.getElementById("maghrib").innerText = jadwal.Maghrib;
            document.getElementById("isya").innerText = jadwal.Isha;

            document.getElementById("tanggal").innerText = `Tanggal : ${tanggal}`;
            document.getElementById("kotaJadwal").innerText = `Zona : ${kota}`;
        })
        .catch(err => {
            console.error(err);
        });
}


function degToRad(deg) {
    return deg * (Math.PI / 180);
}

function radToDeg(rad) {
    return rad * (180 / Math.PI);
}
