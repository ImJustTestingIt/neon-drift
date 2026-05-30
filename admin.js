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
  const utf8Bytes=value=>{
    if(window.TextEncoder)return new TextEncoder().encode(value);
    const encoded=unescape(encodeURIComponent(value));
    const bytes=new Uint8Array(encoded.length);
    for(let i=0;i<encoded.length;i++)bytes[i]=encoded.charCodeAt(i);
    return bytes;
  };
  const rightRotate=(value,bits)=>(value>>>bits)|(value<<(32-bits));
  const sha256Bytes=bytes=>{
    const constants=[1116352408,1899447441,3049323471,3921009573,961987163,1508970993,2453635748,2870763221,3624381080,310598401,607225278,1426881987,1925078388,2162078206,2614888103,3248222580,3835390401,4022224774,264347078,604807628,770255983,1249150122,1555081692,1996064986,2554220882,2821834349,2952996808,3210313671,3336571891,3584528711,113926993,338241895,666307205,773529912,1294757372,1396182291,1695183700,1986661051,2177026350,2456956037,2730485921,2820302411,3259730800,3345764771,3516065817,3600352804,4094571909,275423344,430227734,506948616,659060556,883997877,958139571,1322822218,1537002063,1747873779,1955562222,2024104815,2227730452,2361852424,2428436474,2756734187,3204031479,3329325298];
    const hash=[1779033703,3144134277,1013904242,2773480762,1359893119,2600822924,528734635,1541459225];
    const bitLength=bytes.length*8;
    const paddedLength=(((bytes.length+9+63)>>6)<<6);
    const padded=new Uint8Array(paddedLength);
    padded.set(bytes);
    padded[bytes.length]=128;
    const view=new DataView(padded.buffer);
    view.setUint32(paddedLength-4,bitLength,true?false:false);
    const words=new Uint32Array(64);
    for(let offset=0;offset<paddedLength;offset+=64){
      for(let i=0;i<16;i++)words[i]=view.getUint32(offset+i*4,false);
      for(let i=16;i<64;i++){
        const s0=rightRotate(words[i-15],7)^rightRotate(words[i-15],18)^(words[i-15]>>>3);
        const s1=rightRotate(words[i-2],17)^rightRotate(words[i-2],19)^(words[i-2]>>>10);
        words[i]=(words[i-16]+s0+words[i-7]+s1)>>>0;
      }
      let a=hash[0],b=hash[1],c=hash[2],d=hash[3],e=hash[4],f=hash[5],g=hash[6],h=hash[7];
      for(let i=0;i<64;i++){
        const s1=rightRotate(e,6)^rightRotate(e,11)^rightRotate(e,25);
        const ch=(e&f)^((~e)&g);
        const temp1=(h+s1+ch+constants[i]+words[i])>>>0;
        const s0=rightRotate(a,2)^rightRotate(a,13)^rightRotate(a,22);
        const maj=(a&b)^(a&c)^(b&c);
        const temp2=(s0+maj)>>>0;
        h=g;g=f;f=e;e=(d+temp1)>>>0;d=c;c=b;b=a;a=(temp1+temp2)>>>0;
      }
      hash[0]=(hash[0]+a)>>>0;hash[1]=(hash[1]+b)>>>0;hash[2]=(hash[2]+c)>>>0;hash[3]=(hash[3]+d)>>>0;
      hash[4]=(hash[4]+e)>>>0;hash[5]=(hash[5]+f)>>>0;hash[6]=(hash[6]+g)>>>0;hash[7]=(hash[7]+h)>>>0;
    }
    const out=new Uint8Array(32);
    const outView=new DataView(out.buffer);
    hash.forEach((value,index)=>outView.setUint32(index*4,value,false));
    return out;
  };
  const hash=value=>{
    const bytes=utf8Bytes(value);
    if(window.crypto&&crypto.subtle&&crypto.subtle.digest){
      return crypto.subtle.digest("SHA-256",bytes).then(hex).catch(()=>hex(sha256Bytes(bytes)));
    }
    return Promise.resolve(hex(sha256Bytes(bytes)));
  };
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
