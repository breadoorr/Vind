
<script>
  import { onMount } from 'svelte';
  import { searchVideos } from './lib/youtube.js';

  let query = $state('');
  let videos = $state([]);
  let loading = $state(false);
  let error = $state('');
  let nextPageToken = $state('');
  let activeTab = $state('For you');
  let platform = $state('YouTube');
  let sortBy = $state('relevance');
  let saved = $state([]);
  let darkMode = $state(false);
  let isScrolled = $state(false);
  let logo = $state("logo-dark.png")
  
  onMount(() => { 
    search();

    const handleScroll = () => {
    isScrolled = window.scrollY > window.innerHeight * 0.65;
};

window.addEventListener('scroll', handleScroll, { passive: true });
handleScroll();

return () => window.removeEventListener('scroll', handleScroll);
});


  async function search(append = false, term = query) {
    loading = true;
    error = '';

    try {
      const result = await searchVideos(
        term.trim() || 'popular',
        append ? nextPageToken : ''
      );

      videos = append
        ? [...videos, ...result.videos]
        : result.videos;

      nextPageToken = result.nextPageToken || '';
    } catch (e) {
      error = e.message || 'Unable to load videos.';
    } finally {
      loading = false;
    }
  }

  let visibleVideos = $derived(
    [...videos].sort((a, b) => {
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'newest') {
        return new Date(b.publishedAt) - new Date(a.publishedAt);
      }
      return 0;
    })
  );

  function toggleSave(id) {
    saved = saved.includes(id)
      ? saved.filter(item => item !== id)
      : [...saved, id];
  }

  function formatViews(n) {
    if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
    if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
    return String(n);
  }
</script>

<svelte:head>
  <title>Vind - Video Search</title>
  <meta name="theme-color" content="#0b0b10" />
</svelte:head>

<div class="app-shell" class:dark={darkMode}>
  <aside class="sidebar">
    <a class="brand" href="/"> <img src={logo} alt="logo" /></a>
    <p class="side-label">WORKSPACE</p>

    <button class="nav-item selected">
      <span>▦</span> Discover
    </button>
    <button class="nav-item" onclick={() => {
      activeTab = 'Trending';
      search(false, query || 'trending videos');
    }}>
      <span>↗</span> Trending
    </button>
    <button class="nav-item" onclick={() => {
      activeTab = 'Saved';
    }}>
      <span>♡</span> Saved videos
      <span class="nav-count">{saved.length}</span>
    </button>

    <p class="side-label second-label">INSIGHTS</p>
    <button class="nav-item" onclick={() => {
      sortBy = 'views';
    }}>
      <span>⌁</span> Performance
    </button>
  </aside>

  <main class="main-area">
    <header class="topbar">
      <div class="breadcrumb">Workspace <span>/</span> Discover</div>

      <button
  class="theme-toggle"
  onclick={() => {
    darkMode = !darkMode;
    logo = darkMode ? "logo-light.png" : "logo-dark.png";
  } }
  aria-label={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
  title={darkMode ? 'Switch to light theme' : 'Switch to dark theme'}
>
  {#if darkMode}
    <span>☀</span>
  {:else}
    <span>☾</span>
  {/if}
</button>
    </header>

    <section class="hero">
      <div class="eyebrow"><span>✳</span> VIDEO INTELLIGENCE, REIMAGINED</div>
      <h1 class="hero-title">
  Find the video<br />
  behind the <span>idea.</span>
</h1>
      <p class="hero-copy">
        Search by what you see, what you know, or how a video performs.
        All in one place.
      </p>

      
<form
  class:sticky-active={isScrolled}
  class="search-box"
  onsubmit={(e) => {
    e.preventDefault();
    activeTab = 'For you';
    search();
  }}
>
  <span class="search-symbol">⌕</span>
  <input
    bind:value={query}
    placeholder="Try “viral product demos for skincare”..."
    aria-label="Search videos"
  />
  <button class="search-button" type="submit" disabled={loading}>
    {loading ? 'Searching…' : 'Search ↗'}
  </button>
</form>


      <div class="suggestions">
        <span>Try:</span>
        {#each ['AI tools', 'Product launches', 'Creator marketing', 'Fitness'] as term}
          <button class="suggestion" onclick={() => {
            query = term;
            search();
          }}>{term}</button>
        {/each}
      </div>
    </section>


    <section class="results">
      <div class="section-head">
        <div>
          <div class="eyebrow muted">YOUR NEXT DISCOVERY</div>
          <h2>{activeTab === 'Saved' ? 'Saved videos' : activeTab === 'Trending' ? 'Trending videos' : 'Explore videos'}</h2>
          <p>Real videos matched to your search.</p>
        </div>
        <div class="sort-wrap">
          <label for="sort">Sort by</label>
          <select id="sort" bind:value={sortBy}>
            <option value="relevance">Relevance</option>
            <option value="views">Most views</option>
            <option value="newest">Newest</option>
          </select>
        </div>
      </div>

      <div class="filter-row">
        <div class="tabs">
          {#each ['For you', 'Trending', 'Recently published'] as tab}
            <button class:tab-active={activeTab === tab}
              class="tab"
              onclick={() => {
                activeTab = tab;
                if (tab === 'Trending') {
                  query = 'trending';
                  search();
                } else if (tab === 'Recently published') {
                  sortBy = 'newest';
                } else {
                  search();
                }
              }}>{tab}</button>
          {/each}
        </div>
        <span class="source-pill">▶ YouTube</span>
      </div>

      {#if error}
        <div class="notice">
          <strong>We couldn't load your results.</strong>
          <p>{error}</p>
          <button class="search-button" onclick={() => search()}>Try again</button>
        </div>
      {:else if loading && videos.length === 0}
        <p class="empty-state">Finding videos for you…</p>
      {:else if activeTab === 'Saved'}
        <div class="video-grid">
          {#each visibleVideos.filter(v => saved.includes(v.id)) as video (video.id)}
            <article class="video-card">
              <a class="video-thumb" href={video.url} target="_blank" rel="noreferrer">
                <img src={video.thumbnail} alt={video.title} loading="lazy" />
                <span class="platform-tag">▶ YouTube</span>
                <span class="play-icon">▶</span>
                <span class="views-pill">{formatViews(video.views)} views</span>
              </a>
              <div class="video-info">
                <div class="creator-line">
                  <span class="avatar creator-avatar">{video.creator.slice(0,1)}</span>
                  <span class="creator-name">{video.creator}</span>
                  <button class="save-btn saved" onclick={() => toggleSave(video.id)}>♥</button>
                </div>
                <a class="video-title" href={video.url} target="_blank" rel="noreferrer">{video.title}</a>
                <p class="video-description">{video.description}</p>
              </div>
            </article>
          {/each}
        </div>
      {:else}
        <div class="video-grid">
          {#each visibleVideos as video (video.id)}
            <article class="video-card">
              <a class="video-thumb" href={video.url} target="_blank" rel="noreferrer">
                <img src={video.thumbnail} alt={video.title} loading="lazy" />
                <span class="platform-tag">▶ YouTube</span>
                <span class="play-icon">▶</span>
                <span class="views-pill">{formatViews(video.views)} views</span>
              </a>
              <div class="video-info">
                <div class="creator-line">
                  <span class="avatar creator-avatar">{video.creator.slice(0,1).toUpperCase()}</span>
                  <span class="creator-name">{video.creator}</span>
                  <button class:saved={saved.includes(video.id)}
                    class="save-btn"
                    aria-label="Save video"
                    onclick={() => toggleSave(video.id)}>
                    {saved.includes(video.id) ? '♥' : '♡'}
                  </button>
                </div>
                <a class="video-title" href={video.url} target="_blank" rel="noreferrer">{video.title}</a>
                <p class="video-description">{video.description || 'No description available.'}</p>
                <div class="video-meta">
                  <span>{video.likes === null ? 'Likes unavailable' : `${formatViews(video.likes)} likes`}</span>
                  <span>{new Date(video.publishedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </article>
          {/each}
        </div>
      {/if}

      {#if !error && nextPageToken && activeTab !== 'Saved'}
        <div class="load-row">
          <button class="load-button" disabled={loading} onclick={() => search(true)}>
            {loading ? 'Loading…' : 'Load more videos ↓'}
          </button>
        </div>
      {/if}
    </section>

    <footer class="footer">
      <span>vind<span class="footer-dot">.</span></span>
      <span>Discover more. Scroll less.</span>
      <span>Data provided by YouTube</span>
    </footer>
  </main>
</div>
