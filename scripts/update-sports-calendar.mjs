import fs from 'node:fs/promises';
const zhNames={
  'Los Angeles Dodgers':'洛杉磯道奇','Arizona Diamondbacks':'亞利桑那響尾蛇','Atlanta Braves':'亞特蘭大勇士','Baltimore Orioles':'巴爾的摩金鶯','Boston Red Sox':'波士頓紅襪','Chicago Cubs':'芝加哥小熊','Chicago White Sox':'芝加哥白襪','Cincinnati Reds':'辛辛那提紅人','Cleveland Guardians':'克里夫蘭守護者','Colorado Rockies':'科羅拉多洛磯','Detroit Tigers':'底特律老虎','Houston Astros':'休士頓太空人','Kansas City Royals':'堪薩斯市皇家','Los Angeles Angels':'洛杉磯天使','Miami Marlins':'邁阿密馬林魚','Milwaukee Brewers':'密爾瓦基釀酒人','Minnesota Twins':'明尼蘇達雙城','New York Mets':'紐約大都會','New York Yankees':'紐約洋基','Athletics':'運動家','Philadelphia Phillies':'費城費城人','Pittsburgh Pirates':'匹茲堡海盜','San Diego Padres':'聖地牙哥教士','San Francisco Giants':'舊金山巨人','Seattle Mariners':'西雅圖水手','St. Louis Cardinals':'聖路易紅雀','Tampa Bay Rays':'坦帕灣光芒','Texas Rangers':'德州遊騎兵','Toronto Blue Jays':'多倫多藍鳥','Washington Nationals':'華盛頓國民',
  'Atlanta Hawks':'亞特蘭大老鷹','Boston Celtics':'波士頓塞爾提克','Brooklyn Nets':'布魯克林籃網','Charlotte Hornets':'夏洛特黃蜂','Chicago Bulls':'芝加哥公牛','Cleveland Cavaliers':'克里夫蘭騎士','Dallas Mavericks':'達拉斯獨行俠','Denver Nuggets':'丹佛金塊','Detroit Pistons':'底特律活塞','Golden State Warriors':'金州勇士','Houston Rockets':'休士頓火箭','Indiana Pacers':'印第安納溜馬','LA Clippers':'洛杉磯快艇','Los Angeles Clippers':'洛杉磯快艇','Los Angeles Lakers':'洛杉磯湖人','Memphis Grizzlies':'曼菲斯灰熊','Miami Heat':'邁阿密熱火','Milwaukee Bucks':'密爾瓦基公鹿','Minnesota Timberwolves':'明尼蘇達灰狼','New Orleans Pelicans':'紐奧良鵜鶘','New York Knicks':'紐約尼克','Oklahoma City Thunder':'奧克拉荷馬雷霆','Orlando Magic':'奧蘭多魔術','Philadelphia 76ers':'費城 76 人','Phoenix Suns':'鳳凰城太陽','Portland Trail Blazers':'波特蘭拓荒者','Sacramento Kings':'沙加緬度國王','San Antonio Spurs':'聖安東尼奧馬刺','Toronto Raptors':'多倫多暴龍','Utah Jazz':'猶他爵士','Washington Wizards':'華盛頓巫師',
  'Arizona Cardinals':'亞利桑那紅雀','Atlanta Falcons':'亞特蘭大獵鷹','Baltimore Ravens':'巴爾的摩烏鴉','Buffalo Bills':'水牛城比爾','Carolina Panthers':'卡羅萊納黑豹','Chicago Bears':'芝加哥熊','Cincinnati Bengals':'辛辛那提孟加拉虎','Cleveland Browns':'克里夫蘭布朗','Dallas Cowboys':'達拉斯牛仔','Denver Broncos':'丹佛野馬','Detroit Lions':'底特律雄獅','Green Bay Packers':'綠灣包裝工','Houston Texans':'休士頓德州人','Indianapolis Colts':'印第安納波利斯小馬','Jacksonville Jaguars':'傑克森維爾美洲虎','Kansas City Chiefs':'堪薩斯市酋長','Las Vegas Raiders':'拉斯維加斯突襲者','Los Angeles Chargers':'洛杉磯電光','Los Angeles Rams':'洛杉磯公羊','Miami Dolphins':'邁阿密海豚','Minnesota Vikings':'明尼蘇達維京人','New England Patriots':'新英格蘭愛國者','New Orleans Saints':'紐奧良聖徒','New York Giants':'紐約巨人','New York Jets':'紐約噴射機','Philadelphia Eagles':'費城老鷹','Pittsburgh Steelers':'匹茲堡鋼人','San Francisco 49ers':'舊金山 49 人','Seattle Seahawks':'西雅圖海鷹','Tampa Bay Buccaneers':'坦帕灣海盜','Tennessee Titans':'田納西泰坦','Washington Commanders':'華盛頓司令'
  ,'Algeria':'阿爾及利亞','Argentina':'阿根廷','Australia':'澳洲','Austria':'奧地利','Belgium':'比利時','Bosnia & Herzegovina':'波士尼亞與赫塞哥維納','Brazil':'巴西','Canada':'加拿大','Cape Verde':'維德角','Colombia':'哥倫比亞','Croatia':'克羅埃西亞','Curaçao':'庫拉索','Czech Republic':'捷克','DR Congo':'剛果民主共和國','Ecuador':'厄瓜多','Egypt':'埃及','England':'英格蘭','France':'法國','Germany':'德國','Ghana':'迦納','Haiti':'海地','Iran':'伊朗','Iraq':'伊拉克','Ivory Coast':'象牙海岸','Japan':'日本','Jordan':'約旦','Mexico':'墨西哥','Morocco':'摩洛哥','Netherlands':'荷蘭','New Zealand':'紐西蘭','Norway':'挪威','Panama':'巴拿馬','Paraguay':'巴拉圭','Portugal':'葡萄牙','Qatar':'卡達','Saudi Arabia':'沙烏地阿拉伯','Scotland':'蘇格蘭','Senegal':'塞內加爾','South Africa':'南非','South Korea':'南韓','Spain':'西班牙','Sweden':'瑞典','Switzerland':'瑞士','Tunisia':'突尼西亞','Turkey':'土耳其','USA':'美國','Uruguay':'烏拉圭','Uzbekistan':'烏茲別克'
};
const zhMeta={'regular-season':'例行賽','post-season':'季後賽','pre-season':'熱身賽','Round of 16':'16 強','Quarter-final':'半準決賽','Semi-final':'準決賽','Final':'決賽','Third-place match':'季軍戰'};
const zhText=text=>typeof text==='string'?Object.entries(zhNames).reduce((s,[en,zh])=>s.replaceAll(en,zh),zhMeta[text]||text):text;
let previousData={};try{previousData=JSON.parse(await fs.readFile('sports-calendar/data.json','utf8'))}catch{}
let previousEvents=previousData.events||[];
const events=[];const add=x=>events.push({...x,title:zhText(x.title),subtitle:zhText(x.subtitle)});const safe=async(url)=>{if(process.env.OFFLINE||process.env.SKIP_SPORTS)return null;try{const r=await fetch(url,{signal:AbortSignal.timeout(15000)});if(!r.ok)throw Error(r.status);return await r.json()}catch(e){console.warn(url,e.message);return null}};
const text=async(url)=>{if(process.env.OFFLINE||process.env.SKIP_SPORTS)return '';try{const r=await fetch(url,{headers:{'User-Agent':'Mozilla/5.0'},signal:AbortSignal.timeout(20000)});if(!r.ok)throw Error(r.status);return await r.text()}catch(e){console.warn(url,e.message);return ''}};
const channel={f1:{channel:'200–202',channelStatus:'愛爾達體育，依 EPG'},world:{channel:'200–202',channelStatus:'愛爾達體育，依 EPG'},mlb:{channel:'200–202',channelStatus:'愛爾達／依 EPG'},nba:{channel:'200–202',channelStatus:'愛爾達／依 EPG'},nfl:{channel:'200–202',channelStatus:'愛爾達／依 EPG'},tour:{channel:'待定',channelStatus:'MOD EPG 尚未確認'}};
const ymd=(d,sep='-')=>`${d.getFullYear()}${sep}${String(d.getMonth()+1).padStart(2,'0')}${sep}${String(d.getDate()).padStart(2,'0')}`;
const clean=s=>String(s||'').replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();
function parseModPrograms(html){
  const out=[],re=/<div class="com com_(\d+)">[\s\S]*?<h3><a[^>]*>([^<]+)<\/a><\/h3>[\s\S]*?<p class="program"><a[^>]*>([^<]+)<\/a><\/p>[\s\S]*?<div class="time">([^<]+)<\/div>/g;
  for(let m;(m=re.exec(html));)out.push({channel:m[1],channelName:clean(m[2]),title:clean(m[3]),time:clean(m[4]),source:'中華電信 MOD 目前節目'});
  return out;
}
function parseModChannels(html){
  const rows=parseModPrograms(html),wanted=/tvN|KMTV|Arirang|MTV|龍華偶像|韓國娛樂|BBC Lifestyle|Food Network|Travel Channel|EYE TV旅遊|亞洲旅遊|美食星球|Fashion|Lifetime|HGTV/i;
  const fixed=[['353','龍華偶像HD'],['376','tvN HD'],['377','韓國娛樂台KMTV HD'],['751','Arirang TV HD'],['260','BBC Lifestyle HD'],['275','美食星球HD'],['277','Food Network 美食台HD'],['278','亞洲旅遊HD'],['279','EYE TV旅遊台HD'],['280','Travel Channel HD']];
  return [...new Map([...fixed,...rows.filter(x=>wanted.test(`${x.channelName} ${x.title}`)).map(x=>[x.channel,x.channelName])].map(x=>[x[0],x])).values()];
}
function parseModEpg(html,fallbackChannel,fallbackName){
  const heading=html.match(/<h3[^>]*>\s*(\d+)\s+([^<]+)<\/h3>/),channel=heading?.[1]||fallbackChannel,channelName=clean(heading?.[2]||fallbackName),out=[];
  for(const block of html.split("<div class='epgdays'>").slice(1)){
    const date=block.match(/(20\d{2}-\d{2}-\d{2})/)?.[1];
    if(!date)continue;
    for(const m of block.matchAll(/<div class='(?:past|now|future)'[^>]*>\s*<div class='time'>\s*(\d{2}:\d{2})\s*<\/div>\s*<div class='channelTitle'>\s*([\s\S]*?)\s*<\/div>/g)){
      const title=clean(m[2]).replace(/[（(](普|護|輔\d*|限)[）)]/g,'').trim();
      if(title)out.push({channel,channelName,title,time:m[1],date,source:'中華電信 MOD 7 日節目表'});
    }
  }
  return out;
}
function scoreModProgram(p){
  const haystack=`${p.channelName} ${p.title}`,reject=/新聞|購物|午間|整點|氣象|股市|財經|政論|宗教|法會|六合彩|消費高手|首購|詳按|元氣加油站|銀髮|健康|養生|經典|懷舊|大陸尋奇|大陸尋趣|新戲說台灣|戲說台灣|藍色水玲瓏|台灣1001個故事|台灣一千零一個故事|鑽石大舞台|美鳳有約|全民星攻略|巴布狄倫|羅大佑|古典|爵士|貝多芬|史克里亞賓|重播/;
  if(reject.test(haystack))return null;
  const points=rules=>rules.reduce((n,[re,pt])=>n+(re.test(haystack)?pt:0),0),hour=Number(String(p.time).slice(0,2));
  const base=points([[/tvN|KMTV|Arirang|MTV|龍華偶像|韓國娛樂|Fashion|Food Network|Travel|BBC Lifestyle|HGTV|美食星球|亞洲旅遊|EYE TV旅遊|Lifetime/i,4],[/LIVE|首播|新播|第\d+季|S\d+|\(\d+\)|\d+-\d+/,1]])+(hour>=18&&hour<=23?3:hour>=11&&hour<=17?1:0);
  const drama=base+points([[/偶像|韓流|韓劇|K-?POP|戀愛|青春|劇場|Drama|Series|Season|柔美|鬼怪|臥底|秘戀|KILL IT|龍華偶像|tvN|KMTV|Arirang|韓國娛樂/i,5],[/約會|戀綜|選秀|明星|團體|男團|女團|舞台/i,2]]);
  const variety=base+points([[/音樂|MV|K-?POP|偶像|韓流|實境|真人秀|選秀|街舞|遊戲|動漫|潮流|時尚|Fashion|美食|料理|餐廳|打卡|旅遊|旅行|探險|Lifestyle|Travel|Food|HGTV|種豆得豆|第六感|名廚|柳先生/i,5],[/MTV|KMTV|Arirang|tvN|Food Network|BBC Lifestyle|Fashion|Travel|美食星球|亞洲美食|亞洲旅遊|EYE TV旅遊/i,3]]);
  const kind=drama>=variety?'MOD影劇':'MOD綜藝',score=Math.max(drama,variety);
  return score>=7?{...p,kind,score}:null;
}
function pickPopularMod(programs){
  const reject=/新聞|購物|午間|整點|氣象|股市|財經|政論|宗教|法會|六合彩|消費高手|首購|詳按|元氣加油站|銀髮|健康|養生|經典|懷舊|大陸尋奇|大陸尋趣|新戲說台灣|戲說台灣|藍色水玲瓏|台灣1001個故事|台灣一千零一個故事|鑽石大舞台|美鳳有約|全民星攻略|巴布狄倫|羅大佑|古典|爵士|貝多芬|史克里亞賓/;
  const points=(haystack,rules)=>rules.reduce((n,[re,pt])=>n+(re.test(haystack)?pt:0),0);
  const baseRules=[
    [/tvN|KMTV|Arirang|MTV|龍華偶像|韓國娛樂|Fashion|Food Network|Travel|BBC Lifestyle|HGTV|美食星球|亞洲旅遊|EYE TV旅遊/i,4],
    [/HD|4K/,1],
    [/LIVE|首播|新播|第\d+季|S\d+|\(\d+\)|\d+-\d+/,1]
  ];
  const dramaRules=[
    [/偶像|韓流|韓劇|K-?POP|K-?CRAZY|戀愛|青春|劇場|Drama|Series|Season|tvN|龍華偶像|KMTV|Arirang|韓國娛樂/i,5],
    [/約會|戀綜|選秀|明星|團體|男團|女團|舞台/i,2]
  ];
  const varietyRules=[
    [/音樂|MV|K-?POP|偶像|韓流|實境|真人秀|選秀|街舞|遊戲|動漫|潮流|時尚|Fashion|美食|料理|餐廳|打卡|旅遊|旅行|探險|Lifestyle|Travel|Food|HGTV|HOME TO TABLE|種豆得豆|頂尖名模/i,5],
    [/MTV|KMTV|Arirang|tvN|Food Network|BBC Lifestyle|Fashion|Travel|美食星球|亞洲美食|亞洲旅遊|EYE TV旅遊/i,3]
  ];
  const rank=(kindRules)=>programs.map(p=>{const haystack=`${p.channelName} ${p.title}`;return {...p,score:reject.test(haystack)?-99:points(haystack,baseRules)+points(haystack,kindRules)}}).filter(p=>p.score>=6).sort((a,b)=>b.score-a.score||Number(a.channel)-Number(b.channel));
  const uniq=arr=>[...new Map(arr.map(p=>[`${p.channel}-${p.title}`,p])).values()].map(({score,...p})=>p);
  return {modDrama:uniq(rank(dramaRules)).slice(0,12),modVariety:uniq(rank(varietyRules)).slice(0,12)};
}
function geminiText(result){
  if(result?.output_text)return result.output_text;
  const chunks=[];
  const walk=x=>{if(!x)return;if(typeof x==='string')return;if(Array.isArray(x))return x.forEach(walk);if(x.text)chunks.push(x.text);for(const v of Object.values(x))if(typeof v==='object')walk(v)};
  walk(result);
  return chunks.join('\n');
}
let lastGeminiError='';
const compactError=s=>String(s||'').replace(/\s+/g,' ').slice(0,180);
async function postGeminiJson(url,body){
  const r=await fetch(url,{method:'POST',headers:{'x-goog-api-key':process.env.GEMINI_API_KEY,'Content-Type':'application/json'},body:JSON.stringify(body),signal:AbortSignal.timeout(8000)});
  if(!r.ok)throw Error(`${r.status} ${compactError(await r.text())}`);
  return await r.json();
}
function extractJsonText(text){
  const raw=String(text||'').replace(/^```json\s*|\s*```$/g,'').trim(),start=raw.indexOf('{'),end=raw.lastIndexOf('}');
  if(start>=0&&end>start)return raw.slice(start,end+1);
  return raw;
}
async function askGeminiJson(prompt){
  if(!process.env.GEMINI_API_KEY)throw Error('GEMINI_API_KEY missing');
  const model=process.env.GEMINI_MODEL||'gemini-3.5-flash';
  const failures=[];
  try{
    const result=await postGeminiJson('https://generativelanguage.googleapis.com/v1beta/interactions',{model,input:prompt,generation_config:{temperature:0.1,thinking_level:'low'}});
    return {json:JSON.parse(extractJsonText(geminiText(result))),api:'interactions'};
  }catch(e){failures.push(`interactions ${e.message}`)}
  try{
    const result=await postGeminiJson(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,{contents:[{parts:[{text:prompt}]}],generationConfig:{temperature:0.1,responseMimeType:'application/json'}});
    return {json:JSON.parse(extractJsonText(result?.candidates?.[0]?.content?.parts?.map(p=>p.text||'').join('\n'))),api:'generateContent'};
  }catch(e){failures.push(`generateContent ${e.message}`)}
  throw Error(failures.join(' | '));
}
async function rerankModWithGemini(candidates){
  if(!process.env.GEMINI_API_KEY)return {modDrama:candidates.modDrama.slice(0,6),modVariety:candidates.modVariety.slice(0,6)};
  const compact=Object.fromEntries(Object.entries(candidates).map(([k,items])=>[k,items.map((x,i)=>({i,channel:x.channel,channelName:x.channelName,title:x.title,time:x.time}))]));
  const prompt=`你是台灣 18-35 歲觀眾的 MOD 節目推薦排序器。請只根據候選資料排序，不要新增不存在的節目。目標是找「年輕向熱門」：韓流、偶像、音樂、實境、旅遊、美食、潮流、國際娛樂、新劇優先；排除長輩向、購物、新聞、政論、宗教、懷舊老片、傳統本土長壽節目。回覆必須是純 JSON，格式：{"modDrama":[候選 i...最多6個],"modVariety":[候選 i...最多6個]}。\n候選：${JSON.stringify(compact)}`;
  try{
    const {json:picked}=await askGeminiJson(prompt);
    const pick=(key)=>Array.isArray(picked[key])?picked[key].map(i=>candidates[key]?.[Number(i)]).filter(Boolean).slice(0,6):candidates[key].slice(0,6);
    return {modDrama:pick('modDrama'),modVariety:pick('modVariety')};
  }catch(e){
    lastGeminiError=compactError(e.message);console.warn('Gemini rerank fallback',lastGeminiError);
    return {modDrama:candidates.modDrama.slice(0,6),modVariety:candidates.modVariety.slice(0,6)};
  }
}
function pickModScheduleByRules(candidates,selector='rules'){
  const selected=[],dayCount={},kindCount={},seen={};
  for(const p of candidates.sort((a,b)=>b.score-a.score||a.date.localeCompare(b.date)||a.time.localeCompare(b.time))){
    const d=p.date,k=`${d}-${p.kind}`,u=`${d}-${p.title.replace(/\(\d+\)/g,'')}`;
    if((dayCount[d]||0)>=4||(kindCount[k]||0)>=2||seen[u])continue;
    dayCount[d]=(dayCount[d]||0)+1;kindCount[k]=(kindCount[k]||0)+1;seen[u]=1;selected.push(p);
  }
  selected.sort((a,b)=>`${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  return {modSchedule:selected,modDrama:selected.filter(x=>x.kind==='MOD影劇').slice(0,6),modVariety:selected.filter(x=>x.kind==='MOD綜藝').slice(0,6),meta:{modSelector:selector,modScheduleDays:new Set(candidates.map(x=>x.date)).size,modDailyLimit:4}};
}
async function pickModScheduleWithGemini(candidates){
  const byDay=Object.groupBy?Object.groupBy(candidates,x=>x.date):candidates.reduce((a,x)=>((a[x.date]||=[]).push(x),a),{});
  const ranked=Object.values(byDay).flatMap(items=>items.sort((a,b)=>b.score-a.score||a.time.localeCompare(b.time)).slice(0,24));
  if(!process.env.GEMINI_API_KEY)return pickModScheduleByRules(ranked);
  const compact=ranked.map((x,i)=>({i,date:x.date,time:x.time,kind:x.kind,channel:x.channel,channelName:x.channelName,title:x.title}));
  const prompt=`你是台灣 18-35 歲觀眾的 MOD 7 日節目精選編輯。只根據候選資料挑選，不要新增不存在的節目。目標：年輕熱門，優先韓流、偶像、音樂、實境、旅遊、美食、潮流、國際娛樂、新劇、晚上黃金時段；排除長輩向、購物、新聞、政論、宗教、懷舊、太硬的知識節目。請選未來 7 天每天最多 4 個，其中 MOD影劇最多 2 個、MOD綜藝最多 2 個，同一天避免同名重複。回覆純 JSON：{"schedule":[候選 i...],"modDrama":[候選 i...最多6個],"modVariety":[候選 i...最多6個]}。\n候選：${JSON.stringify(compact)}`;
  try{
    const {json:picked,api}=await askGeminiJson(prompt),byIndex=i=>ranked[Number(i)];
    const schedule=(Array.isArray(picked.schedule)?picked.schedule:[]).map(byIndex).filter(Boolean);
    if(!schedule.length)throw Error('empty Gemini schedule');
    const drama=(Array.isArray(picked.modDrama)?picked.modDrama:[]).map(byIndex).filter(Boolean).slice(0,6),variety=(Array.isArray(picked.modVariety)?picked.modVariety:[]).map(byIndex).filter(Boolean).slice(0,6);
    return {modSchedule:schedule.sort((a,b)=>`${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)),modDrama:drama.length?drama:schedule.filter(x=>x.kind==='MOD影劇').slice(0,6),modVariety:variety.length?variety:schedule.filter(x=>x.kind==='MOD綜藝').slice(0,6),meta:{modSelector:'gemini',modApi:api,modScheduleDays:new Set(ranked.map(x=>x.date)).size,modDailyLimit:4}};
  }catch(e){
    lastGeminiError=compactError(e.message);console.warn('Gemini MOD schedule fallback',lastGeminiError);
    const fallback=pickModScheduleByRules(ranked,'rules-fallback');fallback.meta.modSelectorError=lastGeminiError;return fallback;
  }
}
async function getModSevenDayPicks(modHtml){
  const channels=parseModChannels(modHtml),rows=[];
  await Promise.all(channels.map(async([id,name])=>{const html=await text(`https://modp.cht.com.tw/modinfo/epginfob.php?id=${id}`);rows.push(...parseModEpg(html,id,name))}));
  const scored=rows.map(scoreModProgram).filter(Boolean);
  return scored.length?await pickModScheduleWithGemini(scored):null;
}
async function getStreamingRecommendations(){
  const modHtml=await text('https://mod.cht.com.tw/modweb/%E9%A0%BB%E9%81%93TV/%E5%85%A8%E9%83%A8.do?tab=channelInfo'),mod=(await getModSevenDayPicks(modHtml))||await rerankModWithGemini(pickPopularMod(parseModPrograms(modHtml)));
  const netflixHtml=await text('https://www.netflix.com/tudum/top10/taiwan'),seen=new Set(),netflix=[];
  for(const m of netflixHtml.matchAll(/"title":"([^"]+)"/g)){const title=m[1].replace(/\\x20/g,' ');if(title.includes('Top 10')||seen.has(title))continue;seen.add(title);netflix.push({title,source:'Netflix 台灣 Top 10',url:'https://www.netflix.com/tudum/top10/taiwan'});if(netflix.length>=10)break}
  const youtube=[{title:'YouTube 台灣熱門影片',source:'YouTube Trending Taiwan',url:'https://www.youtube.com/feed/trending?gl=TW&hl=zh-TW'},{title:'年輕人熱門短影音／梗片',source:'YouTube 搜尋',url:'https://www.youtube.com/results?search_query=%E5%8F%B0%E7%81%A3+%E7%86%B1%E9%96%80+%E7%9F%AD%E5%BD%B1%E9%9F%B3+%E6%A2%97%E7%89%87'},{title:'台灣熱門音樂 MV',source:'YouTube 搜尋',url:'https://www.youtube.com/results?search_query=%E5%8F%B0%E7%81%A3+%E7%86%B1%E9%96%80+MV+%E9%9F%B3%E6%A8%82'},{title:'熱門遊戲／實況精華',source:'YouTube 搜尋',url:'https://www.youtube.com/results?search_query=%E5%8F%B0%E7%81%A3+%E7%86%B1%E9%96%80+%E9%81%8A%E6%88%B2+%E5%AF%A6%E6%B3%81+%E7%B2%BE%E8%8F%AF'}];
  return {...mod,netflix,youtube};
}
function keepLastGoodRecommendations(fresh,old={}){
  const out={};
  for(const key of ['modDrama','modVariety','modSchedule','netflix','youtube']){
    out[key]=fresh?.[key]?.length?fresh[key]:(old?.[key]||[]);
  }
  out.meta=fresh?.meta||old?.meta||{};
  return out;
}
const taiwanToday=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Taipei'}).format(new Date());
function addModRecommendationEvents(recommendations){
  const date=taiwanToday(),seen=new Set(),schedule=recommendations?.modSchedule;
  if(Array.isArray(schedule)&&schedule.length){
    const selector=recommendations?.meta?.modSelector==='gemini'?'Gemini 年輕熱門精選':'年輕熱門精選';
    for(const item of schedule){
      const id=`${item.date}-${item.channel}-${item.title}-${item.time}`;
      if(seen.has(id))continue;
      seen.add(id);
      add({sport:item.kind||'MOD影劇',title:item.title,subtitle:`${selector}・${item.channelName||''}・${item.time}`,start:`${item.date}T${item.time}:00+08:00`,channel:item.channel||'待定',channelStatus:item.channelName?`MOD ${item.channelName}`:'MOD'});
    }
    return;
  }
  for(const [key,sport,label] of [['modDrama','MOD影劇','MOD 年輕向影集'],['modVariety','MOD綜藝','MOD 年輕向綜藝']]){
    for(const item of recommendations?.[key]||[]){
      const time=String(item.time||''),m=time.match(/(\d{1,2}):(\d{2})/);
      if(!m)continue;
      const id=`${item.channel}-${item.title}-${time}`;
      if(seen.has(id))continue;
      seen.add(id);
      add({sport,title:item.title,subtitle:`${label}・${item.channelName||''}${time?`・${time}`:''}`,start:`${date}T${String(m[1]).padStart(2,'0')}:${m[2]}:00+08:00`,channel:item.channel||'待定',channelStatus:item.channelName?`MOD ${item.channelName}`:'MOD'});
    }
  }
}
const eltaChannels=[['101','200','愛爾達體育 1'],['105','201','愛爾達體育 2'],['110','202','愛爾達體育 3'],['115','203','愛爾達體育 4']];
async function getEltaRows(dates,matcher){
  const rows=[];
  await Promise.all(dates.flatMap(date=>eltaChannels.map(async([id,no,name])=>{try{const r=await fetch(`https://eltaott.tv/mod/get_schedule_by_channel_date/${id}/${date}`,{headers:{'User-Agent':'Mozilla/5.0','X-Requested-With':'XMLHttpRequest','Referer':'https://eltaott.tv/mod/program_detail'},signal:AbortSignal.timeout(12000)});if(!r.ok)return;const html=(await r.json()).html||'';for(const m of html.matchAll(/<li[^>]*>([\s\S]*?)<\/li>/g)){const row=m[1].replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim();const time=row.match(/(\d{2}:\d{2})/)?.[1];if(time&&matcher(row))rows.push({date,time,row,channel:no,channelStatus:name})}}catch{}})));
  return rows;
}
async function getEltaCpblBroadcasts(){
  if(process.env.OFFLINE||process.env.SKIP_SPORTS)return;
  const now=new Date(),dates=Array.from({length:31},(_,i)=>ymd(new Date(now.getTime()+(i-1)*864e5)));
  const rows=await getEltaRows(dates,row=>row.includes('中華職棒')&&row.includes('VS')&&!row.includes('重播'));
  for(const x of rows){const title=x.row.replace(/^\d{2}:\d{2}\s*/,'').replace(/^(新播|直播)\s*/,'').replace(/\s*普\s*$/,'').trim();add({sport:'中職',title,subtitle:'愛爾達中華職棒轉播',start:`${x.date}T${x.time}:00+08:00`,channel:x.channel,channelStatus:x.channelStatus})}
}
async function getEltaNflBroadcasts(){
  if(process.env.OFFLINE||process.env.SKIP_SPORTS)return;
  const now=new Date(),dates=Array.from({length:31},(_,i)=>ymd(new Date(now.getTime()+(i-1)*864e5)));
  const rows=await getEltaRows(dates,row=>/\bNFL\b/.test(row)&&row.includes('VS')&&!row.includes('重播'));
  for(const x of rows){const title=x.row.replace(/^\d{2}:\d{2}\s*/,'').replace(/^(新播|直播)\s*/,'').replace(/\s*普\s*$/,'').trim();add({sport:'NFL',title,subtitle:'MOD／愛爾達 NFL 轉播',start:`${x.date}T${x.time}:00+08:00`,channel:x.channel,channelStatus:x.channelStatus})}
}
async function getEltaUfcBroadcasts(){
  if(process.env.OFFLINE||process.env.SKIP_SPORTS)return;
  const now=new Date(),dates=Array.from({length:31},(_,i)=>ymd(new Date(now.getTime()+(i-1)*864e5)));
  const rows=await getEltaRows(dates,row=>/\bUFC\b/i.test(row)&&!row.includes('重播'));
  for(const x of rows){const title=x.row.replace(/^\d{2}:\d{2}\s*/,'').replace(/^(新播|直播)\s*/,'').replace(/\s*普\s*$/,'').trim();add({sport:'UFC',title,subtitle:'MOD／愛爾達 UFC 轉播',start:`${x.date}T${x.time}:00+08:00`,channel:x.channel,channelStatus:x.channelStatus})}
}
const f1=await safe('https://api.jolpi.ca/ergast/f1/2026.json');for(const r of f1?.MRData?.RaceTable?.Races||[]){if(r.Qualifying?.date)add({sport:'F1',title:`${r.raceName}・排位賽`,subtitle:r.Circuit?.circuitName,start:`${r.Qualifying.date}T${r.Qualifying.time||'00:00:00Z'}`,...channel.f1,timeTbd:!r.Qualifying.time});if(r.date)add({sport:'F1',title:`${r.raceName}・正賽`,subtitle:r.Circuit?.circuitName,start:`${r.date}T${r.time||'00:00:00Z'}`,...channel.f1,timeTbd:!r.time})}
try{const wc=JSON.parse(await fs.readFile('data/site-data.json','utf8'));for(const m of wc.matches||[])if(m.kickoff)add({sport:'世界盃',title:`${m.team1} vs ${m.team2}`,subtitle:m.round||m.group,start:m.kickoff,...channel.world})}catch{}
const mlb=await safe('https://statsapi.mlb.com/api/v1/schedule?sportId=1&teamId=119&season=2026&hydrate=team');for(const d of mlb?.dates||[])for(const g of d.games||[])add({sport:g.gameType==='R'?'道奇':'MLB季後賽',title:`${g.teams.away.team.name} vs ${g.teams.home.team.name}`,subtitle:g.venue?.name||'',start:g.gameDate,...channel.mlb});
for(const [sport,path,ch] of [['NBA季後賽','basketball/nba','nba']]){const data=await safe(`https://site.api.espn.com/apis/site/v2/sports/${path}/scoreboard?dates=2026&seasontype=3&limit=200`);for(const e of data?.events||[]){const c=e.competitions?.[0],names=(c?.competitors||[]).map(x=>x.team?.displayName).join(' vs ');add({sport,title:names||e.name,subtitle:e.season?.slug||'季後賽',start:e.date,...channel[ch]})}}
await getEltaCpblBroadcasts();
await getEltaNflBroadcasts();
await getEltaUfcBroadcasts();
const tourStages=[
  [1,4,'Barcelone > Barcelone','19.6 km','Team Time-Trial'],[2,5,'Tarragone > Barcelone','168.5 km','Hilly'],[3,6,'Granollers > Les Angles','195.9 km','Mountain'],[4,7,'Carcassonne > Foix','181.9 km','Hilly'],[5,8,'Lannemezan > Pau','158.3 km','Flat'],[6,9,'Pau > Gavarnie-Gèdre','186.2 km','Mountain'],[7,10,'Hagetmau > Bordeaux','175.1 km','Flat'],[8,11,'Périgueux > Bergerac','180.4 km','Flat'],[9,12,'Malemort > Ussel','185.5 km','Hilly'],[10,14,'Aurillac > Le Lioran','166.6 km','Mountain'],[11,15,'Vichy > Nevers','161.3 km','Flat'],[12,16,'Circuit Nevers Magny-Cours > Chalon-sur-Saône','179.1 km','Flat'],[13,17,'Dole > Belfort','205.8 km','Hilly'],[14,18,'Mulhouse > Le Markstein Fellering','155.3 km','Mountain'],[15,19,'Champagnole > Plateau de Solaison','183.9 km','Mountain'],[16,21,'Évian-les-Bains > Thonon-les-Bains','26.1 km','Individual time-trial'],[17,22,'Chambéry > Voiron','174.7 km','Flat'],[18,23,'Voiron > Orcières-Merlette','185.2 km','Mountain'],[19,24,"Gap > Alpe d'Huez",'127.9 km','Mountain'],[20,25,"Le Bourg d'Oisans > Alpe d'Huez",'170.9 km','Mountain'],[21,26,'Thoiry > Paris Champs-Élysées','133 km','Flat']
];
const climbZh={Mountain:'山地站',Hilly:'丘陵站',Flat:'平路站','Team Time-Trial':'團體計時賽','Individual time-trial':'個人計時賽'},elevationGain={2:2500,3:3850,4:2800,6:4100,9:3300,10:3900,11:1800,14:3800,15:4700,16:500,17:2400,18:3900,20:5450};
async function getEltaTourBroadcasts(){
  const now=new Date(),end=new Date(now.getTime()+8*864e5),dates=tourStages.map(x=>`2026-07-${String(x[1]).padStart(2,'0')}`).filter(x=>process.env.ELTA_ALL||(()=>{const d=new Date(`${x}T00:00:00+08:00`);return d>=new Date(now.getTime()-864e5)&&d<=end})());
  const found=new Map();
  for(const x of await getEltaRows(dates,row=>row.includes('環法')&&!row.includes('重播')))if(!found.has(x.date))found.set(x.date,{start:`${x.date}T${x.time}:00+08:00`,channel:x.channel,channelStatus:x.channelStatus});
  return found;
}
const eltaConfirmed=new Map([['2026-07-06',{start:'2026-07-06T18:00:00+08:00',channel:'203',channelStatus:'愛爾達體育 4'}],['2026-07-07',{start:'2026-07-07T19:00:00+08:00',channel:'203',channelStatus:'愛爾達體育 4'}],['2026-07-08',{start:'2026-07-08T22:00:00+08:00',channel:'203',channelStatus:'愛爾達體育 4'}],['2026-07-09',{start:'2026-07-09T18:15:00+08:00',channel:'203',channelStatus:'愛爾達體育 4'}],['2026-07-10',{start:'2026-07-10T19:05:00+08:00',channel:'203',channelStatus:'愛爾達體育 4'}],['2026-07-12',{start:'2026-07-12T19:30:00+08:00',channel:'202',channelStatus:'愛爾達體育 3'}]]),eltaLive=process.env.OFFLINE?new Map():await getEltaTourBroadcasts(),eltaTour=new Map([...eltaConfirmed,...eltaLive]),oldTour=new Map(previousEvents.filter(x=>x.sport==='環法').map(x=>[x.title,x]));tourStages.forEach(([stage,day,route,distance,type])=>{const date=`2026-07-${String(day).padStart(2,'0')}`,title=`環法自行車賽・第 ${stage} 站`,tv=eltaTour.get(date),old=oldTour.get(title),saved=!tv&&old&&!old.timeTbd?old:null;add({sport:'環法',title,subtitle:route,start:tv?.start||saved?.start||`${date}T10:00:00Z`,distance,climb:climbZh[type]||type,elevation:elevationGain[stage]||null,mapUrl:`https://www.letour.fr/en/stage-${stage}`,channel:tv?.channel||saved?.channel||'待定',channelStatus:tv?.channelStatus||saved?.channelStatus||'愛爾達 EPG 尚未指定',timeTbd:!(tv||saved)})});
const recommendations=keepLastGoodRecommendations(await getStreamingRecommendations(),previousData.recommendations);addModRecommendationEvents(recommendations);events.sort((a,b)=>a.start.localeCompare(b.start));const pending=[{sport:'NBA 季後賽',note:'2027 季後賽對戰與時間尚未公布'},{sport:'MLB 季後賽',note:'2026 季後賽對戰與時間尚未公布'},{sport:'NFL',note:'只顯示 MOD／愛爾達 EPG 已列出的 NFL 轉播，EPG 尚未列出則不顯示'},{sport:'UFC',note:'只顯示 MOD／愛爾達 EPG 已列出的 UFC 轉播，EPG 尚未列出則不顯示'},{sport:'中華職棒季後賽',note:'只顯示愛爾達 EPG 已列出的中職轉播'}];await fs.writeFile('sports-calendar/data.json',JSON.stringify({updatedAt:new Date().toISOString(),events,pending,recommendations},null,2)+'\n');console.log(`Sports calendar: ${events.length} events`);
