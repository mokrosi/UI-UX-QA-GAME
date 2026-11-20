import {build} from 'esbuild';
import {mkdir,writeFile,copyFile,rm} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';

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
await rm('dist/can-you-use-it.zip',{force:true});
execFileSync('zip',['-q','-r','dist/can-you-use-it.zip','src','scripts','assets','tests','README.md','package.json','package-lock.json','-x','*.DS_Store']);
execFileSync('zip',['-q','-j','dist/can-you-use-it.zip','dist/offline.html']);
console.log('Built the game, standalone offline edition and source archive.');
