import { invoke } from "@tauri-apps/api/core";
import { readDir, mkdir, exists, BaseDirectory } from '@tauri-apps/plugin-fs';
import { useEffect, useState, useRef} from "react";
import * as path from '@tauri-apps/api/path';
import { convertFileSrc } from "@tauri-apps/api/core";
import "./App.css";


function App() {

  const [tracks, setTracks] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false); 
  const audioRef = useRef(null); 

    useEffect(() => {
    async function load() {
      await getTracks();
    }
      load();
    }, []);

    useEffect(() => {
      if (!audioRef.current || !currentTrack) return;
      audioRef.current.src = currentTrack.url;
    }, [currentTrack]);

  async function getTracks(){
    //Directory
    let basePath =  await path.audioDir();
    let musiPath = await path.join(basePath, 'musi-songs' )
    const tokenExists = await exists('musi-songs', {
    baseDir: BaseDirectory.Audio,
    });
    if(!tokenExists){
       await mkdir('musi-songs', {
          baseDir: BaseDirectory.Audio,
        }); 
      }
      //Loading tracks
      const entries = await readDir('musi-songs', { baseDir: BaseDirectory.Audio });
      let files = entries.filter(file => !file.isDirectory)
      let songs = []
      
      for(let i=0; i < files.length; i++){
          let fullPath = await path.join(musiPath, files[i].name)
          songs.push({
            position: i,
            name: files[i].name,
            path: fullPath,
            url: convertFileSrc(fullPath),
        });
      }
      setTracks(songs)
      setCurrentTrack(songs[0])
      
    }

    async function playSong(){
      audioRef.current.play()
      setIsPlaying(true)
    }
    async function pauseSong(){
      audioRef.current.pause()
      setIsPlaying(false)
    }
    async function toggleSong(){
      isPlaying ?  pauseSong(): playSong();
    }
    async function nextSong(){
      if(currentTrack.position >= tracks.length - 1){
        console.log("position: ", currentTrack.position)
        console.log("tracks len: ", tracks.length)
        setCurrentTrack(tracks[0])
      }
      else{
        setCurrentTrack(tracks[currentTrack.position + 1])
      }
      audioRef.current.src = currentTrack.url;
      await audioRef.current.play();

    }
    async function prevSong(){
      if(!(currentTrack.position == 0)){
        setCurrentTrack(tracks[currentTrack.position - 1])
      }
      await audioRef.current.play();

    }
  return (
    <main className="container">
      <h1></h1>
      <audio id="audio-ref" ref={audioRef} controls />
      <div id="audio-controls">
        <button onClick={prevSong}>Prev</button>
        <button onClick={toggleSong}>{isPlaying ? "pause": "play"}</button>
        <button onClick={nextSong}>Next</button>
      </div>
    </main>
  );
}

export default App;
