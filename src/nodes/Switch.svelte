<script>
  import { Channel } from 'tone';

  let prevOutputCount = 0;
  let outputCount = "2";
  const distributor = new Channel();
  
  export let ports = [
    { dir: 'input', name: 'input', type: 'audio', sink: distributor },
  ];

  function updateOutputCount() {
    if(typeof outputCount === 'number' || typeof outputCount === 'string' && outputCount.match(/^0|([1-9]\d*)$/)) {
      const nextOutputCount = typeof outputCount === 'number' ? outputCount : parseInt(outputCount, 10);
      const change = nextOutputCount - prevOutputCount;
      if(change > 0) {
        for(let i = 0; i < change; i++) {
          const output = new Channel();
          distributor.connect(output);
          ports.push({ dir: 'output', name: 'output', type: 'audio', source: output });
          ports = ports;
        }
      } else if(change < 0) {
        for(let i = 0; i < Math.abs(change); i++) {
          const output = ports.pop();
          ports = ports;
          distributor.disconnect(output.source);
          output.source.dispose();
        }
      }

      console.log(ports);

      prevOutputCount = nextOutputCount;
    }
  }

  updateOutputCount();
</script>
<form on:submit|preventDefault={updateOutputCount}>
  <input type="number" bind:value={outputCount} />
  <button type="submit">Update</button>
</form>