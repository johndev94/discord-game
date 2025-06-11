# Connect 4 Discord Activity

This template is used in the [Building An Activity](https://discord.com/developers/docs/activities/building-an-activity) tutorial in the Discord Developer Docs.

Read more about building Discord Activities with the Embedded App SDK at [https://discord.com/developers/docs/activities/overview](https://discord.com/developers/docs/activities/overview).

## Getting Started

**IMPORTANT**: Create a .env file and add your **client ID** and **secret** to it.

## Run Server

```shell
cd ./server
npm run dev
```

## Run Client

```shell
cd ./client
npm run dev
```

## Create Tunnel

```shell
cloudflared tunnel --url localhost:5173
```
