import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.contentType('text/html');
  res.send(
    Buffer.from(`
    <body>
    <div style="display: flex;
    justify-content: center;
    align-items: center;
    font-family: sans-serif;
    height: 100%;">
    <p>
    <h1 > ASE - Group </h1>
    </p>
    </div>
    </body>`),
  );
});

export const homeRoutes: Router = router;
