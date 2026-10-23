/*
 * drlentau.com content admin. Plain JavaScript, no build step.
 * Talks to Supabase with the public (publishable) key; Row Level Security decides what a signed-in user may do.
 * To add a field: add the column in Supabase (migration), then add it to TYPES below.
 */
(function () {
  'use strict';

  var SUPABASE_URL = 'https://jkjuepbjuxpgodfpcdkn.supabase.co';
  var SUPABASE_KEY = 'sb_publishable_-XClinHHe4TgTzzDwh_-pA_lta9Q4kN';
  var BUCKET = 'media';

  var sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });

  // Site root, so previews of "/images/x.png" and "View on site" links work on the preview (/drlentau1/) and on drlentau.com.
  var ROOT = location.pathname.replace(/admin\/?(index\.html)?$/, '');
  var abs = function (u) { return !u ? '' : /^(https?:)?\/\//.test(u) || u.indexOf('data:') === 0 ? u : ROOT + u.replace(/^\//, ''); };

  // ---------- Content types ----------
  var SEO = [
    { name: 'seo_title', label: 'SEO title', type: 'text', help: 'Shown in Google and the browser tab. Leave blank to use the title.', group: 'SEO' },
    { name: 'seo_description', label: 'SEO description', type: 'textarea', rows: 2, help: 'About 150 characters. Leave blank to use the excerpt or summary.', group: 'SEO' },
  ];
  var STATUS = { name: 'status', label: 'Status', type: 'select', options: [['published', 'Published'], ['draft', 'Draft (hidden from the site)']], def: 'draft' };

  var TYPES = {
    posts: {
      label: 'Posts', one: 'post', table: 'posts', titleField: 'title', path: 'news/',
      select: '*, category:post_categories(name)', order: [['published_at', false], ['sort', true]],
      cols: [['title', 'Title'], ['category', 'Category', function (r) { return r.category ? r.category.name : ''; }], ['published_at', 'Date', fmtDate], ['status', 'Status']],
      fields: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'slug', label: 'URL slug', type: 'slug', from: 'title', required: true },
        { name: 'category_id', label: 'Category', type: 'ref', ref: 'post_categories' },
        STATUS,
        { name: 'published_at', label: 'Date', type: 'date' },
        { name: 'author', label: 'Author byline', type: 'text', help: 'For guest posts, e.g. "Jane Smith, CEO of Example". Leave blank for your own posts.' },
        { name: 'excerpt', label: 'Excerpt', type: 'textarea', rows: 3, help: 'One or two sentences for the News list.' },
        { name: 'content_html', label: 'Content', type: 'rich' },
        { name: 'image_url', label: 'Featured image', type: 'image' },
        { name: 'image_alt', label: 'Image description (alt text)', type: 'text' },
      ].concat(SEO, [
        { name: 'og_image_url', label: 'Social share image', type: 'image', help: 'Optional. Used when the post is shared on social media. Defaults to the featured image.', group: 'SEO' },
        { name: 'sort', label: 'Order (for posts without a date)', type: 'number', group: 'Advanced' },
      ]),
    },
    podcast_episodes: {
      label: 'Podcast', one: 'episode', table: 'podcast_episodes', titleField: 'title', path: 'podcast/',
      select: '*', order: [['published_at', false], ['number', false]],
      cols: [['number', '#'], ['title', 'Title'], ['guest', 'Guest'], ['published_at', 'Date', fmtDate], ['status', 'Status']],
      fields: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'slug', label: 'URL slug', type: 'slug', from: 'title', required: true },
        { name: 'number', label: 'Episode number', type: 'number' },
        { name: 'season', label: 'Season', type: 'number' },
        STATUS,
        { name: 'published_at', label: 'Release date', type: 'date' },
        { name: 'guest', label: 'Guest', type: 'text', help: 'e.g. "Cory Pinegar, founder of REACH"' },
        { name: 'audio_embed_url', label: 'Audio', type: 'url', help: 'The Libsyn .mp3 link or a player link.' },
        { name: 'video_embed_url', label: 'Video', type: 'url', help: 'A YouTube or Vimeo link, or an .mp4 file link.' },
        { name: 'summary', label: 'Summary', type: 'textarea', rows: 3, help: 'One or two sentences, shown under the title.' },
        { name: 'body_html', label: 'Show notes', type: 'rich' },
        { name: 'image_url', label: 'Episode image', type: 'image', help: 'Optional. Shown only when there is no audio or video.' },
        { name: 'image_alt', label: 'Image description (alt text)', type: 'text' },
      ].concat(SEO),
    },
    videos: {
      label: 'Videos', one: 'video', table: 'videos', titleField: 'title', path: 'videos/',
      select: '*', order: [['sort', true], ['published_at', false]],
      cols: [['sort', 'Order'], ['title', 'Title'], ['source', 'Source'], ['status', 'Status']],
      fields: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'slug', label: 'URL slug', type: 'slug', from: 'title', required: true },
        STATUS,
        { name: 'embed_url', label: 'Video link', type: 'url', help: 'A YouTube or Vimeo link.' },
        { name: 'source', label: 'Source', type: 'text', help: 'Show or event, e.g. "Dental Marketing Guy Show". Optional.' },
        { name: 'summary', label: 'Summary', type: 'textarea', rows: 3 },
        { name: 'body_html', label: 'Notes', type: 'rich' },
        { name: 'published_at', label: 'Date', type: 'date' },
        { name: 'sort', label: 'Order', type: 'number', help: 'Lower numbers show first.' },
        { name: 'image_url', label: 'Thumbnail image', type: 'image' },
        { name: 'image_alt', label: 'Image description (alt text)', type: 'text' },
      ].concat(SEO),
    },
    favorites: {
      label: 'Favorites', one: 'favorite', table: 'favorites', titleField: 'name', path: 'favorites/',
      select: '*, category:favorite_categories(name)', order: [['sort', true], ['name', true]],
      cols: [['sort', 'Order'], ['name', 'Company'], ['category', 'Category', function (r) { return r.category ? r.category.name : ''; }], ['featured', 'Featured', function (r) { return r.featured ? 'Yes' : ''; }], ['status', 'Status']],
      fields: [
        { name: 'name', label: 'Company name', type: 'text', required: true },
        { name: 'slug', label: 'URL slug', type: 'slug', from: 'name', required: true },
        { name: 'category_id', label: 'Category', type: 'ref', ref: 'favorite_categories' },
        { name: 'status', label: 'Status', type: 'select', options: [['published', 'Published'], ['draft', 'Draft (hidden from the site)']], def: 'published' },
        { name: 'featured', label: 'Featured at the top of the Favorites page', type: 'checkbox' },
        { name: 'description', label: 'Short description', type: 'textarea', rows: 2, help: 'One sentence for the card.' },
        { name: 'website_url', label: 'Website or partner link', type: 'url' },
        { name: 'logo_url', label: 'Logo', type: 'image', help: 'A white or light logo. It sits on a navy tile.', dark: true },
        { name: 'logo_alt', label: 'Logo description (alt text)', type: 'text' },
        { name: 'body_html', label: 'Page text', type: 'rich', help: 'Optional. Longer text for the company page.' },
        { name: 'sort', label: 'Order', type: 'number', help: 'Lower numbers show first.' },
      ].concat(SEO),
    },
    post_categories: {
      label: 'Post categories', one: 'category', table: 'post_categories', titleField: 'name',
      select: '*', order: [['sort', true], ['name', true]], cols: [['sort', 'Order'], ['name', 'Name'], ['slug', 'Slug']],
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'slug', label: 'Slug', type: 'slug', from: 'name', required: true },
        { name: 'sort', label: 'Order', type: 'number' },
      ],
    },
    favorite_categories: {
      label: 'Favorite categories', one: 'category', table: 'favorite_categories', titleField: 'name',
      select: '*', order: [['sort', true], ['name', true]], cols: [['sort', 'Order'], ['name', 'Name'], ['slug', 'Slug']],
      fields: [
        { name: 'name', label: 'Name', type: 'text', required: true },
        { name: 'slug', label: 'Slug', type: 'slug', from: 'name', required: true },
        { name: 'sort', label: 'Order', type: 'number' },
      ],
    },
  };

  // ---------- Helpers ----------
  var $ = function (s, el) { return (el || document).querySelector(s); };
  function h(tag, attrs, kids) {
    var el = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'text') el.textContent = v;
      else if (k.indexOf('on') === 0) el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? '' : v);
    });
    [].concat(kids || []).forEach(function (c) { if (c != null) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }
  function fmtDate(r, k) {
    var v = typeof r === 'object' ? r[k || 'published_at'] : r;
    return v ? new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' }) : '';
  }
  function slugify(s) {
    return (s || '').toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 90);
  }
  var toastTimer;
  function toast(msg, bad) {
    var t = $('#toast');
    t.textContent = msg; t.className = 'toast' + (bad ? ' toast--bad' : ''); t.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { t.hidden = true; }, bad ? 9000 : 5000);
  }
  function show(id) { ['login', 'reset', 'denied', 'workspace'].forEach(function (s) { $('#' + s).hidden = s !== id; }); }
  function friendly(err) {
    var m = (err && (err.message || err.error_description)) || String(err);
    if (/duplicate key.*slug/i.test(m)) return 'That URL slug is already used. Change the slug and save again.';
    if (/duplicate key.*name/i.test(m)) return 'That name is already used.';
    if (/foreign key/i.test(m)) return 'This category is still used by some items. Move them to another category first.';
    if (/slug_format|check constraint.*slug/i.test(m)) return 'The slug can only use lowercase letters, numbers and dashes.';
    if (/row-level security|permission denied/i.test(m)) return 'Your account is not allowed to make this change.';
    return m;
  }

  // ---------- Auth ----------
  var user = null;
  var autoPublish = false;
  var recovering = /type=recovery/.test(location.hash);

  async function boot() {
    var res = await sb.auth.getSession();
    await onSession(res.data.session);
    sb.auth.onAuthStateChange(function (event, session) {
      if (event === 'PASSWORD_RECOVERY') { recovering = true; show('reset'); return; }
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') onSession(session);
    });
  }

  async function onSession(session) {
    if (recovering && session) { show('reset'); return; }
    user = session ? session.user : null;
    $('#userbox').hidden = !user;
    if (!user) { show('login'); return; }
    $('#useremail').textContent = user.email;
    var r = await sb.rpc('is_admin');
    if (r.error || !r.data) { show('denied'); return; }
    show('workspace');
    buildTabs();
    publishNote();
    route();
  }

  $('#loginform').addEventListener('submit', async function (e) {
    e.preventDefault();
    var f = e.target, msg = $('#loginmsg');
    msg.textContent = 'Signing in...';
    var r = await sb.auth.signInWithPassword({ email: f.email.value.trim(), password: f.password.value });
    msg.textContent = r.error ? 'That email and password did not match. Try again or reset your password.' : '';
  });
  $('#forgot').addEventListener('click', async function () {
    var email = $('#loginform').email.value.trim(), msg = $('#loginmsg');
    if (!email) { msg.textContent = 'Type your email above, then click "Forgot your password?" again.'; return; }
    var r = await sb.auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname });
    msg.textContent = r.error ? friendly(r.error) : 'Check your email for a link to choose a new password.';
  });
  $('#resetform').addEventListener('submit', async function (e) {
    e.preventDefault();
    var r = await sb.auth.updateUser({ password: e.target.password.value });
    if (r.error) { $('#resetmsg').textContent = friendly(r.error); return; }
    recovering = false; history.replaceState(null, '', location.pathname);
    toast('Password saved.');
    onSession((await sb.auth.getSession()).data.session);
  });
  $('#signout').addEventListener('click', function () { sb.auth.signOut(); });

  async function publishNote() {
    var r = await sb.rpc('rebuild_configured');
    var on = autoPublish = !r.error && !!r.data;
    $('#publishnote').textContent = on
      ? 'Saving publishes automatically. The live site updates about two minutes after you save.'
      : 'Changes are saved. Automatic publishing is not switched on yet, so the live site updates at the next scheduled rebuild (daily) or when Andy publishes.';
  }

  // ---------- Routing: #/posts, #/posts/new, #/posts/<id> ----------
  function buildTabs() {
    var nav = $('#tabs'); nav.innerHTML = '';
    Object.keys(TYPES).forEach(function (k) { nav.appendChild(h('a', { href: '#/' + k, 'data-k': k, text: TYPES[k].label })); });
  }
  window.addEventListener('hashchange', function () { if (user) route(); });
  var dirty = false;
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  function route() {
    var parts = location.hash.replace(/^#\/?/, '').split('/');
    var k = TYPES[parts[0]] ? parts[0] : 'posts';
    document.querySelectorAll('#tabs a').forEach(function (a) { a.classList.toggle('is-on', a.getAttribute('data-k') === k); });
    if (window.tinymce) tinymce.remove();
    dirty = false;
    if (parts[1]) edit(k, parts[1] === 'new' ? null : parts[1]); else list(k);
  }

  // ---------- List ----------
  async function list(k) {
    var T = TYPES[k], view = $('#view');
    view.innerHTML = '';
    var search = h('input', { type: 'search', placeholder: 'Search ' + T.label.toLowerCase(), class: 'search' });
    view.appendChild(h('div', { class: 'listhead' }, [
      h('h1', { text: T.label }), search,
      h('a', { class: 'btn', href: '#/' + k + '/new', text: 'Add ' + T.one }),
    ]));
    var wrap = h('div', { class: 'tablewrap' }, [h('p', { class: 'muted', text: 'Loading...' })]);
    view.appendChild(wrap);
    var q = sb.from(T.table).select(T.select);
    T.order.forEach(function (o) { q = q.order(o[0], { ascending: o[1], nullsFirst: false }); });
    var r = await q;
    if (r.error) { wrap.innerHTML = ''; wrap.appendChild(h('p', { class: 'msg', text: friendly(r.error) })); return; }
    var rows = r.data;
    function draw() {
      var term = search.value.toLowerCase();
      var shown = rows.filter(function (row) { return !term || JSON.stringify([row[T.titleField], row.slug, row.guest, row.category]).toLowerCase().indexOf(term) > -1; });
      wrap.innerHTML = '';
      if (!shown.length) { wrap.appendChild(h('p', { class: 'muted', text: rows.length ? 'Nothing matches that search.' : 'Nothing here yet.' })); return; }
      var table = h('table', { class: 'list' }, [
        h('thead', {}, [h('tr', {}, T.cols.map(function (c) { return h('th', { text: c[1] }); }))]),
        h('tbody', {}, shown.map(function (row) {
          return h('tr', { onclick: function () { location.hash = '#/' + k + '/' + row.id; } }, T.cols.map(function (c) {
            var v = c[2] ? c[2](row, c[0]) : row[c[0]];
            if (c[0] === 'status') return h('td', {}, [h('span', { class: 'pill pill--' + v, text: v === 'published' ? 'Published' : 'Draft' })]);
            var txt = v == null ? '' : String(v);
            if (c[0] === T.titleField) return h('td', { class: 'strong' }, [h('a', { href: '#/' + k + '/' + row.id, text: txt })]);
            return h('td', { text: txt });
          }));
        })),
      ]);
      wrap.appendChild(table);
      wrap.appendChild(h('p', { class: 'muted', text: shown.length + ' of ' + rows.length }));
    }
    search.addEventListener('input', draw);
    draw();
  }

  // ---------- Edit ----------
  var refCache = {};
  async function refOptions(table, fresh) {
    if (!refCache[table] || fresh) {
      var r = await sb.from(table).select('id,name,sort').order('sort', { ascending: true, nullsFirst: false }).order('name');
      refCache[table] = r.data || [];
    }
    return refCache[table];
  }

  async function edit(k, id) {
    var T = TYPES[k], view = $('#view'), row = {};
    view.innerHTML = '<p class="muted">Loading...</p>';
    if (id) {
      var r = await sb.from(T.table).select('*').eq('id', id).maybeSingle();
      if (r.error || !r.data) { view.innerHTML = ''; view.appendChild(h('p', { class: 'msg', text: r.error ? friendly(r.error) : 'Not found. It may have been deleted.' })); return; }
      row = r.data;
    }
    var slugTouched = !!id;
    var form = h('form', { class: 'editor', novalidate: true });
    var groups = {};
    var main = h('div', { class: 'editor__main' }), side = h('div', { class: 'editor__side' });

    for (var i = 0; i < T.fields.length; i++) {
      var f = T.fields[i];
      var holder = main;
      if (f.group) {
        if (!groups[f.group]) { groups[f.group] = h('details', { class: 'group' }, [h('summary', { text: f.group })]); }
        holder = groups[f.group];
      }
      holder.appendChild(await field(f, row, k));
    }
    Object.keys(groups).forEach(function (g) { main.appendChild(groups[g]); });

    var saveBtn = h('button', { class: 'btn', type: 'submit', text: 'Save' });
    var viewLink = T.path && id && row.status === 'published' ? h('a', { class: 'linkbtn', href: ROOT + T.path + row.slug + '/', target: '_blank', rel: 'noopener', text: 'View on site' }) : null;
    var del = id ? h('button', { class: 'btn btn--danger', type: 'button', text: 'Delete', onclick: function () { remove(k, row); } }) : null;
    side.appendChild(h('div', { class: 'card sticky' }, [
      saveBtn,
      h('a', { class: 'btn btn--ghost', href: '#/' + k, text: 'Back to list' }),
      viewLink,
      id && (row.updated_at || row.created_at) ? h('p', { class: 'muted small', text: 'Last saved ' + new Date(row.updated_at || row.created_at).toLocaleString() }) : null,
      del,
    ]));

    form.appendChild(h('div', { class: 'editor__head' }, [h('h1', { text: id ? 'Edit ' + T.one : 'New ' + T.one })]));
    form.appendChild(h('div', { class: 'editor__cols' }, [main, side]));
    view.innerHTML = '';
    view.appendChild(form);

    // Slug follows the title until edited by hand.
    T.fields.forEach(function (f) {
      if (f.type !== 'slug') return;
      var s = form.elements[f.name], src = form.elements[f.from];
      s.addEventListener('input', function () { slugTouched = true; });
      src.addEventListener('input', function () { if (!slugTouched) s.value = slugify(src.value); });
    });
    form.addEventListener('input', function () { dirty = true; });

    await initRich(form);

    form.addEventListener('submit', async function (e) {
      e.preventDefault();
      if (window.tinymce) tinymce.triggerSave();
      var data = {}, problems = [];
      T.fields.forEach(function (f) {
        var el = form.elements[f.name], v;
        if (f.type === 'checkbox') v = el.checked;
        else if (f.type === 'number') v = el.value === '' ? null : Number(el.value);
        else if (f.type === 'date') v = el.value ? el.value + 'T12:00:00Z' : null;
        else if (f.type === 'ref') v = el.value || null;
        else { v = el.value.trim(); if (v === '') v = null; }
        if (f.type === 'slug' && v) { v = slugify(v); el.value = v; }
        if (f.required && (v == null || v === '')) problems.push(f.label);
        data[f.name] = v;
      });
      if (problems.length) { toast('Please fill in: ' + problems.join(', '), true); return; }
      if (id && row.slug && data.slug !== row.slug && row.status === 'published' &&
          !confirm('Changing the URL slug changes the page address. Links to the old address will stop working. Continue?')) return;
      saveBtn.disabled = true; saveBtn.textContent = 'Saving...';
      var r = id ? await sb.from(T.table).update(data).eq('id', id).select().single()
                 : await sb.from(T.table).insert(data).select().single();
      saveBtn.disabled = false; saveBtn.textContent = 'Save';
      if (r.error) { toast(friendly(r.error), true); return; }
      dirty = false;
      if (/categories$/.test(T.table)) refOptions(T.table, true);
      toast(data.status === 'draft' ? 'Saved as a draft. It stays hidden from the site.' : autoPublish ? 'Saved. The live site updates in about two minutes.' : 'Saved. It appears on the live site at the next rebuild.');
      if (!id) location.hash = '#/' + k + '/' + r.data.id; else edit(k, id);
    });
  }

  async function field(f, row, k) {
    var v = row[f.name];
    if (v === undefined || v === null) v = f.def !== undefined ? f.def : '';
    var input;
    var help = f.help ? h('small', { text: f.help }) : null;
    switch (f.type) {
      case 'textarea': input = h('textarea', { name: f.name, rows: f.rows || 4 }); input.value = v; break;
      case 'rich': input = h('textarea', { name: f.name, class: 'rich', rows: 18 }); input.value = v; break;
      case 'number': input = h('input', { type: 'number', name: f.name, step: 1 }); input.value = v; break;
      case 'date': input = h('input', { type: 'date', name: f.name }); input.value = v ? String(v).slice(0, 10) : ''; break;
      case 'url': input = h('input', { type: 'url', name: f.name, placeholder: 'https://' }); input.value = v; break;
      case 'checkbox':
        input = h('input', { type: 'checkbox', name: f.name }); input.checked = !!row[f.name];
        return h('label', { class: 'field field--check' }, [input, h('span', { text: f.label }), help]);
      case 'select':
        input = h('select', { name: f.name }, f.options.map(function (o) { return h('option', { value: o[0], text: o[1] }); }));
        input.value = v; break;
      case 'ref':
        var opts = await refOptions(f.ref);
        input = h('select', { name: f.name }, [h('option', { value: '', text: 'Choose a category' })].concat(opts.map(function (o) { return h('option', { value: o.id, text: o.name }); })));
        input.value = v || '';
        var manage = h('a', { href: '#/' + f.ref, class: 'small', text: 'Add or rename categories' });
        return h('label', { class: 'field' }, [h('span', { text: f.label }), input, manage]);
      case 'image': return imageField(f, v, k);
      case 'slug':
        input = h('input', { type: 'text', name: f.name, pattern: '[a-z0-9-]+', spellcheck: 'false' }); input.value = v;
        help = h('small', { text: 'Lowercase words joined by dashes. It becomes the page address.' });
        break;
      default: input = h('input', { type: 'text', name: f.name }); input.value = v;
    }
    return h('label', { class: 'field' + (f.type === 'rich' ? ' field--rich' : '') }, [h('span', { text: f.label + (f.required ? ' *' : '') }), input, help]);
  }

  function imageField(f, v, k) {
    var input = h('input', { type: 'text', name: f.name, placeholder: 'Upload an image or paste a link' });
    input.value = v || '';
    var prev = h('img', { alt: '', class: 'thumb' + (f.dark ? ' thumb--dark' : '') });
    function refresh() { prev.src = abs(input.value); prev.hidden = !input.value; }
    input.addEventListener('input', refresh);
    var file = h('input', { type: 'file', accept: 'image/*', hidden: true });
    var status = h('small', { text: f.help || '' });
    file.addEventListener('change', async function () {
      if (!file.files[0]) return;
      status.textContent = 'Uploading...';
      try { input.value = await upload(file.files[0], k); refresh(); status.textContent = 'Uploaded. Remember to save.'; input.dispatchEvent(new Event('input', { bubbles: true })); }
      catch (e) { status.textContent = friendly(e); }
      file.value = '';
    });
    refresh();
    return h('div', { class: 'field' }, [
      h('span', { text: f.label }),
      h('div', { class: 'imgrow' }, [prev, h('div', { class: 'imgrow__ctl' }, [input, h('div', {}, [
        h('button', { type: 'button', class: 'btn btn--ghost', text: 'Upload image', onclick: function () { file.click(); } }),
        h('button', { type: 'button', class: 'linkbtn', text: 'Remove', onclick: function () { input.value = ''; refresh(); input.dispatchEvent(new Event('input', { bubbles: true })); } }),
      ]), file])]),
      status,
    ]);
  }

  async function upload(blob, folder) {
    if (blob.size > 10 * 1024 * 1024) throw new Error('That image is over 10 MB. Please use a smaller file.');
    var name = (blob.name || 'image.png').toLowerCase();
    var ext = (name.match(/\.(\w+)$/) || [, 'png'])[1];
    var base = slugify(name.replace(/\.\w+$/, '')) || 'image';
    var path = folder + '/' + Date.now() + '-' + base + '.' + ext;
    var r = await sb.storage.from(BUCKET).upload(path, blob, { cacheControl: '31536000', upsert: false, contentType: blob.type || undefined });
    if (r.error) throw r.error;
    return sb.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
  }

  function initRich(form) {
    var areas = form.querySelectorAll('textarea.rich');
    if (!areas.length || !window.tinymce) return Promise.resolve();
    var k = (location.hash.split('/')[1]) || 'posts';
    return tinymce.init({
      selector: 'textarea.rich',
      license_key: 'gpl',
      promotion: false,
      branding: false,
      menubar: false,
      toolbar_sticky: true,
      min_height: 420,
      plugins: 'lists link image media table code autoresize wordcount',
      toolbar: 'blocks | bold italic | bullist numlist blockquote | link image media table | removeformat | code',
      block_formats: 'Paragraph=p; Heading=h2; Subheading=h3; Small heading=h4',
      convert_urls: false,
      relative_urls: false,
      link_default_target: '',
      image_caption: false,
      image_advtab: false,
      automatic_uploads: true,
      paste_data_images: true,
      images_upload_handler: function (blobInfo) { return upload(blobInfo.blob(), k); },
      content_style: 'body{font-family:Montserrat,Arial,sans-serif;font-size:16px;line-height:1.6;color:#333;max-width:760px;margin:16px auto;padding:0 12px} h2,h3,h4{color:#143b70} a{color:#143b70} img{max-width:100%;height:auto} blockquote{border-left:3px solid #EDB21E;margin-left:0;padding-left:16px}',
      setup: function (ed) { ed.on('input change undo redo', function () { dirty = true; }); },
    });
  }

  async function remove(k, row) {
    var T = TYPES[k];
    if (!confirm('Delete "' + (row[T.titleField] || 'this item') + '"? This cannot be undone. To hide it instead, set Status to Draft.')) return;
    var r = await sb.from(T.table).delete().eq('id', row.id);
    if (r.error) { toast(friendly(r.error), true); return; }
    dirty = false;
    toast('Deleted.');
    location.hash = '#/' + k;
  }

  boot();
})();
