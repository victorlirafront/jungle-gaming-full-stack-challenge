const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function rebuildPackages() {
  console.log('Detectada mudança nos packages, reconstruindo...');
  try {
    execSync('yarn workspace @repo/types build', { stdio: 'inherit' });
    execSync('yarn workspace @repo/utils build', { stdio: 'inherit' });
    console.log('Packages reconstruídos\n');
  } catch (error) {
    console.error('Erro ao reconstruir packages:', error.message);
  }
}

function watchPackages() {
  const typesSrc = path.join(__dirname, '../packages/types/src');
  const utilsSrc = path.join(__dirname, '../packages/utils/src');
  
  console.log('Monitorando mudanças nos packages...');
  
  if (fs.existsSync(typesSrc)) {
    fs.watch(typesSrc, { recursive: true }, (eventType, filename) => {
      if (filename && (filename.endsWith('.ts') || filename.endsWith('.js'))) {
        rebuildPackages();
      }
    });
  }
  
  if (fs.existsSync(utilsSrc)) {
    fs.watch(utilsSrc, { recursive: true }, (eventType, filename) => {
      if (filename && (filename.endsWith('.ts') || filename.endsWith('.js'))) {
        rebuildPackages();
      }
    });
  }
}

watchPackages();
console.log('Modo de desenvolvimento ativo!');
console.log('Edite os arquivos em packages/ e eles serão reconstruídos automaticamente');
console.log('Pressione Ctrl+C para parar\n');
