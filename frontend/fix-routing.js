const fs = require('fs');
const path = require('path');

const dirToDelete = path.join(__dirname, 'app', 'dashboard');

if (fs.existsSync(dirToDelete)) {
  fs.rmSync(dirToDelete, { recursive: true, force: true });
  console.log('✓ Deleted conflicting /dashboard route');
} else {
  console.log('⚠ /dashboard directory not found');
}
