function showPage(id) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

    // Show selected page
    document.getElementById(id).classList.add('active');

    // Remove active class from all nav buttons
    document.querySelectorAll('.bottom-nav button').forEach(b => b.classList.remove('active'));

    // Add active class to clicked button
    event.currentTarget.classList.add('active');
}

// Helper functions for degrees/radians conversion
function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}

function toDegrees(radians) {
    return radians * (180 / Math.PI);
}

let currentAngle = 0; // Sudut jarum saat ini

document.getElementById('btnlokasi').addEventListener('click', ambilLokasi);

function ambilLokasi() {
    if (!navigator.geolocation) {
        alert('Geolocation tidak didukung oleh browser Anda');
        return;
    }

    navigator.geolocation.getCurrentPosition(posisiBerhasil, posisiGagal);
}

function posisiBerhasil(position) {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // Koordinat Ka'bah
    const latKaBah = 21.4225;
    const longKaBah = 39.8262;

    const arah = hitungArahKiblat(latitude, longitude, latKaBah, longKaBah);

    // Animasi rotasi jarum kompas
    animateRotation(arah);

    // Update hasil
    document.getElementById('hasil').innerHTML = `
        Latitude: ${latitude.toFixed(6)}<br>
        Longitude: ${longitude.toFixed(6)}<br>
        Arah Kiblat: ${arah.toFixed(2)}° dari utara`;

    // Update lokasi page if it exists
    const lokasiSection = document.getElementById('lokasi');
    if (lokasiSection) {
        lokasiSection.innerHTML = `
            <h2>Lokasi Anda</h2>
            <p>Latitude: ${latitude.toFixed(6)}</p>
            <p>Longitude: ${longitude.toFixed(6)}</p>
        `;
    }

    // Ambil jadwal sholat berdasarkan lokasi
    tampilkanKota(latitude, longitude);
    ambilJadwalSholat(latitude, longitude);
}

function animateRotation(targetAngle) {
    const needle = document.querySelector(".needle");
    needle.classList.add('rotating');
    const duration = 2000; // Durasi animasi dalam ms
    const startAngle = currentAngle;
    const startTime = performance.now();

    function animate(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out function
        const easeOut = 1 - Math.pow(1 - progress, 3);

        const currentAngleNow = startAngle + (targetAngle - startAngle) * easeOut;
        needle.style.transform = `translate(-50%, -50%) rotate(${currentAngleNow}deg)`;

        if (progress < 1) {
            requestAnimationFrame(animate);
        } else {
            currentAngle = targetAngle;
            needle.classList.remove('rotating');
        }
    }

    requestAnimationFrame(animate);
}

function hitungArahKiblat(lat1, lon1, lat2, lon2) {
    const dLon = toRadians(lon2 - lon1);

    const y = Math.sin(dLon) * Math.cos(toRadians(lat2));
    const x = Math.cos(toRadians(lat1)) * Math.sin(toRadians(lat2)) -
        Math.sin(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.cos(dLon);

    const brng = Math.atan2(y, x);
    return (toDegrees(brng) + 360) % 360;
}

function posisiGagal() {
    alert('Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.');
}


function ambilJadwalSholat(latitude, longitude) {
    // Tampilkan loading
    document.getElementById('tanggal').innerText = 'Tanggal: Memuat...';
    document.getElementById('subuh').innerText = '-';
    document.getElementById('dzuhur').innerText = '-';
    document.getElementById('ashar').innerText = '-';
    document.getElementById('maghrib').innerText = '-';
    document.getElementById('isya').innerText = '-';

    const today = new Date();
    const date = today.getDate();
    const month = today.getMonth() + 1; // Bulan dimulai dari 0
    const year = today.getFullYear();

    const url = `https://api.aladhan.com/v1/timings/${date}-${month}-${year}?latitude=${latitude}&longitude=${longitude}&method=2`;
    
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (data.code === 200) {
                const jadwal = data.data.timings;
                const tanggal = data.data.date.readable;

                document.getElementById('tanggal').innerText = `Tanggal: ${tanggal}`;
                document.getElementById('subuh').innerText = jadwal.Fajr;
                document.getElementById('dzuhur').innerText = jadwal.Dhuhr;
                document.getElementById('ashar').innerText = jadwal.Asr;
                document.getElementById('maghrib').innerText = jadwal.Maghrib;
                document.getElementById('isya').innerText = jadwal.Isha;
            } else {
                console.error('API Error:', data.status);
                document.getElementById('tanggal').innerText = 'Tanggal: Gagal memuat';
            }
        })
        .catch((error) => {
            console.error('Gagal ambil jadwal sholat:', error);
            document.getElementById('tanggal').innerText = 'Tanggal: Error';
        });
}

function tampilkanKota(latitude, longitude) {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log('BigDataCloud response:', data); // Untuk debugging
            let kota = 'Unknown';
            if (data && data.city) {
                kota = data.city;
            } else if (data && data.locality) {
                kota = data.locality;
            } else if (data && data.principalSubdivision) {
                kota = data.principalSubdivision;
            }
            document.getElementById('kotaJadwal').innerText = `Kota: ${kota}`;
        })
        .catch((error) => {
            console.error('Gagal ambil nama kota:', error);
            document.getElementById('kotaJadwal').innerText = `Lokasi: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
        });
}