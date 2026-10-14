import express, { type Request, type Response, type NextFunction } from 'express';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const browserDistFolder = join(__dirname, '../browser');

const app = express();

// Static files (adjust path if your browser build outputs elsewhere)
app.use(express.static(browserDistFolder));

// Example middleware with proper typings
app.use((req: Request, res: Response, next: NextFunction) => {
  // Add your logic here
  next();
});

// Example API route (optional)
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true });
});

// Fallback to index.html for client routes
app.get('*', (_req: Request, res: Response) => {
  res.sendFile(join(browserDistFolder, 'index.html'));
});

const port = process.env['PORT'] ? Number(process.env['PORT']) : 4000;

app.listen(port, (error?: unknown) => {
  if (error) {
    console.error('Server start error:', error);
    process.exit(1);
  }
  console.log(`Server listening on http://localhost:${port}`);
});
