import yaml

from YamlMapping m
where m.getKey() = "type" and m.getValue().toString() = "LoadBalancer"
select m, "Kubernetes Service exposes LoadBalancer publicly"
