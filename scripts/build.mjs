import {build} from 'esbuild';
import {deflateRawSync,crc32} from 'node:zlib';
import {mkdir,writeFile,copyFile,readFile,readdir} from 'node:fs/promises';
import {join} from 'node:path';

await mkdir('dist',{recursive:true});
const result=await build({
  entryPoints:['src/main.jsx'],bundle:true,minify:true,write:false,outdir:'dist',target:'es2020',
  loader:{'.woff2':'dataurl','.webp':'dataurl'},define:{'process.env.NODE_ENV':'"production"'},legalComments:'inline'
});
const js=result.outputFiles.find(f=>f.path.endsWith('.js')).text.replace(/<\/script/gi,'<\\/script');
const css=result.outputFiles.find(f=>f.path.endsWith('.css')).text;
const html='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"><meta name="theme-color" content="#76223e"><meta name="description" content="An INFS4321 interaction design lab. Design an event and a registration form, test their usability, and evaluate one change."><title>Can You Use It? · HCI Arcade</title><style>'+css+'</style></head><body><div id="root"></div><noscript>Enable JavaScript to play this React game.</noscript><script>'+js+'</script></body></html>';
await writeFile('dist/index.html',html);
await copyFile('dist/index.html','dist/offline.html');

async function filesIn(dir,prefix){
  const entries=[];
  for(const entry of await readdir(dir,{withFileTypes:true})){
    if(entry.name==='.DS_Store') continue;
    const path=join(dir,entry.name),name=prefix+entry.name;
    if(entry.isDirectory()) entries.push(...await filesIn(path,name+'/'));
    else entries.push([name,await readFile(path)]);
  }
  return entries;
}
function archive(entries){
  const now=new Date();
  const time=(now.getHours()<<11)|(now.getMinutes()<<5)|(now.getSeconds()>>1);
  const date=((now.getFullYear()-1980)<<9)|((now.getMonth()+1)<<5)|now.getDate();
  const locals=[],centrals=[];
  let offset=0;
  for(const [name,data] of entries.sort(([a],[b])=>a<b?-1:a>b?1:0)){
    const filename=Buffer.from(name),compressed=deflateRawSync(data),checksum=crc32(data)>>>0;
    const local=Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50,0);
    local.writeUInt16LE(20,4);
    local.writeUInt16LE(8,8);
    local.writeUInt16LE(time,10);
    local.writeUInt16LE(date,12);
    local.writeUInt32LE(checksum,14);
    local.writeUInt32LE(compressed.length,18);
    local.writeUInt32LE(data.length,22);
    local.writeUInt16LE(filename.length,26);
    const chunk=Buffer.concat([local,filename,compressed]);
    locals.push(chunk);
    const header=Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50,0);
    header.writeUInt16LE(20,4);
    header.writeUInt16LE(20,6);
    header.writeUInt16LE(8,10);
    header.writeUInt16LE(time,12);
    header.writeUInt16LE(date,14);
    header.writeUInt32LE(checksum,16);
    header.writeUInt32LE(compressed.length,20);
    header.writeUInt32LE(data.length,24);
    header.writeUInt16LE(filename.length,28);
    header.writeUInt32LE(offset,42);
    centrals.push(Buffer.concat([header,filename]));
    offset+=chunk.length;
  }
  const directory=Buffer.concat(centrals);
  const end=Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50,0);
  end.writeUInt16LE(centrals.length,8);
  end.writeUInt16LE(centrals.length,10);
  end.writeUInt32LE(directory.length,12);
  end.writeUInt32LE(offset,16);
  return Buffer.concat([...locals,directory,end]);
}
const entries=[
  ...await filesIn('src','src/'),
  ...await filesIn('scripts','scripts/'),
  ...await filesIn('assets','assets/'),
  ...await filesIn('tests','tests/'),
  ['README.md',await readFile('README.md')],
  ['package.json',await readFile('package.json')],
  ['package-lock.json',await readFile('package-lock.json')],
  ['vercel.json',await readFile('vercel.json')],
  ['.gitignore',await readFile('.gitignore')],
  ['offline.html',await readFile('dist/offline.html')]
];
await writeFile('dist/can-you-use-it.zip',archive(entries));
console.log('Built the game, standalone offline edition and source archive.');
