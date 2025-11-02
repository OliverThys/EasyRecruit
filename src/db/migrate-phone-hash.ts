/**
 * Script de migration pour remplir le champ phoneHash
 * des candidats existants.
 * 
 * À exécuter après la migration Prisma qui ajoute le champ phoneHash.
 */

import prisma from '../config/database';
import { decryptData, hashPhoneNumber } from '../utils/encryption';

async function migratePhoneHashes() {
  console.log('🔄 Début de la migration phoneHash...');

  // Récupérer tous les candidats (le champ peut être vide string ou null selon la version)
  // Note: Cette migration est nécessaire uniquement si vous aviez des candidats avant l'ajout du champ phoneHash
  const candidates = await prisma.candidate.findMany();

  console.log(`📊 ${candidates.length} candidats à migrer`);

  let success = 0;
  let errors = 0;

  for (const candidate of candidates) {
    try {
      // Vérifier si le hash existe déjà (si migration partielle)
      if (candidate.phoneHash && candidate.phoneHash.length > 0) {
        continue; // Skip si déjà migré
      }

      // Déchiffrer le numéro
      const phoneNumber = decryptData(candidate.phoneNumber);
      
      // Générer le hash
      const phoneHash = hashPhoneNumber(phoneNumber);

      // Mettre à jour le candidat
      await prisma.candidate.update({
        where: { id: candidate.id },
        data: { phoneHash },
      });

      success++;
      if (success % 10 === 0) {
        console.log(`✅ ${success} candidats migrés...`);
      }
    } catch (error) {
      console.error(`❌ Erreur migration candidat ${candidate.id}:`, error);
      errors++;
    }
  }

  console.log(`\n✨ Migration terminée:`);
  console.log(`   - Succès: ${success}`);
  console.log(`   - Erreurs: ${errors}`);
}

// Exécuter
migratePhoneHashes()
  .catch((error) => {
    console.error('❌ Erreur fatale:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

