# IRISCODE

Vite + React + TypeScript で作っている、見下ろしグリッド型ゲームの試作です。

## Local

```bash
npm install
npm run dev
```

## GitHub Pages

`.github/workflows/deploy-pages.yml` を追加してあるので、`main` に push すると自動で GitHub Pages にデプロイされます。

想定フロー:

1. GitHub のリポジトリで `Settings > Pages` を開く
2. `Build and deployment` の `Source` を `GitHub Actions` にする
3. `main` に push する
4. `Actions` と `Deployments` から最新の公開状態を確認する

想定される公開 URL:

`https://hirao-greendice.github.io/IRISCODE/`

補足:

- `vite.config.ts` の `base: './'` は GitHub Pages 配信用にそのまま使えます
- 初回公開は数分かかることがあります

## Checks

```bash
npm run build
npm run lint
```
