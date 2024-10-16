# else

> [!WARNING]
> Use at your own risk

**else** is a full-featured bot for ELSE.

## Features:


1. Auto collection of tokens
2. Auto upgrade boosts
3. Auto use fast recharge boost if exists
4. Choose random careers and update them 

* All tasks are delayed. Every account has its own user agent
* The bot works asynchronously, i.e. it goes along the line until it finishes the cycle

**Have fun :)**

## Install

1. Install [Bun.sh](https://bun.sh)
2. Install dependencies:

```bash
bun install
```

3. Add sessions (read below)
4. Configure bot in the config in `src/config.ts`
5. Run:

```bash
bun start
```


## Configuration


#### Preparatory steps

1. Login to [my.telegram.org](https://my.telegram.org)
2. Go to "Api development tools"
3. Create new Application by filling in the fields as shown in the picture

![Create new application](images/tg-create-application.png)

4. Copy the `api_id` and `api_hash`

![Copy api configuration](images/tg-copy-config.png)

5. Insert `api_id` and `api_hash` to `.example.env`
6. Rename `.example.env` to `.env`

#### Login with Sessions

Supported Pyrogram and Telethon v1.x sessions

1. Create `sessions` folder near the package.json file (not in `./src`)
2. Place `.session` files in `./sessions` folder (not in `./src/sessions`)
3. Run `bun sessions:parse`
4. Done

#### Login with Phone number

1. Run `bun sessions:add`
2. Enter the required data in the console
3. Done

### Proxy

The bot supports only http and https proxies. I haven't tested it

1. Open `src/config.ts`
2. Add proxy string to `proxy` array

```ts
...
proxy: ["https://...:443", "http://...:8053"],
...
```


## About chances of being banned

Everything is at your own risk. I don't recommend using it on the main accounts.


## Info

Follow me on Telegram: @degen_broke
