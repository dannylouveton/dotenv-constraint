# dotenv-constraint

🚀 **dotenv-constraint** is a lightweight package for **validating and enforcing constraints** on environment variables in JavaScript. It ensures that required variables are defined and match expected types.

## 📦 Installation

Install the package via npm:

```sh
npm install dotenv-constraint
```

## 🛠️ Setup

### 1️⃣ Create a Schema File

Before using **dotenv-constraint**, you must create a `.env.schema` file to **define expected environment variables and their types**.

#### Example `.env.schema` File:

```sh
DB_USERNAME=                  # Required
SERVICE=                      # Required
DB_PORT= #number              # Required and must be a number
NB_LICENSE= #optional#number  # Optional and must be a number if provided
```

📌 **Schema Rules**:

- **Required variable**: Any variable without `#optional` is mandatory.
- **Optional variable**: Add `#optional` to indicate that a variable is not required.
- **Type constraints**: Use `#number` to enforce numeric values.
- **Optional + Type combination**: Use `#optional#number` for variables that can be omitted but must be numeric if defined.

### 2️⃣ Create an `.env` File

Add your environment variables in a `.env` file:

```sh
DB_USERNAME=admin
SERVICE=some_api_key
DB_PORT=5432
NB_LICENSE=50
```

### 3️⃣ Validate Environment Variables

Add the following script to your code to validate environment variables:

#### ESM (ECMAScript Modules)

```js
import { validateEnv } from 'dotenv-constraint'
```

#### CommonJS (Traditional Node.js Modules)

```js
const { validateEnv } = require('dotenv-constraint')
```

Then, call the function:

```js
const { success, errors } = validateEnv({
  dotenvPath: '.env',
  schemaPath: '.env.schema',
})

if (!success) {
  console.error('❌ Environment validation failed:', errors)
}
```

## ⚙️ API

### `validateEnv(config?: { dotenvPath?: string; schemaPath?: string })`

- **dotenvPath** (optional, default: `.env`): Path to the `.env` file containing the environment variables.
- **schemaPath** (optional, default: `.env.schema`): Path to the schema file defining expected variables.

### Return Value

If validation fails, the function returns an error object:

```ts
{
  success: false,
  errors: [
    {
      variable: "DB_USERNAME"
      code: "empty",
    },
    {
      variable: "DB_PORT",
      code: "invalid_type",
      expected: "number"
    }
  ]
}
```

### Error Handling

If errors are detected, you can stop your application:

```ts
if (!success) {
  console.error(errors)
}
```

## 🤝 Contributing

Contributions are welcome! Feel free to submit issues or pull requests. 🛠️

## 📜 License

MIT
