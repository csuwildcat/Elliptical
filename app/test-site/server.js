const Koa = require('koa');
const Router = require('koa-router');
const Logger = require('koa-logger');
const BodyParser = require('koa-body');
const Static = require('koa-static');
const Session = require('koa-session');
const randomBytes = require('@consento/sync-randombytes');
const Storage = import('./js/storage.mjs');

const PORT = 1338;
const SESSION_CONFIG = {
  key: 'koa.sess',
  maxAge: 1000 * 60 * 0.25 // last number is minutes
}

const app = new Koa();
const router = new Router();

const challenges = {};

function setChallenge(ctx){
  let val = ctx.session['did-connect-challenge'];
  if (!val) {
    val = ctx.session['did-connect-challenge'] = randomBytes(new Uint8Array(16)).join('');
    challenges[value] = true;
    console.log(val);
  }
}

router.use((ctx, next) => {
  setChallenge(ctx);
  next();
});

// Response to GET requests
router.get('/test', async (ctx) => {
  ctx.body = 'Hello, World!\n';
});

router.get('/did-connect', async (ctx) => {
  ctx.body = [
    ctx.session['did-connect-challenge'],
    {
      "prompt": true,
      "methods": ["ion", "elem"]
    }
  ];
});


app.keys = ['testing123'];

app.on('session:invalid', args => {
  console.log(args);
  setChallenge(args.ctx);
})

app.on('session:expired', args => {
  console.log(args);
  setChallenge(args.ctx);
})

app.use(Session(SESSION_CONFIG, app));
app.use(Static('./'));
app.use(Logger());
app.use(BodyParser());
app.use(router.routes()).use(router.allowedMethods());
app.listen(PORT, () => {
  console.log('Server running on port ' + PORT);
});