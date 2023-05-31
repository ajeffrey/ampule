(() => {
  // node_modules/svelte/internal/index.mjs
  function noop() {
  }
  function assign(tar, src) {
    for (const k in src)
      tar[k] = src[k];
    return tar;
  }
  function run(fn) {
    return fn();
  }
  function blank_object() {
    return /* @__PURE__ */ Object.create(null);
  }
  function run_all(fns) {
    fns.forEach(run);
  }
  function is_function(thing) {
    return typeof thing === "function";
  }
  function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || (a && typeof a === "object" || typeof a === "function");
  }
  function is_empty(obj) {
    return Object.keys(obj).length === 0;
  }
  function create_slot(definition, ctx, $$scope, fn) {
    if (definition) {
      const slot_ctx = get_slot_context(definition, ctx, $$scope, fn);
      return definition[0](slot_ctx);
    }
  }
  function get_slot_context(definition, ctx, $$scope, fn) {
    return definition[1] && fn ? assign($$scope.ctx.slice(), definition[1](fn(ctx))) : $$scope.ctx;
  }
  function get_slot_changes(definition, $$scope, dirty, fn) {
    if (definition[2] && fn) {
      const lets = definition[2](fn(dirty));
      if ($$scope.dirty === void 0) {
        return lets;
      }
      if (typeof lets === "object") {
        const merged = [];
        const len = Math.max($$scope.dirty.length, lets.length);
        for (let i = 0; i < len; i += 1) {
          merged[i] = $$scope.dirty[i] | lets[i];
        }
        return merged;
      }
      return $$scope.dirty | lets;
    }
    return $$scope.dirty;
  }
  function update_slot_base(slot, slot_definition, ctx, $$scope, slot_changes, get_slot_context_fn) {
    if (slot_changes) {
      const slot_context = get_slot_context(slot_definition, ctx, $$scope, get_slot_context_fn);
      slot.p(slot_context, slot_changes);
    }
  }
  function get_all_dirty_from_scope($$scope) {
    if ($$scope.ctx.length > 32) {
      const dirty = [];
      const length = $$scope.ctx.length / 32;
      for (let i = 0; i < length; i++) {
        dirty[i] = -1;
      }
      return dirty;
    }
    return -1;
  }
  var globals = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : global;
  var ResizeObserverSingleton = class {
    constructor(options) {
      this.options = options;
      this._listeners = "WeakMap" in globals ? /* @__PURE__ */ new WeakMap() : void 0;
    }
    observe(element2, listener) {
      this._listeners.set(element2, listener);
      this._getObserver().observe(element2, this.options);
      return () => {
        this._listeners.delete(element2);
        this._observer.unobserve(element2);
      };
    }
    _getObserver() {
      var _a;
      return (_a = this._observer) !== null && _a !== void 0 ? _a : this._observer = new ResizeObserver((entries) => {
        var _a2;
        for (const entry of entries) {
          ResizeObserverSingleton.entries.set(entry.target, entry);
          (_a2 = this._listeners.get(entry.target)) === null || _a2 === void 0 ? void 0 : _a2(entry);
        }
      });
    }
  };
  ResizeObserverSingleton.entries = "WeakMap" in globals ? /* @__PURE__ */ new WeakMap() : void 0;
  var is_hydrating = false;
  function start_hydrating() {
    is_hydrating = true;
  }
  function end_hydrating() {
    is_hydrating = false;
  }
  function append(target, node) {
    target.appendChild(node);
  }
  function append_styles(target, style_sheet_id, styles) {
    const append_styles_to = get_root_for_style(target);
    if (!append_styles_to.getElementById(style_sheet_id)) {
      const style = element("style");
      style.id = style_sheet_id;
      style.textContent = styles;
      append_stylesheet(append_styles_to, style);
    }
  }
  function get_root_for_style(node) {
    if (!node)
      return document;
    const root = node.getRootNode ? node.getRootNode() : node.ownerDocument;
    if (root && root.host) {
      return root;
    }
    return node.ownerDocument;
  }
  function append_stylesheet(node, style) {
    append(node.head || node, style);
    return style.sheet;
  }
  function insert(target, node, anchor) {
    target.insertBefore(node, anchor || null);
  }
  function detach(node) {
    if (node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }
  function destroy_each(iterations, detaching) {
    for (let i = 0; i < iterations.length; i += 1) {
      if (iterations[i])
        iterations[i].d(detaching);
    }
  }
  function element(name) {
    return document.createElement(name);
  }
  function svg_element(name) {
    return document.createElementNS("http://www.w3.org/2000/svg", name);
  }
  function text(data) {
    return document.createTextNode(data);
  }
  function space() {
    return text(" ");
  }
  function empty() {
    return text("");
  }
  function listen(node, event, handler, options) {
    node.addEventListener(event, handler, options);
    return () => node.removeEventListener(event, handler, options);
  }
  function attr(node, attribute, value) {
    if (value == null)
      node.removeAttribute(attribute);
    else if (node.getAttribute(attribute) !== value)
      node.setAttribute(attribute, value);
  }
  function children(element2) {
    return Array.from(element2.childNodes);
  }
  function set_data(text2, data) {
    data = "" + data;
    if (text2.data === data)
      return;
    text2.data = data;
  }
  function construct_svelte_component(component, props) {
    return new component(props);
  }
  var current_component;
  function set_current_component(component) {
    current_component = component;
  }
  var dirty_components = [];
  var binding_callbacks = [];
  var render_callbacks = [];
  var flush_callbacks = [];
  var resolved_promise = /* @__PURE__ */ Promise.resolve();
  var update_scheduled = false;
  function schedule_update() {
    if (!update_scheduled) {
      update_scheduled = true;
      resolved_promise.then(flush);
    }
  }
  function add_render_callback(fn) {
    render_callbacks.push(fn);
  }
  var seen_callbacks = /* @__PURE__ */ new Set();
  var flushidx = 0;
  function flush() {
    if (flushidx !== 0) {
      return;
    }
    const saved_component = current_component;
    do {
      try {
        while (flushidx < dirty_components.length) {
          const component = dirty_components[flushidx];
          flushidx++;
          set_current_component(component);
          update(component.$$);
        }
      } catch (e) {
        dirty_components.length = 0;
        flushidx = 0;
        throw e;
      }
      set_current_component(null);
      dirty_components.length = 0;
      flushidx = 0;
      while (binding_callbacks.length)
        binding_callbacks.pop()();
      for (let i = 0; i < render_callbacks.length; i += 1) {
        const callback = render_callbacks[i];
        if (!seen_callbacks.has(callback)) {
          seen_callbacks.add(callback);
          callback();
        }
      }
      render_callbacks.length = 0;
    } while (dirty_components.length);
    while (flush_callbacks.length) {
      flush_callbacks.pop()();
    }
    update_scheduled = false;
    seen_callbacks.clear();
    set_current_component(saved_component);
  }
  function update($$) {
    if ($$.fragment !== null) {
      $$.update();
      run_all($$.before_update);
      const dirty = $$.dirty;
      $$.dirty = [-1];
      $$.fragment && $$.fragment.p($$.ctx, dirty);
      $$.after_update.forEach(add_render_callback);
    }
  }
  function flush_render_callbacks(fns) {
    const filtered = [];
    const targets = [];
    render_callbacks.forEach((c) => fns.indexOf(c) === -1 ? filtered.push(c) : targets.push(c));
    targets.forEach((c) => c());
    render_callbacks = filtered;
  }
  var outroing = /* @__PURE__ */ new Set();
  var outros;
  function group_outros() {
    outros = {
      r: 0,
      c: [],
      p: outros
      // parent group
    };
  }
  function check_outros() {
    if (!outros.r) {
      run_all(outros.c);
    }
    outros = outros.p;
  }
  function transition_in(block, local) {
    if (block && block.i) {
      outroing.delete(block);
      block.i(local);
    }
  }
  function transition_out(block, local, detach2, callback) {
    if (block && block.o) {
      if (outroing.has(block))
        return;
      outroing.add(block);
      outros.c.push(() => {
        outroing.delete(block);
        if (callback) {
          if (detach2)
            block.d(1);
          callback();
        }
      });
      block.o(local);
    } else if (callback) {
      callback();
    }
  }
  var _boolean_attributes = [
    "allowfullscreen",
    "allowpaymentrequest",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "defer",
    "disabled",
    "formnovalidate",
    "hidden",
    "inert",
    "ismap",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "selected"
  ];
  var boolean_attributes = /* @__PURE__ */ new Set([..._boolean_attributes]);
  function create_component(block) {
    block && block.c();
  }
  function mount_component(component, target, anchor, customElement) {
    const { fragment, after_update } = component.$$;
    fragment && fragment.m(target, anchor);
    if (!customElement) {
      add_render_callback(() => {
        const new_on_destroy = component.$$.on_mount.map(run).filter(is_function);
        if (component.$$.on_destroy) {
          component.$$.on_destroy.push(...new_on_destroy);
        } else {
          run_all(new_on_destroy);
        }
        component.$$.on_mount = [];
      });
    }
    after_update.forEach(add_render_callback);
  }
  function destroy_component(component, detaching) {
    const $$ = component.$$;
    if ($$.fragment !== null) {
      flush_render_callbacks($$.after_update);
      run_all($$.on_destroy);
      $$.fragment && $$.fragment.d(detaching);
      $$.on_destroy = $$.fragment = null;
      $$.ctx = [];
    }
  }
  function make_dirty(component, i) {
    if (component.$$.dirty[0] === -1) {
      dirty_components.push(component);
      schedule_update();
      component.$$.dirty.fill(0);
    }
    component.$$.dirty[i / 31 | 0] |= 1 << i % 31;
  }
  function init(component, options, instance5, create_fragment5, not_equal, props, append_styles2, dirty = [-1]) {
    const parent_component = current_component;
    set_current_component(component);
    const $$ = component.$$ = {
      fragment: null,
      ctx: [],
      // state
      props,
      update: noop,
      not_equal,
      bound: blank_object(),
      // lifecycle
      on_mount: [],
      on_destroy: [],
      on_disconnect: [],
      before_update: [],
      after_update: [],
      context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
      // everything else
      callbacks: blank_object(),
      dirty,
      skip_bound: false,
      root: options.target || parent_component.$$.root
    };
    append_styles2 && append_styles2($$.root);
    let ready = false;
    $$.ctx = instance5 ? instance5(component, options.props || {}, (i, ret, ...rest) => {
      const value = rest.length ? rest[0] : ret;
      if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
        if (!$$.skip_bound && $$.bound[i])
          $$.bound[i](value);
        if (ready)
          make_dirty(component, i);
      }
      return ret;
    }) : [];
    $$.update();
    ready = true;
    run_all($$.before_update);
    $$.fragment = create_fragment5 ? create_fragment5($$.ctx) : false;
    if (options.target) {
      if (options.hydrate) {
        start_hydrating();
        const nodes = children(options.target);
        $$.fragment && $$.fragment.l(nodes);
        nodes.forEach(detach);
      } else {
        $$.fragment && $$.fragment.c();
      }
      if (options.intro)
        transition_in(component.$$.fragment);
      mount_component(component, options.target, options.anchor, options.customElement);
      end_hydrating();
      flush();
    }
    set_current_component(parent_component);
  }
  var SvelteElement;
  if (typeof HTMLElement === "function") {
    SvelteElement = class extends HTMLElement {
      constructor() {
        super();
        this.attachShadow({ mode: "open" });
      }
      connectedCallback() {
        const { on_mount } = this.$$;
        this.$$.on_disconnect = on_mount.map(run).filter(is_function);
        for (const key in this.$$.slotted) {
          this.appendChild(this.$$.slotted[key]);
        }
      }
      attributeChangedCallback(attr2, _oldValue, newValue) {
        this[attr2] = newValue;
      }
      disconnectedCallback() {
        run_all(this.$$.on_disconnect);
      }
      $destroy() {
        destroy_component(this, 1);
        this.$destroy = noop;
      }
      $on(type, callback) {
        if (!is_function(callback)) {
          return noop;
        }
        const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
        callbacks.push(callback);
        return () => {
          const index = callbacks.indexOf(callback);
          if (index !== -1)
            callbacks.splice(index, 1);
        };
      }
      $set($$props) {
        if (this.$$set && !is_empty($$props)) {
          this.$$.skip_bound = true;
          this.$$set($$props);
          this.$$.skip_bound = false;
        }
      }
    };
  }
  var SvelteComponent = class {
    $destroy() {
      destroy_component(this, 1);
      this.$destroy = noop;
    }
    $on(type, callback) {
      if (!is_function(callback)) {
        return noop;
      }
      const callbacks = this.$$.callbacks[type] || (this.$$.callbacks[type] = []);
      callbacks.push(callback);
      return () => {
        const index = callbacks.indexOf(callback);
        if (index !== -1)
          callbacks.splice(index, 1);
      };
    }
    $set($$props) {
      if (this.$$set && !is_empty($$props)) {
        this.$$.skip_bound = true;
        this.$$set($$props);
        this.$$.skip_bound = false;
      }
    }
  };

  // src/Box.svelte
  function add_css(target) {
    append_styles(target, "svelte-cap075", ".container.svelte-cap075{border:1px solid #666}.title.svelte-cap075{background:#fff;padding:5px;font-size:16px;cursor:move}.contents.svelte-cap075{padding:5px}");
  }
  function create_fragment(ctx) {
    let foreignObject;
    let div2;
    let div0;
    let t0_value = (
      /*component*/
      ctx[2].name + ""
    );
    let t0;
    let t1;
    let div1;
    let current;
    let mounted;
    let dispose;
    const default_slot_template = (
      /*#slots*/
      ctx[8].default
    );
    const default_slot = create_slot(
      default_slot_template,
      ctx,
      /*$$scope*/
      ctx[7],
      null
    );
    return {
      c() {
        foreignObject = svg_element("foreignObject");
        div2 = element("div");
        div0 = element("div");
        t0 = text(t0_value);
        t1 = space();
        div1 = element("div");
        if (default_slot)
          default_slot.c();
        attr(div0, "class", "title svelte-cap075");
        attr(div1, "class", "contents svelte-cap075");
        attr(div2, "class", "container svelte-cap075");
        attr(
          foreignObject,
          "x",
          /*x*/
          ctx[0]
        );
        attr(
          foreignObject,
          "y",
          /*y*/
          ctx[1]
        );
        attr(
          foreignObject,
          "width",
          /*width*/
          ctx[5]
        );
        attr(
          foreignObject,
          "height",
          /*height*/
          ctx[6]
        );
      },
      m(target, anchor) {
        insert(target, foreignObject, anchor);
        append(foreignObject, div2);
        append(div2, div0);
        append(div0, t0);
        append(div2, t1);
        append(div2, div1);
        if (default_slot) {
          default_slot.m(div1, null);
        }
        ctx[9](div2);
        current = true;
        if (!mounted) {
          dispose = listen(div0, "pointerdown", function() {
            if (is_function(
              /*onDrag*/
              ctx[3]
            ))
              ctx[3].apply(this, arguments);
          });
          mounted = true;
        }
      },
      p(new_ctx, [dirty]) {
        ctx = new_ctx;
        if ((!current || dirty & /*component*/
        4) && t0_value !== (t0_value = /*component*/
        ctx[2].name + ""))
          set_data(t0, t0_value);
        if (default_slot) {
          if (default_slot.p && (!current || dirty & /*$$scope*/
          128)) {
            update_slot_base(
              default_slot,
              default_slot_template,
              ctx,
              /*$$scope*/
              ctx[7],
              !current ? get_all_dirty_from_scope(
                /*$$scope*/
                ctx[7]
              ) : get_slot_changes(
                default_slot_template,
                /*$$scope*/
                ctx[7],
                dirty,
                null
              ),
              null
            );
          }
        }
        if (!current || dirty & /*x*/
        1) {
          attr(
            foreignObject,
            "x",
            /*x*/
            ctx[0]
          );
        }
        if (!current || dirty & /*y*/
        2) {
          attr(
            foreignObject,
            "y",
            /*y*/
            ctx[1]
          );
        }
        if (!current || dirty & /*width*/
        32) {
          attr(
            foreignObject,
            "width",
            /*width*/
            ctx[5]
          );
        }
        if (!current || dirty & /*height*/
        64) {
          attr(
            foreignObject,
            "height",
            /*height*/
            ctx[6]
          );
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(default_slot, local);
        current = true;
      },
      o(local) {
        transition_out(default_slot, local);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(foreignObject);
        if (default_slot)
          default_slot.d(detaching);
        ctx[9](null);
        mounted = false;
        dispose();
      }
    };
  }
  function instance($$self, $$props, $$invalidate) {
    let { $$slots: slots = {}, $$scope } = $$props;
    let { x } = $$props;
    let { y } = $$props;
    let { component } = $$props;
    let { onDrag } = $$props;
    let parent;
    let width = 100;
    let height = 100;
    function div2_binding($$value) {
      binding_callbacks[$$value ? "unshift" : "push"](() => {
        parent = $$value;
        $$invalidate(4, parent);
      });
    }
    $$self.$$set = ($$props2) => {
      if ("x" in $$props2)
        $$invalidate(0, x = $$props2.x);
      if ("y" in $$props2)
        $$invalidate(1, y = $$props2.y);
      if ("component" in $$props2)
        $$invalidate(2, component = $$props2.component);
      if ("onDrag" in $$props2)
        $$invalidate(3, onDrag = $$props2.onDrag);
      if ("$$scope" in $$props2)
        $$invalidate(7, $$scope = $$props2.$$scope);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & /*parent*/
      16) {
        $: {
          if (parent) {
            const bb = parent.getBoundingClientRect();
            $$invalidate(5, width = bb.width);
            $$invalidate(6, height = bb.height);
          }
        }
      }
    };
    return [x, y, component, onDrag, parent, width, height, $$scope, slots, div2_binding];
  }
  var Box = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance, create_fragment, safe_not_equal, { x: 0, y: 1, component: 2, onDrag: 3 }, add_css);
    }
  };
  var Box_default = Box;

  // src/Output.svelte
  function create_fragment2(ctx) {
    let div;
    return {
      c() {
        div = element("div");
        div.textContent = "output";
      },
      m(target, anchor) {
        insert(target, div, anchor);
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(div);
      }
    };
  }
  function instance2($$self, $$props, $$invalidate) {
    let { context } = $$props;
    const inputs = [
      {
        name: "output",
        type: "audio",
        sink: context.destination
      }
    ];
    $$self.$$set = ($$props2) => {
      if ("context" in $$props2)
        $$invalidate(0, context = $$props2.context);
    };
    return [context, inputs];
  }
  var Output = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance2, create_fragment2, safe_not_equal, { context: 0, inputs: 1 });
    }
    get inputs() {
      return this.$$.ctx[1];
    }
  };
  var Output_default = Output;

  // src/Source.svelte
  function create_fragment3(ctx) {
    let button;
    let mounted;
    let dispose;
    return {
      c() {
        button = element("button");
        button.textContent = "play";
      },
      m(target, anchor) {
        insert(target, button, anchor);
        if (!mounted) {
          dispose = listen(
            button,
            "click",
            /*startPlaying*/
            ctx[0]
          );
          mounted = true;
        }
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(button);
        mounted = false;
        dispose();
      }
    };
  }
  function instance3($$self, $$props, $$invalidate) {
    let guitar = null;
    let source = null;
    let { context } = $$props;
    const inputs = [];
    const output = { name: "audio", type: "audio", sinks: [] };
    const outputs = [output];
    let connected = [];
    async function startPlaying(e) {
      e.preventDefault();
      e.stopPropagation();
      guitar = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: false,
          autoGainControl: false,
          noiseSuppression: false,
          latency: 0
        }
      });
      $$invalidate(4, source = context.createMediaStreamSource(guitar));
    }
    $$self.$$set = ($$props2) => {
      if ("context" in $$props2)
        $$invalidate(1, context = $$props2.context);
    };
    $$self.$$.update = () => {
      if ($$self.$$.dirty & /*source*/
      16) {
        $: {
          if (source) {
            for (const sink of connected) {
              if (!output.sinks.includes(sink)) {
                source.disconnect(sink);
              }
            }
            for (const sink of output.sinks) {
              if (!connected.includes(sink)) {
                source.connect(sink);
              }
            }
          }
        }
      }
    };
    return [startPlaying, context, inputs, outputs, source];
  }
  var Source = class extends SvelteComponent {
    constructor(options) {
      super();
      init(this, options, instance3, create_fragment3, safe_not_equal, { context: 1, inputs: 2, outputs: 3 });
    }
    get inputs() {
      return this.$$.ctx[2];
    }
    get outputs() {
      return this.$$.ctx[3];
    }
  };
  var Source_default = Source;

  // src/App.svelte
  function add_css2(target) {
    append_styles(target, "svelte-5b1bsw", ".layout.svelte-5b1bsw{height:100%;display:flex;flex-direction:column;font-family:sans-serif;position:relative;background:#eee}.node-types.svelte-5b1bsw{min-height:40px;display:flex;flex-direction:row;position:absolute;top:0;left:0;right:0}.node-type.svelte-5b1bsw{padding:10px;cursor:pointer}svg.svelte-5b1bsw{flex-grow:1}");
  }
  function get_each_context_1(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[12] = list[i];
    return child_ctx;
  }
  function get_each_context(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[12] = list[i];
    return child_ctx;
  }
  function get_each_context_2(ctx, list, i) {
    const child_ctx = ctx.slice();
    child_ctx[17] = list[i];
    return child_ctx;
  }
  function create_else_block(ctx) {
    let button;
    let mounted;
    let dispose;
    return {
      c() {
        button = element("button");
        button.textContent = "go";
      },
      m(target, anchor) {
        insert(target, button, anchor);
        if (!mounted) {
          dispose = listen(
            button,
            "click",
            /*startContext*/
            ctx[0]
          );
          mounted = true;
        }
      },
      p: noop,
      i: noop,
      o: noop,
      d(detaching) {
        if (detaching)
          detach(button);
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block(ctx) {
    let div1;
    let div0;
    let t;
    let current_block_type_index;
    let if_block;
    let current;
    let each_value_2 = (
      /*nodeTypes*/
      ctx[8]
    );
    let each_blocks = [];
    for (let i = 0; i < each_value_2.length; i += 1) {
      each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
    }
    const if_block_creators = [create_if_block_1, create_if_block_2];
    const if_blocks = [];
    function select_block_type_1(ctx2, dirty) {
      if (!/*state*/
      ctx2[5])
        return 0;
      if (
        /*state*/
        ctx2[5]?.type === "dragging"
      )
        return 1;
      return -1;
    }
    if (~(current_block_type_index = select_block_type_1(ctx, -1))) {
      if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    }
    return {
      c() {
        div1 = element("div");
        div0 = element("div");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        t = space();
        if (if_block)
          if_block.c();
        attr(div0, "class", "node-types svelte-5b1bsw");
        attr(div1, "class", "layout svelte-5b1bsw");
      },
      m(target, anchor) {
        insert(target, div1, anchor);
        append(div1, div0);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(div0, null);
          }
        }
        append(div1, t);
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].m(div1, null);
        }
        current = true;
      },
      p(ctx2, dirty) {
        if (dirty & /*createNode, nodeTypes*/
        258) {
          each_value_2 = /*nodeTypes*/
          ctx2[8];
          let i;
          for (i = 0; i < each_value_2.length; i += 1) {
            const child_ctx = get_each_context_2(ctx2, each_value_2, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
            } else {
              each_blocks[i] = create_each_block_2(child_ctx);
              each_blocks[i].c();
              each_blocks[i].m(div0, null);
            }
          }
          for (; i < each_blocks.length; i += 1) {
            each_blocks[i].d(1);
          }
          each_blocks.length = each_value_2.length;
        }
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type_1(ctx2, dirty);
        if (current_block_type_index === previous_block_index) {
          if (~current_block_type_index) {
            if_blocks[current_block_type_index].p(ctx2, dirty);
          }
        } else {
          if (if_block) {
            group_outros();
            transition_out(if_blocks[previous_block_index], 1, 1, () => {
              if_blocks[previous_block_index] = null;
            });
            check_outros();
          }
          if (~current_block_type_index) {
            if_block = if_blocks[current_block_type_index];
            if (!if_block) {
              if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
              if_block.c();
            } else {
              if_block.p(ctx2, dirty);
            }
            transition_in(if_block, 1);
            if_block.m(div1, null);
          } else {
            if_block = null;
          }
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(div1);
        destroy_each(each_blocks, detaching);
        if (~current_block_type_index) {
          if_blocks[current_block_type_index].d();
        }
      }
    };
  }
  function create_each_block_2(ctx) {
    let div;
    let t_value = (
      /*nodeType*/
      ctx[17].name + ""
    );
    let t;
    let mounted;
    let dispose;
    function pointerdown_handler(...args) {
      return (
        /*pointerdown_handler*/
        ctx[9](
          /*nodeType*/
          ctx[17],
          ...args
        )
      );
    }
    return {
      c() {
        div = element("div");
        t = text(t_value);
        attr(div, "class", "node-type svelte-5b1bsw");
      },
      m(target, anchor) {
        insert(target, div, anchor);
        append(div, t);
        if (!mounted) {
          dispose = listen(div, "pointerdown", pointerdown_handler);
          mounted = true;
        }
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
      },
      d(detaching) {
        if (detaching)
          detach(div);
        mounted = false;
        dispose();
      }
    };
  }
  function create_if_block_2(ctx) {
    let svg;
    let box;
    let current;
    let mounted;
    let dispose;
    box = new Box_default({
      props: {
        x: (
          /*state*/
          ctx[5].x - /*state*/
          ctx[5].offX
        ),
        y: (
          /*state*/
          ctx[5].y - /*state*/
          ctx[5].offY
        ),
        component: (
          /*state*/
          ctx[5].component
        ),
        $$slots: { default: [create_default_slot_2] },
        $$scope: { ctx }
      }
    });
    let each_value_1 = (
      /*nodes*/
      ctx[6]
    );
    let each_blocks = [];
    for (let i = 0; i < each_value_1.length; i += 1) {
      each_blocks[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        svg = svg_element("svg");
        create_component(box.$$.fragment);
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        attr(svg, "class", "svelte-5b1bsw");
      },
      m(target, anchor) {
        insert(target, svg, anchor);
        mount_component(box, svg, null);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(svg, null);
          }
        }
        current = true;
        if (!mounted) {
          dispose = [
            listen(
              svg,
              "pointermove",
              /*updatePosition*/
              ctx[2]
            ),
            listen(
              svg,
              "pointerup",
              /*insertNode*/
              ctx[3]
            )
          ];
          mounted = true;
        }
      },
      p(ctx2, dirty) {
        const box_changes = {};
        if (dirty & /*state*/
        32)
          box_changes.x = /*state*/
          ctx2[5].x - /*state*/
          ctx2[5].offX;
        if (dirty & /*state*/
        32)
          box_changes.y = /*state*/
          ctx2[5].y - /*state*/
          ctx2[5].offY;
        if (dirty & /*state*/
        32)
          box_changes.component = /*state*/
          ctx2[5].component;
        if (dirty & /*$$scope, state, context*/
        1048736) {
          box_changes.$$scope = { dirty, ctx: ctx2 };
        }
        box.$set(box_changes);
        if (dirty & /*nodes, context*/
        192) {
          each_value_1 = /*nodes*/
          ctx2[6];
          let i;
          for (i = 0; i < each_value_1.length; i += 1) {
            const child_ctx = get_each_context_1(ctx2, each_value_1, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block_1(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(svg, null);
            }
          }
          group_outros();
          for (i = each_value_1.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(box.$$.fragment, local);
        for (let i = 0; i < each_value_1.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        transition_out(box.$$.fragment, local);
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(svg);
        destroy_component(box);
        destroy_each(each_blocks, detaching);
        mounted = false;
        run_all(dispose);
      }
    };
  }
  function create_if_block_1(ctx) {
    let svg;
    let current;
    let each_value = (
      /*nodes*/
      ctx[6]
    );
    let each_blocks = [];
    for (let i = 0; i < each_value.length; i += 1) {
      each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
    }
    const out = (i) => transition_out(each_blocks[i], 1, 1, () => {
      each_blocks[i] = null;
    });
    return {
      c() {
        svg = svg_element("svg");
        for (let i = 0; i < each_blocks.length; i += 1) {
          each_blocks[i].c();
        }
        attr(svg, "class", "svelte-5b1bsw");
      },
      m(target, anchor) {
        insert(target, svg, anchor);
        for (let i = 0; i < each_blocks.length; i += 1) {
          if (each_blocks[i]) {
            each_blocks[i].m(svg, null);
          }
        }
        current = true;
      },
      p(ctx2, dirty) {
        if (dirty & /*nodes, moveNode, context*/
        208) {
          each_value = /*nodes*/
          ctx2[6];
          let i;
          for (i = 0; i < each_value.length; i += 1) {
            const child_ctx = get_each_context(ctx2, each_value, i);
            if (each_blocks[i]) {
              each_blocks[i].p(child_ctx, dirty);
              transition_in(each_blocks[i], 1);
            } else {
              each_blocks[i] = create_each_block(child_ctx);
              each_blocks[i].c();
              transition_in(each_blocks[i], 1);
              each_blocks[i].m(svg, null);
            }
          }
          group_outros();
          for (i = each_value.length; i < each_blocks.length; i += 1) {
            out(i);
          }
          check_outros();
        }
      },
      i(local) {
        if (current)
          return;
        for (let i = 0; i < each_value.length; i += 1) {
          transition_in(each_blocks[i]);
        }
        current = true;
      },
      o(local) {
        each_blocks = each_blocks.filter(Boolean);
        for (let i = 0; i < each_blocks.length; i += 1) {
          transition_out(each_blocks[i]);
        }
        current = false;
      },
      d(detaching) {
        if (detaching)
          detach(svg);
        destroy_each(each_blocks, detaching);
      }
    };
  }
  function create_default_slot_2(ctx) {
    let switch_instance;
    let t;
    let current;
    var switch_value = (
      /*state*/
      ctx[5].component
    );
    function switch_props(ctx2) {
      return { props: { context: (
        /*context*/
        ctx2[7]
      ) } };
    }
    if (switch_value) {
      switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
    }
    return {
      c() {
        if (switch_instance)
          create_component(switch_instance.$$.fragment);
        t = space();
      },
      m(target, anchor) {
        if (switch_instance)
          mount_component(switch_instance, target, anchor);
        insert(target, t, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const switch_instance_changes = {};
        if (dirty & /*context*/
        128)
          switch_instance_changes.context = /*context*/
          ctx2[7];
        if (dirty & /*state*/
        32 && switch_value !== (switch_value = /*state*/
        ctx2[5].component)) {
          if (switch_instance) {
            group_outros();
            const old_component = switch_instance;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value) {
            switch_instance = construct_svelte_component(switch_value, switch_props(ctx2));
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(switch_instance, t.parentNode, t);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          switch_instance.$set(switch_instance_changes);
        }
      },
      i(local) {
        if (current)
          return;
        if (switch_instance)
          transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o(local) {
        if (switch_instance)
          transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (switch_instance)
          destroy_component(switch_instance, detaching);
        if (detaching)
          detach(t);
      }
    };
  }
  function create_default_slot_1(ctx) {
    let switch_instance;
    let t;
    let current;
    var switch_value = (
      /*node*/
      ctx[12].component
    );
    function switch_props(ctx2) {
      return { props: { context: (
        /*context*/
        ctx2[7]
      ) } };
    }
    if (switch_value) {
      switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
    }
    return {
      c() {
        if (switch_instance)
          create_component(switch_instance.$$.fragment);
        t = space();
      },
      m(target, anchor) {
        if (switch_instance)
          mount_component(switch_instance, target, anchor);
        insert(target, t, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const switch_instance_changes = {};
        if (dirty & /*context*/
        128)
          switch_instance_changes.context = /*context*/
          ctx2[7];
        if (dirty & /*nodes*/
        64 && switch_value !== (switch_value = /*node*/
        ctx2[12].component)) {
          if (switch_instance) {
            group_outros();
            const old_component = switch_instance;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value) {
            switch_instance = construct_svelte_component(switch_value, switch_props(ctx2));
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(switch_instance, t.parentNode, t);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          switch_instance.$set(switch_instance_changes);
        }
      },
      i(local) {
        if (current)
          return;
        if (switch_instance)
          transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o(local) {
        if (switch_instance)
          transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (switch_instance)
          destroy_component(switch_instance, detaching);
        if (detaching)
          detach(t);
      }
    };
  }
  function create_each_block_1(ctx) {
    let box;
    let current;
    box = new Box_default({
      props: {
        x: (
          /*node*/
          ctx[12].x
        ),
        y: (
          /*node*/
          ctx[12].y
        ),
        component: (
          /*node*/
          ctx[12].component
        ),
        $$slots: { default: [create_default_slot_1] },
        $$scope: { ctx }
      }
    });
    return {
      c() {
        create_component(box.$$.fragment);
      },
      m(target, anchor) {
        mount_component(box, target, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const box_changes = {};
        if (dirty & /*nodes*/
        64)
          box_changes.x = /*node*/
          ctx2[12].x;
        if (dirty & /*nodes*/
        64)
          box_changes.y = /*node*/
          ctx2[12].y;
        if (dirty & /*nodes*/
        64)
          box_changes.component = /*node*/
          ctx2[12].component;
        if (dirty & /*$$scope, nodes, context*/
        1048768) {
          box_changes.$$scope = { dirty, ctx: ctx2 };
        }
        box.$set(box_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(box.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(box.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(box, detaching);
      }
    };
  }
  function create_default_slot(ctx) {
    let switch_instance;
    let t;
    let current;
    var switch_value = (
      /*node*/
      ctx[12].component
    );
    function switch_props(ctx2) {
      return { props: { context: (
        /*context*/
        ctx2[7]
      ) } };
    }
    if (switch_value) {
      switch_instance = construct_svelte_component(switch_value, switch_props(ctx));
    }
    return {
      c() {
        if (switch_instance)
          create_component(switch_instance.$$.fragment);
        t = space();
      },
      m(target, anchor) {
        if (switch_instance)
          mount_component(switch_instance, target, anchor);
        insert(target, t, anchor);
        current = true;
      },
      p(ctx2, dirty) {
        const switch_instance_changes = {};
        if (dirty & /*context*/
        128)
          switch_instance_changes.context = /*context*/
          ctx2[7];
        if (dirty & /*nodes*/
        64 && switch_value !== (switch_value = /*node*/
        ctx2[12].component)) {
          if (switch_instance) {
            group_outros();
            const old_component = switch_instance;
            transition_out(old_component.$$.fragment, 1, 0, () => {
              destroy_component(old_component, 1);
            });
            check_outros();
          }
          if (switch_value) {
            switch_instance = construct_svelte_component(switch_value, switch_props(ctx2));
            create_component(switch_instance.$$.fragment);
            transition_in(switch_instance.$$.fragment, 1);
            mount_component(switch_instance, t.parentNode, t);
          } else {
            switch_instance = null;
          }
        } else if (switch_value) {
          switch_instance.$set(switch_instance_changes);
        }
      },
      i(local) {
        if (current)
          return;
        if (switch_instance)
          transition_in(switch_instance.$$.fragment, local);
        current = true;
      },
      o(local) {
        if (switch_instance)
          transition_out(switch_instance.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        if (switch_instance)
          destroy_component(switch_instance, detaching);
        if (detaching)
          detach(t);
      }
    };
  }
  function create_each_block(ctx) {
    let box;
    let current;
    function func(...args) {
      return (
        /*func*/
        ctx[10](
          /*node*/
          ctx[12],
          ...args
        )
      );
    }
    box = new Box_default({
      props: {
        x: (
          /*node*/
          ctx[12].x
        ),
        y: (
          /*node*/
          ctx[12].y
        ),
        component: (
          /*node*/
          ctx[12].component
        ),
        onDrag: func,
        $$slots: { default: [create_default_slot] },
        $$scope: { ctx }
      }
    });
    return {
      c() {
        create_component(box.$$.fragment);
      },
      m(target, anchor) {
        mount_component(box, target, anchor);
        current = true;
      },
      p(new_ctx, dirty) {
        ctx = new_ctx;
        const box_changes = {};
        if (dirty & /*nodes*/
        64)
          box_changes.x = /*node*/
          ctx[12].x;
        if (dirty & /*nodes*/
        64)
          box_changes.y = /*node*/
          ctx[12].y;
        if (dirty & /*nodes*/
        64)
          box_changes.component = /*node*/
          ctx[12].component;
        if (dirty & /*nodes*/
        64)
          box_changes.onDrag = func;
        if (dirty & /*$$scope, nodes, context*/
        1048768) {
          box_changes.$$scope = { dirty, ctx };
        }
        box.$set(box_changes);
      },
      i(local) {
        if (current)
          return;
        transition_in(box.$$.fragment, local);
        current = true;
      },
      o(local) {
        transition_out(box.$$.fragment, local);
        current = false;
      },
      d(detaching) {
        destroy_component(box, detaching);
      }
    };
  }
  function create_fragment4(ctx) {
    let current_block_type_index;
    let if_block;
    let if_block_anchor;
    let current;
    const if_block_creators = [create_if_block, create_else_block];
    const if_blocks = [];
    function select_block_type(ctx2, dirty) {
      if (
        /*context*/
        ctx2[7]
      )
        return 0;
      return 1;
    }
    current_block_type_index = select_block_type(ctx, -1);
    if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    return {
      c() {
        if_block.c();
        if_block_anchor = empty();
      },
      m(target, anchor) {
        if_blocks[current_block_type_index].m(target, anchor);
        insert(target, if_block_anchor, anchor);
        current = true;
      },
      p(ctx2, [dirty]) {
        let previous_block_index = current_block_type_index;
        current_block_type_index = select_block_type(ctx2, dirty);
        if (current_block_type_index === previous_block_index) {
          if_blocks[current_block_type_index].p(ctx2, dirty);
        } else {
          group_outros();
          transition_out(if_blocks[previous_block_index], 1, 1, () => {
            if_blocks[previous_block_index] = null;
          });
          check_outros();
          if_block = if_blocks[current_block_type_index];
          if (!if_block) {
            if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx2);
            if_block.c();
          } else {
            if_block.p(ctx2, dirty);
          }
          transition_in(if_block, 1);
          if_block.m(if_block_anchor.parentNode, if_block_anchor);
        }
      },
      i(local) {
        if (current)
          return;
        transition_in(if_block);
        current = true;
      },
      o(local) {
        transition_out(if_block);
        current = false;
      },
      d(detaching) {
        if_blocks[current_block_type_index].d(detaching);
        if (detaching)
          detach(if_block_anchor);
      }
    };
  }
  function instance4($$self, $$props, $$invalidate) {
    let state = null;
    const nodeTypes = [Source_default, Output_default];
    let nodes = [];
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    let context;
    function startContext() {
      $$invalidate(7, context = new AudioContext());
    }
    function createNode(e, nodeType) {
      e.preventDefault();
      const bb = e.target.getBoundingClientRect();
      $$invalidate(5, state = {
        type: "dragging",
        offX: e.clientX - bb.left,
        offY: e.clientY - bb.top,
        x: e.clientX,
        y: e.clientY,
        component: nodeType
      });
    }
    function updatePosition(e) {
      $$invalidate(5, state.x = e.clientX, state);
      $$invalidate(5, state.y = e.clientY, state);
    }
    function insertNode() {
      $$invalidate(6, nodes = [
        ...nodes,
        {
          x: state.x - state.offX,
          y: state.y - state.offY,
          component: state.component
        }
      ]);
      $$invalidate(5, state = null);
    }
    function moveNode(e, node) {
      e.preventDefault();
      nodes.splice(nodes.indexOf(node), 1);
      $$invalidate(6, nodes);
      const bb = e.target.getBoundingClientRect();
      $$invalidate(5, state = {
        type: "dragging",
        offX: e.clientX - bb.left,
        offY: e.clientY - bb.top,
        x: e.clientX,
        y: e.clientY,
        component: node.component
      });
    }
    const pointerdown_handler = (nodeType, e) => createNode(e, nodeType);
    const func = (node, e) => moveNode(e, node);
    return [
      startContext,
      createNode,
      updatePosition,
      insertNode,
      moveNode,
      state,
      nodes,
      context,
      nodeTypes,
      pointerdown_handler,
      func
    ];
  }
  var App = class extends SvelteComponent {
    constructor(options) {
      super();
      init(
        this,
        options,
        instance4,
        create_fragment4,
        safe_not_equal,
        {
          startContext: 0,
          createNode: 1,
          updatePosition: 2,
          insertNode: 3,
          moveNode: 4
        },
        add_css2
      );
    }
    get startContext() {
      return this.$$.ctx[0];
    }
    get createNode() {
      return this.$$.ctx[1];
    }
    get updatePosition() {
      return this.$$.ctx[2];
    }
    get insertNode() {
      return this.$$.ctx[3];
    }
    get moveNode() {
      return this.$$.ctx[4];
    }
  };
  var App_default = App;

  // src/index.js
  var app = new App_default({
    target: document.body
  });
})();
