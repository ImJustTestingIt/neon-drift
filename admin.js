(()=>{
  const config=window.NeonDriftAdminConfig||{};
  const game=()=>window.NeonDriftAdmin;
  const sessionKey="neon-drift-admin-unlocked";
  const styles=document.createElement("style");
  styles.textContent=`
    .admin-trigger{position:fixed;right:14px;bottom:14px;z-index:20;width:42px;height:42px;border-radius:8px;border:1px solid rgba(0,245,255,.35);background:rgba(5,2,18,.62);color:#e7ff38;font-weight:950;box-shadow:0 0 22px rgba(0,245,255,.22);backdrop-filter:blur(16px);pointer-events:auto}
    .admin-shell{position:fixed;inset:0;z-index:30;display:grid;place-items:center;padding:18px;background:rgba(2,1,10,.58);backdrop-filter:blur(10px);pointer-events:auto}
    .admin-shell[hidden],.admin-trigger[hidden]{display:none}
    .admin-card{width:min(440px,100%);border:1px solid rgba(0,245,255,.36);border-radius:8px;background:linear-gradient(135deg,rgba(255,43,214,.18),rgba(0,245,255,.08)),rgba(6,3,20,.94);box-shadow:0 24px 80px rgba(0,0,0,.6),0 0 42px rgba(124,60,255,.25);color:#f9f7ff;padding:20px}
    .admin-head{display:flex;align-items:center;justify-content:space-between;gap:14px;margin-bottom:16px}
    .admin-title{margin:0;font-size:18px;text-transform:uppercase;letter-spacing:.12em}
    .admin-close{width:34px;height:34px;padding:0;border-radius:8px;background:rgba(255,255,255,.05);color:#fff;box-shadow:none}
    .admin-grid{display:grid;gap:12px}
    .admin-row{display:grid;gap:7px}
    .admin-row label{font-size:11px;text-transform:uppercase;letter-spacing:.12em;color:#a9b0ff}
    .admin-row input,.admin-row select{width:100%;border:1px solid rgba(255,255,255,.18);border-radius:8px;background:rgba(0,0,0,.24);color:#fff;padding:11px 12px;font:inherit}
    .admin-actions{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
    .admin-actions button,.admin-login{padding:11px 12px;border-radius:8px}
    .admin-status{min-height:20px;color:#e7ff38;font-size:12px;line-height:1.45}
    @media(max-width:520px){.admin-actions{grid-template-columns:1fr}.admin-trigger{right:10px;bottom:10px}}
  `;
  document.head.appendChild(styles);

  const trigger=document.createElement("button");
  trigger.className="admin-trigger";
  trigger.type="button";
  trigger.textContent="ADM";
  trigger.title="Admin";
  trigger.hidden=true;
  document.body.appendChild(trigger);

  const shell=document.createElement("div");
  shell.className="admin-shell";
  shell.hidden=true;
  shell.innerHTML=`
    <section class="admin-card" role="dialog" aria-modal="true" aria-label="Admin panel">
      <div class="admin-head">
        <h2 class="admin-title">Admin</h2>
        <button class="admin-close" type="button" aria-label="Close">X</button>
      </div>
      <div class="admin-grid" data-screen="login">
        <div class="admin-row">
          <label for="admin-secret">Passphrase</label>
          <input id="admin-secret" type="password" autocomplete="current-password">
        </div>
        <button class="admin-login" type="button">Unlock</button>
        <div class="admin-status" data-status></div>
      </div>
      <div class="admin-grid" data-screen="controls" hidden>
        <div class="admin-row">
          <label for="admin-multiplier">Score multiplier</label>
          <select id="admin-multiplier">
            <option value="1">1x</option>
            <option value="2">2x</option>
            <option value="5">5x</option>
            <option value="10">10x</option>
          </select>
        </div>
        <div class="admin-row">
          <label for="admin-best">Best score</label>
          <input id="admin-best" type="number" min="0" step="1" inputmode="numeric">
        </div>
        <div class="admin-actions">
          <button type="button" data-action="god">God mode</button>
          <button type="button" data-action="boost">Refill boost</button>
          <button type="button" data-action="score">+10,000 score</button>
          <button type="button" data-action="best">Save best</button>
          <button type="button" data-action="clear">Clear best</button>
          <button type="button" data-action="restart">Restart run</button>
          <button type="button" data-action="debug">Debug mode</button>
        </div>
        <div class="admin-status" data-status></div>
      </div>
    </section>
  `;
  document.body.appendChild(shell);

  const loginScreen=shell.querySelector('[data-screen="login"]');
  const controlsScreen=shell.querySelector('[data-screen="controls"]');
  const secretInput=shell.querySelector("#admin-secret");
  const multiplier=shell.querySelector("#admin-multiplier");
  const bestInput=shell.querySelector("#admin-best");
  const statuses=shell.querySelectorAll("[data-status]");

  const setStatus=message=>statuses.forEach(node=>node.textContent=message||"");
  const hex=buffer=>[...new Uint8Array(buffer)].map(byte=>byte.toString(16).padStart(2,"0")).join("");
  const hash=value=>crypto.subtle.digest("SHA-256",new TextEncoder().encode(value)).then(hex);
  const showControls=()=>{
    loginScreen.hidden=true;
    controlsScreen.hidden=false;
    const state=game()?.getState?.();
    if(state){
      bestInput.value=state.best;
      multiplier.value=String(state.scoreMultiplier||1);
      setStatus(`Score ${state.score} | Boost ${state.boost}% | God ${state.godMode?"on":"off"} | Debug ${state.debug?"on":"off"}`);
    }
  };
  const open=()=>{
    shell.hidden=false;
    if(sessionStorage.getItem(sessionKey)==="1")showControls();
    else setTimeout(()=>secretInput.focus(),0);
  };
  const close=()=>shell.hidden=true;
  const reveal=()=>{trigger.hidden=false;open()};

  trigger.addEventListener("click",open);
  shell.querySelector(".admin-close").addEventListener("click",close);
  addEventListener("keydown",event=>{
    if(event.key==="Escape")close();
    if(event.ctrlKey&&event.shiftKey&&event.key.toLowerCase()==="a"){
      event.preventDefault();
      reveal();
    }
  });
  if(location.hash.toLowerCase()==="#admin")reveal();

  shell.querySelector(".admin-login").addEventListener("click",async()=>{
    if(!config.secretHash||config.secretHash==="__ADMIN_SECRET_HASH__"){
      setStatus("Admin secret is not configured in this deployment.");
      return;
    }
    const candidate=await hash(secretInput.value);
    if(candidate===config.secretHash){
      sessionStorage.setItem(sessionKey,"1");
      secretInput.value="";
      showControls();
    }else{
      setStatus("Passphrase rejected.");
    }
  });

  multiplier.addEventListener("change",()=>{
    const value=game()?.setScoreMultiplier?.(multiplier.value);
    setStatus(`Score multiplier set to ${value}x.`);
  });

  shell.addEventListener("click",event=>{
    const action=event.target?.dataset?.action;
    if(!action||!game())return;
    if(action==="god"){
      const enabled=game().setGodMode(!game().getState().godMode);
      setStatus(`God mode ${enabled?"enabled":"disabled"}.`);
    }
    if(action==="boost"){game().refillBoost();setStatus("Overdrive refilled.")}
    if(action==="score"){game().addScore(10000);setStatus("Added 10,000 score.")}
    if(action==="best"){const value=game().setBest(bestInput.value);setStatus(`Best score saved as ${value}.`)}
    if(action==="clear"){game().clearBest();bestInput.value=0;setStatus("Best score cleared.")}
    if(action==="restart"){game().restart();setStatus("Run restarted.")}
    if(action==="debug"){
      const enabled=game().setDebug(!game().getState().debug);
      setStatus(`Debug mode ${enabled?"enabled":"disabled"}.`);
    }
  });
})();
