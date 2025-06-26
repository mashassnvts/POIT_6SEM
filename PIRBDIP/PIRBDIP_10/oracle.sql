create tablespace lob_ts
datafile 'd:/masha/university/6_sem/pirbdip/pirbdip_10/lob_ts1.dbf' size 100m
logging
online
permanent
extent management local
segment space management auto;

drop tablespace lob_ts INCLUDING CONTENTS;
drop directory docs_dir;
drop user c##lob_user;

create directory docs_dir as 'd:/masha/university/6_sem/pirbdip/pirbdip_10/docs';

create user c##lob_user identified by 1111
default tablespace lob_ts
temporary tablespace temp
quota unlimited on lob_ts
account unlock;

grant connect to c##lob_user;
grant create session to c##lob_user;
grant create table to c##lob_user;
grant create any directory to c##lob_user;
grant drop any directory to c##lob_user;
grant execute on dbms_lob to c##lob_user;
GRANT READ, WRITE ON DIRECTORY docs_dir TO c##lob_user;
alter user c##lob_user quota 100m on lob_ts;

drop table lob_table;
create table lob_table (
id number primary key,
foto blob,
doc bfile
) lob (foto) store as securefile (tablespace lob_ts enable storage in row chunk 8192 retention);

declare
v_blob blob; 
v_bfile bfile := bfilename('DOCS_DIR', 'photo1.jpg'); 
v_doc bfile := bfilename('DOCS_DIR', 'document1.pdf'); 
begin
dbms_lob.createtemporary(v_blob, true);
dbms_lob.open(v_bfile, dbms_lob.lob_readonly);
dbms_lob.loadfromfile(v_blob, v_bfile, dbms_lob.getlength(v_bfile));
dbms_lob.close(v_bfile);
insert into lob_table (id, foto, doc) values (1, v_blob, v_doc);
dbms_lob.freetemporary(v_blob);
commit;
end;
/

select * from lob_table;
select * from all_directories;