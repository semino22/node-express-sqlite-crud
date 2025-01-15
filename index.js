const express = require('express');
const app = express();
const port = 3000;

// 여기부터 sqlite db 사용해서 추가한 코드 (데이터 모델)
const { Sequelize, DataTypes } = require('sequelize');

const sequelize = new Sequelize({   // 시퀄라이즈 사용을 위한 객체 생성 및 변수에 할당
    dialect: 'sqlite',              // DB로 sqlite 사용용
    storage: 'database.sqlite'      // sqlite를 통해 관리되는 데이터 파일의 저장 경로 지정정
});

const Comments = sequelize.define('Comments', {
    content: {                  // content 칼럼의 데이터 타입과 기타 설정 정의
        type: DataTypes.STRING, // 데이터 타입을 STRING으로 정의의
        allowNull: false        // 데이터는 Null값 비허용. Null이면 오류 발생생
    }
});

(async () => {  // 설계한 모델에 맞게 DB에 테이블 생성
    await Comments.sync({ force: true });
    console.log("The table for the Use model was just (re)created!");
})();
// sqlite db관련 코드 끝


let comments = [];  // 댓글 데이터가 담기는 배열을 comments 변수에 할당
                    // 댓글이 등록될 때마다 데이터가 변경되므로 변수 상자 let 사용

app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.get('/', async(req, res) => {
    const comments = await Comments.findAll();  // findAll()함수로 데이터 조회 -> asysnc코드 추가
    res.render('index', { comments: comments }); // { 키: 배열 }
        // comments 테이블의 데이터 조회해서, comments 변수에 넣기
});

app.post('/create', async(req, res) => {
    console.log(req.body);
    const { content } = req.body;   // content를 name으로 갖는 데이터 가져오기
    const comment = await Comments.create({ content: content });
    // content 데이터를 comments 테이블의 content 칼럼에 입력하여 데이터 생성
    console.log(comment.id);    
    //comments.push(content);         // comments 배열에 데이터 넣어주기
    res.redirect('/');              // post 요청이 정상 처리되면 '/' 경로로 페이지 이동
});

// 게시글 수정하는 라우팅 규칙 추가
// update() 함수 사용할때는 async 코드 추가
// 라우팅 경로에서 데이터에 따라 가변 부분을 나타낼 때는 : 사용
app.post('/update/:id', async (req, res) => {
    console.log(req.params);
    console.log(req.body);
    const { id } = req.params;  // 파라미터에서 아이디값 가져오기기
    const { content } = req.body;

    // 테이블의 데이터 중 파라미터의 아이디값과 일치하는 것에 content값 덮어쓰기
    await Comments.update({ content: content }, { // 칼럼: 요청 본문
        where: {
            id: id // 칼럼: 파라미터
        }
    });
    res.redirect('/');
});

// 게시글 삭제하는 라우팅 규칙
app.post('/delete/:id', async (req, res) => {
    console.log(req.params);
    const { id } = req.params;
    await Comments.destroy({
        where: {
            id: id
        }
    });
    res.redirect('/');
});


app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});