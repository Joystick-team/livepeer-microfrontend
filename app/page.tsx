"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Player, useCreateStream } from "@livepeer/react";

const date = new Date();

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

  console.log(stream);

  async function recordScreen() {
    return await navigator.mediaDevices.getDisplayMedia({
      audio: true,
      video: true,
    });
  }

  function createRecorder(stream: MediaStream, mimeType: string) {
    // the stream data is stored in this array
    let recordedChunks: Blob[] = [];

    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = function (e) {
      if (e.data.size > 0) {
        recordedChunks.push(e.data);
        setChunk((prev) => [...prev, e.data]);
      }
    };

    mediaRecorder.onstop = function () {
      saveFile(recordedChunks);
      recordedChunks = [];
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
      {stream && (
        <div className={"relative container h-96"}>
          <Player
            title="Test Player"
            playbackId={stream.playbackId}
            showPipButton
            objectFit="cover"
            priority
          />
        </div>
      )}
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
