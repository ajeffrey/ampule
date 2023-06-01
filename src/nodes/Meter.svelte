<script>
  import { Meter } from 'tone';

  const meter = new Meter({ smoothing: 0.1, normalRange: true });
  let values = [];
  let highestSeen = 0;
  
  export const ports = [
    { dir: 'input', name: 'output', type: 'audio', sink: meter }
  ];

  setInterval(() => {
    const value = meter.getValue();
    highestSeen = value > highestSeen ? value : highestSeen;
    values.push(value);
    values = values.slice(-50);
  }, 250);

</script>
<div class="columns">
  {#each values as value}
    <div class="column" style={`height: ${100 / highestSeen * value}%`} />
  {/each}
</div>
<style>
  .columns {
    width: 100%;
    display: flex;
    flex-direction: row;
    align-items: flex-end;
    background: white;
    height: 100px;
  }
  .column {
    flex-grow: 1;
    background: black;
    margin: 0 1px;
  }
</style>