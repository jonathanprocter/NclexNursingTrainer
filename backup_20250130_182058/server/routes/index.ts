import express from 'express';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const routeFiles = fs.readdirSync(__dirname)
    .filter(file => file !== 'index.ts' && file.endsWith('.ts'));

for (const file of routeFiles) {
    const route = require(path.join(__dirname, file));
    router.use('/', route.default || route);
}

export default router;
