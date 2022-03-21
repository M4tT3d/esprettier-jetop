#! /usr/bin/env node
"use strict"
const fs = require("fs")
const path = require("path")
const cp = require("child_process")
const inquirer = require("inquirer")
const eslintrc = require("../assets/eslintrc.json")
const prettierrc = require("../assets/prettierrc.json")

const argv = process.argv
const packages = {
  tailwindCSS: ["tailwindcss", "postcss", "autoprefixer", "eslint-plugin-tailwindcss"],
  eslint: ["eslint-config-prettier", "eslint-plugin-prettier", "prettier"],
  typescript: ["typescript", "@types/react", "@types/node"],
  airbnb: [
    "eslint",
    "eslint-plugin-import",
    "eslint-plugin-jsx-a11y",
    "eslint-plugin-react",
    "eslint-plugin-react-hooks",
    "eslint-config-airbnb",
  ],
}
const lintStagedNoTs = {
  "*.js": "eslint --cache --fix",
  "*.{js,css,md}": "prettier --write",
}
const lintStagedTs = {
  "*.{js,jsx,ts,tsx}": "eslint --cache --fix",
  "*.{js,jsx,ts,tsx,css,md}": "prettier --write",
}

const questions = [
  {
    type: "confirm",
    name: "nextJS",
    message: "Do you use nextJS?",
    default: false,
  },
  {
    type: "confirm",
    name: "ts",
    message: "Do you use Typescript?",
    default: true,
  },
  {
    type: "confirm",
    name: "tailwindCSS",
    message: "Do you use TailwindCSS?",
    default: false,
  },
  {
    type: "confirm",
    name: "husky",
    message: "Do you want to auto format code before commit?",
    default: true,
  },
  {
    type: "confirm",
    name: "confirm",
    message:
      "This will overwrite your eslintrc, prettierrc and tsconfig files. Do you want to continue?",
    default: false,
  },
]

if (argv.length > 3 || argv.length <= 2) {
  console.error("Insert only project path as param")
  process.exit(-1)
} else {
  const projectPath = path.resolve(argv[2])
  inquirer.prompt(questions).then((answers) => {
    if (!answers.confirm) {
      process.exit(1)
    }
    console.log("Installig packages...")
    if (answers.nextJS) {
      if (fs.existsSync(`${projectPath}/next.config.js`)) {
        eslintrc.extends.unshift("next/core-web-vitals")
        cp.spawnSync("npm", ["i", "-D", "eslint-config-next@latest"], {
          stdio: "inherit",
          cwd: projectPath,
        })
      }
    }
    if (answers.ts) {
      eslintrc.plugins.push("@typescript-eslint")
      eslintrc.extends.push("plugin:@typescript-eslint/recommended")
      eslintrc["parser"] = "@typescript-eslint/parser"
      if (answers.nextJS && !fs.existsSync(`${projectPath}/tsconfig.json`)) {
        try {
          fs.writeFileSync(`${projectPath}/tsconfig.json`, "")
        } catch (err) {
          console.log(err)
        }
      }
      cp.spawnSync(
        "npm",
        ["i", "-D", "@typescript-eslint/parser@latest", "@typescript-eslint/eslint-plugin@latest"],
        {
          stdio: "inherit",
          cwd: projectPath,
        }
      )
    }
    if (answers.tailwindCSS) {
      cp.spawnSync("npm", ["i", "-D", ...packages.tailwindCSS.map((e) => e.concat("@latest"))], {
        stdio: "inherit",
        cwd: projectPath,
      })
      cp.spawnSync("npx", ["tailwind", "init", "-p"], {
        stdio: "inherit",
        cwd: projectPath,
      })
      eslintrc.extends.push("plugin:tailwindcss/recommended")
      eslintrc.plugins.push("tailwindcss")
      eslintrc.rules["tailwindcss/classnames-order"] = 0
    }
    if (answers.husky) {
      cp.spawnSync("npx", ["mrm@2", "lint-staged"], {
        stdio: "inherit",
        cwd: projectPath,
      })
      let pkJSON = JSON.parse(fs.readFileSync(`${projectPath}/package.json`))
      if (answers.ts) {
        pkJSON["lint-staged"] = lintStagedTs
      } else {
        pkJSON["lint-staged"] = lintStagedNoTs
      }
      try {
        fs.writeFileSync(`${projectPath}/package.json`, JSON.stringify(pkJSON, null, 2))
      } catch (err) {
        console.log(err)
      }
    }
    cp.spawnSync("npm", ["i", "-D", ...packages.airbnb.map((e) => e.concat("@latest"))], {
      stdio: "inherit",
      cwd: projectPath,
    })
    cp.spawnSync("npm", ["i", "-D", ...packages.eslint.map((e) => e.concat("@latest"))], {
      stdio: "inherit",
      cwd: projectPath,
    })
    try {
      fs.writeFileSync(`${projectPath}/.eslintrc.json`, JSON.stringify(eslintrc, null, 2))
      fs.writeFileSync(`${projectPath}/.prettierrc.json`, JSON.stringify(prettierrc, null, 2))
    } catch (err) {
      console.error(err)
    }
  })
}
