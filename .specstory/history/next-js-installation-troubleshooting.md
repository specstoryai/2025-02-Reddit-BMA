## SpecStory

## Next.js Installation Troubleshooting (2/12/2025, 10:20:12 PM)

_**User**_

Why 

---

_**Assistant**_

Next.js isn't installed. You need to install dependencies first:

```bash
npm install
```

If that doesn't work, Next.js might be missing from package.json. Install it:

```bash
npm install next@latest react@latest react-dom@latest
```

---

_**User**_

got this issue



---

_**Assistant**_

You're trying to use React 19 but @react-three/drei and react-spring only support up to React 18. Two options:

1. Downgrade React to v18:
```bash
npm install react@18.2.0 react-dom@18.2.0
```

2. Force install with peer dependency issues (might break things):
```bash
npm install --legacy-peer-deps
```

Option 1 is safer. Update your package.json React version to:

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  }
}
```

---

_**User**_

How can I remove @react-three/drei and react-spring 

---

_**Assistant**_



Remove them using npm:

```bash
npm uninstall @react-three/drei react-spring
```

Then delete any imports and code using these packages from your files. You'll need to refactor any components that were using them.

If you want to verify they're gone, check your package.json - those dependencies should no longer be listed.

---



---

