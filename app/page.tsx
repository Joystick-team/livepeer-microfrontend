"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Player, useCreateStream } from "@livepeer/react";
import { io } from "socket.io-client";

let SOCKET_URL = "http://localhost:8000";

const date = new Date();

const socket = io(SOCKET_URL);

export default function Home() {
  const [isRecording, setIsRecording] = useState(false);
  const [recorderInstance, setRecorderInstance] =
    useState<MediaRecorder | null>(null);

  const [chunk, setChunk] = useState<Blob[]>([]);

  const {
    mutate: createStream,
    data: stream,
    status,
  } = useCreateStream({ name: date.toDateString() });

  async function recordScreen() {
    return await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: true,
    });
  }

  let videoRef = useRef(null);

  function createRecorder(stream: MediaStream, mimeType: string) {
    // the stream data is stored in this array
    let recordedChunks: Blob[] = [];

    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function (e) {
      if (e.data.size > 0 && socket) {
        //  recordedChunks.push(e.data);
        //  setChunk((prev) => [...prev, e.data]);
        socket.emit("message", e.data);
      }
    };

    mediaRecorder.onstop = function () {
      // saveFile(recordedChunks);
      // recordedChunks = [];
      const tracks = stream.getTracks();
      tracks.forEach((track) => {
        track.stop();
      });
    };
    mediaRecorder.start(200); // For every 200ms the stream data will be stored in a separate chunk.
    return mediaRecorder;
  }

  function saveFile(recordedChunks: Blob[]) {
    const blob = new Blob(recordedChunks, {
      type: "video/webm",
    });
    let filename = window.prompt("Enter file name"),
      downloadLink = document.createElement("a");
    downloadLink.href = URL.createObjectURL(blob); // this is the url to the file
    downloadLink.download = `${filename}.webm`;

    document.body.appendChild(downloadLink);
    downloadLink.click();
    URL.revokeObjectURL(blob as any); // clear from memory
    document.body.removeChild(downloadLink);
  }

  const start = async () => {
    setIsRecording(true);

    let stream = await recordScreen();
    if (videoRef.current) {
      (videoRef.current as any).srcObject = new MediaStream([
        stream.getVideoTracks()[0],
      ]);
    }
    let mimeType = "video/webm";
    let mediaRecorder = createRecorder(stream, mimeType);

    setRecorderInstance(mediaRecorder);
  };

  const stop = () => {
    if (!recorderInstance) return;

    recorderInstance.stop();
    setIsRecording(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center space-y-3">
      <div className={"relative container h-96"}>
        <video
          style={{ width: "100%", height: "100%", background: "black" }}
          ref={videoRef}
          autoPlay
        />
      </div>
      <Button
        disabled={status === "loading" || !createStream}
        onClick={() => createStream?.()}
      >
        Create Stream
      </Button>
      {stream && <div>Stream Key: {stream.streamKey}</div>}

      <Button onClick={start} disabled={isRecording}>
        Start Recording
      </Button>
      <Button onClick={stop} disabled={!isRecording}>
        Stop Recording
      </Button>
    </main>
  );
}
