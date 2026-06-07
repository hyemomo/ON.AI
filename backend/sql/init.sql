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

CREATE TABLE IF NOT EXISTS MATCHING_REQUESTS (
    request_id INT NOT NULL AUTO_INCREMENT,
    requester_usernum INT NOT NULL,
    receiver_usernum INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING',
    message VARCHAR(255),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responded_at DATETIME,

    PRIMARY KEY (request_id),

    CONSTRAINT fk_matching_requests_requester
        FOREIGN KEY (requester_usernum) REFERENCES USERS(usernum),
    CONSTRAINT fk_matching_requests_receiver
        FOREIGN KEY (receiver_usernum) REFERENCES USERS(usernum),

    CONSTRAINT uq_matching_request_pair
        UNIQUE (requester_usernum, receiver_usernum)
);

CREATE TABLE IF NOT EXISTS MATCHES (
    match_id INT NOT NULL AUTO_INCREMENT,
    user1_usernum INT NOT NULL,
    user2_usernum INT NOT NULL,
    matching_request_id INT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (match_id),

    CONSTRAINT fk_matches_user1
        FOREIGN KEY (user1_usernum) REFERENCES USERS(usernum),
    CONSTRAINT fk_matches_user2
        FOREIGN KEY (user2_usernum) REFERENCES USERS(usernum),
    CONSTRAINT fk_matches_matching_request
        FOREIGN KEY (matching_request_id) REFERENCES MATCHING_REQUESTS(request_id),

    CONSTRAINT uq_match_user_pair
        UNIQUE (user1_usernum, user2_usernum)
);

CREATE TABLE IF NOT EXISTS CHAT_ROOMS (
    room_id INT NOT NULL AUTO_INCREMENT,
    match_id INT NOT NULL UNIQUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_message_at DATETIME,

    PRIMARY KEY (room_id),

    CONSTRAINT fk_chat_rooms_match
        FOREIGN KEY (match_id) REFERENCES MATCHES(match_id)
);

CREATE TABLE IF NOT EXISTS CHAT_MESSAGES (
    message_id INT NOT NULL AUTO_INCREMENT,
    room_id INT NOT NULL,
    sender_usernum INT NOT NULL,
    content VARCHAR(1000) NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (message_id),

    CONSTRAINT fk_chat_messages_room
        FOREIGN KEY (room_id) REFERENCES CHAT_ROOMS(room_id),
    CONSTRAINT fk_chat_messages_sender
        FOREIGN KEY (sender_usernum) REFERENCES USERS(usernum)
);