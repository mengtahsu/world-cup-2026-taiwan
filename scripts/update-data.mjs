import fs from 'node:fs/promises';

const FIXTURES='https://raw.githubusercontent.com/openfootball/worldcup.json/master/2026/worldcup.json';
const NEWS='https://news.google.com/rss/search?q=2026%20%E4%B8%96%E7%95%8C%E7%9B%83%20%E8%B6%B3%E7%90%83&hl=zh-TW&gl=TW&ceid=TW:zh-Hant';
const clean=s=>String(s||'').replace(/<!\[CDATA\[|\]\]>/g,'').replace(/<[^>]+>/g,'').replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/&lt;/g,'<').replace(/&gt;/g,'>').trim();

if(process.env.GITHUB_EVENT_NAME==='schedule'){
  try{
    const previous=JSON.parse(await fs.readFile('data/site-data.json','utf8'));
    const age=Date.now()-new Date(previous.updatedAt).getTime();
    if(age<2.5*60*60*1000){console.log(`Skipping early scheduled refresh; last update was ${Math.round(age/60000)} minutes ago.`);process.exit(0)}
  }catch{}
}

function kickoff(date,time='00:00 UTC+0'){
  const m=time.match(/(\d{1,2}):(\d{2})\s+UTC([+-]\d+)?/i);
  const hour=+(m?.[1]||0), minute=+(m?.[2]||0), offset=+(m?.[3]||0);
  return new Date(Date.UTC(+date.slice(0,4),+date.slice(5,7)-1,+date.slice(8,10),hour-offset,minute)).toISOString();
}
function computeGroups(raw){
  const map=new Map();
  for(const m of raw.filter(x=>x.group)){
    if(!map.has(m.group)) map.set(m.group,new Map()); const group=map.get(m.group);
    for(const team of [m.team1,m.team2]) if(team&&!group.has(team)) group.set(team,{team,played:0,won:0,drawn:0,lost:0,gf:0,ga:0,points:0});
    if(!Array.isArray(m.score?.ft)) continue;
    const [a,b]=m.score.ft,x=group.get(m.team1),y=group.get(m.team2); x.played++;y.played++;x.gf+=a;x.ga+=b;y.gf+=b;y.ga+=a;
    if(a>b){x.won++;y.lost++;x.points+=3}else if(b>a){y.won++;x.lost++;y.points+=3}else{x.drawn++;y.drawn++;x.points++;y.points++}
  }
  return [...map].map(([name,teams])=>({name,teams:[...teams.values()].sort((a,b)=>b.points-a.points||(b.gf-b.ga)-(a.gf-a.ga)||b.gf-a.gf||a.team.localeCompare(b.team))})).sort((a,b)=>a.name.localeCompare(b.name));
}
function computeScorers(raw){
  const players=new Map();
  raw.forEach((m,index)=>{
    for(const side of [1,2]){
      const team=m[`team${side}`],opponent=m[`team${side===1?2:1}`],keyFor=name=>`${name}|${team}`;
      const matchGoals=new Map();
      for(const goal of m[`goals${side}`]||[]){if(!goal.owngoal)matchGoals.set(goal.name,(matchGoals.get(goal.name)||0)+1)}
      for(const [name,count] of matchGoals){
        const key=keyFor(name),player=players.get(key)||{name,team,goals:0,matches:[]};
        player.goals+=count;
        player.matches.push({number:index+1,opponent,date:m.date,kickoff:kickoff(m.date,m.time),score:m.score?.ft,goals:count});
        players.set(key,player);
      }
    }
  });
  return [...players.values()].sort((a,b)=>b.goals-a.goals||a.name.localeCompare(b.name));
}
async function addPlayerProfiles(scorers){
  return Promise.all(scorers.map(async player=>{
    try{
      const sports=await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(player.name)}`).then(r=>{if(!r.ok)throw Error(r.status);return r.json()});
      const athlete=(sports.player||[]).find(x=>x.strSport==='Soccer')||(sports.player||[])[0];
      if(athlete?.strThumb||athlete?.strCutout){
        const details=[athlete.strPosition,athlete.strNationality,athlete.dateBorn?`生於 ${athlete.dateBorn}`:''].filter(Boolean).join('・');
        return {...player,profile:{photo:athlete.strCutout||athlete.strThumb,bio:athlete.strDescriptionZH||details||`${player.team}國家隊球員`}};
      }
      const exact=async lang=>{
        const params=new URLSearchParams({action:'query',titles:player.name,redirects:'1',prop:'pageimages|description',piprop:'thumbnail',pithumbsize:'360',format:'json',origin:'*'});
        const json=await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`).then(r=>{if(!r.ok)throw Error(r.status);return r.json()});
        return Object.values(json.query?.pages||{})[0];
      };
      const search=async lang=>{
        const params=new URLSearchParams({action:'query',generator:'search',gsrsearch:`${player.name} footballer`,gsrlimit:'1',prop:'pageimages|description',piprop:'thumbnail',pithumbsize:'360',format:'json',origin:'*'});
        const json=await fetch(`https://${lang}.wikipedia.org/w/api.php?${params}`).then(r=>{if(!r.ok)throw Error(r.status);return r.json()});
        return Object.values(json.query?.pages||{})[0];
      };
      const page=await exact('en').then(x=>x?.thumbnail?x:exact('zh')).then(x=>x?.thumbnail?x:search('en'));
      const candidate=page?.thumbnail?.source||'',photo=/logo|\.svg(?:\.png)?$/i.test(candidate)?'':candidate;
      return {...player,profile:{photo,bio:page?.description||`${player.team}國家隊球員`}};
    }catch{return {...player,profile:{photo:'',bio:`${player.team}國家隊球員，本屆世界盃目前攻進 ${player.goals} 球。`}}}
  }));
}
async function getNews(){try{const xml=await fetch(NEWS).then(r=>{if(!r.ok)throw Error(r.status);return r.text()});return [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].slice(0,9).map(x=>{const s=x[1],title=clean(s.match(/<title>([\s\S]*?)<\/title>/)?.[1]),link=clean(s.match(/<link>([\s\S]*?)<\/link>/)?.[1]),pubDate=clean(s.match(/<pubDate>([\s\S]*?)<\/pubDate>/)?.[1]),source=clean(s.match(/<source[^>]*>([\s\S]*?)<\/source>/)?.[1]);return{title,link,pubDate,source}})}catch(e){console.warn('News unavailable:',e.message);return[]}}
async function getOdds(){const key=process.env.ODDS_API_KEY;if(!key)return[];try{const url=`https://api.the-odds-api.com/v4/sports/soccer_fifa_world_cup/odds/?apiKey=${key}&regions=eu&markets=h2h&oddsFormat=decimal`;const rows=await fetch(url).then(r=>{if(!r.ok)throw Error(r.status);return r.json()});return rows.map(e=>{const market=e.bookmakers?.[0]?.markets?.[0]?.outcomes||[],price=n=>market.find(x=>x.name===n)?.price||'—';return{home:e.home_team,away:e.away_team,homePrice:price(e.home_team),drawPrice:price('Draw'),awayPrice:price(e.away_team)}})}catch(e){console.warn('Odds unavailable:',e.message);return[]}}
async function getVideos(){
  const channels=[
    ['UCCQvP4hsRW9emj0meGk15jg','愛爾達體育家族 ELTA Sports']
  ];
  try{
    const feeds=await Promise.all(channels.map(async([channelId,source])=>({source,xml:await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`).then(r=>{if(!r.ok)throw Error(r.status);return r.text()})})));
    const videos=feeds.flatMap(({source,xml})=>[...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map(x=>{const s=x[1],id=clean(s.match(/<yt:videoId>(.*?)<\/yt:videoId>/)?.[1]),title=clean(s.match(/<title>([\s\S]*?)<\/title>/)?.[1]),published=clean(s.match(/<published>(.*?)<\/published>/)?.[1]);return{id,title,published,label:`${source}・繁中精華`,url:`https://www.youtube.com/watch?v=${id}`}})).filter(x=>x.id&&/(世界盃|世足|FIFA|全場精華)/i.test(x.title)).sort((a,b)=>new Date(b.published)-new Date(a.published)).slice(0,3).map(({published,...x})=>x);
    if(videos.length<3)throw Error('Not enough embeddable World Cup videos');
    return videos;
  }catch(e){
    console.warn('Video feeds unavailable, keeping last verified set:',e.message);
    try{return JSON.parse(await fs.readFile('data/site-data.json','utf8')).videos||[]}catch{return[]}
  }
}

const raw=await fetch(FIXTURES).then(r=>{if(!r.ok)throw Error(`Fixtures ${r.status}`);return r.json()});
const matches=raw.matches.map((m,i)=>({number:i+1,round:m.round,date:m.date,kickoff:kickoff(m.date,m.time),team1:m.team1||'待定',team2:m.team2||'待定',score:m.score?.ft,extraTime:m.score?.et,penalties:m.score?.p,group:m.group,ground:m.ground}));
const scorers=await addPlayerProfiles(computeScorers(raw.matches).slice(0,24));
const output={updatedAt:new Date().toISOString(),matches,groups:computeGroups(raw.matches),scorers,news:await getNews(),odds:await getOdds(),videos:await getVideos()};
await fs.mkdir('data',{recursive:true});await fs.writeFile('data/site-data.json',JSON.stringify(output,null,2)+'\n');console.log(`Updated ${matches.length} matches, ${output.news.length} news, ${output.scorers.length} scorers.`);
