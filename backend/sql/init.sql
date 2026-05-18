-- 데이터베이스 초기 생성 SQL문

CREATE DATABASE onai
DEFAULT CHARACTER SET utf8mb4
DEFAULT COLLATE utf8mb4_unicode_ci;

USE onai;

CREATE TABLE USERS (
    usernum INT NOT NULL AUTO_INCREMENT,
    id VARCHAR(20) NOT NULL UNIQUE,
    pwd VARCHAR(255) NOT NULL,
    nickname VARCHAR(30) NOT NULL UNIQUE,
    parents_name VARCHAR(20) NOT NULL,
    parents_birth DATE NOT NULL,
    parents_gender VARCHAR(10) NOT NULL,
    parents_mbti CHAR(4),
    email VARCHAR(100) NOT NULL UNIQUE,
    region VARCHAR(50) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (usernum)
);

CREATE TABLE POSTS (
    postnum INT NOT NULL AUTO_INCREMENT,
    p_title VARCHAR(50) NOT NULL,
    p_content TEXT NOT NULL,
    p_user INT NOT NULL,
    p_region_tag VARCHAR(100) NOT NULL,
    p_category_tag VARCHAR(20) NOT NULL,
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

CREATE TABLE CHILDREN (
	childnum INT AUTO_INCREMENT,
	parentsnum INT NOT NULL,
	child_name VARCHAR(15) NOT NULL,
	child_birth DATE NOT NULL,
	child_gender VARCHAR(10) NOT NULL,

	PRIMARY KEY (childnum),
	
	CONSTRAINT fk_children_user
		FOREIGN KEY (parentsnum) REFERENCES USERS (usernum),
	CONSTRAINT uq_children_parent_name_birth
        	UNIQUE (parentsnum, child_name, child_birth)
);

CREATE TABLE USER_INTEREST_REGIONS (
	interest_regionnum INT AUTO_INCREMENT,
	interest_region_user INT NOT NULL,
	region_name VARCHAR(100) NOT NULL,

	PRIMARY KEY (interest_regionnum),
	CONSTRAINT fk_interest_region_user
		FOREIGN KEY (interest_region_user) 
        REFERENCES USERS (usernum),

	UNIQUE (interest_region_user, region_name)
);

CREATE TABLE USER_INTERESTS (
	interestnum INT AUTO_INCREMENT,
	interest_user INT NOT NULL,
	interest_name VARCHAR(100) NOT NULL,

	PRIMARY KEY (interestnum),
	CONSTRAINT fk_interests_user
		FOREIGN KEY (interest_user) REFERENCES USERS (usernum),
	
	UNIQUE (interest_user, interest_name)
);


CREATE TABLE POST_LIKES (
	likenum INT AUTO_INCREMENT,
	like_postnum INT NOT NULL,
	like_usernum INT NOT NULL,
	like_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

	PRIMARY KEY (likenum),
	CONSTRAINT fk_like_posts
		FOREIGN KEY (like_postnum) 
        REFERENCES POSTS (postnum) 
        ON DELETE CASCADE,
	CONSTRAINT fk_like_post_user
		FOREIGN KEY (like_usernum) 
        REFERENCES USERS (usernum),

	UNIQUE (like_postnum, like_usernum)
);

CREATE TABLE PHOTO_IMAGES (
    imagenum INT AUTO_INCREMENT,
    image_postnum INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    image_created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (imagenum),
    CONSTRAINT fk_photo_image_post
        FOREIGN KEY (image_postnum) REFERENCES POSTS(postnum)
        ON DELETE CASCADE
);