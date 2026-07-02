/** Static deployment facts (public hashes only). */
export const DEPLOYMENT = {
  network: "GenLayer Studionet",
  chainId: 61999,
  deployer: "0xf9903EED741c3ca9e3591c9d6A527d36bE4B5aC7",
  contractAddress: "0x17E593B469A82BDA42f1b377ea14851C5D410856",
  deployTxHash: "0xb329699fea8dedfeccf2f34a9abe1e0e36994030c257c353c570fbf2db1cadae",
  faucetTxHash: "0xd007f7b4c1ede8ece9bb2f110bd672c491e24760746590b8a92c2d83764cc38a",
  smoke: [
    { label: "create_watchlist", hash: "0x7527954430bf52f04de3babec5032ad0adbfb447439be4996973dd009106ef45" },
    { label: "activate_watchlist", hash: "0xd07f170def7828880455df6e8a181a802a40f6fa74db3f8deef47ad9e79d1000" },
    { label: "submit_snapshot", hash: "0x6b78703737a8006ec5a15592ced9888b0597c14e6a0de8b9dae5882bba353bd7" },
    { label: "assess_snapshot (routine/15/5/low)", hash: "0xbda8bfe9c903bc6f871bf89b5a1d166dd7dacb5b5b5e3feb4f25e747f7f167d0" },
    { label: "publish_alert", hash: "0xf87ace6d0512b76e64aff0f9e97ccc5e11d4758113370a35e813a2a5fa4f9db0" },
    { label: "challenge_snapshot", hash: "0x5df6af2fc2e9dd2402375f2a525f13abbb3812b52c7b619112fc8a7f93bc5424" },
    { label: "file_appeal", hash: "0xa935cbd2603f0e1bbdeca15b03a7570827aa7dc23dbf42074024d2ed0883da90" },
    { label: "resolve_challenge (dismissed)", hash: "0xe825efe8bbc1c4dc0940549b6a0f8938007232be9ec019d2b6d93c2ad0b44de4" },
    { label: "resolve_appeal (denied)", hash: "0x82d4233f14507854490041aaf21af5cdef0d03852e3d8d6ef46594812b35dc0f" },
    { label: "resolve_watchlist", hash: "0xa6f6dd53914c2c4e6610828e5187142dba21908e8be27e212f8229c22f271f58" },
    { label: "archive_watchlist", hash: "0x8d4cd9e90d890d3ce1235b615de1896142a2749af56203d9e36a9b666642102a" },
  ],
} as const;
