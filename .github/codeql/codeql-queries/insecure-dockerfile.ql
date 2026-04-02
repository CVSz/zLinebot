import docker

from Instruction i
where i.getText().regexpMatch("(?i)curl.*|wget.*")
select i, "Insecure Dockerfile command (curl/wget without checksum)"
