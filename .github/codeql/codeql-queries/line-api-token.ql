import javascript

from Expr e
where e.toString().regexpMatch("(?i)(LINE_CHANNEL_SECRET|LINE_CHANNEL_ACCESS_TOKEN)")
select e, "Hardcoded LINE API token detected"
