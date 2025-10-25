const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  console.log(`${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`${description} concluído\n`);
  } catch (error) {
    console.error(`Erro em: ${description}`);
    console.error(error.message);
    process.exit(1);
  }
}

function checkPackagesBuilt() {
  const typesDist = path.join(__dirname, '../packages/types/dist');
  const utilsDist = path.join(__dirname, '../packages/utils/dist');
  return fs.existsSync(typesDist) && fs.existsSync(utilsDist);
}

function checkNodeModules() {
  return fs.existsSync(path.join(__dirname, '../node_modules'));
}

async function setup() {
  if (!checkNodeModules()) {
    runCommand('yarn install', 'Instalando dependências');
  } else {
    console.log('Dependências já instaladas\n');
  }

  if (!checkPackagesBuilt()) {
    runCommand('yarn workspace @repo/types build', 'Construindo package de tipos');
    runCommand('yarn workspace @repo/utils build', 'Construindo package de utilitários');
  } else {
    console.log('Packages compartilhados já construídos\n');
  }

  console.log('Setup concluído!');
  console.log('   yarn start     - Subir serviços');
  console.log('   yarn start:dev - Subir + logs');
}

setup();
