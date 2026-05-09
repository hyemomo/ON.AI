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