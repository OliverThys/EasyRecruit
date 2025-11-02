#!/usr/bin/env node

/**
 * Script pour générer des secrets sécurisés pour la production
 * Usage: node scripts/generate-secrets.js
 */

const crypto = require('crypto');

console.log('\n🔐 Génération de secrets sécurisés pour la production\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

// JWT_SECRET (256 bits = 32 bytes = 64 caractères hex)
const jwtSecret = crypto.randomBytes(32).toString('hex');
console.log('JWT_SECRET=' + jwtSecret);
console.log('   → Pour l\'authentification JWT (copiez cette valeur)\n');

// ENCRYPTION_KEY (256 bits = 32 bytes = 64 caractères hex)
const encryptionKey = crypto.randomBytes(32).toString('hex');
console.log('ENCRYPTION_KEY=' + encryptionKey);
console.log('   → Pour chiffrer les numéros de téléphone (copiez cette valeur)\n');

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('✅ IMPORTANT:');
console.log('   - Ces secrets sont générés aléatoirement');
console.log('   - Utilisez-les UNIQUEMENT en production');
console.log('   - Ne les partagez JAMAIS publiquement');
console.log('   - Sauvegardez-les dans un gestionnaire de mots de passe\n');

