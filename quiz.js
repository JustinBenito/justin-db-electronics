'use strict';
/* ===== Question bank — edit freely. `a` = index of the right option. ===== */
const PARTS=['Part 1 · Basics','Part 2 · Level up','Part 3 · Real world'];
const Q=[
 // ---- 8 basic ----
 {p:0,q:'What does a resistor do in a circuit?',o:['Stores electric charge','Limits (resists) the flow of current','Makes light','Spins a shaft'],a:1,why:'A resistor opposes current. That is how it protects parts like LEDs. Ohm\'s law: V = I × R.'},
 {p:0,q:'What is the unit of resistance?',o:['Volt (V)','Ampere (A)','Ohm (Ω)','Farad (F)'],a:2,why:'Resistance is measured in ohms (Ω). Volts measure the push, amps measure the flow, and farads measure capacitance.'},
 {p:0,q:'Which component can store charge and release it quickly, like a tiny rechargeable bucket?',o:['Resistor','Capacitor','Diode','Button'],a:1,why:'A capacitor stores charge on two plates. It is used in camera flashes, power smoothing and the ceiling fan at home.'},
 {p:0,q:'An LED will only light up if current flows…',o:['In both directions','Only from cathode to anode','Only from anode (+) to cathode (−)','Only when it is very cold'],a:2,why:'An LED is a diode, so it conducts one way. Anode (long leg, +) to cathode (short leg, −). Put it in backwards and nothing happens.'},
 {p:0,q:'In the "sense → think → act" idea, which part is the brain?',o:['Microcontroller','LED','Servo motor','Potentiometer'],a:0,why:'The microcontroller reads the sensors, runs your code and decides what the actuators should do.'},
 {p:0,q:'A potentiometer is best described as…',o:['A light sensor','A one-way valve for current','A variable resistor (a knob)','A tiny speaker'],a:2,why:'Turning the knob moves a wiper along a resistive track, giving any voltage between 0 and 5 V.'},
 {p:0,q:'Which of these gives DC (direct current)?',o:['The wall socket at home','A battery','The electricity pole on the street','A ceiling fan'],a:1,why:'Batteries give steady, one-way DC. The wall socket gives AC (about 230 V, 50 Hz in India).'},
 {p:0,q:'Which sensor measures distance using sound waves?',o:['Ultrasonic sensor (HC-SR04)','LDR','Soil moisture sensor','Push button'],a:0,why:'It sends a 40 kHz chirp and times the echo, just like a bat.'},
 // ---- 2 moderate ----
 {p:1,q:'A servo expects a pulse every 20 ms. Which pulse width moves it to the middle (90°)?',o:['0.5 ms','1.0 ms','1.5 ms','2.5 ms'],a:2,why:'1 ms = 0°, 1.5 ms = 90°, 2 ms = 180°. The servo\'s internal circuit compares the pulse to its feedback potentiometer.'},
 {p:1,q:'A 5 V pin drives an LED (2 V drop) through a 150 Ω resistor. About how much current flows?',o:['2 mA','20 mA','33 mA','200 mA'],a:1,why:'The resistor sees 5 − 2 = 3 V, so I = V/R = 3 / 150 = 0.02 A = 20 mA. A perfect LED current.'},
 // ---- 5 real world ----
 {p:2,s:'🏠 Your mother is tired of the <b>overhead water tank overflowing</b> every morning. Hundreds of litres go down the drain and the motor keeps running.',q:'Which sensor, mounted on the tank lid, tells the Arduino how full the tank is so it can switch off the motor?',o:['Soil moisture sensor','Ultrasonic sensor','Push button','Potentiometer'],a:1,why:'An ultrasonic sensor measures the distance down to the water surface. When the gap is small, the tank is full, so cut power to the pump.'},
 {p:2,s:'🌿 Your family travels to the hometown for <b>Pongal week</b>. The terrace plants that grandma loves are dry and wilted by the time you return.',q:'Which sensor lets a small pump water the plants only when the soil is actually dry?',o:['IR sensor','Photoresistor (LDR)','Soil moisture sensor','Ultrasonic sensor'],a:2,why:'A soil moisture probe reads how wet the soil is. If the number says dry, the Arduino or ESP32 turns the pump on, and off again when the soil is wet.'},
 {p:2,s:'💡 Your <b>apartment gate light</b> is switched on and off by hand. The watchman forgets, so it burns all day and the EB bill goes up. Sometimes it stays dark at night.',q:'Which sensor makes the light turn on by itself at dusk and off at dawn?',o:['Photoresistor (LDR)','Push button','Soil moisture sensor','Ultrasonic sensor'],a:0,why:'An LDR changes resistance with light. When the reading falls below a threshold (dark), the lamp turns on, and when it is bright, the lamp turns off.'},
 {p:2,s:'🚰 In your <b>college hostel mess</b>, hundreds of students touch the same tap handle every day. Germs spread and taps are often left dripping.',q:'Which sensor can open the water for a few seconds when you bring your hand near, with no touching?',o:['Potentiometer','Soil moisture sensor','IR sensor','Photoresistor (LDR)'],a:2,why:'An IR sensor sends invisible light and detects the reflection from your hand. When it detects you, a servo or valve opens the water.'},
 {p:2,s:'👵 Your <b>grandmother stays alone</b> at home during the day while everyone is at work or college. If she feels unwell, she must be able to alert the family quickly.',q:'Which simple input would you give her so one press sends an alert (buzzer or SMS) through a microcontroller?',o:['Push button (panic button)','Ultrasonic sensor','Soil moisture sensor','Potentiometer'],a:0,why:'A large push button is the simplest and most reliable input. One press reads HIGH, and the microcontroller sounds the buzzer or sends a message. It needs no training and no battery-hungry sensor.'}
];

/* ===== tiny helpers ===== */
const $=(s,e=document)=>e.querySelector(s);
const L=['A','B','C','D'];
let i=0,score=0,answered=false,log=[],busy=false;
const sec={sIntro:$('#sIntro'),sQ:$('#sQ'),sRes:$('#sRes')};

function show(id){Object.values(sec).forEach(s=>s.classList.remove('on','out'));sec[id].classList.add('on');window.scrollTo(0,0)}
function swap(then){busy=true;sec.sQ.classList.add('out');setTimeout(()=>{sec.sQ.classList.remove('out');then();busy=false},280)}
function setProg(n){$('#qprog').style.width=(n/Q.length*100)+'%'}

function render(){
  const q=Q[i];answered=false;
  $('#qnum').textContent=(i+1)+' → '+Q.length;$('#qpart').textContent=PARTS[q.p];$('#qcount').textContent=(i+1)+' / '+Q.length;
  const sc=$('#qscene');if(q.s){sc.hidden=false;sc.innerHTML=q.s}else sc.hidden=true;
  $('#qtext').textContent=q.q;$('#qfb').hidden=true;
  const box=$('#qopts');box.innerHTML='';
  q.o.forEach((t,k)=>{const b=document.createElement('button');b.className='opt';b.innerHTML=`<span class="k">${L[k]}</span><span></span>`;b.lastChild.textContent=t;b.onclick=()=>pick(k);box.appendChild(b)});
  setProg(i);
  document.getElementById('qmain').className=['c-b','c-v','c-p'][q.p];
}
function pick(k){
  if(answered||busy)return;answered=true;const q=Q[i],ok=k===q.a;if(ok)score++;log.push({q,k,ok});
  [...document.querySelectorAll('.opt')].forEach((b,n)=>{b.disabled=true;if(n===q.a)b.classList.add('right');else if(n===k)b.classList.add('wrong');else b.classList.add('dim')});
  const fb=$('#qfb');fb.hidden=false;fb.className='fb '+(ok?'good':'bad');
  $('#qfbh').textContent=ok?'✅ Correct!':'❌ Not quite. The answer is '+L[q.a]+'.';$('#qfbp').textContent=q.why;
  $('#nextBtn').innerHTML=(i===Q.length-1?'See my score':'Next')+' <span class="kbd">Enter ↵</span>';
  setProg(i+1);fb.scrollIntoView({behavior:'smooth',block:'nearest'});
}
function next(){
  if(!answered||busy)return;
  if(i===Q.length-1){swap(()=>{showResult()})}else{swap(()=>{i++;render()})}
}
function start(){i=0;score=0;log=[];show('sQ');render()}

/* ===== result ===== */
function showResult(){
  show('sRes');$('#qcount').textContent='Done!';setProg(Q.length);
  const t=['Keep tinkering 🔧','Getting there 💡','Nice work ⚡','Electronics star 🌟'],m=['Revisit the slides and give it another go. Every maker starts here.','Solid start. Revisit the slides and try again.','You clearly know your sensors, brains and actuators.','Wow, near-perfect! You are ready to build real projects.'];
  const lvl=score>=14?3:score>=11?2:score>=7?1:0;
  $('#rTitle').textContent=t[lvl];$('#rMsg').textContent=m[lvl];
  let n=0;const el=$('#rScore'),iv=setInterval(()=>{n++;el.textContent=n;if(n>=score)clearInterval(iv)},score?1200/score:0);if(!score)el.textContent=0;
  requestAnimationFrame(()=>setTimeout(()=>$('#ringC').style.strokeDashoffset=377*(1-score/Q.length),60));
  try{const b=+localStorage.getItem('spark-best')||0;if(score>b)localStorage.setItem('spark-best',score)}catch(e){}
  if(score>=11)confetti();
}

/* ===== confetti ===== */
function confetti(){
  const cv=$('#confetti'),x=cv.getContext('2d');cv.width=innerWidth;cv.height=innerHeight;const cols=['#FFBE0B','#FB5607','#FF006E','#8338EC','#3A86FF'];
  const ps=[...Array(160)].map(()=>({x:Math.random()*cv.width,y:-20-Math.random()*cv.height*.6,w:6+Math.random()*8,h:8+Math.random()*10,v:2+Math.random()*4,r:Math.random()*6,s:(Math.random()-.5)*.3,c:cols[Math.random()*5|0],d:Math.random()*2-1}));
  let f=0;(function a(){x.clearRect(0,0,cv.width,cv.height);ps.forEach(p=>{p.y+=p.v;p.x+=p.d;p.r+=p.s;x.save();x.translate(p.x,p.y);x.rotate(p.r);x.fillStyle=p.c;x.fillRect(-p.w/2,-p.h/2,p.w,p.h);x.restore()});if(++f<260)requestAnimationFrame(a);else x.clearRect(0,0,cv.width,cv.height)})();
}

/* ===== wiring ===== */
$('#startBtn').onclick=start;$('#nextBtn').onclick=next;$('#retryBtn').onclick=()=>{$('#qprog').style.width='0';$('#ringC').style.strokeDashoffset=377;start()};
addEventListener('keydown',e=>{
  if(e.key==='Enter'){if(sec.sIntro.classList.contains('on'))start();else if(sec.sQ.classList.contains('on'))next()}
  const k=L.indexOf(e.key.toUpperCase());if(k>-1&&e.key.length===1&&sec.sQ.classList.contains('on')&&k<Q[i].o.length)pick(k);
  const n=+e.key;if(n>=1&&n<=4&&sec.sQ.classList.contains('on')&&n-1<Q[i].o.length)pick(n-1)});
