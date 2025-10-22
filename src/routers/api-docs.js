import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const swaggerFilePath = path.join(__dirname, '../../docs/swagger.json');
let swaggerDocument;

try {
  const swaggerFile = fs.readFileSync(swaggerFilePath, 'utf8');
  swaggerDocument = JSON.parse(swaggerFile);
} catch (error) {
  console.warn(
    'Swagger documentation not found. Run "npm run build-docs" first.',
  );
  swaggerDocument = {};
}

const options = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Contacts API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
  },
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(swaggerDocument, options));

export default router;
