<script>
  let guitar = null;
  let source = null;

  export let context;
  
  export const inputs = [];

  const output = { name: 'audio', type: 'audio', sinks: [] };
  export const outputs = [output];
  let connected = [];

  $: {
    if(source) {
      for(const sink of connected) {
        if(!output.sinks.includes(sink)) {
          source.disconnect(sink);
        }
      }
      for(const sink of output.sinks) {
        if(!connected.includes(sink)) {
          source.connect(sink);
        }
      }
    }
  }

  async function startPlaying(e) {
    e.preventDefault();
    e.stopPropagation();

    guitar = await navigator.mediaDevices.getUserMedia({
      audio: {
        echoCancellation: false,
        autoGainControl: false,
        noiseSuppression: false,
        latency: 0,
      }
    });

    source = context.createMediaStreamSource(guitar);
  }
</script>
<button on:click={startPlaying}>play</button>