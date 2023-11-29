create database nftDB;
use nftdb;

create table User(
    user_id int primary key,
    f_name varchar(20) unique not null,
    l_name varchar(20),
    date_of_join date,
    wallet_value int
);

create table NFT(
    NFT_id int primary key,
    genre varchar(20),
    celebrity varchar(20),
    descr varchar(20),
    price int
);

create table portfolio(
    user_id int,
     foreign key (user_id) references User(user_id),
    NFT_id int ,
    foreign key(NFT_id) references NFT(NFT_id)
);

create table creator(
    user_id int ,
    foreign key (user_id) references User(user_id),
    income int
);

create table collection(
    collection_id int primary key unique not null,
    commission int,
    quantity int,
    user_name varchar(20),
    foreign key (user_name) references User(f_name),
    creator_id int,
    foreign key(creator_id) references creator(user_id)
);

create table collection_nft_id(
    collection_id int,
     foreign key (collection_id) references collection(collection_id),
    NFT_id int,
    foreign key (NFT_id) references NFT(NFT_id)
);


create table NFT_features(
    NFT_id int ,
    foreign key (NFT_id) references NFT(NFT_id),
    feature varchar(20),feature_num int primary key
);


create table Transaction(
    transaction_id int primary key,
    buyer_id int,
     foreign key (buyer_id) references User(user_id),
    seller_id int,
     foreign key (seller_id) references User(user_id),
    NFT_id int ,
    foreign key (NFT_id) references NFT(NFT_id),
    date_of_transaction date,
    price int,
    BlockChain_id varchar(20)
);

create table Auction(
    auction_id int primary key,
    Duration int,
    starttime timestamp,
    Base_price int,
    Bid_price int,
    NFT_id int ,
    foreign key (NFT_id) references NFT(NFT_id)
);

create table Bid(
    user_id int, auction_id int,bid_number int ,
    foreign key (user_id) references User(user_id),
    foreign key (auction_id) references Auction(auction_id),

    primary key(auction_id, bid_number)
);


show tables;
truncate User;



insert into User values (1023121, 'Alison', 'Burgers', '2021-01-01', 10000);
insert into User values (1023122, 'Brett', 'Lee', '2021-01-01', 10000);

insert into creator values (1023121, 10000);
insert into creator values (1023122, 10000);

select * from creator;

select * from User;

desc collection;

insert into collection values (030, 10, 100, 'Alison', 1023121);
insert into collection values (031, 10, 100, 'Brett', 1023122);

select * from nft;


desc nft;

insert into NFT values(21656, 'Sports', 'Virat Kohli', 'Cricket', 1000);
insert into NFT values(21657, 'Racing', 'Lewis Hamilton', 'F1 Racing', 1000);

insert into collection_nft_id values (030, 21656);
insert into collection_nft_id values (031, 21657);

insert into NFT_features values (21656, 'Sports',1);
insert into NFT_features values (21657, 'Racing',2);

insert into Transaction values (3301, 1023121, 1023122, 21656, '2021-01-01', 1000, '123456789');
insert into Transaction values (2202, 1023122, 1023121, 21657, '2021-01-01', 1000, '123456789');



insert into Auction values (1001, 10, '2021-01-01', 1000, 1000, 21656);
insert into Auction values (1002, 10, '2021-01-01', 1000, 1000, 21657);

select * from bid;

insert into Bid values (1023121, 1001, 1);
insert into Bid values (1023122, 1002, 2);

select * from User;
select * from creator;
select * from collection;
truncate User;

show tables;
select * from auction;

drop table keytable;
create table keytable(user_id int ,transaction_id int,auction_id int,creator_id int ,collection_id int ,feature_num int,bid_number int,

 foreign key(user_id) references User(user_id),
 foreign key(transaction_id) references Transaction(transaction_id),
 foreign key(auction_id) references Auction(auction_id),
 foreign key(creator_id) references Creator(user_id),
 foreign key(collection_id) references Collection(collection_id),
 foreign key(feature_num) references NFT_features(feature_num)

 );


 insert into keytable values (1023121,3301, 1001, 1023121, 030, 1, 1);
 insert into keytable values (1023122,2202, 1002, 1023122, 031, 2, 2);

 select * from keytable;
 