<script lang="typescript">
  import { Player } from 'tone';
  interface UrlState {
    mode: 'url';
    value: string;
  }

  interface FileState {
    mode: 'file';
    file: File;
  }

  interface PlayState {
    playing: boolean;
    looping: boolean;
    time: number;
    duration: number;
  }

  const source = new Player();
  let inputState: UrlState | FileState = {
    mode: 'url',
    value: '',
  };

  let playState: PlayState | null = null;

  $: display = (inputState.mode === 'url') ? inputState.value : inputState.file.name;

  const output = { dir: 'output', name: 'audio', type: 'audio', source };
  export const ports = [output];

  source.onstop = () => {
    playState.playing = false;
  }

  function setUrl(e) {
    inputState = { mode: 'url', value: e.target.value };
  }

  function uploadFile(e) {
    inputState = { mode: 'file', file: e.target.files[0] };
  }

  function fileToDataURL(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        resolve(reader.result as string);
      });

      reader.readAsDataURL(file);
    });
  }

  async function setAudio(e) {
    e.preventDefault();

    let url = (inputState.mode === 'url') ? inputState.value : (await fileToDataURL(inputState.file));
    await source.load(url);
    playState = {
      playing: false,
      looping: source.loop,
      time: 0,
      duration: source.buffer.duration,
    };
  }

  function start() {
    source.start();
    playState.playing = true;
    requestAnimationFrame(updateScrubber);
  }

  function stop() {
    source.stop();
  }

  function formatTime(secs: number) {
    const hours = Math.floor(secs / (60 * 60));
    const minutes = Math.floor(secs / 60);
    const seconds = secs % 60;
    let time = Math.round(seconds).toString().padStart(2, '0');
    time = minutes.toString().padStart(2, '0') + ':' + time;

    if(hours) {
      time = hours.toString().padStart(2, '0') + ':' + time;
    }

    return time;
  }

  function updateScrubber() {
    playState.time = source.toSeconds();
    if(playState?.playing) {
      requestAnimationFrame(updateScrubber);
    }
  }

  $: {
    if(playState) {
      source.loop = playState.looping;
    }
  }
</script>
<div class="iface">
  {#if playState}
    {#if false}
      <div class="scrubber">
        <div class="scrubber-line">
          <div class="scrubber-played" style={`width: ${100 / playState.duration * playState.time}%`}>
            <div class="scrubber-handle" />
          </div>
        </div>
      </div>
      <div class="time">
        <div class="elapsed">{formatTime(playState.time)}</div>
        <div class="duration">{formatTime(playState.duration)}</div>
      </div>
    {/if}
    {#if playState.playing}
      <button class="ctrl ctrl-stop" on:click={stop}><i class="fa fa-stop" /></button>
    {:else}
      <button class="ctrl ctrl-play" on:click={start}><i class="fa fa-play" /></button>
    {/if}
    <label class="loop-label">
      <input type="checkbox" bind:checked={playState.looping} /> loop
    </label>
  {:else}
    <form class="input" on:submit={setAudio}>
      <div class="options">
        <input class="url" type={inputState.mode === 'url' ? 'url' : 'text'} value={display} on:change={setUrl} />
        <label for="file" class="filebtn"><i class="fa fa-upload" /></label>
        <input type="file" id="file" on:change={uploadFile} />
      </div>
      <button class="btn" type="submit">load</button>
    </form>
  {/if}
</div>
<style lang="scss">
  .iface {
    background: white;
    padding: 10px;
  }
  .options {
    display: flex;
    flex-direction: row;
    margin-bottom: 5px;
  }
  .url {
    border: 1px solid #ddd;
    border-radius: 0;
    border-right: none;
    height: 26px;
    line-height: 24px;
    flex-grow: 1;
    padding: 0;
    min-width: 0px;
    text-indent: 5px;
  }
  .filebtn {
    display: block;
    height: 26px;
    width: 26px;
    text-align: center;
    line-height: 24px;
    color: white;
    background: linear-gradient(to bottom, #606dbc, #465298 100%);
    flex-shrink: 0;
    cursor: pointer;
    &:hover {
      background: #465298;
    }
  }
  #file {
    display: none;
  }
  .btn {
    border: none;
    border-radius: 0;
    width: 100%;
    background: linear-gradient(to bottom, #606dbc, #465298 100%);
    color: white;
    height: 26px;
    line-height: 26px;
    padding: 0;
  }
  .ctrl {
    display: block;
    height: 26px;
    width: 26px;
    text-align: center;
    line-height: 24px;
    color: white;
    flex-shrink: 0;
    cursor: pointer;
    &-stop {
      background: linear-gradient(to bottom, #fff, #ddd 100%);
      &:hover {
        background: #ddd;
      }
    }
    &-play {
      background: linear-gradient(to bottom, #606dbc, #465298 100%);
      &:hover {
        background: #465298;
      }
    }
  }
  .scrubber {
    padding: 5px 5px;
    &-line {
      height: 3px;
      width: 100%;
      background: #999;
      position: relative;
    }
    &-played {
      height: 3px;
      background: #333;
      position: relative;
    }
    &-handle {
      position: absolute;
      width: 11px;
      height: 11px;
      border-radius: 100%;
      background: linear-gradient(to bottom, #fff, #ddd 100%);
      border: 1px solid #999;
      right: -4px;
      top: -4px;
    }
  }
  .time {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    margin-top: 5px;
    font-size: 12px;

  }
</style>