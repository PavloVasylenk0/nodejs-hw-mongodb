import express from 'express';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

const loadSwaggerDocument = () => {
  const swaggerFilePath = path.join(__dirname, '../../docs/swagger.json');

  try {
    if (fs.existsSync(swaggerFilePath)) {
      const swaggerFile = fs.readFileSync(swaggerFilePath, 'utf8');
      const swaggerDocument = JSON.parse(swaggerFile);

      const isProduction = process.env.NODE_ENV === 'production';
      const currentDomain = isProduction
        ? `https://${
            process.env.RENDER_EXTERNAL_HOSTNAME || 'https://nodejs-hw-mongodb-9ho9.onrender.com'
          }`
        : `http://localhost:${process.env.PORT || 3000}`;

      swaggerDocument.servers = [
        {
          url: currentDomain,
          description: isProduction
            ? 'Production server'
            : 'Development server',
        },
      ];

      return swaggerDocument;
    }
  } catch (error) {
    console.warn(
      'Swagger documentation not found. Run "npm run build-docs" first.',
    );
  }

  return {
    openapi: '3.1.0',
    info: {
      title: 'Contacts API',
      version: '1.0.0',
      description:
        'API documentation will be available after running "npm run build-docs"',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Current server',
      },
    ],
  };
};

const options = {
  explorer: true,
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Contacts API Documentation',
  swaggerOptions: {
    persistAuthorization: true,
  },
};

router.use('/', swaggerUi.serve);
router.get('/', swaggerUi.setup(loadSwaggerDocument(), options));

export default router;
