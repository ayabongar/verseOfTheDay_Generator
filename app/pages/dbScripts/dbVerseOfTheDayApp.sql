CREATE DATABASE BibleApp;

USE BibleApp;

CREATE TABLE USERS (
    id INT PRIMARY KEY IDENTITY(1,1),
    username VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE VERSES (
    id INT PRIMARY KEY IDENTITY(1,1),
    text TEXT NOT NULL,
    reference VARCHAR(255) NOT NULL,
    created_at DATETIME DEFAULT GETDATE()
);

CREATE TABLE FAVORITES (
    id INT PRIMARY KEY IDENTITY(1,1),
    user_id INT NOT NULL,
    verse_id INT NOT NULL,
    created_at DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES USERS(id),
    FOREIGN KEY (verse_id) REFERENCES VERSES(id)
);


-- Insert test data into USERS table
INSERT INTO USERS (username, password) 
VALUES 
    ('user1', 'password1'),
    ('user2', 'password2'),
    ('user3', 'password3'),
    ('user4', 'password4'),
    ('user5', 'password5');

-- Insert test data into VERSES table
INSERT INTO VERSES (text, reference) 
VALUES
    ('For God so loved the world that he gave his one and only Son, that whoever believes in him shall not perish but have eternal life.', 'John 3:16'),
    ('Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to him, and he will make your paths straight.', 'Proverbs 3:5-6'),
    ('The Lord is my shepherd, I lack nothing. He makes me lie down in green pastures, he leads me beside quiet waters, he refreshes my soul.', 'Psalm 23:1-3a'),
    ('I can do all this through him who gives me strength.', 'Philippians 4:13'),
    ('Rejoice always, pray continually, give thanks in all circumstances; for this is God’s will for you in Christ Jesus.', '1 Thessalonians 5:16-18');

-- Insert test data into FAVORITES table
INSERT INTO FAVORITES (user_id, verse_id) 
VALUES
    (1, 1),
    (1, 2),
    (2, 1),
    (2, 4),
    (3, 3),
    (4, 5),
    (5, 2),
    (5, 3),
    (5, 4);
