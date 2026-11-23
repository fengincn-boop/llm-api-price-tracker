import fs from 'node:fs';

const res = await fetch('https://llmfare.com/api/prices.json');
if (!res.ok) throw new Error(`HTTP ${res.status}`);
const data = await res.json();

const spreads = (data.topChannelSpreads || []).slice(0, 6).map((s) =>
  `| ${s.name} | ${s.vendor} | $${s.minIn} / $${s.minOut} (${s.minProvEn}) | $${s.maxIn} / $${s.maxOut} (${s.maxProvEn}) | **${s.spreadRatio}x (Save ${s.savePct}%)** |`
).join('\n');

const rows = (data.models || []).slice(0, 35).map((m) =>
  `| ${m.name} | ${m.vendor} | $${m.inputUsdPer1M} / $${m.outputUsdPer1M} | $${m.lowestChannelInUsdPer1M} / $${m.lowestChannelOutUsdPer1M} (${m.lowestChannel}) | ${m.channelSpreadRatio}x | ${m.fare?.coding ?? '-'} |`
).join('\n');

const md = `# Daily LLM API Price & Arbitrage Tracker

> Auto-synced daily at **08:30 HKT** from [LLMFare.com](https://llmfare.com/en/) open static feed (\`/api/prices.json\`).
> Last updated: **${data.updatedDate}** (USD/CNY: \`${data.usdToCny}\` · Tracked: **${data.mainModelCount}** flagship / **${data.catalogModelCount}** total models)

## Largest Multi-Channel Price Spreads

| Model | Vendor | Cheapest Gateway (In / Out per 1M) | Highest Channel (In / Out per 1M) | Spread |
| :--- | :--- | :--- | :--- | :--- |
${spreads}

## Top 35 Models Snapshot (USD per 1M Tokens)

| Model | Vendor | Official (In / Out) | Cheapest Channel (In / Out) | Spread | Coding Score |
| :--- | :--- | :--- | :--- | :--- | :---: |
${rows}

---
Explore interactive F.A.R.E. Pareto charts, subscription vs. API break-even calculators, and full 480+ model search at **[llmfare.com](https://llmfare.com/en/)** ([中文版](https://llmfare.com/)).
`;

fs.writeFileSync('PRICES.md', md, 'utf8');
console.log('Updated PRICES.md for', data.updatedDate);
