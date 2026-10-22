const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)],root=document.documentElement;
root.classList.add('js');
let tt;const toast=m=>{const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tt);tt=setTimeout(()=>t.classList.remove('show'),2600)};
/* theme */
const setTheme=t=>{root.dataset.theme=t;$('#theme').innerHTML='<svg class="i"><use href="#'+(t=='dark'?'sun':'moon')+'"/></svg>';$('#theme').setAttribute('aria-label','Switch to '+(t=='dark'?'light':'dark')+' theme');try{localStorage.setItem('sc',t)}catch(e){}studio()};
$('#theme').onclick=()=>setTheme(root.dataset.theme=='dark'?'light':'dark');
$('#menubtn').onclick=e=>{const o=$('#nav').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',o)};
$$('#nav a').forEach(a=>a.onclick=()=>$('#nav').classList.remove('open'));
/* dial */
const MIN=60,MAX=85,NS='http://www.w3.org/2000/svg';let T=72,on=true,mode='eco';
const tk=$('#ticks');for(let i=0;i<=MAX-MIN;i++){const a=(-135+i/(MAX-MIN)*270-90)*Math.PI/180,l=document.createElementNS(NS,'line');
l.setAttribute('x1',180+Math.cos(a)*158);l.setAttribute('y1',180+Math.sin(a)*158);l.setAttribute('x2',180+Math.cos(a)*(i%5?170:176));l.setAttribute('y2',180+Math.sin(a)*(i%5?170:176));tk.appendChild(l)}
const msgs={heat:'Heating to ',cool:'Cooling to ',eco:'Eco cooling active'};
function setT(v,q){T=Math.max(MIN,Math.min(MAX,v));$('#knob').style.transform='rotate('+(-135+(T-MIN)/(MAX-MIN)*270)+'deg)';
$$('#ticks line').forEach((l,i)=>l.classList.toggle('on',on&&i<=T-MIN));
$('#tv').textContent=on?T+'°':'Off';$('#ts').textContent=on?msgs[mode]+(mode=='eco'?'':T+'°F'):'Standby';
const d=$('#dw');d.setAttribute('aria-valuenow',T);d.setAttribute('aria-valuetext',T+' degrees Fahrenheit')}
const dw=$('#dw');let dr=false;
const ang=e=>{const r=dw.getBoundingClientRect();let a=Math.atan2(e.clientY-r.top-r.height/2,e.clientX-r.left-r.width/2)*180/Math.PI+90;if(a>180)a-=360;a=Math.max(-135,Math.min(135,a));setT(Math.round(MIN+(a+135)/270*(MAX-MIN)))};
dw.onpointerdown=e=>{if(!on)return;dr=true;dw.classList.add('drag');dw.setPointerCapture(e.pointerId);ang(e)};
dw.onpointermove=e=>{if(dr)ang(e)};dw.onpointerup=()=>{dr=false;dw.classList.remove('drag')};
dw.onkeydown=e=>{if(!on)return;const k={ArrowRight:1,ArrowUp:1,ArrowLeft:-1,ArrowDown:-1}[e.key];if(k){e.preventDefault();setT(T+k)}};
$('#pwr').onclick=e=>{on=!on;e.currentTarget.setAttribute('aria-pressed',on);$('#powl').textContent=on?'Online':'Standby';$('#dial').classList.toggle('off',!on);setT(T);toast(on?'System online':'System on standby')};
$$('#modes button').forEach(b=>b.onclick=()=>{mode=b.dataset.m;$$('#modes button').forEach(x=>x.setAttribute('aria-pressed',x==b));setT(T);toast('Thermostat set to '+mode)});
setT(T);
/* calculator */
const K=['C','⌫','÷','×','7','8','9','−','4','5','6','+','1','2','3','=','0','.'];let cv='0',acc=null,op=null,fresh=false;
const ks=$('#keys');K.forEach(k=>{const b=document.createElement('button');b.className='btn'+('÷×−+C⌫'.includes(k)?' op':'')+(k=='='?' hot eq':'')+(k=='0'?' z':'');b.textContent=k;b.onclick=()=>key(k);ks.appendChild(b)});
const calc=(a,o,b)=>({'+':a+b,'−':a-b,'×':a*b,'÷':b?a/b:NaN}[o]);
const show=()=>{$('#cd').textContent=cv;$('#ch').textContent=acc!==null&&op?acc+' '+op:''};
function key(k){if(k=='C'){cv='0';acc=op=null;fresh=false}
else if(k=='⌫'){cv=!fresh&&cv.length>1&&cv!='Error'?cv.slice(0,-1):'0'}
else if('÷×−+'.includes(k)){if(op&&!fresh){acc=calc(acc,op,parseFloat(cv))}else acc=parseFloat(cv);op=k;fresh=true;cv=String(+acc.toFixed(8)||0)}
else if(k=='='){if(op){const r=calc(acc,op,parseFloat(cv));cv=isFinite(r)?String(+r.toFixed(8)):'Error';acc=op=null;fresh=true}}
else{if(fresh||cv=='0'||cv=='Error'){cv=k=='.'?'0.':k;fresh=false}else if(!(k=='.'&&cv.includes('.'))&&cv.length<12)cv+=k}show()}
/* player */
let pl=false,pi;const f=s=>String(Math.floor(s/60)).padStart(2,'0')+':'+String(Math.floor(s%60)).padStart(2,'0'),sk=$('#seek');
sk.oninput=()=>{$('#cur').textContent=f(sk.value)};
$('#pp').onclick=e=>{pl=!pl;e.currentTarget.innerHTML='<svg class="i"><use href="#'+(pl?'pause':'play')+'"/></svg>';e.currentTarget.setAttribute('aria-label',pl?'Pause':'Play');$('#disc').classList.toggle('spin',pl);clearInterval(pi);
if(pl)pi=setInterval(()=>{sk.value=(+sk.value+1)%(+sk.max+1);sk.oninput()},1000);toast(pl?'Playback started':'Playback paused')};
/* switches + segments + bars */
$$('.sw input').forEach(i=>i.onchange=()=>toast(i.dataset.t));
const D={Day:[30,45,35,60,80,55,40],Week:[40,65,50,85,95,70,60],Month:[55,60,72,68,88,92,100]},bw=$('#bars');
for(let i=0;i<7;i++)bw.appendChild(document.createElement('div'));
const bars=k=>$$('#bars div').forEach((d,i)=>{d.style.setProperty('--h',D[k][i]+'%');d.title=D[k][i]+'%'});bars('Week');
$$('#seg button').forEach(b=>b.onclick=()=>{$$('#seg button').forEach(x=>x.setAttribute('aria-pressed',x==b));bars(b.textContent)});
/* studio */
let sk2='';const hx=c=>{c=c.trim();return[1,3,5].map(i=>parseInt(c.substr(i,2),16))};
function studio(){const g=id=>$('#'+id).value,d=g('d'),b=g('b'),s=g('s'),r=g('rad'),cs=getComputedStyle(root),
dk=hx(cs.getPropertyValue('--sd')),lt=hx(cs.getPropertyValue('--sl')),a=Math.min(1,s*6/100).toFixed(2);
$('#vd').textContent=d+'px';$('#vb').textContent=b+'px';$('#vs').textContent=s+'%';$('#vr').textContent=r+'px';
const css='box-shadow: '+sk2+d+'px '+d+'px '+b+'px rgba('+dk+','+a+'), '+sk2+'-'+d+'px -'+d+'px '+b+'px rgba('+lt+',1);';
const p=$('#pv');p.style.cssText='background:'+cs.getPropertyValue('--surf')+';border-radius:'+r+'px;'+css;$('#out').textContent='border-radius: '+r+'px;\n'+css}
['d','b','s','rad'].forEach(i=>$('#'+i).oninput=studio);
$$('#tg button').forEach(x=>x.onclick=()=>{sk2=x.dataset.k;$$('#tg button').forEach(y=>y.setAttribute('aria-pressed',y==x));studio()});
$('#cp').onclick=async()=>{const t=$('#out').textContent;try{await navigator.clipboard.writeText(t)}catch(e){const a=document.createElement('textarea');a.value=t;document.body.appendChild(a);a.select();document.execCommand('copy');a.remove()}toast('CSS copied to clipboard')};
/* modal + form */
const dg=$('#dlg');$$('[data-buy]').forEach(b=>b.onclick=()=>{const[n,p]=b.dataset.buy.split('|');$('#dt').textContent=n;$('#dp').textContent='$'+p;dg.showModal()});
$('#dx').onclick=()=>dg.close();dg.onclick=e=>{if(e.target==dg)dg.close()};
$('#dbuy').onclick=()=>{dg.close();toast('Order confirmed. Your demo license is on its way.')};
$('#cf').onsubmit=e=>{e.preventDefault();const[n,m,t,g]=[...e.target.elements].map(x=>x.value);
const a=document.createElement('a');a.href='mailto:webdevmanash@gmail.com?subject='+encodeURIComponent('SoftCraft enquiry: '+t)+'&body='+encodeURIComponent('Name: '+n+'\nEmail: '+m+'\nProject: '+t+'\n\n'+g);a.click();toast('Opening your email app. Or write to webdevmanash@gmail.com')};
$('#cpm').onclick=async()=>{try{await navigator.clipboard.writeText('webdevmanash@gmail.com')}catch(e){}toast('webdevmanash@gmail.com copied')};
/* queue, lights, sliders */
$$('#q button').forEach(b=>b.onclick=()=>{$$('#q button').forEach(x=>x.setAttribute('aria-pressed',x==b));$('#trk').textContent=b.dataset.n;sk.max=b.dataset.s;sk.value=0;$('#dur').textContent=f(+b.dataset.s);sk.oninput()});
$$('#lg .btn').forEach(b=>b.onclick=()=>{const o=b.getAttribute('aria-pressed')!='true';b.setAttribute('aria-pressed',o);toast(b.textContent.trim()+' light '+(o?'on':'off'))});
$$('[data-o]').forEach(i=>i.oninput=()=>$('#'+i.dataset.o).textContent=i.value+'%');
/* calendar */
const now=new Date();let cy=now.getFullYear(),cm=now.getMonth(),sel=new Date(now);
function cal(foc){const g=$('#cal'),f1=new Date(cy,cm,1),n=new Date(cy,cm+1,0).getDate(),off=(f1.getDay()+6)%7;g.innerHTML='';
['M','T','W','T','F','S','S'].forEach(d=>{const x=document.createElement('span');x.className='wd mono';x.setAttribute('aria-hidden','true');x.textContent=d;g.appendChild(x)});
for(let i=0;i<off;i++)g.appendChild(document.createElement('span'));
for(let d=1;d<=n;d++){const b=document.createElement('button'),dt=new Date(cy,cm,d);b.textContent=d;b.setAttribute('aria-label',dt.toDateString());b.setAttribute('aria-pressed',dt.toDateString()==sel.toDateString());if(dt.toDateString()==now.toDateString())b.className='today';b.onclick=()=>{sel=dt;cal(true)};g.appendChild(b)}
$('#calh').textContent=f1.toLocaleString('en',{month:'long',year:'numeric'});$('#cs').textContent='Selected · '+sel.toLocaleDateString('en',{weekday:'short',day:'numeric',month:'short'});
if(foc){const p=g.querySelector('[aria-pressed=true]');if(p)p.focus()}}
$('#cprev').onclick=()=>{if(--cm<0){cm=11;cy--}cal()};$('#cnext').onclick=()=>{if(++cm>11){cm=0;cy++}cal()};cal();
/* selection controls */
let lic=3;const sumU=()=>{const t=$$('#chips [aria-pressed=true]').map(b=>b.textContent).join(', ')||'No tags',r=document.querySelector('input[name=ss]:checked').parentElement.textContent.trim();$('#sum').textContent=t+' · '+r+' · '+lic+' license'+(lic>1?'s':'')};
$('#m1').onclick=()=>{lic=Math.max(1,lic-1);$('#sv').textContent=lic;sumU()};$('#p1').onclick=()=>{lic=Math.min(20,lic+1);$('#sv').textContent=lic;sumU()};
$$('#chips .btn').forEach(b=>b.onclick=()=>{b.setAttribute('aria-pressed',b.getAttribute('aria-pressed')!='true');sumU()});
$$('input[name=ss]').forEach(i=>i.onchange=sumU);sumU();
/* reveal */
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){const t=e.target;t.classList.add('in');io.unobserve(t);setTimeout(()=>t.classList.remove('rv'),1300)}}),{threshold:.12});
$$('.rv').forEach(el=>io.observe(el));
/* cursor */
if(matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches){const c=$('#cur2');let x=0,y=0,cx=0,cy=0;
addEventListener('pointermove',e=>{x=e.clientX;y=e.clientY;c.style.opacity=1;c.classList.toggle('big',!!e.target.closest('a,button,.dialwrap,input[type=range]'))});
(function t(){cx+=(x-cx)*.2;cy+=(y-cy)*.2;c.style.transform='translate('+cx+'px,'+cy+'px)';requestAnimationFrame(t)})()}
/* smooth scroll, progress, parallax */
const prog=$('#prog'),rg=$('.rings'),smooth=matchMedia('(pointer:fine)').matches&&!matchMedia('(prefers-reduced-motion:reduce)').matches,maxS=()=>root.scrollHeight-innerHeight;
let tg=scrollY,cu=scrollY,rf=0;
const paint=()=>{prog.style.transform='scaleX('+(maxS()>0?scrollY/maxS():0)+')';if(rg&&smooth)rg.style.transform='translateY('+scrollY*.12+'px)'};
if(smooth){root.style.scrollBehavior='auto';
const step=()=>{cu+=(tg-cu)*.085;if(Math.abs(tg-cu)<.4){cu=tg;rf=0}else rf=requestAnimationFrame(step);scrollTo(0,cu)};
const go=y=>{tg=Math.max(0,Math.min(maxS(),y));if(!rf)rf=requestAnimationFrame(step)};
addEventListener('wheel',e=>{if(e.ctrlKey||dg.open||Math.abs(e.deltaX)>Math.abs(e.deltaY))return;e.preventDefault();go(tg+e.deltaY*(e.deltaMode==1?32:1))},{passive:false});
addEventListener('scroll',()=>{if(!rf)tg=cu=scrollY});
$$('a[href^="#"]').forEach(a=>a.addEventListener('click',e=>{const el=document.querySelector(a.getAttribute('href'));if(!el)return;e.preventDefault();go(el.getBoundingClientRect().top+scrollY-(el.id=='top'?0:88))}))}
addEventListener('scroll',()=>requestAnimationFrame(paint),{passive:true});paint();
$('.cmpr').oninput=e=>$('#cmp').style.setProperty('--p',e.target.value+'%');
/* nav highlight + back to top */
const nl=$$('#nav a'),nio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting)nl.forEach(a=>a.setAttribute('aria-current',a.hash=='#'+e.target.id))}),{rootMargin:'-45% 0px -50% 0px'});
['showcase','playground','pricing','contact'].forEach(i=>nio.observe(document.getElementById(i)));
addEventListener('scroll',()=>$('#up').classList.toggle('show',scrollY>900),{passive:true});
/* init */
let st;try{st=localStorage.getItem('sc')}catch(e){}
setTheme(st||(matchMedia('(prefers-color-scheme:dark)').matches?'dark':'light'));
