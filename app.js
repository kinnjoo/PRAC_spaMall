const express = require('express');
const { Server } = require('http');
const socketIo = require('socket.io');

const cookieParser = require('cookie-parser');
const goodsRouter = require('./routes/goods.js');
const usersRouter = require('./routes/users.js');
const authRouter = require('./routes/auth.js');
const connect = require('./schemas');

const app = express();
const http = Server(app);
const io = socketIo(http);
const port = 3000;

connect();

// Socket이 접속했을 때, 해당하는 콜백 함수가 실행된다.
io.on('connection', (sock) => {
  console.log('새로운 소켓이 연결되었습니다.');

  // 1. 클라이언트가 상품을 구매했을 때, 발생하는 이벤트
  sock.on('BUY', (data) => {
    const { nickname, goodsId, goodsName } = data;

    // 2. emit 데이터 만들기
    const emitData = {
      nickname,
      goodsId,
      goodsName,
      date: new Date().toISOString(),
    };

    // 3. 클라이언트가 구매한 정보를 바탕으로 BUY_GOODS 메시지 전달 (소켓에 접속한 모든 사용자)
    io.emit('BUY_GOODS', emitData);
  });

  sock.on('disconnect', () => {
    console.log(`${sock.id}에 해당하는 사용자가 연결을 종료하였습니다.`);
  });
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static('assets'));
app.use('/api', [goodsRouter, usersRouter, authRouter]);

app.get('/', (req, res) => {
  res.send('Hello World!');
});

http.listen(port, () => {
  console.log(port, '포트로 서버가 열렸어요!');
});
