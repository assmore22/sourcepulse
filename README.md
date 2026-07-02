# SourcePulse

## Live Links

- App: https://sourcepulse.vercel.app
- Repository: https://github.com/assmore22/sourcepulse
A GenLayer-powered source-monitoring and change-verification protocol.

The project is a source-backed GenLayer workflow, with frontend views designed around evidence status rather than generic contract buttons.

## SourcePulse Brief

- Project folder: `projects/project-09-sourcepulse`
- Frontend: Next/Vite-style app folder
- Contract package: `contracts/` plus `deployment.json`
- Logo asset: FontAwesome satellite-dish (faSatelliteDish) + plain text wordmark 'SourcePulse'
- Build status: next build OK (9 routes, 0 type/lint errors); contract schema-valid; all 11 write methods executed on-chain; 17 read methods power the UI; RainbowKit+wagmi+viem+genlayer-js; D3 source-change timeline + GSAP command-log...
- QA notes: Browser QA 1440px + 390px: source monitor workbench (terminal command-log + D3 source-change timeline + alert drawer + sticky bottom action bar; terminal status rail top, command nav - no sidebar/tabs/cards) / watchlist detail (timeline, snapshots, alerts...

## SourcePulse On Studionet

- Network: studionet (61999)
- Contract: [0x17E593B469A82BDA42f1b377ea14851C5D410856](https://explorer-studio.genlayer.com/contracts/0x17E593B469A82BDA42f1b377ea14851C5D410856)
- Deploy tx: [0xb329699f...1cadae](https://explorer-studio.genlayer.com/tx/0xb329699fea8dedfeccf2f34a9abe1e0e36994030c257c353c570fbf2db1cadae)
- Deployed at: 2026-06-22T17:16:41.026Z
- Smoke writes recorded: 11

## Evidence Mechanics

- Primary source: `contracts/SourcePulse.py` (36,072 bytes)
- Public write/action methods: 11
- Read methods: 17
- GenLayer features: live web rendering, LLM adjudication, validator-comparative consensus, indexed storage, append-only collections

Typical flow: `create_watchlist` -> `submit_snapshot` -> `resolve_challenge` -> `challenge_snapshot` -> `file_appeal` -> `archive_watchlist` -> `activate_watchlist`

Useful reads: `get_watchlist`, `get_snapshot`, `get_alert`, `get_challenge`, `get_appeal`, `get_profile`, `get_recent_watchlists`, `get_active_watchlists`

The contract is deliberately larger than a one-method demo. It keeps lifecycle state, evidence records and read endpoints so the UI can show real project state instead of static copy.

## Operator Preview

```powershell
cd <this-repository-folder>
npm install
npm run dev
```

Open the dev server URL printed by npm.

## Smoke Transactions

- create_watchlist: [0x75279544...06ef45](https://explorer-studio.genlayer.com/tx/0x7527954430bf52f04de3babec5032ad0adbfb447439be4996973dd009106ef45)
- activate_watchlist: [0xd07f170d...9d1000](https://explorer-studio.genlayer.com/tx/0xd07f170def7828880455df6e8a181a802a40f6fa74db3f8deef47ad9e79d1000)
- submit_snapshot: [0x6b787037...353bd7](https://explorer-studio.genlayer.com/tx/0x6b78703737a8006ec5a15592ced9888b0597c14e6a0de8b9dae5882bba353bd7)
- assess_snapshot: [0xbda8bfe9...f167d0](https://explorer-studio.genlayer.com/tx/0xbda8bfe9c903bc6f871bf89b5a1d166dd7dacb5b5b5e3feb4f25e747f7f167d0)
- challenge_snapshot: [0x5df6af2f...bc5424](https://explorer-studio.genlayer.com/tx/0x5df6af2fc2e9dd2402375f2a525f13abbb3812b52c7b619112fc8a7f93bc5424)
- file_appeal: [0xa935cbd2...83da90](https://explorer-studio.genlayer.com/tx/0xa935cbd2603f0e1bbdeca15b03a7570827aa7dc23dbf42074024d2ed0883da90)
- resolve_challenge: [0xe825efe8...b44de4](https://explorer-studio.genlayer.com/tx/0xe825efe8bbc1c4dc0940549b6a0f8938007232be9ec019d2b6d93c2ad0b44de4)
- resolve_appeal: [0x82d4233f...35dc0f](https://explorer-studio.genlayer.com/tx/0x82d4233f14507854490041aaf21af5cdef0d03852e3d8d6ef46594812b35dc0f)

## Public Repo Safety

- Private keys and local vault files are not part of this repository.
- Public addresses, contract source, deployment metadata and frontend code are safe to publish.
- Vercel should receive only this project folder, never the workspace dashboard or vault data.
