create database url_shortener;
\c url_shortener;

create table users(
    username varchar(25) primary key,
    password varchar(255)
);

create table short_url(
    short_url varchar(10) primary key,
    long_url varchar(1000),
    username varchar(25) references users(username)
);
