#! /usr/bin/env node
"use strict"
const fs = require("fs")
const path = require("path")
const cp = require("child_process")
const inquirer = require("inquirer")
const eslintrc = require("../assets/eslintrc.json")
const prettierrc = require("../assets/prettierrc.json")

const argv = process.argv
let packages = {
  tailwindCSS: ["tailwindcss", "postcss", "autoprefixer", "eslint-plugin-tailwindcss"],
  eslint: ["eslint-config-next", "eslint-config-prettier", "eslint-plugin-prettier", "prettier"],
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

const questions = [
  {
    type: "confirm",
    name: "tailwindCSS",
    message: "Do you use TailwindCSS?",
    default: true,
  },
  {
    type: "confirm",
    name: "nextJS",
    message: "Do you use nextJS?",
    default: true,
  },
  {
    type: "confirm",
    name: "husky",
    message: "Do you want to auto format code before commit?",
    default: true,
  },
]

if (argv.length > 3 || argv.length <= 2) {
  console.error("Insert only project path as param")
  process.exit(1)
} else {
  const projectPath = path.resolve(argv[2])
  inquirer.prompt(questions).then((answers) => {
    console.log("Installig packages...")
    cp.execSync(
      `npm i -D --prefix ${projectPath} ${packages.airbnb
        .map((e) => e.concat("@latest"))
        .join(" ")}`
    )
    cp.execSync(
      `npm i -D --prefix ${projectPath} ${packages.eslint
        .map((e) => e.concat("@latest"))
        .join(" ")}`
    )
    try {
      fs.writeFileSync(`${projectPath}/.eslintrc.json`, JSON.stringify(eslintrc, null, "  "))
      fs.writeFileSync(`${projectPath}/.prettierrc.json`, JSON.stringify(prettierrc, null, "  "))
    } catch (err) {
      console.error(err)
    }
    if (answers.tailwindCSS) {
      cp.execSync(
        `npm i -D --prefix ${projectPath} ${packages.tailwindCSS
          .map((e) => e.concat("@latest"))
          .join(" ")}`
      )
      cp.execSync(`cd ${projectPath} && npx tailwindcss init -p`)
    }
    if (answers.husky) {
      let pkJSON = JSON.parse(fs.readFileSync(`${projectPath}/package.json`))
      cp.execSync(`cd ${projectPath} && npx mrm@2 lint-staged`)
    }
    cp.execSync(`cd ${process.env.PWD}`)
  })
}
