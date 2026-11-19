
document.addEventListener("DOMContentLoaded", () => {
  const el = document.getElementById("site-footer");
  if (!el) return;
  el.innerHTML = `
    <div class="container">
      <div class="footer-simple" style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 15px; padding-bottom: 20px;">
        <div class="footer-brand">
          <div class="brand" style="display: flex; align-items: center; justify-content: center; gap: 10px; margin-bottom: 10px;">
            <img class="brand-logo" src="img/Logo.png" alt="FutFlex" style="height: 35px;">
            <span style="font-size: 1.2rem; font-weight: bold;">FUT<em>FLEX</em></span>
          </div>
          <p style="color: #bbb; font-size: 0.9rem; max-width: 400px; margin: 0 auto 15px auto;">
            Camisas de futebol de clubes europeus, clubes brasileiros e seleções, incluindo modelos retrô.
          </p>
          <div class="footer-social" style="display: flex; justify-content: center; gap: 15px;">
            <a href="#" class="social-icon" aria-label="Instagram"><img src="img/instagram.png" alt="Instagram" style="width: 24px; height: 24px;"></a>
            <a href="#" class="social-icon" aria-label="Facebook"><img src="img/facebook.png" alt="Facebook" style="width: 24px; height: 24px;"></a>
            <a href="#" class="social-icon" aria-label="X (Twitter)"><img src="img/twitter.webp" alt="X" style="width: 24px; height: 24px;"></a>
          </div>
        </div>
      </div>
      <div class="footer-bottom" style="text-align: center; border-top: 1px solid rgba(255, 255, 255, 0.1); padding-top: 15px; color: #999; font-size: 0.85rem;">
        © 2026 FutFlex. Todos os direitos reservados.
      </div>
    </div>
  `;
});