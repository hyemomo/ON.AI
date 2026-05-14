# 해당 SQL문 실행시 커뮤니티 기능의 DB 구조를 생성할 수 있습니다.

CREATE TABLE USERS (
	usernum INT NOT NULL AUTO_INCREMENT,
    id VARCHAR(20) NOT NULL UNIQUE,
    pwd VARCHAR(30) NOT NULL,
    nickname VARCHAR(30) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usernum)
    );

CREATE TABLE POSTS (
	postnum INT AUTO_INCREMENT,
    p_title VARCHAR (50) NOT NULL,
    p_content TEXT NOT NULL,
    p_user INT NOT NULL,
    p_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (postnum),
    FOREIGN KEY (p_user) REFERENCES USERS (usernum)
    );

CREATE TABLE COMMENTS (
	commentnum INT AUTO_INCREMENT,
    c_content VARCHAR (255) NOT NULL,
    c_user INT NOT NULL,
    c_post INT NOT NULL,
    c_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (commentnum),
    FOREIGN KEY (c_user) REFERENCES USERS (usernum),
    FOREIGN KEY (c_post) REFERENCES POSTS (postnum)
    );

# 아래 쿼리문부터는 위의 쿼리문을 실행하여 테이블이 이미 생성된 것을 전재로 작성했습니다.
# 위의 쿼리문을 실행하지 않은 상태로 게시글과 댓글의 수정/삭제 기능까지 구현하기 위해선 가장 하단의 '최종 쿼리문'을 사용해 주세요.

# 게시글/댓글 수정을 위한 칼럼 추가 (수정일)
ALTER TABLE POSTS
ADD COLUMN p_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE COMMENTS
ADD COLUMN c_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

# 외래키 제약조건 이름 변경을 위한 기존 외래키 삭제 및 신규 외래키 추가 (!필수X!)
## 1. 각 테이블의 외래키 제약조건 이름 확인
SHOW CREATE TABLE POSTS;
SHOW CREATE TABLE COMMENTS;

## 2. 확인한 제약조건 이름을 기준으로 기존 외래키 삭제 및 신규 외래키 추가

ALTER TABLE POSTS
DROP FOREIGN KEY posts_ibfk_1;

ALTER TABLE POSTS
ADD CONSTRAINT fk_posts_user
FOREIGN KEY (p_user)
REFERENCES USERS(usernum);

ALTER TABLE COMMENTS
DROP FOREIGN KEY comments_ibfk_1;

ALTER TABLE COMMENTS
ADD CONSTRAINT fk_comments_user
FOREIGN KEY (c_user)
REFERENCES USERS(usernum);

# 게시글 삭제시 댓글 자동 삭제를 위한 기존 외래키 변경 (기존 외래키 이름 확인 필요)
ALTER TABLE COMMENTS
DROP FOREIGN KEY comments_ibfk_2;

ALTER TABLE COMMENTS
ADD CONSTRAINT fk_comments_post
FOREIGN KEY (c_post)
REFERENCES POSTS(postnum)
ON DELETE CASCADE;


=========================================================================================================


# 최종 쿼리문 (기존에 맨 위의 쿼리문을 입력하지 않았다면 이 쿼리문만 입력하세요.)
CREATE DATABASE onai;
USE onai;

CREATE TABLE USERS (
    usernum INT NOT NULL AUTO_INCREMENT,
    id VARCHAR(20) NOT NULL UNIQUE,
    pwd VARCHAR(30) NOT NULL,
    nickname VARCHAR(30) NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usernum)
);

CREATE TABLE POSTS (
    postnum INT NOT NULL AUTO_INCREMENT,
    p_title VARCHAR(50) NOT NULL,
    p_content TEXT NOT NULL,
    p_user INT NOT NULL,
    p_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    p_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (postnum),
    CONSTRAINT fk_posts_user
        FOREIGN KEY (p_user)
        REFERENCES USERS(usernum)
);

CREATE TABLE COMMENTS (
    commentnum INT NOT NULL AUTO_INCREMENT,
    c_content VARCHAR(255) NOT NULL,
    c_user INT NOT NULL,
    c_post INT NOT NULL,
    c_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    c_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (commentnum),
    CONSTRAINT fk_comments_user
        FOREIGN KEY (c_user)
        REFERENCES USERS(usernum),
    CONSTRAINT fk_comments_post
        FOREIGN KEY (c_post)
        REFERENCES POSTS(postnum)
        ON DELETE CASCADE
);