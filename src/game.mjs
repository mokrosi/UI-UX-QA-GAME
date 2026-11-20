export const fields = [
  {key:'bg', label:'Background', question:'Choose your canvas.', hint:'Pick a surface for the workshop details and registration form.', concept:'Visual perception', lesson:'The brightness of a surface affects how clearly a student can read the text on it.', options:[
    {name:'Paper',value:'#ffffff'}, {name:'Blush',value:'#f4e1e4'}, {name:'Butter',value:'#fff0bc'}, {name:'Ice',value:'#e4ecfa'}, {name:'Midnight',value:'#192b3f'}]},
  {key:'ink', label:'Text color', question:'Choose your ink.', hint:'Check how the workshop title and time read against your canvas.', concept:'Luminance contrast', lesson:'Two colors can look different in hue yet have similar brightness. Look at the small text as well as the title.', options:[
    {name:'Navy',value:'#192b3f'}, {name:'Burgundy',value:'#76223e'}, {name:'Slate',value:'#65758b'}, {name:'Silver',value:'#a2a9ad'}, {name:'Snow',value:'#ffffff'}]},
  {key:'size', label:'Font size', question:'Set the reading size.', hint:'Choose the size of the details a student will need to scan.', concept:'PACT · context', lesson:'A student reading a tablet at arm’s length may need larger text than someone sitting close to a monitor.', options:[
    {name:'Fine print',value:13},{name:'Compact',value:16},{name:'Standard',value:18},{name:'Large',value:22}]},
  {key:'button', label:'Button style', question:'Shape the main action.', hint:'Choose the button a student will use to join a workshop.', concept:'Fitts’s Law', lesson:'Target size and pointing distance affect acquisition time. Look at the area a fingertip can actually hit.', options:[
    {name:'Solid',value:'solid',bg:'#76223e',ink:'#ffffff',height:48},{name:'Compact',value:'compact',bg:'#24354b',ink:'#ffffff',height:32},
    {name:'Soft',value:'soft',bg:'#f2e3e7',ink:'#b298a0',height:44},{name:'Slim outline',value:'slim',bg:null,ink:null,height:24}]},
  {key:'link', label:'Link style', question:'Make the location findable.', hint:'Choose how the location link appears within a sentence.', concept:'Discoverability', lesson:'Familiar signifiers help a first-time visitor recognize an available action before trying it.', options:[
    {name:'Underlined',value:'underline'},{name:'Icon link',value:'icon'},{name:'Bold text',value:'bold'},{name:'Plain text',value:'plain'}]},
  {key:'input', label:'Input field', question:'Label the code field.', hint:'Choose what stays visible when a student starts typing.', concept:'Error prevention', lesson:'A persistent label identifies the field. A format hint lets a student check their entry while they type.', options:[
    {name:'Label + hint',value:'guided'},{name:'Label only',value:'label'},{name:'Placeholder only',value:'placeholder'}]},
  {key:'session', label:'Session selector', question:'Choose a session control.', hint:'Students must pick one of three workshop sessions.', concept:'Recognition versus recall', lesson:'Visible choices reduce memory demands. A menu saves space, while free text asks the student to supply the session name.', options:[
    {name:'Radio buttons',value:'radio'},{name:'Drop-down menu',value:'menu'},{name:'Free text',value:'text'}]}
];
export const initialDesign = Object.fromEntries(fields.map(f=>[f.key,f.options[0].value]));
initialDesign.size=18;
export const sessionNames=['Explore','Make','Review'];
export const sample={title:'Design Workshop',day:'Thursday',time:'10:00 AM',room:'Studio A',code:'1024',session:'Explore'};
export const workshops=[
  {title:'Human Factors Lab',day:'Wednesday',time:'2:45 PM',room:'Room C-12',times:['2:15 PM','2:45 PM','3:45 PM'],code:'4821',session:'Make'},
  {title:'Interaction Studio',day:'Tuesday',time:'11:30 AM',room:'Studio B-04',times:['11:30 AM','1:30 PM','11:00 AM'],code:'7316',session:'Review'},
  {title:'Prototype Club',day:'Monday',time:'3:15 PM',room:'Lab D-08',times:['3:45 PM','2:15 PM','3:15 PM'],code:'3062',session:'Explore'}
];
export const nicknames=['Pixel Finch','Studio Fox','Navy Owl','Curious Kiwi','Studio Cat','Clever Otter','Pixel Panda','Cobalt Jay'];
export function pick(items){return items[Math.floor(Math.random()*items.length)];}
export function luminance(hex){
  const channels=[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16)/255)
    .map(c=>c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4);
  return channels[0]*0.2126+channels[1]*0.7152+channels[2]*0.0722;
}
export function contrast(a,b){
  const [light,dark]=[luminance(a),luminance(b)].sort((x,y)=>y-x);
  return (light+0.05)/(dark+0.05);
}
export function buttonStyle(d){return fields.find(f=>f.key==='button').options.find(o=>o.value===d.button);}
export function evaluate(d){
  const button=buttonStyle(d);
  const textRatio=contrast(d.bg,d.ink);
  const buttonRatio=contrast(button.bg||d.bg,button.ink||d.ink);
  const textContrast=textRatio>=4.5, largeText=d.size>=18;
  const buttonContrast=buttonRatio>=4.5, largeButton=button.height>=44;
  const link=fields[4].options.find(o=>o.value===d.link);
  const cue=d.link==='underline'||d.link==='icon';
  const input=d.input||'guided', session=d.session||'radio';
  return [
    {title:'Reading the card',points:Number(textContrast)+Number(largeText),metric:textRatio.toFixed(2)+'∶1 · '+d.size+' px',field:textContrast?'size':'ink',principle:'Perception & legibility',feedback:(textContrast?'Text clears the 4.5∶1 normal-text contrast threshold.':'Increase the difference in brightness to reach 4.5∶1 for normal text.')+' '+(largeText?'The type meets the 18 px booth target.':'Try 18 px type for reading at arm’s length.')},
    {title:'Using the button',points:Number(buttonContrast)+Number(largeButton),metric:buttonRatio.toFixed(2)+'∶1 · '+button.height+' px',field:'button',principle:'Contrast & Fitts’s Law',feedback:(buttonContrast?'The button label clears 4.5∶1.':'Choose a stronger contrast between the button and its label.')+' '+(largeButton?'The hit area meets our 44 px height target.':'A 44 px tall button gives a fingertip more room to land.')},
    {title:'Finding the link',points:cue?2:d.link==='bold'?1:0,metric:link.name,field:'link',principle:'Discoverability',feedback:cue?'Your link has a familiar visual cue in the sentence.':d.link==='bold'?'Bold text attracts attention but can also mean emphasis. An underline or icon signals the action.':'The link looks like ordinary text. An underline or link icon makes the action visible.'},
    {title:'Entering the code',points:input==='guided'?2:input==='label'?1:0,metric:fields[5].options.find(o=>o.value===input).name,field:'input',principle:'Error prevention',feedback:input==='guided'?'The field name and four-digit format stay visible as the student types.':input==='label'?'The label stays visible. Add a four-digit hint so students can check the format before submitting.':'Typing hides the placeholder. Keep a visible label and a format hint beside the entry.'},
    {title:'Selecting a session',points:session==='radio'?2:session==='menu'?1:0,metric:fields[6].options.find(o=>o.value===session).name,field:'session',principle:'Recognition versus recall',feedback:session==='radio'?'All three alternatives are visible. The student can compare them and choose one.':session==='menu'?'The menu constrains entries to valid options. Opening it adds a step to inspect this short list.':'Free text requires an exact session name. Showing the three choices removes spelling errors.'}
  ];
}
export const total=d=>evaluate(d).reduce((sum,c)=>sum+c.points,0);
export function validateRegistration(event,code,session){
  return {code:code.trim()===event.code?'':'Enter the four-digit code shown in your task.',
    session:session.trim().toLowerCase()===event.session.toLowerCase()?'':'Choose or enter the '+event.session+' session.'};
}
export const formatTime=ms=>(ms/1000).toFixed(1)+' s';
const boardKey='hci-arcade-rounds-v2';
export function readBoard(key=boardKey){
  try{
    const data=JSON.parse(localStorage.getItem(key)||'[]');
    return Array.isArray(data)?data.filter(r=>typeof r?.name==='string'&&Number.isInteger(r.score)&&r.score>=0&&r.score<=10&&Number.isFinite(r.ms)).slice(0,5):[];
  }catch{return [];}
}
export function saveScore(record){
  const rows=[...readBoard(),record].sort((a,b)=>b.score-a.score||a.ms-b.ms).slice(0,5);
  try{localStorage.setItem(boardKey,JSON.stringify(rows));}catch{}
  return rows;
}
