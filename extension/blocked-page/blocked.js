const params = new URLSearchParams(window.location.search);

const domainEl = document.getElementById('domain');
const messageEl = document.getElementById('message');
const backBtn = document.getElementById('backBtn');
const allowBtn = document.getElementById('allowBtn');

const site = params.get('site') || 'This site';
const original = params.get('original');

domainEl.textContent = site;

const quotes = [
  'Deep work is the superpower of the 21st century.',
  'Focus is the new IQ.',
  'Every minute of focus builds your future.',
  'The ability to concentrate is a competitive advantage.'
];

const quote = quotes[Math.floor(Math.random() * quotes.length)];
messageEl.innerHTML = `${quote}<br><small>You blocked this site to stay on track.</small>`;

backBtn.addEventListener('click', () => {
  window.history.back();
});

allowBtn.addEventListener('click', () => {
  if (!original) return;

  const until = Date.now() + 5 * 60 * 1000;

  chrome.storage.local.set(
    {
      tempAllow: {
        url: site,
        until
      }
    },
    () => {
      window.location.href = original;
    }
  );
});