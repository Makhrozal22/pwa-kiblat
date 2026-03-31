const judul = document.getElementById('judul');
const tombol = document.getElementById('btnUbah');

tombol.addEventListener('click', function() {
    judul.textContent = "PWA Dirubah!";
});