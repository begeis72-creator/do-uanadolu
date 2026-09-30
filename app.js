import { db, yapilandirildi } from "./firebase-config.js";
import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

/* ===== 1) TEMSİLCİLİKLER: kart, form listesi ve footer buradan oluşur =====
   bilgi = karttaki kısa yazı | link = sosyal medya adresi (Instagram vb.) */
const TEMSILCILIKLER = [
  { ad: "Çarşı Batman",     kisa: "BT", bilgi: "Batman grubunun kısa tanıtımı buraya.",     link: "https://instagram.com/" },
  { ad: "Çarşı Urfa",       kisa: "UR", bilgi: "Urfa grubunun kısa tanıtımı buraya.",       link: "https://instagram.com/" },
  { ad: "Çarşı Gaziantep",  kisa: "GA", bilgi: "Gaziantep grubunun kısa tanıtımı buraya.",  link: "https://instagram.com/" },
  { ad: "Çarşı Siirt",      kisa: "SI", bilgi: "Siirt grubunun kısa tanıtımı buraya.",      link: "https://instagram.com/" },
  { ad: "Çarşı Mardin",     kisa: "MA", bilgi: "Mardin grubunun kısa tanıtımı buraya.",     link: "https://instagram.com/" }
];

/* ===== 2) GALERİ: src = görsel yolu (örn. "img/pankart1.jpg"), baslik = alt yazı,
   genis: true yaparsan görsel iki kat geniş görünür ===== */
const GALERI = [
  { src: "https://placehold.co/900x900/222/fff?text=Pankart", baslik: "Deplasman pankartı", genis: true },
  { src: "https://placehold.co/600x600/222/fff?text=Yagmurluk", baslik: "Özel tasarım yağmurluk" },
  { src: "https://placehold.co/600x600/222/fff?text=Atki", baslik: "Doğu Anadolu atkısı" },
  { src: "https://placehold.co/600x600/222/fff?text=Logo", baslik: "Bölge logosu" },
  { src: "https://placehold.co/900x900/222/fff?text=Tribun", baslik: "Tribün emeği", genis: true }
];

/* ===== 3) ÖRNEK DUYURULAR: Firebase bağlanana kadar bunlar görünür ===== */
const ORNEK_DUYURULAR = [
  { tip: "Deplasman", baslik: "Örnek: Otobüs kalkışı", tarih: "2026-11-07T08:00", yer: "Toplanma: Şehir Meydanı", aciklama: "Bu bir örnektir. Gerçek duyuruları Firebase'den ekle." }
];

const $ = (s) => document.querySelector(s);
const esc = (t = "") => String(t).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

/* --- Temsilcilik kartları, dropdown, footer --- */
$("#temsilGrid").innerHTML = TEMSILCILIKLER.map((t) => `
  <button class="kart" type="button" aria-expanded="false">
    <div class="rozet">${esc(t.kisa)}</div><h3>${esc(t.ad)}</h3>
    <div class="detay">${esc(t.bilgi)}<br><a href="${esc(t.link)}" target="_blank" rel="noopener">Sosyal medya</a></div>
  </button>`).join("");
document.querySelectorAll(".kart").forEach((k) => k.addEventListener("click", () => {
  const a = k.classList.toggle("acik"); k.setAttribute("aria-expanded", a); // mobilde dokununca aç/kapa
}));
$("#sehirSec").insertAdjacentHTML("beforeend", TEMSILCILIKLER.map((t) => `<option>${esc(t.ad)}</option>`).join(""));
$("#footerLinkler").innerHTML = TEMSILCILIKLER.map((t) => `<a href="${esc(t.link)}" target="_blank" rel="noopener">${esc(t.ad)}</a>`).join("");

/* --- Galeri + lightbox --- */
$("#galeriGrid").innerHTML = GALERI.map((g, i) => `
  <figure class="${g.genis ? "genis" : ""}" data-i="${i}" tabindex="0">
    <img src="${esc(g.src)}" alt="${esc(g.baslik)}" loading="lazy"><figcaption>${esc(g.baslik)}</figcaption>
  </figure>`).join("");
const lb = $("#lightbox");
const ac = (f) => { const g = GALERI[f.dataset.i]; lb.querySelector("img").src = g.src; lb.querySelector("p").textContent = g.baslik; lb.showModal(); };
document.querySelectorAll(".galeri figure").forEach((f) => {
  f.addEventListener("click", () => ac(f));
  f.addEventListener("keydown", (e) => e.key === "Enter" && ac(f));
});
$("#lbKapat").onclick = () => lb.close();
lb.addEventListener("click", (e) => e.target === lb && lb.close()); // dışarı tıklayınca kapat

/* --- Duyuru panosu (Firestore "duyurular" koleksiyonu, canlı dinleme) --- */
function duyuruCiz(liste) {
  const kutu = $("#duyuruListe");
  if (!liste.length) { kutu.innerHTML = '<p class="bos">Şu an planlanmış bir organizasyon yok. Takipte kal.</p>'; return; }
  kutu.innerHTML = liste.map((d) => {
    const t = new Date(d.tarih);
    const gecerli = !isNaN(t);
    return `<article class="duyuru">
      <div class="tarih"><b>${gecerli ? t.getDate() : "?"}</b><span>${gecerli ? t.toLocaleDateString("tr-TR", { month: "short" }) : ""}</span></div>
      <div class="govde"><span class="tip">${esc(d.tip || "Duyuru")}</span><h3>${esc(d.baslik)}</h3>
      <p class="meta">${gecerli ? t.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" }) : ""} ${d.yer ? "· " + esc(d.yer) : ""}</p>
      <p>${esc(d.aciklama)}</p></div></article>`;
  }).join("");
}
if (yapilandirildi) {
  // tarih alanına göre yakın olan üstte; geçmiş etkinlikleri de göstermek istemezsen burada filtreleyebilirsin
  onSnapshot(query(collection(db, "duyurular"), orderBy("tarih")),
    (snap) => duyuruCiz(snap.docs.map((d) => d.data())),
    () => { $("#duyuruListe").innerHTML = '<p class="bos">Duyurular şu an yüklenemedi.</p>'; });
} else duyuruCiz(ORNEK_DUYURULAR);

/* --- Üyelik formu → Firestore "uyeler" koleksiyonu --- */
$("#katilForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const f = e.target, durum = $("#formDurum"), v = Object.fromEntries(new FormData(f));
  const tel = v.telefon.replace(/\s|-/g, "");
  durum.className = "hata";
  if (v.web) return;                                   // bot tuzağı doluysa sessizce çık
  if (!v.ad.trim() || !v.soyad.trim() || !v.sehir) { durum.textContent = "Ad, soyad ve temsilcilik zorunlu."; return; }
  if (!/^(\+90|0)?5\d{9}$/.test(tel)) { durum.textContent = "Telefonu 05XX XXX XX XX biçiminde yaz."; return; }
  if (!yapilandirildi) { durum.textContent = "Firebase ayarları henüz girilmedi (firebase-config.js)."; return; }
  try {
    await addDoc(collection(db, "uyeler"), { ad: v.ad.trim(), soyad: v.soyad.trim(), sehir: v.sehir, telefon: tel, tarih: serverTimestamp() });
    f.reset(); durum.className = "ok"; durum.textContent = "Başvurun alındı. Temsilciliğin seninle iletişime geçecek.";
  } catch { durum.textContent = "Gönderilemedi. Bağlantını kontrol edip tekrar dene."; }
});
