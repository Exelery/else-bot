# else

> [!WARNING]
> Use at your own risk


[Russian version (Русская версия)](README_RU.md)

**else** is a full-featured bot for ELSE.

## Features

1. Auto clicker
2. Auto upgrade of boosts
3. Auto use of fast recharge energy when available
4. Random career selection and updates
5. Auto daily tasks

* All tasks are delayed with account-specific user agents
* Asynchronous operation: completes full cycle for each account sequentially



## Installation

1. Install [Bun.sh](https://bun.sh)
2. Install dependencies:

```bash
bun install
```

3. Add sessions (see Configuration section)
4. Configure the bot in `src/config.ts`
5. Run:

```bash
bun start
```

## Configuration

### Telegram API Setup

1. Log in to [my.telegram.org](https://my.telegram.org)
2. Navigate to "API development tools"
3. Create a new application (fill in required fields)
4. Copy the `api_id` and `api_hash`
5. Add `api_id` and `api_hash` to `.example.env`
6. Rename `.example.env` to `.env`

### Session Login

#### Option 1: Using Existing Sessions

Supports Pyrogram and Telethon v1.x sessions

1. Create a `sessions` folder in the project root (next to `package.json`)
2. Place `.session` files in the `sessions` folder
3. Run `bun sessions:parse`

#### Option 2: Login with Phone Number

1. Run `bun sessions:add`
2. Follow the console prompts

### Proxy Configuration (Optional)

The bot supports HTTP and HTTPS proxies (untested).

1. Open `src/config.ts`
2. Add proxy strings to the `proxy` array:

```ts
proxy: ["https://user:pass@host:port", "http://user:pass@host:port"],
```

## Disclaimer

Use of this bot may violate ELSE's terms of service. Use at your own risk. We strongly advise against using it on main accounts.

## Future Plans

In upcoming updates, we plan to add the following features:

1. Automatic referral management
2. Automatic task completion
3. Automatic verification process

Stay tuned for updates!

## Contact

For updates and support, follow [CryptoBroke](https://t.me/degen_broke) on Telegram.
