import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

/**
 * Crée un client S3 avec les credentials fournis
 */
function createS3Client(awsConfig: {
  accessKeyId?: string;
  secretAccessKey?: string;
  region?: string;
}): S3Client | null {
  if (!awsConfig.accessKeyId || !awsConfig.secretAccessKey) {
    return null;
  }

  return new S3Client({
    region: awsConfig.region || 'eu-west-1',
    credentials: {
      accessKeyId: awsConfig.accessKeyId,
      secretAccessKey: awsConfig.secretAccessKey,
    },
    // Pour Cloudflare R2, ajouter endpoint
    // endpoint: 'https://<account-id>.r2.cloudflarestorage.com',
  });
}

/**
 * Upload un fichier vers S3 (optionnel - retourne null si non configuré)
 */
export async function uploadToS3(
  buffer: Buffer,
  key: string,
  contentType: string | undefined,
  awsConfig: {
    accessKeyId?: string;
    secretAccessKey?: string;
    bucket?: string;
    region?: string;
  }
): Promise<string | null> {
  if (!awsConfig.accessKeyId || !awsConfig.secretAccessKey || !awsConfig.bucket) {
    console.warn('⚠️ S3 non configuré - upload ignoré');
    return null;
  }

  const s3Client = createS3Client(awsConfig);
  if (!s3Client) {
    return null;
  }

  try {
    const command = new PutObjectCommand({
      Bucket: awsConfig.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType || 'application/octet-stream',
      // ACL: 'private', // Les fichiers sont privés par défaut
    });

    await s3Client.send(command);

    // Générer l'URL (adapté selon votre configuration)
    const region = awsConfig.region || 'eu-west-1';
    const url = `https://${awsConfig.bucket}.s3.${region}.amazonaws.com/${key}`;
    
    return url;
  } catch (error) {
    console.error('Erreur upload S3:', error);
    throw new Error('Impossible d\'uploader le fichier');
  }
}

/**
 * Télécharge un fichier depuis S3
 */
export async function downloadFromS3(
  key: string,
  awsConfig: {
    accessKeyId?: string;
    secretAccessKey?: string;
    bucket?: string;
    region?: string;
  }
): Promise<Buffer> {
  if (!awsConfig.accessKeyId || !awsConfig.secretAccessKey || !awsConfig.bucket) {
    throw new Error('Configuration S3 manquante');
  }

  const s3Client = createS3Client(awsConfig);
  if (!s3Client) {
    throw new Error('Impossible de créer le client S3');
  }

  try {
    const command = new GetObjectCommand({
      Bucket: awsConfig.bucket,
      Key: key,
    });

    const response = await s3Client.send(command);
    
    if (!response.Body) {
      throw new Error('Fichier vide');
    }

    const chunks: Uint8Array[] = [];
    for await (const chunk of response.Body as any) {
      chunks.push(chunk);
    }

    return Buffer.concat(chunks);
  } catch (error) {
    console.error('Erreur download S3:', error);
    throw new Error('Impossible de télécharger le fichier');
  }
}

/**
 * Supprime un fichier de S3
 */
export async function deleteFromS3(
  key: string,
  awsConfig: {
    accessKeyId?: string;
    secretAccessKey?: string;
    bucket?: string;
    region?: string;
  }
): Promise<void> {
  if (!awsConfig.accessKeyId || !awsConfig.secretAccessKey || !awsConfig.bucket) {
    throw new Error('Configuration S3 manquante');
  }

  const s3Client = createS3Client(awsConfig);
  if (!s3Client) {
    throw new Error('Impossible de créer le client S3');
  }

  try {
    const command = new DeleteObjectCommand({
      Bucket: awsConfig.bucket,
      Key: key,
    });

    await s3Client.send(command);
  } catch (error) {
    console.error('Erreur suppression S3:', error);
    throw new Error('Impossible de supprimer le fichier');
  }
}

/**
 * Génère une URL signée pour accéder temporairement à un fichier privé
 */
export async function getSignedUrl(
  key: string,
  awsConfig: {
    bucket?: string;
    region?: string;
  },
  expiresIn: number = 3600
): Promise<string> {
  // TODO: Implémenter avec getSignedUrlCommand si nécessaire
  // Pour l'instant, on retourne l'URL publique si les fichiers sont publics
  const region = awsConfig.region || 'eu-west-1';
  return `https://${awsConfig.bucket}.s3.${region}.amazonaws.com/${key}`;
}

