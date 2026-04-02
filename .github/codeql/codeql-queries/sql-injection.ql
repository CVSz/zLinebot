import python

from CallExpr call, Expr arg
where call.getFunc().getName() = "execute"
  and arg = call.getArg(0)
  and arg.toString().regexpMatch(".*\".*%s.*\".*")
select arg, "Possible SQL injection via string interpolation"
