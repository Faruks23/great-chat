"use client"

import React, { useEffect } from 'react'

function page() {
   

  const test = async () => { 

    const devices = await navigator.mediaDevices.enumerateDevices();

    // console.table(devices);

    // await navigator.mediaDevices.getUserMedia({
    //   video: true
    // });

    // await navigator.mediaDevices.getUserMedia({
    //   audio: true
    // });


    try {
      await navigator.mediaDevices.getUserMedia({
        video: true,
      });

      const devices = await navigator.mediaDevices.enumerateDevices();

      console.table(
        devices.map(d => ({
          kind: d.kind,
          label: d.label,
          id: d.deviceId
        }))
      );
    } catch (e) {
      console.log(e,'erro');
    }
  }

  // const devices = await navigator.mediaDevices.enumerateDevices();

  // console.table(devices);

  useEffect( () => {
    test();
//     const btn = document.querySelector("button");
//     const video = document.querySelector("video");
//  if (!btn || !video) return;
//   btn.onclick = async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: true,
//         audio: true
//       });

//       console.log(stream);
//       if (video) {
//         video.srcObject = stream;
//       }

//     } catch (e) {
//       console.log(e);
//     }
//   };
  }, []);

  return (
    <div>

      <video id="video" autoPlay playsInline></video>
      <button id="startButton">Start</button>
    </div>
  )
}

export default page