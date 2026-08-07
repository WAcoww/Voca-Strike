// 三角洲单词突击 · 微信小游戏 v2
var W=375,H=667;var cnv,ctx;
var btns=[]; // {x,y,w,h,cb}
var Q={gray:'#8896a6',green:'#4ade80',blue:'#60a5fa',gold:'#f0b830',red:'#f87171'};

// ============ 词库 ============
VOCAB=[ /* 注入 */ ];

// ============ 装备 ============
var MEDKIT_PRICE=20,MEDKIT_HEAL=50;
var GUNS=[{id:'m4a1',name:'M4A1',atk:22,quality:'gray',price:30},{id:'hk416',name:'HK416',atk:28,quality:'green',price:60},{id:'scarh',name:'SCAR-H',atk:38,quality:'blue',price:120},{id:'mk17',name:'MK17',atk:50,quality:'gold',price:220},{id:'awm',name:'AWM',atk:75,quality:'red',price:400}];
var HELMETS=[{id:'cap',name:'棒球帽',hpBonus:10,dmgReduce:0,quality:'gray',price:20},{id:'tac',name:'战术头盔',hpBonus:25,dmgReduce:0,quality:'green',price:50},{id:'opscore',name:'Ops-Core',hpBonus:50,dmgReduce:0.03,quality:'blue',price:100},{id:'wendy',name:'Wendy EXFIL',hpBonus:80,dmgReduce:0.06,quality:'gold',price:200},{id:'fastmt',name:'FAST MT',hpBonus:120,dmgReduce:0.10,quality:'red',price:380}];
var VESTS=[{id:'light',name:'轻型背心',dmgReduce:0.12,durability:50,quality:'gray',price:25},{id:'tacvest',name:'战术背心',dmgReduce:0.22,durability:70,quality:'green',price:60},{id:'level3',name:'三级甲',dmgReduce:0.32,durability:90,quality:'blue',price:130},{id:'level4',name:'四级甲',dmgReduce:0.45,durability:110,quality:'gold',price:240},{id:'level5',name:'五级重甲',dmgReduce:0.60,durability:140,quality:'red',price:450}];
var MUZZLES=[{id:'flash',name:'消焰器',atkMult:1.05,quality:'gray',price:15},{id:'comp',name:'补偿器',atkMult:1.12,quality:'green',price:35},{id:'supp',name:'消音器',atkMult:1.20,quality:'blue',price:70},{id:'brake',name:'制退器',atkMult:1.30,quality:'gold',price:140},{id:'spec',name:'特种枪口',atkMult:1.45,quality:'red',price:280}];
var SIGHTS=[{id:'iron',name:'铁瞄',coolReduce:0.03,quality:'gray',price:10},{id:'reddot',name:'红点镜',coolReduce:0.08,quality:'green',price:30},{id:'holo',name:'全息镜',coolReduce:0.14,quality:'blue',price:60},{id:'acog',name:'ACOG',coolReduce:0.22,quality:'gold',price:120},{id:'thermal',name:'热成像',coolReduce:0.32,quality:'red',price:250}];
var GRIPS=[{id:'stdgrip',name:'标准握把',coolReduce:0.05,quality:'gray',price:10},{id:'vert',name:'垂直握把',coolReduce:0.10,quality:'green',price:25},{id:'angle',name:'斜角握把',coolReduce:0.18,quality:'blue',price:55},{id:'tacgrip',name:'战术握把',coolReduce:0.28,quality:'gold',price:110},{id:'elite',name:'精英握把',coolReduce:0.40,quality:'red',price:220}];
var AMMO=[{id:'fmj',name:'普通弹',dmgMult:1.0,price:0},{id:'ap',name:'穿甲弹',dmgMult:1.30,price:25},{id:'he',name:'高爆弹',dmgMult:1.60,price:55}];
var LOOT_TABLE=[{rarity:'white',name:'白色物资',color:'#8896a6',emoji:'📎',sellPrice:4,weight:65},{rarity:'blue',name:'蓝色装备',color:'#60a5fa',emoji:'🔧',sellPrice:10,weight:20},{rarity:'purple',name:'紫色配件',color:'#a78bfa',emoji:'💎',sellPrice:25,weight:8},{rarity:'gold',name:'金色物品',color:'#f0b830',emoji:'🏆',sellPrice:60,weight:4},{rarity:'red',name:'大红容器',color:'#f87171',emoji:'❤️',sellPrice:180,weight:2},{rarity:'red',name:'绝密文件',color:'#f87171',emoji:'📋',sellPrice:250,weight:1}];
var ZONES=[{id:'g1',name:'小镇外围',desc:'3年级基础',diff:1,em:0.5,waves:5,grade:0,lb:'A'},{id:'g2',name:'丛林哨站',desc:'3-4年级',diff:1,em:0.6,waves:6,grade:1,lb:'B'},{id:'g3',name:'山地前哨',desc:'3-5年级',diff:2,em:0.8,waves:6,grade:2,lb:'C'},{id:'g4',name:'废弃城区',desc:'小学全段',diff:2,em:1.0,waves:7,grade:3,lb:'D'},{id:'g5',name:'敌方要塞',desc:'含初中',diff:3,em:1.3,waves:7,grade:4,lb:'E'},{id:'g6',name:'三角洲禁区',desc:'全学段',diff:3,em:1.6,waves:7,grade:5,lb:'S'},{id:'g7',name:'深渊基地',desc:'全部词汇',diff:3,em:1.9,waves:7,grade:6,lb:'SS'}];

// ============ 游戏状态 ============
var state='TITLE'; // TITLE|HIDEOUT|SHOP|DEPLOY|FIGHTING|BOSS|ADVANCING|SEARCH|DEFEND|EXTRACTING|VICTORY|DEFEAT
var gold=60,hp=200,maxHp=200,baseAtk=22;
var gun=null,helmet=null,vest=null,muzzle=null,sight=null,grip=null,ammo=AMMO[0];
var inventory=[],loot=[],masteredWords={},wrongWords=[],mode='normal';
var zone=null,level=1,totalGoldEarned=0,missionGold=0;
var wave=0,totalWaves=7,wavePhase='fighting';
var advanceCount=0,retreatUsed=false;
var enemyHp=0,enemyMaxHp=0,enemyAtk=0,enemyName='',enemyType='';
var enemyGoldMin=0,enemyGoldMax=0;
var currentWord=null,wordOptions=[],canAnswer=false,answered=false,speedBonus=1;
var cooldownTimer=0,nextWordTimer=null;
var particles=[],bullets=[],playerFlash=0,enemyFlash=0;
var dmgNums=[],screenShake=0,bgScroll=0;
var extractTimer=0,extractDuration=4,defendTimer=0,defendDuration=20;
var enemyDeathTimer=0,headshotFlash=0;
var waveConfig=[],deployStep=0,deployZone=null;
var refundVest=null,refundHelmet=null,refundGun=null;
var searchPhase=false,searchTimer=0,lootContainer={};
var defendKilled=false,defendCooldown=0,defendEnterTimer=0;
var shopTab=0,yOffset=0; // for scrollable shop
var eDmgTimer=0,eDoTActive=false;

// ============ 工具 ============
function getMaxHp(){return maxHp+(helmet?helmet.hpBonus:0);}
function getAtk(){var a=gun?gun.atk:baseAtk;if(muzzle)a=Math.round(a*muzzle.atkMult);if(ammo)a=Math.round(a*ammo.dmgMult);return a;}
function getDmgReduce(){var r=0;if(vest&&vest.currentDur>0)r+=vest.dmgReduce;if(helmet)r+=helmet.dmgReduce;return Math.min(0.8,r);}
function getCooldownMult(){var c=0;if(sight)c+=sight.coolReduce;if(grip)c+=grip.coolReduce;return Math.max(0.5,1-c);}
function getReducedDmg(raw){var dr=getDmgReduce();return dr>0?Math.max(1,Math.round(raw*(1-dr))):raw;}
function owned(item,type){return inventory.some(function(i){return i.id===item.id&&i.type===type;});}
function equipCheck(item,type){var s={gun:1,helmet:1,vest:1,muzzle:1,sight:1,grip:1};return s[type]&&this[type]&&this[type].id===item.id;}

function drawBtn(x,y,w,h,text,color,textColor){
  ctx.fillStyle=color||'rgba(255,255,255,0.06)';
  ctx.beginPath();ctx.roundRect(x,y,w,h,4);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle=textColor||'#d5dce6';ctx.font='13px sans-serif';
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(text,x+w/2,y+h/2);
}

function drawText(t,x,y,size,color,align){
  ctx.fillStyle=color||'#d5dce6';ctx.font=(size||13)+'px sans-serif';
  ctx.textAlign=align||'left';ctx.textBaseline='middle';ctx.fillText(t,x,y);
}

function drawBar(x,y,w,h,cur,max,c){
  ctx.fillStyle='rgba(0,0,0,0.5)';ctx.beginPath();ctx.roundRect(x,y,w,h,3);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.12)';ctx.lineWidth=1;ctx.stroke();
  var pct=Math.max(0,Math.min(1,cur/max));
  ctx.fillStyle=c;ctx.beginPath();ctx.roundRect(x+2,y+2,Math.max(0,(w-4)*pct),h-4,2);ctx.fill();
}

function rnd(min,max){return min+Math.random()*(max-min);}

// ============ 触摸 ============
function onTouch(e){
  var t=e.touches?e.touches[0]:e;if(!t)return;
  var tx=t.clientX,ty=t.clientY;
  for(var i=btns.length-1;i>=0;i--){
    var b=btns[i];
    if(tx>=b.x&&tx<=b.x+b.w&&ty>=b.y&&ty<=b.y+b.h&&b.cb){b.cb();return;}
  }
}

// ============ 渲染 ============
function render(){
  ctx.clearRect(0,0,W,H);
  var sx=0,sy=0;
  if(screenShake>0){sx=(Math.random()-0.5)*screenShake*4;sy=(Math.random()-0.5)*screenShake*4;}
  ctx.save();ctx.translate(sx,sy);
  if(state==='TITLE')drawTitle();
  else if(state==='HIDEOUT')drawHideout();
  else if(state==='SHOP')drawShop();
  else if(state==='DEPLOY')drawDeploy();
  else if(/FIGHTING|BOSS|ADVANCING|SEARCH|DEFEND|EXTRACTING/.test(state))drawBattle();
  drawVictoryDefeat();
  if(headshotFlash>0){ctx.fillStyle='rgba(251,191,36,'+headshotFlash*0.25+')';ctx.fillRect(0,0,W,H);}
  ctx.restore();
}

// ============ 标题画面 ============
function drawTitle(){
  ctx.fillStyle='#070c14';ctx.fillRect(0,0,W,H);
  drawText('三角洲单词突击',W/2,H*0.30,26,'#e8823a','center');
  drawText('SEARCH · FIGHT · EXTRACT',W/2,H*0.37,10,'#4a5568','center');
  drawBtn(W*0.2,H*0.45,W*0.6,50,'部 署 行 动');
  btns=[{x:W*0.2,y:H*0.45,w:W*0.6,h:50,cb:function(){state='HIDEOUT';}}];
}

// ============ 安全屋 ============
function drawHideout(){
  ctx.fillStyle='#070c14';ctx.fillRect(0,0,W,H);
  // header
  ctx.fillStyle='rgba(12,18,28,0.95)';ctx.fillRect(0,0,W,44);
  drawText('🔒 安全屋',12,22,14,'#e8823a');
  drawText('💰'+gold+'  ❤'+hp+'/'+getMaxHp()+'  ⚔'+getAtk(),W-12,22,11,'#8896a6','right');
  btns=[];var y=54;

  // 装备状态
  ctx.fillStyle='rgba(255,255,255,0.02)';ctx.beginPath();ctx.roundRect(6,y,W-12,120,6);ctx.fill();
  ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=1;ctx.stroke();
  drawText('🎖 装备状态',14,y+16,11,'#4a5568');
  y+=34;
  var gear=[{i:'🔫',v:gun,st:gun?'⚔'+gun.atk:'',q:gun?gun.quality:''},{i:'🪖',v:helmet,st:helmet?'❤+'+helmet.hpBonus+(helmet.dmgReduce>0?' 🛡'+Math.round(helmet.dmgReduce*100)+'%':''):'',q:helmet?helmet.quality:''},{i:'🛡',v:vest,st:vest?'🛡'+Math.round(vest.dmgReduce*100)+'% 🔩'+(vest.currentDur||vest.durability)+'/'+vest.durability:'',q:vest?vest.quality:''},{i:'🔧',v:muzzle,st:muzzle?'⚔×'+muzzle.atkMult.toFixed(2):'',q:muzzle?muzzle.quality:''},{i:'👁',v:sight,st:sight?'⏱-'+Math.round(sight.coolReduce*100)+'%':'',q:sight?grip.quality:''},{i:'✊',v:grip,st:grip?'⏱-'+Math.round(grip.coolReduce*100)+'%':'',q:grip?grip.quality:''}];
  gear.forEach(function(g,i){
    var gx=14+Math.floor(i%3)*120,gy=y+Math.floor(i/3)*22;
    drawText(g.i,gx,gy,12,g.v?Q[g.q]||'#d5dce6':'#4a5568');
    drawText(g.v?g.v.name:'空',gx+22,gy,11,g.v?Q[g.q]||'#d5dce6':'#4a5568');
    if(g.st)drawText(g.st,gx+90,gy,10,'#8896a6');
  });
  y+=50;
  drawText('弹药: '+(ammo?ammo.name:'普通弹')+' | 模式: '+(mode==='death'?'💀死亡':'🟢普通'),14,y,10,'#8896a6');y+=6;

  // 操作按钮
  y=180;
  var mk=inventory.filter(function(x){return x.type==='medkit';}).length;
  // Row 1: 军械库 | 急救包
  drawBtn(W*0.1,y,W*0.38,46,'🏪 军械库','rgba(255,255,255,0.04)');
  btns.push({x:W*0.1,y:y,w:W*0.38,h:46,cb:function(){state='SHOP';shopTab=0;}});
  drawBtn(W*0.52,y,W*0.38,46,'💊 用急救包('+mk+')','rgba(255,255,255,0.04)',mk>0&&hp<getMaxHp()?'#4ade80':'#555');
  btns.push({x:W*0.52,y:y,w:W*0.38,h:46,cb:function(){
    if(mk>0&&hp<getMaxHp()){var i=inventory.findIndex(function(x){return x.type==='medkit';});if(i>=0){inventory.splice(i,1);hp=Math.min(getMaxHp(),hp+MEDKIT_HEAL);}}
  }});
  y+=52;
  // Row 2: 买急救包 | 仓库
  drawBtn(W*0.1,y,W*0.38,46,'+买急救包💰'+MEDKIT_PRICE,'rgba(255,255,255,0.04)','#4ade80');
  btns.push({x:W*0.1,y:y,w:W*0.38,h:46,cb:function(){if(gold>=MEDKIT_PRICE){gold-=MEDKIT_PRICE;inventory.push({id:'medkit',type:'medkit',name:'急救包'});}}});
  drawBtn(W*0.52,y,W*0.38,46,'📦 仓库','rgba(255,255,255,0.04)');
  btns.push({x:W*0.52,y:y,w:W*0.38,h:46,cb:function(){drawStorageScreen();}});
  y+=52;
  // Row 3: 错词本 | 统计
  drawBtn(W*0.1,y,W*0.38,46,'📋 错词本','rgba(255,255,255,0.04)');
  btns.push({x:W*0.1,y:y,w:W*0.38,h:46,cb:function(){drawWrongBook();}});
  drawBtn(W*0.52,y,W*0.38,46,'📊 统计','rgba(255,255,255,0.04)');
  btns.push({x:W*0.52,y:y,w:W*0.38,h:46,cb:function(){drawStats();}});
  y+=56;
  // Row 4: 部署
  drawBtn(W*0.1,y,W*0.8,50,'🚁 部 署 行 动','rgba(232,130,58,0.12)','#e8823a');
  btns.push({x:W*0.1,y:y,w:W*0.8,h:50,cb:startDeploy});

  // 背包显示
  if(loot.length>0){
    y+=58;
    var sm={};loot.forEach(function(l){var k=l.rarity+'|'+l.name;sm[k]=sm[k]||{name:l.name,rarity:l.rarity,color:l.color,emoji:l.emoji,sellPrice:l.sellPrice,count:0};sm[k].count++;});
    drawText('🎒 背包',14,y,11,'#4a5568');y+=14;
    var lx=14;Object.values(sm).forEach(function(s){
      drawText(s.emoji+s.name+'×'+s.count+' 💰'+s.sellPrice,lx,y,10,s.color);
      lx+=ctx.measureText(s.emoji+s.name+'×'+s.count+' 💰'+s.sellPrice+'  ').width;
    });
  }
}

var popupScreen=null; // 'storage'|'wrong'|'stats'
function drawStorageScreen(){
  ctx.fillStyle='rgba(7,12,20,0.97)';ctx.fillRect(0,0,W,H);
  drawText('📦 仓库 & 背包',W/2,30,16,'#e8823a','center');
  btns=[];
  drawBtn(W-80,8,70,30,'← 返回','rgba(255,255,255,0.04)');
  btns.push({x:W-80,y:8,w:70,h:30,cb:function(){state='HIDEOUT';}});
  var y=55;
  // 战利品
  drawText('战利品（点击出售）',10,y,11,'#4a5568');y+=18;
  if(loot.length===0){drawText('暂无战利品',14,y,11,'#555');y+=20;}
  else{
    var sm={};loot.forEach(function(l){var k=l.rarity+'|'+l.name;sm[k]=sm[k]||{name:l.name,rarity:l.rarity,color:l.color,emoji:l.emoji,sellPrice:l.sellPrice,count:0};sm[k].count++;});
    var keys=Object.keys(sm);
    var total=0;loot.forEach(function(l){total+=l.sellPrice;});
    drawBtn(5,y,W-10,26,'💰 全卖 +'+total,'rgba(232,130,58,0.08)','#e8823a');
    btns.push({x:5,y:y,w:W-10,h:26,cb:function(){gold+=total;loot=[];state='HIDEOUT';}});
    y+=30;
    keys.forEach(function(k){
      var s=sm[k];
      drawBtn(5,y,W-10,24,s.emoji+s.name+'×'+s.count+' 💰'+s.sellPrice,'rgba(255,255,255,0.02)',s.color);
      btns.push({x:5,y:y,w:W-10,h:24,cb:(function(n,r){return function(){var i=loot.findIndex(function(l){return l.name===n&&l.rarity===r;});if(i>=0){gold+=loot[i].sellPrice;loot.splice(i,1);drawStorageScreen();}}})(s.name,s.rarity)});
      y+=28;
    });
  }
  y+=10;
  // 库存
  drawText('库存装备（点击装备）',10,y,11,'#4a5568');y+=18;
  if(inventory.length===0){drawText('暂无库存装备',14,y,11,'#555');}
  else{
    var labels={gun:'🔫',helmet:'🪖',vest:'🛡',muzzle:'🔧',sight:'👁',grip:'✊',medkit:'💊'};
    inventory.forEach(function(it,i){
      drawBtn(5,y,W-10,24,(labels[it.type]||'')+it.name,'rgba(255,255,255,0.02)',Q[it.quality]||'#d5dce6');
      btns.push({x:5,y:y,w:W-10,h:24,cb:(function(idx){return function(){equipItem(inventory[idx],inventory[idx].type);drawStorageScreen();};})(i)});
      y+=28;
    });
  }
}

function drawWrongBook(){
  ctx.fillStyle='rgba(7,12,20,0.97)';ctx.fillRect(0,0,W,H);
  drawText('📋 错词本 ('+wrongWords.length+'词)',W/2,30,16,'#e8823a','center');
  btns=[];
  drawBtn(W-80,8,70,30,'← 返回','rgba(255,255,255,0.04)');
  btns.push({x:W-80,y:8,w:70,h:30,cb:function(){state='HIDEOUT';}});
  var y=55,lx=8;
  wrongWords.forEach(function(w,i){
    var txt=w.en+' → '+w.zh+' ✕';
    var tw=ctx.measureText(txt).width+12;
    if(lx+tw>W-10){lx=8;y+=22;}
    ctx.fillStyle='rgba(248,113,113,0.08)';ctx.beginPath();ctx.roundRect(lx,y,12,8,3);ctx.fill();
    ctx.strokeStyle='rgba(248,113,113,0.2)';ctx.lineWidth=1;ctx.stroke();
    drawText(txt,lx+6,y+8,10,'#f87171');
    btns.push({x:lx,y:y,w:12,h:8,cb:(function(idx){return function(){wrongWords.splice(idx,1);drawWrongBook();};})(i)});
    lx+=tw+8;
  });
}

function drawStats(){
  ctx.fillStyle='rgba(7,12,20,0.97)';ctx.fillRect(0,0,W,H);
  drawText('📊 个人统计',W/2,30,16,'#e8823a','center');
  btns=[{x:W-80,y:8,w:70,h:30,cb:function(){state='HIDEOUT';}}];
  drawBtn(W-80,8,70,30,'← 返回','rgba(255,255,255,0.04)');
  var y=55;
  var mc=0;Object.keys(masteredWords).forEach(function(k){if(masteredWords[k].hs>0||masteredWords[k].c>=2)mc++;});
  var stats=[
    ['总金币收入','💰'+totalGoldEarned],['当前金币','💰'+gold],
    ['掌握词汇','💀'+mc+'词'],['错词本','📋'+wrongWords.length+'词'],
    ['战利品','🎒'+loot.length+'件'],['库存装备','📦'+inventory.length+'件']
  ];
  stats.forEach(function(s){
    ctx.fillStyle='rgba(255,255,255,0.02)';ctx.beginPath();ctx.roundRect(10,y,W-20,30,4);ctx.fill();
    drawText(s[0],20,y+15,12,'#8896a6');drawText(s[1],W/2,y+15,13,'#d5dce6','center');
    y+=36;
  });
}

// ============ 军械库 ============
function drawShop(){
  ctx.fillStyle='rgba(7,12,20,0.97)';ctx.fillRect(0,0,W,H);
  drawText('🏪 军械库',W/2,30,16,'#e8823a','center');
  drawText('⚔攻击力 ❤血量 🛡减伤 🔩耐久 ⏱冷却 ×倍率',W/2,48,9,'#4a5568','center');
  btns=[];
  drawBtn(W-80,8,70,30,'← 返回','rgba(255,255,255,0.04)');
  btns.push({x:W-80,y:8,w:70,h:30,cb:function(){state='HIDEOUT';}});

  // tabs
  var tabs=['🔫枪械','🪖头盔','🛡胸甲','🔧枪口','👁瞄具','✊握把','🔫弹药'];
  var tabW=W/tabs.length;
  tabs.forEach(function(t,i){
    ctx.fillStyle=i===shopTab?'rgba(232,130,58,0.15)':'rgba(255,255,255,0.02)';
    ctx.fillRect(i*tabW,55,tabW-1,28);
    ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;ctx.strokeRect(i*tabW,55,tabW-1,28);
    drawText(t,i*tabW+tabW/2,69,9,i===shopTab?'#e8823a':'#8896a6','center');
    btns.push({x:i*tabW,y:55,w:tabW-1,h:28,cb:function(idx){return function(){shopTab=idx;};}(i)});
  });

  var y=90;
  var cats=[GUNS,HELMETS,VESTS,MUZZLES,SIGHTS,GRIPS,AMMO];
  var catLabels=['🔫 枪械','🪖 头盔','🛡 胸甲','🔧 枪口','👁 瞄具','✊ 握把','🔫 弹药'];
  var catTypes=['gun','helmet','vest','muzzle','sight','grip','ammo'];
  var items=cats[shopTab];
  var ct=catTypes[shopTab];

  items.forEach(function(it){
    var eq=ct==='ammo'?(ammo&&ammo.id===it.id):equipCheck(it,ct);
    var ow=ct==='ammo'?true:owned(it,ct);
    var c=eq?'#e8823a':(ow?'#4ade80':'#8896a6');
    var s='';
    if(ct==='gun')s='⚔'+it.atk;
    else if(ct==='helmet'){s='❤+'+it.hpBonus;if(it.dmgReduce>0)s+=' 🛡'+Math.round(it.dmgReduce*100)+'%';}
    else if(ct==='vest')s='🛡'+Math.round(it.dmgReduce*100)+'% 🔩'+it.durability;
    else if(ct==='muzzle')s='⚔×'+it.atkMult.toFixed(2);
    else if(ct==='sight'||ct==='grip')s='⏱-'+Math.round(it.coolReduce*100)+'%';
    else if(ct==='ammo')s='⚔×'+it.dmgMult.toFixed(2);
    var label=(eq?'✓':'')+it.name+' '+s+' '+(it.price>0?'💰'+it.price:'免费');
    if(!eq&&ct!=='ammo'&&ow)label+=' (拥有)';
    drawBtn(6,y,W-12,32,label,'rgba(255,255,255,0.02)',Q[it.quality]||'#d5dce6');
    if(!eq&&ct!=='ammo')btns.push({x:6,y:y,w:W-12,h:32,cb:(function(id,t){return function(){quickBuy(id,t);};})(it.id,ct)});
    if(!eq&&ct==='ammo')btns.push({x:6,y:y,w:W-12,h:32,cb:(function(id,t){return function(){
      if(gold>=it.price){if(it.price>0)gold-=it.price;ammo={id:it.id,name:it.name,dmgMult:it.dmgMult,price:it.price};state='HIDEOUT';}
    };})(it.id,ct)});
    y+=36;
  });
}

// ============ 部署 ============
function startDeploy(){
  deployZone=zone;state='DEPLOY';
}
function drawDeploy(){
  ctx.fillStyle='rgba(7,12,20,0.97)';ctx.fillRect(0,0,W,H);
  drawText('选择任务区域',W/2,30,16,'#e8823a','center');
  btns=[];
  var y=60;
  ZONES.forEach(function(z,i){
    var bx=6,yy=y+Math.floor(i/2)*56;
    ctx.fillStyle='rgba(255,255,255,0.02)';
    ctx.beginPath();ctx.roundRect(bx,yy,(W-18)/2,50,4);ctx.fill();
    if(deployZone&&deployZone.id===z.id){
      ctx.strokeStyle='#e8823a';ctx.lineWidth=2;
    }else{ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=1;}
    ctx.stroke();
    drawText(z.name,bx+8,yy+16,13,'#e8823a');
    drawText(z.desc+' · '+z.waves+'波 · Lv'+z.diff,bx+8,yy+34,9,'#8896a6');
    btns.push({x:bx,y:yy,w:(W-18)/2,h:50,cb:(function(z){return function(){deployZone=z;};})(z)});
  });
  y=60+Math.ceil(ZONES.length/2)*56+10;
  drawBtn(8,y,W*0.4,44,'← 返回','rgba(255,255,255,0.04)');
  btns.push({x:8,y:y,w:W*0.4,h:44,cb:function(){deployZone=zone;state='HIDEOUT';}});
  drawBtn(W*0.55,y,W*0.4,44,'确认出发','rgba(232,130,58,0.15)','#e8823a');
  btns.push({x:W*0.55,y:y,w:W*0.4,h:44,cb:confirmDeploy});
}

function confirmDeploy(){
  if(!deployZone)return;
  zone=deployZone;retreatUsed=false;
  totalGoldEarned=0;missionGold=0;advanceCount=0;
  hp=getMaxHp();
  setupLevel();
  state='FIGHTING';
  bgScroll=0;particles=[];bullets=[];dmgNums=[];
  cooldownTimer=0;canAnswer=false;answered=false;
  playerFlash=0;enemyFlash=0;screenShake=0;enemyDeathTimer=0;headshotFlash=0;
  if(nextWordTimer){clearTimeout(nextWordTimer);nextWordTimer=null;}
  spawnWaveEnemy();
  setTimeout(function(){nextWord();},500);
}

function setupLevel(){
  var z=zone||ZONES[0];var em=z.em;
  wave=0;totalWaves=z.waves;
  if(z.diff<=1)waveConfig=[
    {type:'grunt',name:'民兵',hp:Math.round(55*em),atk:Math.round(6*em),goldMin:2,goldMax:5},
    {type:'grunt',name:'民兵',hp:Math.round(65*em),atk:Math.round(7*em),goldMin:2,goldMax:5},
    {type:'grunt',name:'侦察兵',hp:Math.round(75*em),atk:Math.round(8*em),goldMin:3,goldMax:7},
    {type:'elite',name:'精英突击兵',hp:Math.round(200*em),atk:Math.round(14*em),goldMin:12,goldMax:18},
    {type:'grunt',name:'侦察兵',hp:Math.round(85*em),atk:Math.round(9*em),goldMin:3,goldMax:7},
    {type:'boss',name:'军阀·卡洛夫',hp:Math.round(450*em),atk:Math.round(18*em),goldMin:35,goldMax:55}
  ];
  else if(z.diff===2)waveConfig=[
    {type:'grunt',name:'游击兵',hp:Math.round(78*em),atk:Math.round(8*em),goldMin:3,goldMax:6},
    {type:'grunt',name:'游击兵',hp:Math.round(88*em),atk:Math.round(9*em),goldMin:3,goldMax:6},
    {type:'grunt',name:'突击兵',hp:Math.round(100*em),atk:Math.round(11*em),goldMin:4,goldMax:8},
    {type:'elite',name:'精英指挥官',hp:Math.round(240*em),atk:Math.round(17*em),goldMin:14,goldMax:22},
    {type:'grunt',name:'突击兵',hp:Math.round(110*em),atk:Math.round(12*em),goldMin:4,goldMax:8},
    {type:'grunt',name:'重装兵',hp:Math.round(130*em),atk:Math.round(14*em),goldMin:5,goldMax:9},
    {type:'boss',name:'将军·沃尔科夫',hp:Math.round(520*em),atk:Math.round(22*em),goldMin:40,goldMax:65}
  ];
  else waveConfig=[
    {type:'grunt',name:'精锐兵',hp:Math.round(100*em),atk:Math.round(11*em),goldMin:5,goldMax:9},
    {type:'grunt',name:'精锐兵',hp:Math.round(115*em),atk:Math.round(13*em),goldMin:5,goldMax:9},
    {type:'elite',name:'精英队长',hp:Math.round(280*em),atk:Math.round(19*em),goldMin:16,goldMax:26},
    {type:'grunt',name:'重装兵',hp:Math.round(145*em),atk:Math.round(16*em),goldMin:6,goldMax:11},
    {type:'elite',name:'精英指挥官',hp:Math.round(310*em),atk:Math.round(22*em),goldMin:18,goldMax:28},
    {type:'grunt',name:'狙击手',hp:Math.round(110*em),atk:Math.round(21*em),goldMin:7,goldMax:12},
    {type:'boss',name:'要塞司令',hp:Math.round(600*em),atk:Math.round(28*em),goldMin:50,goldMax:80}
  ];
}

function spawnWaveEnemy(){
  if(wave>=waveConfig.length)wave=waveConfig.length-1;
  var c=waveConfig[wave];if(!c)return;
  enemyType=c.type;enemyName=c.name;enemyMaxHp=c.hp;enemyHp=c.hp;enemyAtk=c.atk;
  enemyGoldMin=c.goldMin||2;enemyGoldMax=c.goldMax||5;
  if(c.type==='boss')state='BOSS';else state='FIGHTING';
}

// ============ 战斗渲染 ============
function drawBattle(){
  // bg
  var skyGrad=ctx.createLinearGradient(0,0,0,H*0.6);
  skyGrad.addColorStop(0,'#1a2a3a');skyGrad.addColorStop(0.45,'#2d4a5a');skyGrad.addColorStop(1,'#4a6a5a');
  ctx.fillStyle=skyGrad;ctx.fillRect(0,0,W,H*0.64);
  ctx.fillStyle='#5a4e30';ctx.fillRect(0,H*0.60,W,H*0.40);
  ctx.fillStyle='#3a2e18';var s=bgScroll%W;
  for(var x=-s;x<W+200;x+=100)ctx.fillRect(x,H*0.64,3,2);

  // 状态横幅
  if(state==='ADVANCING'){ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(0,H*0.28,W,24);drawText('小队推进中...',W/2,H*0.28+12,13,'#4ade80','center');}
  else if(state==='SEARCH'){ctx.fillStyle='rgba(0,0,0,0.4)';ctx.fillRect(0,H*0.28,W,24);drawText('搜索物资中...',W/2,H*0.28+12,13,'#f0b830','center');}

  // 角色
  var gy=H*0.58;
  if(state==='DEFEND'){
    drawOp(W*0.78,gy-18,true);
    if(enemyHp>0||enemyDeathTimer>0)drawEnemy(W*0.22,gy-10,enemyType,true);
  }else if(state==='ADVANCING'||state==='SEARCH'){
    drawOp(W*0.20,gy-18,false);
  }else if(state==='EXTRACTING'){
    drawOp(W*0.78,gy-18,true);
    drawText('撤离中... '+Math.ceil(extractTimer)+'s',W*0.5,H*0.55,14,'#4ade80','center');
  }else{
    drawOp(W*0.20,gy-18,false);
    if(enemyHp>0||enemyDeathTimer>0)drawEnemy(W*0.78,gy-10,enemyType,false);
  }

  // 弹药效果
  drawBullets();drawParticles();drawDmgNums();

  // 血条
  var bw=Math.min(160,W*0.38),bh=14,pad=8;
  drawBar(pad,H-bh-6,bw,bh,hp,getMaxHp(),'#4ade80');
  drawText('干员',pad,H-bh-22,10,'#fff');
  var ex=W-bw-pad;
  if(enemyHp>0||enemyDeathTimer>0){
    drawBar(ex,H-bh-6,bw,bh,enemyHp,enemyMaxHp,'#f0873e');
    drawText(enemyName,ex+bw,H-bh-22,10,'#fff','right');
  }

  // 防御倒计时
  if(state==='DEFEND'&&defendTimer>0){
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.beginPath();ctx.roundRect(W/2-40,H*0.56,80,26,6);ctx.fill();
    drawText('坚守 '+Math.ceil(defendTimer)+'s',W/2,H*0.56+13,13,'#f0b830','center');
  }

  // 单词HUD
  if(currentWord&&state!=='ADVANCING'&&state!=='SEARCH'&&state!=='EXTRACTING'){
    var wy=H*0.68;
    ctx.fillStyle='rgba(0,0,0,0.75)';ctx.beginPath();ctx.roundRect(W*0.05,wy,W*0.9,44,6);ctx.fill();
    ctx.strokeStyle='rgba(255,255,255,0.08)';ctx.lineWidth=1;ctx.stroke();
    drawText(currentWord.en.toUpperCase(),W/2,wy+22,20,'#fff','center');

    // 选项
    var oy=wy+52;
    for(var i=0;i<3;i++){
      var ox=W*0.05+i*(W*0.9/3),ow=W*0.9/3-4;
      ctx.fillStyle=canAnswer?'rgba(255,255,255,0.04)':'rgba(255,255,255,0.01)';
      ctx.beginPath();ctx.roundRect(ox,oy,ow,40,4);ctx.fill();
      ctx.strokeStyle='rgba(255,255,255,0.06)';ctx.lineWidth=1;ctx.stroke();
      if(wordOptions[i])drawText(wordOptions[i],ox+ow/2,oy+20,12,'#d5dce6','center');
      if(canAnswer&&!answered)btns.push({x:ox,y:oy,w:ow,h:40,cb:(function(idx){return function(){selectAnswer(idx);};})(i)});
    }

    // 冷却
    if(cooldownTimer>0){
      ctx.fillStyle='rgba(248,113,113,0.15)';ctx.fillRect(W*0.05,wy,W*0.9*cooldownTimer/Math.max(0.001,0.7*getCooldownMult()),44);
      drawText('冷却中...',W/2,wy-10,9,'#f87171','center');
    }
  }

  // 撤离按钮
  if((state==='FIGHTING'||state==='BOSS')&&!retreatUsed&&wave>=1){
    drawBtn(W-70,10,60,30,'🚁撤离','rgba(248,113,113,0.08)','#f87171');
    btns.push({x:W-70,y:10,w:60,h:30,cb:doRetreat});
  }
}

function drawOp(x,y,fl){
  ctx.save();ctx.translate(x,y);if(fl)ctx.scale(-1,1);
  ctx.fillStyle='#3a5a2a';ctx.fillRect(-10,-22,20,26);
  ctx.fillStyle='#2a4a1a';ctx.fillRect(-9,-18,18,16);
  ctx.fillStyle='#d4a574';ctx.fillRect(-6,-40,12,16);
  ctx.fillStyle='#4a5a3a';ctx.beginPath();ctx.arc(0,-32,12,Math.PI,0);ctx.fill();
  ctx.fillStyle='#2d2a1a';ctx.fillRect(-7,4,6,14);ctx.fillRect(2,4,6,14);
  ctx.fillStyle='#3a3a3a';ctx.fillRect(12,-14,30,5);ctx.fillRect(38,-17,8,10);
  if(playerFlash>1){ctx.fillStyle='rgba(255,210,60,'+Math.min(1,playerFlash/6)+')';ctx.beginPath();ctx.arc(46,-12,4+playerFlash*3,0,Math.PI*2);ctx.fill();}
  ctx.restore();
}

function drawEnemy(x,y,type,fl,df){
  if(df&&Math.sin(enemyDeathTimer*40)>0)return;
  ctx.save();ctx.translate(x,y);var sc=type==='boss'?1.5:(type==='elite'?1.2:1);ctx.scale(fl?-sc:sc,sc);
  if(enemyDeathTimer>0){ctx.globalAlpha=enemyDeathTimer/0.4;}
  ctx.fillStyle=type==='boss'?'#6a1a1a':'#4a3a2a';ctx.fillRect(-10,-20,20,24);
  ctx.fillStyle=type==='boss'?'#4a1010':'#3a2a1a';ctx.fillRect(-7,-34,14,16);
  ctx.fillStyle='#2a1a0a';ctx.fillRect(3,-2,5,9);ctx.fillRect(-8,-2,5,9);
  ctx.fillStyle='#ff3333';ctx.fillRect(-4,-30,2,2);ctx.fillRect(2,-30,2,2);
  ctx.fillStyle='#2a2a2a';ctx.fillRect(-30,-16,14,4);ctx.fillRect(-33,-18,4,8);
  if(enemyFlash>1){ctx.fillStyle='rgba(255,200,50,'+Math.min(1,enemyFlash/8)+')';ctx.beginPath();ctx.arc(-33,-14,3+enemyFlash*2,0,Math.PI*2);ctx.fill();}
  if(type==='boss'){ctx.fillStyle='#ff2222';ctx.fillRect(-9,-36,18,3);}
  ctx.globalAlpha=1;ctx.restore();
}

function drawBullets(){
  bullets.forEach(function(b){
    var cx=b.x+(b.tx-b.x)*b.progress,cy=b.y+(b.ty-b.y)*b.progress;
    ctx.fillStyle=b.isPlayer?'rgba(255,210,80,0.4)':'rgba(255,70,30,0.4)';
    ctx.fillRect(cx-10,cy-0.5,10,1);
    ctx.fillStyle=b.isPlayer?'#ffc830':'#ff4428';
    ctx.fillRect(cx-2,cy-1,8,2);
  });
}

function drawParticles(){
  particles.forEach(function(p){
    ctx.globalAlpha=Math.max(0,Math.min(1,p.life/0.7));
    ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size);
  });
  ctx.globalAlpha=1;
}

function drawDmgNums(){
  dmgNums.forEach(function(d){
    ctx.globalAlpha=Math.max(0,Math.min(1,d.life/1.1));
    ctx.fillStyle=d.color;ctx.font='bold 16px sans-serif';ctx.textAlign='center';
    ctx.fillText(d.text,d.x,d.y);
  });
  ctx.globalAlpha=1;ctx.textAlign='left';
}

function drawVictoryDefeat(){
  if(state==='VICTORY'){
    ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(0,0,W,H);
    drawText('✅ 任务完成!',W/2,H*0.35,22,'#4ade80','center');
    drawText('获得金币 +'+missionGold,W/2,H*0.42,14,'#f0b830','center');
    drawBtn(W*0.3,H*0.50,W*0.4,44,'返回安全屋','rgba(74,222,128,0.12)','#4ade80');
    btns.push({x:W*0.3,y:H*0.50,w:W*0.4,h:44,cb:function(){hp=Math.min(getMaxHp(),hp+30);state='HIDEOUT';}});
  }else if(state==='DEFEAT'){
    ctx.fillStyle='rgba(0,0,0,0.6)';ctx.fillRect(0,0,W,H);
    drawText('💀 行动失败',W/2,H*0.35,22,'#f87171','center');
    drawBtn(W*0.3,H*0.50,W*0.4,44,'返回安全屋','rgba(248,113,113,0.12)','#f87171');
    btns.push({x:W*0.3,y:H*0.50,w:W*0.4,h:44,cb:function(){
      hp=Math.round(getMaxHp()*0.4);
      if(vest)vest.currentDur=Math.max(0,(vest.currentDur||vest.durability)-Math.round(vest.durability*0.4));
      state='HIDEOUT';loot=[];missionGold=0;
    }});
  }
}

// ============ 游戏逻辑 ============
function nextWord(){
  if(nextWordTimer){clearTimeout(nextWordTimer);nextWordTimer=null;}
  if(state==='ADVANCING'||state==='SEARCH'||state==='EXTRACTING'||state==='HIDEOUT')return;
  answered=false;canAnswer=true;speedBonus=3;
  var pool=getWordPool();
  if(pool.length<3)pool=getWordPool(); // fallback
  var correct=pool[Math.floor(Math.random()*pool.length)];
  var dis=pool.filter(function(v){return v.en!==correct.en;}).sort(function(){return Math.random()-0.5;}).slice(0,2).map(function(v){return v.zh;});
  currentWord=correct;wordOptions=[correct.zh].concat(dis).sort(function(){return Math.random()-0.5;});

  // 爆头检测
  var mw=masteredWords[correct.en]||{c:0,hs:0};
  if(mw.hs>0){
    answered=true;canAnswer=false;
    var dmg=Math.round(getAtk()*1.2*(ammo?ammo.dmgMult:1));enemyHp-=dmg;
    addDmgNum(dmg,false);playerFlash=14;screenShake=8;
    headshotFlash=0.3;mw.hs--;masteredWords[correct.en]=mw;
    for(var i=0;i<20;i++)particles.push({x:W*0.75,y:H*0.4,vx:(Math.random()-0.5)*14,vy:(Math.random()-0.8)*10-3,life:0.5+Math.random()*0.5,color:Math.random()>0.5?'#fbbf24':'#f59e0b',size:2+Math.random()*4});
    if(enemyHp<=0){enemyHp=0;enemyDeathTimer=0.4;if(state==='DEFEND')defendKilled=true;else onEnemyDefeated();}
    else setTimeout(function(){if(state==='FIGHTING'||state==='BOSS'||state==='DEFEND')nextWord();},600);
    return;
  }
}

function getWordPool(){
  if(!zone)return VOCAB[0]||[];
  var gIdx=zone.grade||0;
  var pool=[];
  for(var gi=0;gi<=gIdx;gi++){if(VOCAB[gi])pool=pool.concat(VOCAB[gi]);}
  if(pool.length<3)pool=VOCAB[0]||[];
  if(mode==='death'&&wrongWords.length>3){
    var dw=wrongWords[Math.floor(Math.random()*wrongWords.length)];
    pool=pool.filter(function(v){return v.en===dw.en;}).concat(pool);
  }
  return pool;
}

function selectAnswer(idx){
  if(!canAnswer||answered)return;
  answered=true;canAnswer=false;btns=[];
  var ok=wordOptions[idx]===currentWord.zh;
  if(ok){
    var mw=masteredWords[currentWord.en]||{c:0,hs:0};mw.c++;
    if(mw.c>=3){mw.hs=3;mw.c=0;}masteredWords[currentWord.en]=mw;
    var dmg=Math.round(getAtk()*(0.85+Math.random()*0.3));enemyHp-=dmg;
    addDmgNum(dmg,false);playerFlash=8;screenShake=Math.max(screenShake,3);
  }else{
    var rd=getReducedDmg(enemyAtk);hp-=rd;if(vest&&vest.currentDur>0){vest.currentDur-=Math.max(1,Math.round(enemyAtk*0.3));if(vest.currentDur<=0){vest.currentDur=0;}}enemyFlash=8;screenShake=Math.max(screenShake,4);
    cooldownTimer=0.7*getCooldownMult();
    // 记录错词
    if(!wrongWords.some(function(w){return w.en===currentWord.en;}))wrongWords.push(currentWord);
  }
  speedBonus=Math.max(1,speedBonus-1);

  if(enemyHp<=0){enemyHp=0;enemyDeathTimer=0.4;if(state==='DEFEND')defendKilled=true;else onEnemyDefeated();}
  else if(hp<=0){hp=0;onPlayerDefeated();}
  else{nextWordTimer=setTimeout(function(){if(state==='FIGHTING'||state==='BOSS'||state==='DEFEND'){cooldownTimer=0;nextWord();}},ok?300:750);}
}

function onEnemyDefeated(){
  // 金币
  var eg=Math.round(rnd(enemyGoldMin,enemyGoldMax));
  gold+=eg;missionGold+=eg;totalGoldEarned+=eg;
  rollLoot();
  // boss → 防御阶段
  if(enemyType==='boss'){
    state='DEFEND';
    defendTimer=defendDuration;defendEnterTimer=0.6;_defendWave=0;
    defendKilled=false;defendCooldown=0;canAnswer=false;answered=false;
    return;
  }
  // 普通敌人 → 推进
  wave++;advanceCount++;
  if(advanceCount%3===0){
    state='SEARCH';searchTimer=0;canAnswer=false;
    return;
  }
  state='ADVANCING';canAnswer=false;
}

function rollLoot(){
  var totalW=0;LOOT_TABLE.forEach(function(l){totalW+=l.weight;});
  var roll=Math.random()*totalW,cum=0;
  for(var i=0;i<LOOT_TABLE.length;i++){
    cum+=LOOT_TABLE[i].weight;
    if(roll<=cum){
      var lt=LOOT_TABLE[i];
      loot.push({rarity:lt.rarity,name:lt.name,color:lt.color,emoji:lt.emoji,sellPrice:Math.round(lt.sellPrice*rnd(0.8,1.2))});
      break;
    }
  }
  // 高难度多掉一件
  if(zone&&zone.diff>=2&&Math.random()<0.35)rollLoot();
}

function onPlayerDefeated(){
  state='DEFEAT';
  gun=null;helmet=null;vest=null;muzzle=null;sight=null;grip=null;ammo=AMMO[0];
  var lostGold=missionGold;gold=Math.max(0,gold-lostGold);loot=[];missionGold=0;
}

function doRetreat(){
  retreatUsed=true;
  gold=Math.max(0,gold-missionGold);
  missionGold=0;loot=[];
  state='EXTRACTING';extractTimer=1.5;
}

function doSearch(){
  // 随机loot容器
  var containers=[
    {name:'弹药箱',loot:LOOT_TABLE[0],weight:50},
    {name:'医疗包',loot:LOOT_TABLE[1],weight:25},
    {name:'装备箱',loot:LOOT_TABLE[2],weight:15},
    {name:'贵重箱',loot:LOOT_TABLE[3],weight:7},
    {name:'大红容器',loot:LOOT_TABLE[4],weight:3},
  ];
  var totalW=0;containers.forEach(function(c){totalW+=c.weight;});
  var roll=Math.random()*totalW,cum=0;
  var selected=containers[0];
  for(var i=0;i<containers.length;i++){cum+=containers[i].weight;if(roll<=cum){selected=containers[i];break;}}
  var lt=selected.loot;
  loot.push({rarity:lt.rarity,name:lt.name,color:lt.color,emoji:lt.emoji,sellPrice:Math.round(lt.sellPrice*rnd(0.8,1.4))});
  addDmgNum(lt.sellPrice,false,true);
  state='ADVANCING';canAnswer=false;
}

function addDmgNum(dmg,isPlayer,isLoot){
  var x=isPlayer?W*0.25:W*0.75,y=H*0.30,c=isLoot?'#f0b830':(isPlayer?'#f87171':'#f0b830');
  dmgNums.push({x:x+(Math.random()-0.5)*50,y:y,text:(isPlayer?'-':'')+dmg+(isLoot?'💰':''),life:1.1,color:c,vy:-42});
}

// ============ 装备操作 ============
function quickBuy(id,type){
  var all={gun:GUNS,helmet:HELMETS,vest:VESTS,muzzle:MUZZLES,sight:SIGHTS,grip:GRIPS};
  var items=all[type];if(!items)return;
  var it=items.find(function(x){return x.id===id;});if(!it)return;
  if(gold<it.price)return;gold-=it.price;
  var ni={id:it.id,name:it.name,quality:it.quality,type:type};
  var map={gun:1,helmet:1,vest:1,muzzle:1,sight:1,grip:1};
  if(map[type]){
    if(type==='gun')ni.atk=it.atk;
    if(type==='vest'){ni.durability=it.durability;ni.dmgReduce=it.dmgReduce;ni.currentDur=it.durability;}
    if(type==='helmet'){ni.hpBonus=it.hpBonus;ni.dmgReduce=it.dmgReduce;}
    if(type==='muzzle')ni.atkMult=it.atkMult;
    if(type==='sight'||type==='grip')ni.coolReduce=it.coolReduce;
    var _map={gun:1,helmet:1,vest:1,muzzle:1,sight:1,grip:1};if(_map[type]){if(type==="gun")gun=ni;else if(type==="helmet")helmet=ni;else if(type==="vest")vest=ni;else if(type==="muzzle")muzzle=ni;else if(type==="sight")sight=ni;else if(type==="grip")grip=ni;}
  }
  state='SHOP';shopTab=0;
}

function equipItem(item,type){
  var m={gun:'gun',helmet:'helmet',vest:'vest',muzzle:'muzzle',sight:'sight',grip:'grip'};
  if(!m[type])return;
  var cloned={id:item.id,name:item.name,quality:item.quality,type:item.type};
  if(type==='gun'){var g=GUNS.find(function(x){return x.id===item.id;});if(g)cloned.atk=g.atk;}
  if(type==='muzzle'){var x=MUZZLES.find(function(x){return x.id===item.id;});if(x)cloned.atkMult=x.atkMult;}
  if(type==='sight'){var x=SIGHTS.find(function(x){return x.id===item.id;});if(x)cloned.coolReduce=x.coolReduce;}
  if(type==='grip'){var x=GRIPS.find(function(x){return x.id===item.id;});if(x)cloned.coolReduce=x.coolReduce;}
  if(type==='helmet'){var h=HELMETS.find(function(x){return x.id===item.id;});if(h){cloned.hpBonus=h.hpBonus;cloned.dmgReduce=h.dmgReduce;}}
  if(type==='vest'){var v=VESTS.find(function(x){return x.id===item.id;});if(v){cloned.durability=v.durability;cloned.dmgReduce=v.dmgReduce;cloned.currentDur=v.durability;}}
  this[m[type]]=cloned;
}

// ============ 更新循环 ============
var battleStates={FIGHTING:1,BOSS:1,ADVANCING:1,SEARCH:1,DEFEND:1,EXTRACTING:1,VICTORY:1,DEFEAT:1};
function update(dt){
  if(!battleStates[state])return;

  bgScroll+=state==='ADVANCING'?dt*200:dt*40;

  if(enemyDeathTimer>0)enemyDeathTimer=Math.max(0,enemyDeathTimer-dt);
  if(headshotFlash>0)headshotFlash=Math.max(0,headshotFlash-dt);
  if(cooldownTimer>0){cooldownTimer-=dt;if(cooldownTimer<=0&&!answered&&(state==='FIGHTING'||state==='BOSS'||state==='DEFEND')&&!nextWordTimer)nextWord();}
  if(playerFlash>0)playerFlash-=dt*30;
  if(enemyFlash>0)enemyFlash-=dt*30;
  if(screenShake>0)screenShake=Math.max(0,screenShake-dt*5);

  // 玩家射击（视觉）
  if((state==='FIGHTING'||state==='BOSS'||state==='DEFEND')&&enemyHp>0&&!nextWordTimer){
    eDmgTimer+=dt;
    if(eDmgTimer>0.6){eDmgTimer=0;firePlayerShot();}
    // 敌人持续伤害
    if(enemyHp>0&&!eDoTActive){eDoTActive=true;
      var ad=Math.max(1,Math.round(enemyAtk*0.08));
      hp-=getReducedDmg(ad);addDmgNum(ad,true);
      if(hp<=0){hp=0;onPlayerDefeated();}
    }
  }else{eDoTActive=false;}

  // 推进
  if(state==='ADVANCING'){
    waveTimer=typeof waveTimer==='undefined'?0:waveTimer;
    waveTimer+=dt;
    var advDur=1+Math.floor(Math.random()*2); // 1-2秒推进
    if(waveTimer>=advDur){
      if(wave>=totalWaves){
        var b1=missionGold;missionGold=0;
        gold+=b1;totalGoldEarned+=b1;
        state='VICTORY';
      }else{
        spawnWaveEnemy();
        state='FIGHTING';
        setTimeout(function(){nextWord();},400);
      }
    }
  }

  // 搜索
  if(state==='SEARCH'){
    searchTimer+=dt;
    if(searchTimer>1.0){doSearch();}
  }

  // 防御
  if(state==='DEFEND'){
    defendTimer-=dt;
    if(defendEnterTimer>0){defendEnterTimer-=dt;if(defendEnterTimer<=0)_spawnDefendWave();}
    else if(defendCooldown>0){defendCooldown-=dt;if(defendCooldown<=0&&!answered)_spawnDefendWave();}
    else if(!answered&&enemyHp<=0&&defendKilled){_spawnDefendWave();}
    if(defendTimer<=0&&enemyHp<=0&&!answered){
      state='EXTRACTING';extractTimer=extractDuration;canAnswer=false;answered=false;
    }
  }

  // 撤离
  if(state==='EXTRACTING'){extractTimer-=dt;if(extractTimer<=0){state='VICTORY';}}

  // 粒子
  for(var i=particles.length-1;i>=0;i--){var p=particles[i];p.x+=p.vx*dt*60;p.y+=p.vy*dt*60;p.vy+=5*dt;p.life-=dt;if(p.life<=0)particles.splice(i,1);}
  for(var i=bullets.length-1;i>=0;i--){var b=bullets[i];b.progress+=b.speed*dt;if(b.progress>=1){for(var j=0;j<3;j++)particles.push({x:b.tx,y:b.ty,vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6,life:0.3,color:'#ffa726',size:2});bullets.splice(i,1);}}
  for(var i=dmgNums.length-1;i>=0;i--){var d=dmgNums[i];d.y+=d.vy*dt;d.life-=dt;if(d.life<=0)dmgNums.splice(i,1);}
}

function firePlayerShot(){
  var sx=state==='DEFEND'?W*0.73:W*0.27,sy=H*0.48;
  var dir=state==='DEFEND'?-1:1;
  var ex=sx+dir*(W*0.46+(Math.random()-0.5)*28),ey=H*0.46+(Math.random()-0.5)*18;
  bullets.push({x:sx,y:sy,tx:ex,ty:ey,progress:0,speed:10,isPlayer:true});playerFlash=Math.max(playerFlash,4);
}

var _defendWave=0;
function _spawnDefendWave(){
  _defendWave++;
  enemyType='elite';enemyName='增援#'+_defendWave;enemyMaxHp=Math.round(150*(zone?zone.em:1));enemyHp=enemyMaxHp;enemyAtk=Math.round(13*(zone?zone.em:1));
  enemyGoldMin=8;enemyGoldMax=15;
  answered=false;canAnswer=false;defendKilled=false;defendCooldown=0;
  if(nextWordTimer){clearTimeout(nextWordTimer);nextWordTimer=null;}
  enemyDeathTimer=0;
  setTimeout(function(){if(state==='DEFEND')nextWord();},400);
}

// ============ 微信入口 ============
try{
  cnv=wx.createCanvas();
  ctx=cnv.getContext('2d');W=cnv.width;H=cnv.height;
  wx.onTouchStart(onTouch);
}catch(e){
  // 浏览器回退
  cnv=document.createElement('canvas');document.body.appendChild(cnv);
  cnv.style.width='100%';cnv.style.height='100vh';
  ctx=cnv.getContext('2d');
  function resizeC(){var r=cnv.getBoundingClientRect();cnv.width=r.width;cnv.height=r.height;W=r.width;H=r.height;}
  window.addEventListener('resize',resizeC);resizeC();
  cnv.addEventListener('touchstart',function(e){onTouch(e.touches[0]);e.preventDefault();});
  cnv.addEventListener('click',function(e){onTouch(e);});
}

function gameLoop(){
  update(0.016);
  if(state!='TITLE'&&state!='HIDEOUT'&&state!='SHOP'&&state!='DEPLOY')btns=[];
  else if(state==='HIDEOUT'||state==='DEPLOY')btns=[];
  render();
  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
