/* Spark! — slide engine + interactive demos (vanilla JS, no dependencies) */
'use strict';
const $=(s,e=document)=>e.querySelector(s), $$=(s,e=document)=>[...e.querySelectorAll(s)];
const NS='http://www.w3.org/2000/svg';
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)), lerp=(a,b,t)=>a+(b-a)*t, TAU=Math.PI*2;
const hex=h=>[1,3,5].map(i=>parseInt(h.slice(i,i+2),16));
const mix=(a,b,t)=>{const A=hex(a),B=hex(b);return `rgb(${A.map((v,i)=>Math.round(lerp(v,B[i],t))).join(',')})`};
const mk=(tag,attrs,parent)=>{const e=document.createElementNS(NS,tag);for(const k in attrs)e.setAttribute(k,attrs[k]);if(parent)parent.appendChild(e);return e};
const C={y:'#FFBE0B',o:'#FB5607',p:'#FF006E',v:'#8338EC',b:'#3A86FF',ink:'#000',box:'#111'};

/* electrons moving along an SVG path */
function flow(svg,d,n=10,col=C.y,r=4.5){
  const p=mk('path',{d,class:'wire'},svg),L=p.getTotalLength();
  const dots=[...Array(n)].map((_,i)=>({c:mk('circle',{r,fill:col},svg),s:i/n}));
  return {p,step(sp,al=1){for(const o of dots){o.s=((o.s+sp)%1+1)%1;const q=p.getPointAtLength(o.s*L);o.c.setAttribute('cx',q.x);o.c.setAttribute('cy',q.y);o.c.setAttribute('opacity',al)}}};
}
function fit(cv){const r=cv.getBoundingClientRect(),dpr=Math.min(2,devicePixelRatio||1);
  if(cv.width!==Math.round(r.width*dpr)||cv.height!==Math.round(r.height*dpr)){cv.width=Math.round(r.width*dpr);cv.height=Math.round(r.height*dpr)}
  const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);return {ctx:x,W:r.width,H:r.height}}
function svgPt(svg,e){const p=svg.createSVGPoint();p.x=e.clientX;p.y=e.clientY;return p.matrixTransform(svg.getScreenCTM().inverse())}
const T=(id,v)=>{const e=document.getElementById(id);if(e)e.textContent=v};
const fmtR=r=>r>=1000?(r/1000).toFixed(r>=10000?0:1)+' kΩ':Math.round(r)+' Ω';

const D={};

/* ============ 3 · AC / DC ============ */
D.acdc={init(){this.cv=$('#acdcCv');this.f=$('#acF');},
tick(dt,t){const {ctx,W,H}=fit(this.cv),f=+this.f.value,half=H/2;ctx.clearRect(0,0,W,H);
  for(let k=0;k<2;k++){const y0=k*half,col=k?C.b:C.y,top=y0+34,hh=half-96,mid=top+hh/2,amp=hh/2-4;
    ctx.fillStyle='#fff';ctx.font='700 14px Poppins,sans-serif';ctx.fillText(k?'AC · alternating (wall socket)':'DC · direct (battery / USB)',14,y0+24);
    ctx.strokeStyle='rgba(255,255,255,.25)';ctx.setLineDash([5,6]);ctx.beginPath();ctx.moveTo(10,mid);ctx.lineTo(W-10,mid);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle=col;ctx.lineWidth=4;ctx.lineJoin='round';ctx.beginPath();
    for(let x=10;x<=W-10;x+=3){const tt=t-(W-10-x)/(W-20)*3,v=k?Math.sin(TAU*f*tt):1,y=mid-v*amp;x===10?ctx.moveTo(x,y):ctx.lineTo(x,y)}ctx.stroke();
    const vNow=k?Math.sin(TAU*f*t):1;ctx.fillStyle=col;ctx.beginPath();ctx.arc(W-10,mid-vNow*amp,7,0,TAU);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.6)';ctx.font='12px Poppins';ctx.fillText(k?'+V':'+5 V',W-44,top+8);ctx.fillText(k?'−V':'0 V',W-44,top+hh+8);
    /* electrons on a wire */
    const wy=y0+half-34;ctx.strokeStyle='rgba(255,255,255,.3)';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(10,wy);ctx.lineTo(W-10,wy);ctx.stroke();
    for(let i=0;i<14;i++){const base=20+i*(W-40)/14;let x=k?base+Math.sin(TAU*f*t)*(W/28):10+((base-10+t*70)%(W-20));
      ctx.fillStyle=C.y;ctx.shadowColor=C.y;ctx.shadowBlur=10;ctx.beginPath();ctx.arc(x,wy,5,0,TAU);ctx.fill();ctx.shadowBlur=0}
    ctx.fillStyle='rgba(255,255,255,.65)';ctx.font='12px Poppins';ctx.fillText(k?'electrons shuffle back and forth':'electrons march one way',14,wy-12);
  }}};

/* ============ 4 · RESISTOR ============ */
D.resistor={init(){this.cv=$('#resCv');this.R=$('#resR');this.ps=[...Array(80)].map(()=>({x:Math.random(),u:Math.random()*2-1}))},
tick(dt){const {ctx,W,H}=fit(this.cv),R=+this.R.value,frac=(R-50)/950,I=5/R*1000,cy=H/2,H0=H*.34,hmin=H0*(1-.87*frac);
  const hw=x=>H0-(H0-hmin)*Math.exp(-Math.pow((x/W-.5)/.13,2));
  T('rR',fmtR(R));T('rI',I.toFixed(I<10?1:0)+' mA');T('rHeat',frac>.6?'🔥 hot, little current':frac>.25?'warm':'cool, lots of current');
  ctx.clearRect(0,0,W,H);
  const g=ctx.createRadialGradient(W/2,cy,5,W/2,cy,H0*1.3);g.addColorStop(0,`rgba(251,86,7,${.15+frac*.65})`);g.addColorStop(1,'rgba(251,86,7,0)');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  ctx.beginPath();for(let x=0;x<=W;x+=5)ctx.lineTo(x,cy-hw(x));for(let x=W;x>=0;x-=5)ctx.lineTo(x,cy+hw(x));ctx.closePath();ctx.fillStyle='rgba(255,190,11,.08)';ctx.fill();
  ctx.strokeStyle=C.y;ctx.lineWidth=4;ctx.lineJoin='round';ctx.beginPath();for(let x=0;x<=W;x+=5)x?ctx.lineTo(x,cy-hw(x)):ctx.moveTo(x,cy-hw(x));ctx.stroke();ctx.beginPath();for(let x=0;x<=W;x+=5)x?ctx.lineTo(x,cy+hw(x)):ctx.moveTo(x,cy+hw(x));ctx.stroke();
  const v=30+380*Math.min(1,I/100);
  for(const p of this.ps){p.x+=v*dt/W;if(p.x>1)p.x-=1;const x=p.x*W,y=cy+p.u*hw(x)*.82;ctx.fillStyle=C.y;ctx.shadowColor=C.y;ctx.shadowBlur=8;ctx.beginPath();ctx.arc(x,y,4,0,TAU);ctx.fill()}
  ctx.shadowBlur=0;ctx.fillStyle='#fff';ctx.font='700 13px Poppins';ctx.textAlign='center';ctx.fillText('RESISTOR',W/2,cy-hw(W/2)-12);ctx.fillText('current →',W*.16,cy-H0-10);ctx.textAlign='left';
  ctx.fillStyle='rgba(255,255,255,.6)';ctx.font='12px Poppins';ctx.fillText('wide road = low R · narrow road = high R',12,H-12)}};

/* ============ 5 · CAPACITOR ============ */
D.capacitor={init(){const s=$('#capSvg');this.s=s;
  this.fA=flow(s,'M60 140V100H260V130',8);this.fB=flow(s,'M260 190V230H60V160',8);this.fD=flow(s,'M260 130V100H440V230H260V190',14);
  s.insertAdjacentHTML('beforeend',`
  <defs><radialGradient id="capGlow"><stop offset="0" stop-color="#FF006E" stop-opacity=".9"/><stop offset="1" stop-color="#FF006E" stop-opacity="0"/></radialGradient></defs>
  <rect x="38" y="128" width="44" height="44" rx="10" fill="${C.box}" stroke="#fff" stroke-opacity=".4"/>
  <line x1="46" y1="140" x2="74" y2="140" stroke="#fff" stroke-width="4"/><line x1="52" y1="158" x2="68" y2="158" stroke="#fff" stroke-width="8"/>
  <text x="90" y="138" class="lbl">+</text><text x="90" y="172" class="lbl">−</text><text x="14" y="206" class="lbl s">battery 5 V</text>
  <rect x="186" y="140" width="148" height="40" rx="4" fill="rgba(255,255,255,.05)" stroke="rgba(255,255,255,.25)" stroke-dasharray="4 4"/>
  <text x="260" y="164" text-anchor="middle" class="lbl s">insulator</text>
  <rect x="190" y="130" width="140" height="10" rx="3" class="fy"/><rect x="190" y="180" width="140" height="10" rx="3" class="fb"/>
  <g id="capCh"></g>
  <rect x="418" y="140" width="44" height="52" rx="10" fill="${C.box}" stroke="#fff" stroke-opacity=".4"/>
  <circle id="capGl" cx="440" cy="166" r="52" fill="url(#capGlow)" opacity="0"/>
  <path id="capLed" d="M428 152h24l-12 22z" fill="#fff" opacity=".6"/><line x1="428" y1="177" x2="452" y2="177" stroke="#fff" stroke-width="3"/>
  <text x="440" y="212" text-anchor="middle" class="lbl s">LED</text>
  <text x="260" y="116" text-anchor="middle" class="lbl s" opacity="0"> </text>
  <rect x="40" y="258" width="300" height="16" rx="8" fill="rgba(0,0,0,.4)"/><rect id="capBar" x="40" y="258" width="0" height="16" rx="8" class="fa"/>
  <text x="40" y="254" class="lbl s">voltage stored on the capacitor</text>`);
  const g=$('#capCh');this.ch=[];for(let i=0;i<7;i++){const x=204+i*20;this.ch.push([mk('text',{x,y:158,class:'lbl fy','text-anchor':'middle'},g),mk('text',{x,y:176,class:'lbl','text-anchor':'middle',fill:C.b},g)]);this.ch[i][0].textContent='+';this.ch[i][1].textContent='−'}
  this.v=0;this.mode='idle';
  $('#capCharge').onclick=()=>this.mode='charge';$('#capDis').onclick=()=>this.mode='dis'},
tick(dt){let {v,mode}=this;
  if(mode==='charge')v+=(5-v)*(1-Math.exp(-dt/.7));else if(mode==='dis')v*=Math.exp(-dt/1.1);this.v=v;
  const a=mode==='charge'?(5-v)/5:0,d=mode==='dis'?v/5:0;
  this.fA.step(.35*dt*a,a>.02?1:0);this.fB.step(.35*dt*a,a>.02?1:0);this.fD.step(.35*dt*d,d>.02?1:0);
  this.fA.p.style.opacity=this.fB.p.style.opacity=mode==='charge'?1:.38;this.fD.p.style.opacity=mode==='dis'?1:.38;
  this.ch.forEach((c,i)=>{const o=clamp(v/5*7-i,0,1)*.9+.08;c[0].style.opacity=c[1].style.opacity=o});
  $('#capGl').setAttribute('opacity',d);$('#capLed').setAttribute('fill',d>.05?C.p:'#fff');
  $('#capBar').setAttribute('width',v/5*300);T('capV',v.toFixed(1)+' V');
  T('capS',mode==='idle'?'Press a button':mode==='charge'?(v>4.9?'full!':'charging…'):(v<.1?'empty':'releasing charge → LED glows'))}};

/* ============ 6 · POTENTIOMETER ============ */
D.pot={init(){const s=$('#potSvg');this.s=s;
  s.innerHTML=`<defs><linearGradient id="potG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.p}"/><stop offset="1" stop-color="${C.y}"/></linearGradient>
  <radialGradient id="potGl"><stop offset="0" stop-color="#FFBE0B" stop-opacity=".95"/><stop offset="1" stop-color="#FFBE0B" stop-opacity="0"/></radialGradient></defs>
  <g id="potTicks"></g>
  <circle cx="150" cy="150" r="82" fill="${C.b}"/><g id="potKnob" style="cursor:grab"><circle cx="150" cy="150" r="64" fill="${C.ink}" stroke="#fff" stroke-opacity=".35" stroke-width="3"/><circle cx="150" cy="150" r="46" fill="#111"/><line x1="150" y1="150" x2="150" y2="96" stroke="#fff" stroke-width="9" stroke-linecap="round"/></g>
  <text x="150" y="262" text-anchor="middle" class="lbl s">drag me ↻</text>
  <rect x="355" y="40" width="26" height="210" rx="13" fill="url(#potG)"/>
  <text x="368" y="30" text-anchor="middle" class="lbl">5 V</text><text x="368" y="270" text-anchor="middle" class="lbl">GND</text>
  <g id="potW"><polygon points="381,0 400,-10 400,10" class="fa"/><line x1="400" y1="0" x2="440" y2="0" stroke="#fff" stroke-width="4"/><text id="potVt" x="446" y="5" class="lbl m"></text></g>
  <circle id="potGl2" cx="440" cy="290" r="40" fill="url(#potGl)"/><circle cx="440" cy="290" r="14" id="potBulb" fill="#FFBE0B"/><text x="400" y="296" text-anchor="end" class="lbl s">LED</text>`;
  const tk=$('#potTicks');for(let i=0;i<=10;i++){const a=(-135+27*i)*Math.PI/180;mk('line',{x1:150+90*Math.sin(a),y1:150-90*Math.cos(a),x2:150+100*Math.sin(a),y2:150-100*Math.cos(a),stroke:'#fff','stroke-opacity':.5,'stroke-width':3},tk)}
  const R=$('#potR');this.R=R;this.set(.5);R.oninput=()=>this.set(R.value/100);
  let drag=false;const mv=e=>{if(!drag)return;const p=svgPt(s,e);let d=Math.atan2(p.x-150,-(p.y-150))*180/Math.PI;d=clamp(d,-135,135);this.set((d+135)/270)};
  $('#potKnob').addEventListener('pointerdown',e=>{drag=true;s.setPointerCapture(e.pointerId);mv(e)});s.addEventListener('pointermove',mv);s.addEventListener('pointerup',()=>drag=false)},
set(pos){$('#potKnob').setAttribute('transform',`rotate(${pos*270-135} 150 150)`);const y=250-pos*210;$('#potW').setAttribute('transform',`translate(0 ${y})`);
  const v=5*pos;T('potVt',v.toFixed(2)+' V');T('pR1',fmtR((1-pos)*10000));T('pR2',fmtR(pos*10000));T('pV',v.toFixed(2)+' V');this.R.value=pos*100;
  $('#potGl2').setAttribute('opacity',pos);$('#potBulb').setAttribute('opacity',.25+.75*pos)}};

/* ============ 7 · MICROCONTROLLER ============ */
D.mcu={init(){const s=$('#mcuSvg');this.s=s;s.innerHTML='';
  this.fi=flow(s,'M140 140H252',6);this.fo=flow(s,'M428 140H520',6);
  let pins='';for(let i=0;i<8;i++){pins+=`<rect x="250" y="${58+i*24}" width="10" height="10" rx="2" fill="${C.y}"/><rect x="420" y="${58+i*24}" width="10" height="10" rx="2" fill="${C.y}"/>`}
  s.insertAdjacentHTML('beforeend',`<defs><radialGradient id="mcuGl"><stop offset="0" stop-color="#FF006E" stop-opacity=".95"/><stop offset="1" stop-color="#FF006E" stop-opacity="0"/></radialGradient></defs>
  <rect x="20" y="92" width="120" height="96" rx="18" fill="${C.box}" stroke="${C.b}" stroke-width="2"/><text x="80" y="82" text-anchor="middle" class="lbl s">INPUT</text>
  <g id="mBtn" style="cursor:pointer"><circle cx="80" cy="140" r="30" fill="#1b0f40" stroke="#fff" stroke-opacity=".4"/><circle id="mCap" cx="80" cy="140" r="22" fill="${C.b}"/><text x="80" y="178" text-anchor="middle" class="lbl s">tap me</text></g>
  <rect x="258" y="40" width="164" height="200" rx="16" fill="#0b0620" stroke="${C.v}" stroke-width="3"/>${pins}
  <text x="340" y="70" text-anchor="middle" font-size="26" font-weight="700" fill="#fff" font-family="Space Grotesk">µC</text>
  <g id="mB0"><rect x="276" y="92" width="128" height="34" rx="9" fill="${C.b}" opacity=".35"/><text x="340" y="114" text-anchor="middle" class="lbl">I/O pins</text></g>
  <g id="mB1"><rect x="276" y="134" width="128" height="34" rx="9" fill="${C.v}" opacity=".35"/><text x="340" y="156" text-anchor="middle" class="lbl">CPU</text></g>
  <g id="mB2"><rect x="276" y="176" width="128" height="34" rx="9" fill="${C.y}" opacity=".35"/><text x="340" y="198" text-anchor="middle" class="lbl">Memory</text></g>
  <text id="mPh" x="340" y="232" text-anchor="middle" class="lbl s"></text>
  <text id="mWi" x="196" y="128" text-anchor="middle" class="lbl m s"></text>
  <rect x="520" y="92" width="100" height="96" rx="18" fill="${C.box}" stroke="${C.p}" stroke-width="2"/><text x="570" y="82" text-anchor="middle" class="lbl s">OUTPUT</text>
  <circle id="mGl" cx="570" cy="140" r="60" fill="url(#mcuGl)" opacity="0"/><circle id="mLed" cx="570" cy="140" r="24" fill="#2a2a2a" stroke="#fff" stroke-opacity=".5"/><text x="570" y="176" text-anchor="middle" class="lbl s">LED</text>`);
  this.pressed=false;this.phase=0;this.pt=0;this.led=false;this.sync();
  $('#mBtn').onclick=()=>{this.pressed=!this.pressed;this.sync()}},
sync(){const p=this.phase;[0,1,2].forEach(i=>{const lit=p===i||(i===2&&p===1&&false);$('#mB'+i).firstElementChild.setAttribute('opacity',(p===0&&i===0)||(p===1&&(i===1||i===2))||(p===2&&i===0)?.95:.3);
    $('#ml'+(i+1)).classList.toggle('hl',p===i)});
  $('#mCap').setAttribute('fill',this.pressed?C.p:C.b);$('#mCap').setAttribute('r',this.pressed?18:22);
  $('#mLed').setAttribute('fill',this.led?C.p:'#2a2a2a');$('#mGl').setAttribute('opacity',this.led?1:0);
  T('mPh',['1 · READ','2 · DECIDE','3 · ACT'][p]);
  T('mWi',this.pressed?'HIGH':'LOW');
  T('mState',this.pressed?'Button HIGH → decision: yes → LED ON':'Button LOW → decision: no → LED OFF')},
tick(dt){this.pt+=dt;if(this.pt>.9){this.pt=0;this.phase=(this.phase+1)%3;if(this.phase===2)this.led=this.pressed;this.sync()}
  this.fi.step(dt*.8,this.phase===0&&this.pressed?1:0);this.fo.step(dt*.8,this.phase===2&&this.led?1:0)}};

/* ============ 8 · LED ============ */
D.led={init(){const s=$('#ledSvg');this.s=s;this.fwd=true;this.res=true;s.innerHTML='';
  this.fl=flow(s,'M70 250V70H450V250Z',18);
  s.insertAdjacentHTML('beforeend',`<defs><radialGradient id="ledGl"><stop offset="0" stop-color="#FF006E" stop-opacity=".95"/><stop offset="1" stop-color="#FF006E" stop-opacity="0"/></radialGradient></defs>
  <rect x="44" y="120" width="52" height="70" rx="12" fill="${C.box}" stroke="#fff" stroke-opacity=".4"/>
  <line id="bL" x1="52" y1="138" x2="88" y2="138" stroke="#fff" stroke-width="4"/><line id="bS" x1="60" y1="168" x2="80" y2="168" stroke="#fff" stroke-width="9"/>
  <text id="bP" x="104" y="142" class="lbl">+</text><text id="bM" x="104" y="176" class="lbl">−</text><text x="70" y="212" text-anchor="middle" class="lbl s">battery</text>
  <g id="rG"><rect x="195" y="50" width="70" height="40" rx="10" fill="${C.box}" stroke="${C.y}" stroke-width="2"/><path d="M203 70l6-10 9 20 9-20 9 20 9-20 6 10" fill="none" stroke="${C.y}" stroke-width="3" stroke-linejoin="round"/></g>
  <text id="rT" x="230" y="42" text-anchor="middle" class="lbl s">220 Ω resistor</text>
  <circle id="lGl" cx="450" cy="152" r="78" fill="url(#ledGl)" opacity="0"/>
  <rect x="418" y="104" width="64" height="96" rx="16" fill="${C.box}" stroke="${C.p}" stroke-width="2"/>
  <path id="lTri" d="M434 124h32l-16 30z" fill="#fff" fill-opacity=".85"/><line x1="434" y1="158" x2="466" y2="158" stroke="#fff" stroke-width="4"/>
  <g id="lRay" opacity="0" stroke="${C.y}" stroke-width="3" stroke-linecap="round"><line x1="490" y1="120" x2="506" y2="104"/><line x1="494" y1="140" x2="512" y2="132"/><line x1="486" y1="102" x2="494" y2="88"/></g>
  <text x="412" y="132" text-anchor="end" class="lbl s">anode (+)</text><text x="412" y="166" text-anchor="end" class="lbl s">cathode (−)</text>
  <text id="lBlock" x="450" y="224" text-anchor="middle" class="lbl" fill="${C.o}" opacity="0">✋ BLOCKED</text>`);
  $('#ledFlip').onclick=()=>{this.fwd=!this.fwd};$('#ledRes').onclick=()=>{this.res=!this.res;$('#ledRes').textContent=this.res?'⚠ Remove resistor':'✔ Put resistor back'}},
tick(dt,t){const f=this.fwd,r=this.res,burn=f&&!r;
  $('#bL').setAttribute('y1',f?138:168);$('#bL').setAttribute('y2',f?138:168);$('#bS').setAttribute('y1',f?168:138);$('#bS').setAttribute('y2',f?168:138);
  $('#bP').setAttribute('y',f?142:172);$('#bM').setAttribute('y',f?176:146);
  $('#rG').setAttribute('opacity',r?1:.1);T('rT',r?'220 Ω resistor':'⚠ no resistor');
  this.fl.step(f?dt*(r?.28:.8):0,f?1:.3);
  const gl=f?(r?1:.6+.4*Math.sin(t*40)):0;$('#lGl').setAttribute('opacity',gl);$('#lRay').setAttribute('opacity',gl>0?1:0);
  $('#lTri').setAttribute('fill',f?(burn?'#fff':C.p):'#fff');$('#lBlock').setAttribute('opacity',f?0:1);
  $('#ledInfo').textContent=burn?'💥 Way too much current. The LED would burn out in a blink. The resistor is its bodyguard.':f?'✔ Current flows from anode to cathode, so the LED glows. The resistor keeps it near 20 mA.':'✋ Battery reversed: a diode only conducts one way, so no current and no light.'}};

/* ============ 9 · MOTOR PRINCIPLE ============ */
D.motor={init(){const s=$('#motSvg');this.s=s;this.th=0;
  let fl='';for(let i=0;i<5;i++){const y=100+i*30;fl+=`<line x1="124" y1="${y}" x2="396" y2="${y}" stroke="#fff" stroke-opacity=".55" stroke-width="2.5" class="dash"/>`}
  s.innerHTML=`<defs><marker id="mAr" viewBox="0 0 10 10" refX="7" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" fill="${C.y}"/></marker></defs>
  <rect x="30" y="70" width="94" height="180" rx="14" fill="${C.p}"/><text x="77" y="172" text-anchor="middle" font-size="46" font-weight="800" fill="#fff" font-family="Space Grotesk">N</text>
  <rect x="396" y="70" width="94" height="180" rx="14" fill="${C.b}"/><text x="443" y="172" text-anchor="middle" font-size="46" font-weight="800" fill="#fff" font-family="Space Grotesk">S</text>
  ${fl}<text x="260" y="60" text-anchor="middle" class="lbl s">magnetic field → (N to S)</text>
  <circle cx="260" cy="160" r="82" fill="none" stroke="rgba(255,255,255,.15)" stroke-dasharray="4 6"/>
  <line id="mArm" stroke="#fff" stroke-width="7" stroke-linecap="round"/>
  <g id="mE1"><circle r="18" fill="${C.o}" stroke="#fff" stroke-width="2"/><circle class="d" r="5" fill="#fff"/><path class="x" d="M-8-8L8 8M8-8L-8 8" stroke="#fff" stroke-width="3"/></g>
  <g id="mE2"><circle r="18" fill="${C.o}" stroke="#fff" stroke-width="2"/><circle class="d" r="5" fill="#fff"/><path class="x" d="M-8-8L8 8M8-8L-8 8" stroke="#fff" stroke-width="3"/></g>
  <line id="mF1" stroke="${C.y}" stroke-width="5" marker-end="url(#mAr)"/><line id="mF2" stroke="${C.y}" stroke-width="5" marker-end="url(#mAr)"/>
  <circle cx="260" cy="160" r="9" fill="${C.v}" stroke="#fff" stroke-width="2"/>
  <text id="mFl" x="260" y="288" text-anchor="middle" class="lbl" fill="${C.y}"></text>
  <text x="260" y="310" text-anchor="middle" class="lbl s">• current out of page · × current into page · yellow arrows = force</text>`;
  this.I=$('#motI')},
tick(dt){const I=+this.I.value,w=I/100*9;this.th+=w*dt;const th=this.th,cx=260,cy=160,r=76,c=Math.cos(th),sn=Math.sin(th);
  T('motRpm',Math.round(I*30)+' RPM');
  const ends=[[cx+r*c,cy+r*sn],[cx-r*c,cy-r*sn]];$('#mArm').setAttribute('x1',ends[0][0]);$('#mArm').setAttribute('y1',ends[0][1]);$('#mArm').setAttribute('x2',ends[1][0]);$('#mArm').setAttribute('y2',ends[1][1]);
  const len=I<3?0:14+I*.34;
  ends.forEach((e,i)=>{const g=$('#mE'+(i+1)),left=e[0]<cx;g.setAttribute('transform',`translate(${e[0]} ${e[1]})`);
    $('.d',g).style.display=left?'':'none';$('.x',g).style.display=left?'none':'';
    const f=$('#mF'+(i+1)),dir=left?-1:1;f.setAttribute('x1',e[0]);f.setAttribute('y1',e[1]+dir*-22*-1*(-1)*0);
    f.setAttribute('y1',e[1]+(dir<0?-22:22));f.setAttribute('x2',e[0]);f.setAttribute('y2',e[1]+(dir<0?-22-len:22+len));f.style.opacity=len?1:0});
  T('mFl',Math.abs(c)<.14&&I>3?'⟲ commutator flips the current!':'')}};

/* ============ 11 · BUTTON ============ */
D.button={init(){const s=$('#btnSvg');this.s=s;s.innerHTML='';this.on=false;this.n=0;
  this.f1=flow(s,'M60 60H190',6);this.f2=flow(s,'M260 60H440',8);this.f3=flow(s,'M360 60V240',8);
  s.insertAdjacentHTML('beforeend',`<text x="14" y="64" class="lbl">5 V</text>
  <circle cx="190" cy="60" r="6" fill="#fff"/><circle cx="260" cy="60" r="6" fill="#fff"/><line id="bLv" x1="190" y1="60" x2="256" y2="28" stroke="${C.y}" stroke-width="5" stroke-linecap="round"/>
  <text x="225" y="94" text-anchor="middle" class="lbl s">switch</text><circle cx="360" cy="60" r="6" fill="#fff"/>
  <rect x="322" y="116" width="76" height="70" rx="10" fill="${C.box}" stroke="${C.y}" stroke-width="2"/><text x="360" y="156" text-anchor="middle" class="lbl s">10 kΩ</text><text x="360" y="170" text-anchor="middle" class="lbl s">pull-down</text>
  <path d="M338 244h44M346 252h28M354 260h12" stroke="#fff" stroke-width="3"/><text x="360" y="276" text-anchor="middle" class="lbl s">GND</text>
  <rect x="440" y="36" width="64" height="48" rx="10" fill="${C.v}"/><text x="472" y="66" text-anchor="middle" class="lbl">D2</text><text id="bPin" x="472" y="106" text-anchor="middle" class="lbl m"></text>
  <g id="bBig" style="cursor:pointer"><circle cx="110" cy="200" r="58" fill="#1b0f40" stroke="#fff" stroke-opacity=".3" stroke-width="3"/><circle id="bCap" cx="110" cy="196" r="44" fill="${C.b}"/><text id="bTx" x="110" y="202" text-anchor="middle" class="lbl">PRESS</text></g>`);
  const set=v=>{if(v&&!this.on)this.n++;this.on=v;T('bCount',this.n);};
  $('#bBig').addEventListener('pointerdown',e=>{set(true)});['pointerup','pointercancel'].forEach(ev=>window.addEventListener(ev,()=>this.on&&set(false)));
  this.set=set;
  addEventListener('keydown',e=>{if(e.code==='Space'&&isActive('button')){e.preventDefault();if(!e.repeat)set(true)}});addEventListener('keyup',e=>{if(e.code==='Space'&&isActive('button'))set(false)})},
tick(dt){const on=this.on;$('#bLv').setAttribute('x2',on?258:256);$('#bLv').setAttribute('y2',on?60:28);
  $('#bCap').setAttribute('cy',on?204:196);$('#bCap').setAttribute('fill',on?C.p:C.b);$('#bTx').textContent=on?'HOLD':'PRESS';
  this.f1.step(on?dt*.5:0,on?1:0);this.f2.step(on?dt*.5:0,on?1:0);this.f3.step(on?dt*.4:0,on?1:0);
  $('#bPin').textContent=on?'HIGH · 5 V':'LOW · 0 V';$('#bPin').setAttribute('fill',on?C.y:'#bbb');
  $('#bState').innerHTML='D2 = <b>'+(on?'HIGH':'LOW')+'</b>'}};

/* ============ 12 · ADC ============ */
D.adc={init(){const s=$('#adcSvg');let t='';
  for(let i=0;i<=6;i++){const a=(i*30)*Math.PI/180,x1=260-128*Math.cos(a),y1=190-128*Math.sin(a),x2=260-146*Math.cos(a),y2=190-146*Math.sin(a);t+=`<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#fff" stroke-opacity=".6" stroke-width="3"/><text x="${260-168*Math.cos(a)}" y="${194-168*Math.sin(a)}" text-anchor="middle" class="lbl s">${i*30}°</text>`}
  s.innerHTML=`<defs><linearGradient id="adcG" x1="0" x2="1"><stop offset="0" stop-color="${C.y}"/><stop offset=".5" stop-color="${C.p}"/><stop offset="1" stop-color="${C.b}"/></linearGradient></defs>
  <path d="M120 190A140 140 0 0 1 400 190" fill="none" stroke="url(#adcG)" stroke-width="16" stroke-linecap="round"/>${t}
  <line id="adcN2" x1="260" y1="190" x2="140" y2="190" stroke="#fff" stroke-width="7" stroke-linecap="round"/><circle cx="260" cy="190" r="12" fill="${C.b}" stroke="#fff" stroke-width="3"/>
  <text x="260" y="214" text-anchor="middle" class="lbl s">mapped angle</text>`;
  const b=$('#adcBits');for(let i=9;i>=0;i--){const d=document.createElement('div');d.className='bit';d.id='ab'+i;d.textContent='0';b.appendChild(d)}
  const R=$('#adcR');const up=()=>{const n=+R.value;T('adcN',n);T('adcV',(n/1023*5).toFixed(2)+' V');const a=Math.round(n/1023*180);T('adcA',a+'°');
    for(let i=0;i<10;i++){const e=$('#ab'+i),on=(n>>i)&1;e.textContent=on;e.classList.toggle('on',!!on)}
    const r=a*Math.PI/180;$('#adcN2').setAttribute('x2',260-120*Math.cos(r));$('#adcN2').setAttribute('y2',190-120*Math.sin(r))};R.oninput=up;up()}};

/* ============ 13 · LDR ============ */
D.ldr={init(){const s=$('#ldrSvg');let st='';for(let i=0;i<26;i++)st+=`<circle cx="${Math.round(Math.random()*500+10)}" cy="${Math.round(Math.random()*130+8)}" r="${(Math.random()*1.6+.6).toFixed(1)}" fill="#fff"/>`;
  s.innerHTML=`<defs><radialGradient id="sunG"><stop offset="0" stop-color="#FFBE0B"/><stop offset="1" stop-color="#FB5607"/></radialGradient></defs>
  <rect id="sky" x="0" y="0" width="520" height="300" rx="18"/><g id="stars">${st}</g>
  <circle id="sun" cx="110" cy="80" r="34" fill="url(#sunG)"/><circle id="moon" cx="110" cy="80" r="26" fill="#f4f1ff"/><circle cx="120" cy="72" r="26" id="moonCut" />
  <path d="M0 232H520V300H0z" fill="#111"/><g fill="#222"><rect x="30" y="190" width="60" height="45"/><rect x="100" y="205" width="44" height="30"/><rect x="400" y="185" width="70" height="50"/></g>
  <polygon id="cone" points="330,158 262,232 398,232" fill="${C.y}" opacity="0"/>
  <rect x="326" y="160" width="8" height="74" fill="#8e8aa6"/><path d="M330 160h-22" stroke="#8e8aa6" stroke-width="6"/>
  <circle id="bulb" cx="308" cy="166" r="11" fill="#555"/>
  <circle cx="330" cy="205" r="9" fill="${C.o}" stroke="#fff" stroke-width="2"/><text x="346" y="209" class="lbl s">LDR</text>`;
  this.R=$('#ldrS');this.up=()=>{const sv=+this.R.value/100,b=1-sv,R=1000+199000*Math.pow(sv,2),A=Math.round(5*10000/(10000+R)/5*1023);
    $('#sky').setAttribute('fill',mix('#3A86FF','#000000',Math.pow(sv,.8)));$('#stars').setAttribute('opacity',clamp((sv-.35)*2,0,1));
    $('#sun').setAttribute('opacity',1-sv);$('#sun').setAttribute('cy',80+sv*90);$('#moon').setAttribute('opacity',clamp((sv-.3)*1.8,0,1));$('#moon').setAttribute('cy',150-sv*70);
    const mc=$('#moonCut');mc.setAttribute('opacity',0);
    const on=A<300;$('#cone').setAttribute('opacity',on?.35:0);$('#bulb').setAttribute('fill',on?C.y:'#555');
    T('ldrR',fmtR(R));T('ldrA',A);T('ldrL',on?'💡 dark → lamp ON (A < 300)':'☀ bright → lamp OFF')};
  this.R.oninput=this.up;this.up()}};

/* ============ 14 · ULTRASONIC ============ */
D.ultra={init(){const s=$('#ultSvg');this.s=s;
  s.innerHTML=`<rect x="14" y="84" width="96" height="112" rx="14" fill="${C.b}"/><circle cx="62" cy="116" r="20" fill="#ccd" stroke="#889" stroke-width="3"/><circle cx="62" cy="164" r="20" fill="#ccd" stroke="#889" stroke-width="3"/>
  <text x="62" y="121" text-anchor="middle" class="lbl fi">T</text><text x="62" y="169" text-anchor="middle" class="lbl fi">R</text><text x="62" y="76" text-anchor="middle" class="lbl s">HC-SR04</text>
  <g id="uObj"><rect width="30" height="90" rx="10" class="fo"/><circle cx="15" cy="30" r="3" fill="#fff"/><circle cx="15" cy="46" r="3" fill="#fff"/></g>
  <g id="uW"></g>
  <text x="14" y="228" class="lbl s">TRIG</text><path id="uTrig" d="" fill="none" stroke="${C.y}" stroke-width="3"/>
  <text x="14" y="282" class="lbl s">ECHO</text><path id="uEcho" d="" fill="none" stroke="${C.p}" stroke-width="3"/>`;
  const w=$('#uW');this.arcs=[0,1,2].map(()=>mk('path',{fill:'none','stroke-width':5,'stroke-linecap':'round'},w));this.D=$('#ultD');
  this.D.oninput=()=>this.up();this.up()},
up(){const d=+this.D.value;this.ox=130+(d-5)/195*(520-130-30);$('#uObj').setAttribute('transform',`translate(${this.ox} 95)`);
  const us=d*2/0.0343;T('ultDv',d+' cm');T('ultT',Math.round(us)+' µs');
  const w=6+d/200*330;$('#uTrig').setAttribute('d','M60 246H100V222H112V246H540');$('#uEcho').setAttribute('d',`M60 300H132V272H${132+w}V300H540`)},
tick(dt,t){const d=+this.D.value,travel=.5+d/200*1.5,cyc=travel+.7,l=t%cyc;this.arcs.forEach((a,i)=>{
    if(l>travel){a.setAttribute('d','');return}
    const ph=l/travel-i*.045;if(ph<0||ph>1){a.setAttribute('d','');return}
    const out=ph<.5,k=out?ph*2:(ph-.5)*2,x0=116,x1=this.ox-4,x=out?lerp(x0,x1,k):lerp(x1,x0,k);
    a.setAttribute('d',`M${x} 100Q${x+(out?16:-16)} 140 ${x} 180`);a.setAttribute('stroke',out?C.y:C.p);a.setAttribute('opacity',1-i*.3)})}};

/* ============ 15 · SOIL ============ */
D.soil={init(){const s=$('#soilSvg');this.m=20;
  s.innerHTML=`<defs><clipPath id="potClip"><path d="M140 196H380L356 306H164z"/></clipPath></defs>
  <path d="M140 196H380L356 306H164z" fill="#FB5607"/><rect x="130" y="188" width="260" height="22" rx="8" fill="#FF7a33"/>
  <g clip-path="url(#potClip)"><rect id="soilFill" x="140" y="210" width="240" height="100"/></g>
  <line id="stem" x1="200" y1="212" x2="200" y2="120" stroke-width="8" stroke-linecap="round"/>
  <g id="leafL" transform="translate(200 150)"><ellipse cx="-38" cy="0" rx="40" ry="15" id="lfL"/></g>
  <g id="leafR" transform="translate(200 128)"><ellipse cx="38" cy="0" rx="40" ry="15" id="lfR"/></g>
  <g><rect x="318" y="150" width="44" height="30" rx="5" fill="${C.b}"/><rect x="326" y="180" width="6" height="64" rx="2" fill="#ccd"/><rect x="348" y="180" width="6" height="64" rx="2" fill="#ccd"/><text x="340" y="170" text-anchor="middle" class="lbl s">probe</text></g>
  <path d="M362 165H430" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-dasharray="4 4"/><text x="436" y="169" class="lbl s">to A0</text>
  <g id="pump"><rect x="410" y="36" width="90" height="46" rx="12" id="pumpBox"/><text x="455" y="64" text-anchor="middle" class="lbl">PUMP</text></g>
  <path d="M410 59H300V176" fill="none" stroke="#8ec5ff" stroke-width="8" stroke-linecap="round" opacity=".5"/>
  <g id="drops"></g>`;
  this.drops=[...Array(6)].map((_,i)=>({c:mk('circle',{r:5,fill:C.b},$('#drops')),o:i/6}));
  this.M=$('#soilM');this.M.oninput=()=>this.m=+this.M.value;this.pump=false;this.auto=$('#soilAuto')},
tick(dt){let m=this.m;
  if(this.auto.checked){if(m<35)this.pump=true;if(m>70)this.pump=false}else this.pump=false;
  m=clamp(m+(this.pump?16:-1.3)*dt,0,100);this.m=m;this.M.value=m;const k=m/100;
  $('#soilFill').setAttribute('fill',mix('#a8743c','#3a2212',k));$('#stem').setAttribute('stroke',mix('#9a8a3a','#3bbf5a',k));
  const g=mix('#9a8a3a','#3bbf5a',k);$('#lfL').setAttribute('fill',g);$('#lfR').setAttribute('fill',g);
  const dr=1-k;$('#leafL').setAttribute('transform',`translate(200 150) rotate(${25-dr*100})`);$('#leafR').setAttribute('transform',`translate(200 128) rotate(${-25+dr*100})`);
  $('#pumpBox').setAttribute('fill',this.pump?C.b:'#333');
  this.drops.forEach(d=>{d.o=(d.o+dt*(this.pump?.9:0))%1;const y=lerp(80,190,d.o);d.c.setAttribute('cx',300);d.c.setAttribute('cy',y+(d.o<.4?0:0));d.c.setAttribute('opacity',this.pump?1:0)});
  T('soilP',Math.round(m)+'%');T('soilA',Math.round(900-6*m));T('soilS',this.pump?'💧 pump ON':(m<35?'🥀 thirsty!':'🌿 happy plant'))}};

/* ============ 16 · IR ============ */
D.ir={init(){const s=$('#irSvg');this.white=true;
  s.innerHTML=`<rect x="14" y="90" width="100" height="116" rx="14" fill="${C.v}"/>
  <circle cx="92" cy="128" r="14" fill="#e9d6ff" stroke="#fff" stroke-width="3"/><text x="22" y="132" class="lbl s">IR LED</text>
  <circle cx="92" cy="170" r="14" fill="#1a1033" stroke="#fff" stroke-width="3"/><text x="22" y="174" class="lbl s">photo-</text><text x="22" y="186" class="lbl s">diode</text>
  <circle id="irLed" cx="98" cy="104" r="6" fill="#553"/>
  <line id="irThr" y1="60" y2="240" stroke="#fff" stroke-opacity=".35" stroke-dasharray="4 6"/><text id="irThrT" y="56" text-anchor="middle" class="lbl s">detect range ≈ 15 cm</text>
  <line id="irB1" y1="128" y2="128" stroke="${C.y}" stroke-width="4" class="dash"/><line id="irB2" stroke="${C.p}" stroke-width="4" class="dash"/>
  <rect id="irObj" y="100" width="30" height="100" rx="8"/><text id="irX" y="270" text-anchor="middle" class="lbl" fill="${C.o}"></text>`;
  this.D=$('#irD');const W=$('#irW'),B=$('#irB');
  W.onclick=()=>{this.white=true;W.classList.remove('ghost');B.classList.add('ghost')};B.onclick=()=>{this.white=false;B.classList.remove('ghost');W.classList.add('ghost')};
  this.D.oninput=()=>this.up();this.up()},
up(){const d=+this.D.value,ox=130+(d-2)/28*370,det=this.white&&d<15;this.ox=ox;
  $('#irObj').setAttribute('x',ox);$('#irObj').setAttribute('fill',this.white?'#f4f1ff':'#0c0618');$('#irObj').setAttribute('stroke','#fff');
  const thx=130+(15-2)/28*370;$('#irThr').setAttribute('x1',thx);$('#irThr').setAttribute('x2',thx);$('#irThrT').setAttribute('x',thx);
  $('#irB1').setAttribute('x1',118);$('#irB1').setAttribute('x2',ox);
  const b2=$('#irB2');b2.setAttribute('x1',ox);b2.setAttribute('y1',170);b2.setAttribute('x2',118);b2.setAttribute('y2',170);b2.style.opacity=this.white?(d<15?1:.25):0;
  $('#irLed').setAttribute('fill',det?'#ff3b3b':'#553');$('#irX').setAttribute('x',ox+15);$('#irX').textContent=this.white?'':'absorbed ✕';
  T('irOut',det?'OUT = LOW → object detected!':'OUT = HIGH → nothing detected')},
tick(){this.up()}};

/* ============ 17 · ARDUINO ============ */
function board(svg,infoEl,defs,hoverText){const o={};return o}
D.arduino={init(){const s=$('#ardSvg');let h=`<rect x="20" y="52" width="520" height="240" rx="20" fill="#3A86FF" stroke="#fff" stroke-width="4"/>
  <rect x="14" y="96" width="70" height="62" rx="4" fill="#cfd3d8"/><text x="49" y="132" text-anchor="middle" class="lbl s fi">USB</text><rect x="14" y="200" width="60" height="58" rx="4" fill="#222"/><text x="44" y="234" text-anchor="middle" class="lbl s">power</text>
  <rect id="chip" x="310" y="150" width="170" height="54" rx="6" fill="#111"/><text x="395" y="183" text-anchor="middle" class="lbl m" style="font-size:13px">ATmega328P</text>
  <text x="280" y="42" text-anchor="middle" class="lbl s">DIGITAL (PWM ~)</text><text x="400" y="320" text-anchor="middle" class="lbl s">ANALOG IN</text><text x="200" y="320" text-anchor="middle" class="lbl s">POWER</text>`;
  const info={};let pins='';
  for(let i=0;i<14;i++){const x=150+i*26,pwm=[3,5,6,9,10,11].includes(i);
    info['d'+i]=i<2?`D${i} (${i?'TX':'RX'}): used by USB serial. Avoid it while uploading code.`:i===13?'D13: digital pin, also wired to the onboard "L" LED (your first blink!).':`D${i}: digital pin. Reads buttons or drives LEDs (HIGH = 5 V, LOW = 0 V).${pwm?' ~ PWM: analogWrite(0–255) fakes analog output for dimming and motor speed.':''}`;
    pins+=`<rect class="pin" data-i="d${i}" x="${x}" y="58" width="16" height="22" rx="3" fill="#111" stroke="${C.y}" stroke-width="2"/><text x="${x+8}" y="102" text-anchor="middle" class="lbl s" style="font-size:10px">${pwm?'~':''}${i}</text>`}
  [['5V','5V: power output for sensors and LEDs.'],['3V3','3.3V: for 3.3 V sensors (low current).'],['GND','GND: ground, the 0 V return path. Everything must share it.'],['VIN','VIN: input for an external 7–12 V supply.']].forEach((p,i)=>{const x=130+i*34;info['p'+i]=p[1];pins+=`<rect class="pin" data-i="p${i}" x="${x}" y="262" width="22" height="18" rx="3" fill="#111" stroke="${C.p}" stroke-width="2"/><text x="${x+11}" y="256" text-anchor="middle" class="lbl s" style="font-size:10px">${p[0]}</text>`});
  for(let i=0;i<6;i++){const x=330+i*30;info['a'+i]=`A${i}: analog input. analogRead gives 0–1023 (potentiometers, LDRs, soil sensors).`;pins+=`<rect class="pin" data-i="a${i}" x="${x}" y="262" width="20" height="18" rx="3" fill="#111" stroke="${C.b}" stroke-width="2"/><text x="${x+10}" y="256" text-anchor="middle" class="lbl s" style="font-size:10px">A${i}</text>`}
  h+=pins+`<g><rect id="ledL" x="450" y="112" width="14" height="8" rx="2" fill="#552"/><text x="457" y="132" text-anchor="middle" class="lbl s" style="font-size:10px">L</text><rect id="ledT" x="420" y="112" width="14" height="8" rx="2" fill="#552"/><text x="427" y="132" text-anchor="middle" class="lbl s" style="font-size:10px">TX</text><rect id="ledR" x="390" y="112" width="14" height="8" rx="2" fill="#552"/><text x="397" y="132" text-anchor="middle" class="lbl s" style="font-size:10px">RX</text></g>
  <circle cx="110" cy="190" r="12" fill="#a00"/><text x="110" y="216" text-anchor="middle" class="lbl s" style="font-size:10px">RESET</text>`;
  s.innerHTML=h;this.x=0;
  const show=e=>{const i=e.target.dataset&&e.target.dataset.i;if(i)$('#ardInfo').textContent=info[i]};
  s.addEventListener('mouseover',show);s.addEventListener('click',show);
  $('#chip').addEventListener('mouseover',()=>$('#ardInfo').textContent='ATmega328P: the actual brain. 8-bit AVR, 16 MHz, 32 KB flash for your program, 2 KB RAM.');
  s.insertAdjacentHTML('beforeend','<style>.pin{cursor:pointer;transition:fill .15s}.pin:hover{fill:#FFBE0B}</style>')},
tick(dt,t){const on=Math.floor(t*2)%2===0;$('#ledL').setAttribute('fill',on?C.y:'#552');$('#ledL').style.filter=on?`drop-shadow(0 0 6px ${C.y})`:'none';
  const f=Math.sin(t*7)>.6;$('#ledT').setAttribute('fill',f?C.o:'#552');$('#ledR').setAttribute('fill',Math.sin(t*5+1)>.7?C.o:'#552')}};

/* ============ 18 · ESP32 ============ */
D.esp={init(){const s=$('#espSvg'),L=['EN','VP','VN','D34','D35','D32','D33','D25','D26','D27','D14','D12','D13','GND','VIN'],R=['GND','D23','D22','TX0','RX0','D21','GND','D19','D18','D5','TX2','RX2','D4','D2','D15'];
  const info=n=>/^D3[2-5]|^V[PN]$/.test(n)?`${n}: input-capable ADC pin (12-bit, 0–4095). D34–D39 are input only.`:n==='GND'?'GND: ground (0 V).':n==='VIN'?'VIN: 5 V in (from USB or an external supply).':n==='EN'?'EN: reset / enable pin.':/TX|RX/.test(n)?`${n}: serial communication pins.`:`${n}: general purpose pin. Works as digital in/out, PWM, touch or ADC on many pins. Remember: 3.3 V logic only!`;
  let h=`<rect x="196" y="22" width="168" height="302" rx="14" fill="#161026" stroke="#000" stroke-width="3"/>
  <rect x="228" y="30" width="104" height="52" rx="6" fill="#0e0a1a"/><path class="ant" d="M236 74V40h12v34h12V40h12v34h12V40h12v34h12V40" fill="none" stroke="${C.y}" stroke-width="3"/><text x="280" y="96" text-anchor="middle" class="lbl s" style="font-size:10px">PCB antenna</text>
  <rect id="espChip" x="226" y="104" width="108" height="108" rx="6" fill="#c9ccd6"/><text x="280" y="152" text-anchor="middle" class="lbl m fi" style="font-size:12px">ESP-WROOM</text><text x="280" y="170" text-anchor="middle" class="lbl m fi" style="font-size:12px">32</text>
  <rect x="254" y="290" width="52" height="34" rx="4" fill="#cfd3d8"/><text x="280" y="280" text-anchor="middle" class="lbl s" style="font-size:10px">USB</text>`;
  L.forEach((n,i)=>{const y=100+i*14.5;h+=`<rect class="pin" data-n="${n}" x="196" y="${y}" width="14" height="9" fill="${C.y}"/><text x="190" y="${y+8}" text-anchor="end" class="lbl s" style="font-size:9.5px">${n}</text>`});
  R.forEach((n,i)=>{const y=100+i*14.5;h+=`<rect class="pin" data-n="${n}" x="350" y="${y}" width="14" height="9" fill="${C.y}"/><text x="370" y="${y+8}" class="lbl s" style="font-size:9.5px">${n}</text>`});
  h+=`<g id="waves"></g><text x="470" y="60" class="lbl" fill="${C.y}">Wi-Fi</text><text x="470" y="82" class="lbl" fill="${C.b}">Bluetooth</text><text x="470" y="104" class="lbl s">radio waves</text><style>.pin{cursor:pointer}.pin:hover{fill:#FF006E}</style>`;
  s.innerHTML=h;const w=$('#waves');this.w=[0,1,2].map(()=>mk('path',{fill:'none','stroke-width':4,'stroke-linecap':'round'},w));
  const I=$('#espInfo');const show=e=>{const n=e.target.dataset&&e.target.dataset.n;if(n)I.textContent=info(n)};s.addEventListener('mouseover',show);s.addEventListener('click',show);
  $('#espChip').addEventListener('mouseover',()=>I.textContent='ESP32 chip: dual-core 240 MHz, 520 KB RAM, Wi-Fi + Bluetooth LE, hall sensor, touch pins, 2 DACs.');$('#espChip').addEventListener('click',()=>I.textContent='ESP32 chip: dual-core 240 MHz, 520 KB RAM, Wi-Fi + Bluetooth LE.')},
tick(dt,t){this.w.forEach((p,i)=>{const k=((t*.7+i/3)%1),r=14+k*70,cx=280,cy=34,col=i%2?C.b:C.y;
    p.setAttribute('d',`M${cx-r*.72} ${cy-r*.72}A${r} ${r} 0 0 1 ${cx+r*.72} ${cy-r*.72}`);p.setAttribute('stroke',col);p.setAttribute('opacity',1-k)})}};

/* ============ 20 · SERVO ============ */
D.servo={init(){const s=$('#srvSvg');s.setAttribute('viewBox','0 0 520 400');let t='';
  for(let i=0;i<=4;i++){const a=i*45*Math.PI/180;t+=`<line x1="${260-118*Math.cos(a)}" y1="${196-118*Math.sin(a)}" x2="${260-132*Math.cos(a)}" y2="${196-132*Math.sin(a)}" stroke="#fff" stroke-opacity=".6" stroke-width="3"/><text x="${260-152*Math.cos(a)}" y="${200-152*Math.sin(a)}" text-anchor="middle" class="lbl s">${i*45}°</text>`}
  s.innerHTML=`<path d="M128 196A132 132 0 0 1 392 196" fill="none" stroke="rgba(255,255,255,.25)" stroke-width="3" stroke-dasharray="4 6"/>${t}
  <rect x="170" y="196" width="180" height="86" rx="10" fill="${C.b}"/><rect x="150" y="236" width="20" height="14" rx="3" fill="${C.b}"/><rect x="350" y="236" width="20" height="14" rx="3" fill="${C.b}"/>
  <circle id="gear" cx="225" cy="242" r="22" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="9" stroke-dasharray="7 5"/><circle cx="225" cy="242" r="10" fill="#fff" fill-opacity=".4"/>
  <text x="262" y="244" class="lbl s" style="font-size:10px">motor + gears</text><text x="262" y="258" class="lbl s" style="font-size:10px">+ feedback pot</text>
  <g id="horn" transform="translate(260 196)"><rect x="-112" y="-9" width="120" height="18" rx="9" fill="#fff"/><circle cx="-100" cy="0" r="4" fill="${C.o}"/><circle r="15" fill="${C.o}" stroke="#fff" stroke-width="3"/></g>
  <path d="M352 238h56" stroke="#c98a5a" stroke-width="6" stroke-linecap="round"/><path d="M352 252h56" stroke="#ff4d4d" stroke-width="6" stroke-linecap="round"/><path d="M352 266h56" stroke="${C.y}" stroke-width="6" stroke-linecap="round"/>
  <text x="416" y="242" class="lbl s">GND</text><text x="416" y="256" class="lbl s">5 V</text><text x="416" y="270" class="lbl s">signal</text>
  <text x="40" y="318" class="lbl">PWM control signal (one 20 ms frame)</text>
  <path id="pwmB" d="" fill="none" stroke="rgba(255,255,255,.4)" stroke-width="2"/><path id="pwmP" d="" fill="rgba(255,190,11,.35)" stroke="${C.y}" stroke-width="3"/>
  <g class="lbl s"><text x="40" y="392">0</text><text x="150" y="392">5 ms</text><text x="260" y="392">10 ms</text><text x="370" y="392">15 ms</text><text x="480" y="392" text-anchor="end">20 ms</text></g>`;
  this.A=$('#srvA');this.cur=90;this.target=90;this.sw=false;
  this.A.oninput=()=>{this.sw=false;$('#srvSweep').classList.remove('on');this.target=+this.A.value};
  $('#srvSweep').onclick=e=>{this.sw=!this.sw;e.target.classList.toggle('on',this.sw)}},
tick(dt,t){if(this.sw){this.target=90+90*Math.sin(t*1.4);this.A.value=this.target}
  this.cur+=(this.target-this.cur)*(1-Math.exp(-dt*9));const a=this.cur;
  $('#horn').setAttribute('transform',`translate(260 196) rotate(${a})`);$('#gear').setAttribute('transform',`rotate(${-a*3} 225 242)`);
  const ms=1+a/180,w=ms*22;$('#pwmB').setAttribute('d','M40 372H480');$('#pwmP').setAttribute('d',`M40 372V338H${40+w}V372`);
  T('srvAv',Math.round(a)+'°');T('srvP',ms.toFixed(2)+' ms')}};

/* ============ 21 · DC MOTOR ============ */
D.dcm={init(){const s=$('#dcSvg');s.setAttribute('viewBox','0 0 520 400');s.innerHTML='';this.dir=1;this.ang=0;
  this.ft=flow(s,'M92 140H160',4);this.fb=flow(s,'M160 190H92',4);
  s.insertAdjacentHTML('beforeend',`<rect x="14" y="116" width="78" height="100" rx="14" fill="${C.box}" stroke="${C.v}" stroke-width="2"/><text x="53" y="158" text-anchor="middle" class="lbl s">H-bridge</text><text x="53" y="174" text-anchor="middle" class="lbl s">driver</text>
  <text x="53" y="236" text-anchor="middle" class="lbl s">← PWM from Arduino</text>
  <rect x="160" y="108" width="150" height="104" rx="22" fill="#9a97b3"/><rect x="160" y="108" width="40" height="104" rx="18" fill="#6d6a8a"/><rect x="310" y="150" width="46" height="20" fill="#d6d3e6"/>
  <text x="248" y="165" text-anchor="middle" class="lbl fi">DC MOTOR</text>
  <g id="fan" transform="translate(380 160)"><circle r="8" fill="#fff"/><g fill="${C.o}"><ellipse cx="0" cy="-34" rx="14" ry="30"/></g><g fill="${C.p}" transform="rotate(120)"><ellipse cx="0" cy="-34" rx="14" ry="30"/></g><g fill="${C.y}" transform="rotate(240)"><ellipse cx="0" cy="-34" rx="14" ry="30"/></g></g>
  <text x="40" y="294" class="lbl">PWM: the pin flicks ON/OFF very fast</text><path id="dcP" d="" fill="rgba(255,190,11,.3)" stroke="${C.y}" stroke-width="3"/>
  <text id="dcAvg" x="480" y="388" text-anchor="end" class="lbl s"></text>`);
  this.D=$('#dcD');$('#dcDir').onclick=()=>this.dir*=-1},
tick(dt){const d=+this.D.value/100,dir=this.dir;this.ang+=dir*d*900*dt;$('#fan').setAttribute('transform',`translate(380 160) rotate(${this.ang})`);
  this.ft.step(.5*dt*d*dir,d>.02?1:0);this.fb.step(.5*dt*d*dir,d>.02?1:0);
  let p='M40 372';const per=110;for(let i=0;i<4;i++){const x=40+i*per,w=d*per;p+=`V${372}H${x}V338H${x+w}V372H${x+per}`}$('#dcP').setAttribute('d',p);
  T('dcW',Math.round(d*255)+' / 255');T('dcR',Math.round(d*3000)+' RPM');T('dcDirL',dir>0?'↻ forward':'↺ reverse');T('dcAvg','average ≈ '+(d*5).toFixed(1)+' V')}};

/* ============ 22 · RECAP ============ */
D.recap={init(){const S=[
  {n:'Street light',a:['💡','Photoresistor','sees darkness'],b:['🧠','Arduino','dark? then switch on'],c:['🔆','LED lamp','lights up'],i:'Lamps switch on at dusk and off at dawn by themselves, saving electricity and the monthly EB bill.'},
  {n:'Plant waterer',a:['🌱','Soil moisture','feels dry soil'],b:['📶','ESP32','decides and alerts phone'],c:['💧','Pump motor','waters the plant'],i:'Your terrace plants survive the Pongal holidays while the family is away.'},
  {n:'Parking helper',a:['📏','Ultrasonic','measures the gap'],b:['🧠','Arduino','too close? warn'],c:['🔴','LED + buzzer','blinks and beeps'],i:'No more scratches when reversing into a tight apartment parking spot.'},
  {n:'Touchless tap',a:['👋','IR sensor','sees your hand'],b:['🧠','Arduino','hand there? open'],c:['⚙️','Servo','turns the valve'],i:'Clean hands, no germs on the handle, and no water wasted.'}];
  this.S=S;const tb=$('#rcTabs');S.forEach((x,i)=>{const b=document.createElement('button');b.className='btn sm'+(i?' ghost':'');b.textContent=x.n;b.onclick=()=>this.pick(i);tb.appendChild(b)});this.pick(0)},
pick(i){const x=this.S[i];$$('#rcTabs .btn').forEach((b,k)=>b.classList.toggle('ghost',k!==i));['a','b','c'].forEach((k,j)=>{T('rcE'+j,x[k][0]);T('rcT'+j,x[k][1]);T('rcS'+j,x[k][2])});T('rcInfo','✨ '+x.i)},
tick(dt,t){const s=Math.floor(t/.7)%7;[0,1,2].forEach(j=>$('#rcN'+j).classList.toggle('lit',s===j*2));[0,1].forEach(j=>$('#rcA'+j).classList.toggle('lit',s===j*2+1))}};

/* ================= SLIDE ENGINE ================= */
const slides=$$('.slide');let cur=0;
const isActive=n=>slides[cur]&&slides[cur].dataset.demo===n;
slides.forEach(sl=>$$('.rv',sl).forEach((e,i)=>{if(!e.style.getPropertyValue('--d'))e.style.setProperty('--d',(i*.09)+'s')}));
function go(i,push=true){i=clamp(i,0,slides.length-1);cur=i;
  slides.forEach((s,k)=>{s.classList.toggle('active',k===i);s.classList.toggle('past',k<i)});
  const s=slides[i];T('grp',s.dataset.group);T('cnt',(i+1)+' / '+slides.length);$('#prog').style.width=((i+1)/slides.length*100)+'%';
  $('#prev').disabled=i===0;$('#next').disabled=i===slides.length-1;s.scrollTop=0;
  if(push)history.replaceState(null,'','#'+(i+1))}
$('#next').onclick=()=>go(cur+1);$('#prev').onclick=()=>go(cur-1);
document.addEventListener('click',e=>{if(e.target.closest('[data-next]'))go(cur+1);if(e.target.closest('[data-restart]'))go(0)});
addEventListener('keydown',e=>{if(e.target.matches('input[type=range]')&&['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(e.key))return;
  if(e.key==='ArrowRight'||e.key==='PageDown'||(e.key===' '&&!isActive('button')))go(cur+1);
  else if(e.key==='ArrowLeft'||e.key==='PageUp')go(cur-1);else if(e.key==='Home')go(0);else if(e.key==='End')go(slides.length-1);
  else if(e.key==='f'||e.key==='F'){document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen&&document.documentElement.requestFullscreen()}
  else if(e.key==='m'||e.key==='M')toggleMenu();else if(e.key==='Escape')$('#menu').classList.remove('open')});
let sx=0,sy=0,inStage=false;
addEventListener('touchstart',e=>{sx=e.touches[0].clientX;sy=e.touches[0].clientY;inStage=!!e.target.closest('.stage,.cards')},{passive:true});
addEventListener('touchend',e=>{if(inStage)return;const dx=e.changedTouches[0].clientX-sx,dy=e.changedTouches[0].clientY-sy;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)go(cur+(dx<0?1:-1))},{passive:true});
/* menu */
function toggleMenu(){$('#menu').classList.toggle('open')}
$('#menuBtn').onclick=toggleMenu;$('#menu').onclick=e=>{if(e.target.id==='menu')toggleMenu()};
(()=>{let h='',g='';slides.forEach((s,i)=>{if(s.dataset.group!==g){if(g)h+='</div>';g=s.dataset.group;h+=`<h3>${g}</h3><div class="grid">`}
  h+=`<button class="it ${s.className.match(/c-\w/)[0]}" data-go="${i}" style="border-left:6px solid var(--acc)">${s.dataset.title}<small>slide ${i+1}</small></button>`});
  $('#menuBody').innerHTML=h+'</div>';$('#menuBody').onclick=e=>{const b=e.target.closest('[data-go]');if(b){go(+b.dataset.go);toggleMenu()}}})();
/* boot */
for(const k in D){try{D[k].init()}catch(err){console.error('demo init failed:',k,err)}}
let last=performance.now();
function loop(now){const dt=Math.min(.05,(now-last)/1000);last=now;const d=D[slides[cur].dataset.demo];if(d&&d.tick){try{d.tick(dt,now/1000)}catch(err){console.error('tick',slides[cur].dataset.demo,err)}}requestAnimationFrame(loop)}
requestAnimationFrame(loop);
go(clamp((parseInt(location.hash.slice(1))||1)-1,0,slides.length-1),false);
addEventListener('hashchange',()=>go((parseInt(location.hash.slice(1))||1)-1,false));
