#! /usr/bin/env node
"use strict"
const fs = require("fs")
const path = require("path")
const cp = require("child_process")
const inquirer = require("inquirer")
const eslintrc = require("../assets/eslintrc.json")
const prettierrc = require("../assets/prettierrc.json")

const argv = process.argv
let packages = [
  "eslint-config-next@latest",
  "eslint-config-prettier@latest",
  "eslint-plugin-import@latest",
  "eslint-plugin-prettier@latest",
  "eslint-plugin-tailwindcss@latest",
  "prettier@latest",
]

const questions = [
  {
    type: "confirm",
    name: "tailwindCSS",
    message: "Will you use TailwindCSS? (y)",
    default: "y",
    validate(val) {
      if (val !== "y" || val !== "n") {
        return "Please enter y or n"
      }
      return val
    },
  },
  {
    type: "confirm",
    name: "nextJS",
    message: "Do you use nextJS? (y)",
    default: "y",
    validate(val) {
      if (val !== "y" || val !== "n") {
        return "Please enter y or n"
      }
      return val
    },
  },
  {
    type: "confirm",
    name: "typescript",
    message: "Do you use Typescript? (y)",
    default: "y",
    validate(val) {
      if (val !== "y" || val !== "n") {
        return "Please enter y or n"
      }
      return val
    },
  },
]

if (argv.length <= 2) {
  console.error("Insert only project path as param")
  process.exit(1)
} else {
  const projectPath = path.resolve(argv[2])
  inquirer.prompt(questions).then((answers) => {
    console.log("npx install-peerdeps --dev eslint-config-airbnb")
    if (answers.tailwindCSS) {
      console.log(`npm i -D --prefix ${projectPath} eslint-plugin-tailwindcss@latest`)
    }
    console.log(`npm i -D --prefix ${projectPath} ${packages.join(" ")}`)
  })

  //   try {
  //     console.log("Installig packages...")
  //     cp.execSync(`npm i -D --prefix ${projectPath} ${packages.join(" ")}`)
  //     fs.writeFileSync(`${projectPath}/.eslintrc.json`, JSON.stringify(eslintrc, null, "  "))
  //     fs.writeFileSync(`${projectPath}/.prettierrc.json`, JSON.stringify(prettierrc, null, "  "))
  //     console.log("To complete the installation, run:")
  //     console.log("npm i -D " + packages.join(" "))
  //   } catch (err) {
  //     console.error(err)
  //   }
}
