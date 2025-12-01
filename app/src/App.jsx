import { invoke } from "@tauri-apps/api/core";
import { readDir, mkdir, exists, BaseDirectory } from '@tauri-apps/plugin-fs';
import { useEffect, useState, useRef  } from "react";
import * as path from '@tauri-apps/api/path';
import { convertFileSrc } from "@tauri-apps/api/core";
import "./App.css";


function App() {
  
  let musiPath = ""
  useEffect(() => {
    async function load() {
      await setBaseDir();
      await getTracks();
      console.log("audioRef on mount:", audioRef.current); // should log <audio ...>

    }
    load();
  }, []);

  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const audioRef = useRef(null); 

  async function setBaseDir(){
    let basePath =  await path.audioDir();
    musiPath = await path.join(basePath, 'musi-songs' )
    const tokenExists = await exists('musi-songs', {
    baseDir: BaseDirectory.Audio,
    });
    if(!tokenExists){
       await mkdir('musi-songs', {
          baseDir: BaseDirectory.Audio,
        }); 
      }
    }
    async function getTracks(){
      const entries = await readDir('musi-songs', { baseDir: BaseDirectory.Audio });
      let files = entries.filter(file => !file.isDirectory)
      let songs = []
      
      for(let i=0; i < files.length; i++){
          let fullPath = await path.join(musiPath, files[i].name)
          songs.push({
            name: files[i].name,
            path: fullPath,
            url: convertFileSrc(fullPath),
        });
      }
      setTracks(songs)
      setCurrentTrack(songs[0])
    }
    // Run once on mount
    async function playSong(){
      //logic for playing
      audioRef.current = currentTrack;
      audioRef.current.src = currentTrack.url
      console.log('source', audioRef.current.src)
    }
    async function pauseSong(){

    }
  
    
  return (
    <main className="container">
      <h1></h1>
      <audio ref={audioRef} controls />

      <button onClick={playSong}>play</button>

    </main>
  );
}

export default App;
