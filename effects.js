/* ===== EFEKTLER: hero kıvılcımları, kaydırma animasyonu, kayan şerit ===== */
const az = matchMedia("(prefers-reduced-motion: reduce)").matches;

// 1) Kıvılcım/ateş parçacıkları: sayıyı değiştirmek için 90'ı değiştir
const c = document.getElementById("kor"), x = c.getContext("2d"); let W, H, gorunur = true;
const boyut = () => { W = c.width = c.offsetWidth; H = c.height = c.offsetHeight; };
addEventListener("resize", boyut); boyut();
const yeni = (alt = true) => ({ x: Math.random() * W, y: alt ? H + 10 : Math.random() * H, r: Math.random() * 2.4 + .6, v: Math.random() * 1.5 + .5, s: Math.random() - .5, o: Math.random() * .7 + .3 });
const p = Array.from({ length: 90 }, () => yeni(false));
(function ciz() {
  if (gorunur && !az) {
    x.clearRect(0, 0, W, H);
    for (const q of p) {
      q.y -= q.v; q.x += q.s + Math.sin(q.y / 35) * .4; q.o -= .0025;
      if (q.y < -10 || q.o <= 0) Object.assign(q, yeni());
      x.beginPath(); x.arc(q.x, q.y, q.r, 0, 7);
      x.fillStyle = `rgba(255,${90 + q.r * 40 | 0},40,${q.o})`; x.shadowBlur = 14; x.shadowColor = "#e30613"; x.fill();
    }
  }
  requestAnimationFrame(ciz);
})();
new IntersectionObserver(([e]) => gorunur = e.isIntersecting).observe(document.getElementById("hero"));

// 2) Hero yazısı kaydırınca yukarı kayıp solar
const icerik = document.querySelector(".hero-icerik");
addEventListener("scroll", () => { if (!az) { const k = Math.min(scrollY / 600, 1); icerik.style.transform = `translateY(${scrollY * .25}px)`; icerik.style.opacity = 1 - k; } }, { passive: true });

// 3) Kayan şeridi iki kat yap (kesintisiz döngü)
const yol = document.querySelector(".yol"); yol.innerHTML += yol.innerHTML;

// 4) Bölüm başlıkları, kartlar, bilet ve galeri kaydırınca sahneye girer
const io = new IntersectionObserver((l) => l.forEach((e) => e.isIntersecting && (e.target.classList.add("gor"), io.unobserve(e.target))), { threshold: .12 });
const izle = () => document.querySelectorAll("main h2, main .alt, .manifesto, #hakkimizda p, .kart, .galeri figure, .duyuru, form").forEach((el, i) => {
  if (el.dataset.r) return; el.dataset.r = 1; el.classList.add("reveal"); el.style.transitionDelay = (i % 4) * 90 + "ms"; io.observe(el);
});
izle(); new MutationObserver(izle).observe(document.querySelector("main"), { childList: true, subtree: true }); // Firebase'den gelen duyurular için
