import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import "./App.css";

export default function App() {
  const [recentData, setRecentData] = useState<{
    pdga?: number;
    name?: string;
    time?: string;
  }>({})

  useEffect(() => {
    const socket = io("/")
    socket.on("update", (params) => {
      setRecentData(params || {})
    })
    setTimeout(() => {
      // Ask for current data
      socket.emit("init")
    }, 300)
  })

  return (
    <div className="App">
      <div style={{padding: 20}}>
        <h1>PDGA Numbers</h1>
        <p style={{fontSize: 20, marginTop: 10}}>
          <span>Current Number:</span>&nbsp;
          <span style={{color: "lightblue"}}>{recentData.pdga || "Loading..."}</span>
        </p>
        {recentData.name &&
          <p style={{fontSize: 14, marginTop: 5, marginBottom: 5}}>
            <span>{recentData.name}</span>
          </p>
        }
        {recentData.time && recentData.time?.length > 0 &&
          <p style={{fontSize: 14}}>
            <span>{`${recentData.time.substring(0, 10)} at ${recentData.time.substring(11, 16)} GMT`}</span>
          </p>
        }
        <br/>
        {recentData.pdga !== undefined &&
          <>
            <a
              href={`https://www.pdga.com/player/${recentData.pdga}`}
              target="_blank" rel="noopener noreferrer"
            >
              View this member on PDGA
            </a>
            <br/>
          </>
        }
        <a
          href={"https://www.pdga.com/membership"}
          target="_blank" rel="noopener noreferrer"
        >
          Join the PDGA
        </a>
        <p style={{marginTop: 20, fontSize: 12, maxWidth: 350}}>
          PDGA Numbers is a free app that refreshes constantly, pinging the PDGA's website to see what who the most recent member is. This site will be updated far faster than the PDGA's official member list will!
        </p>
      </div>

      <div style={{
        position: "fixed",
        bottom: 10, right: 10
      }}>
        <span style={{fontSize: 12}}>
          By Peter Gossell - PDGA #62067 - github.com/kingpeter1024/pdga-numbers
        </span>
      </div>
    </div>
  );
}
