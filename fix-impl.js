const fs = require("fs");
const p = "C:/Users/ashwi/trust-framework/spec-kit/IMPL.json";
const impl = JSON.parse(fs.readFileSync(p, "utf8"));
impl.task_coverage["TASK-014"] = "complete";
impl.task_coverage["TASK-015"] = "complete";
impl.task_coverage["TASK-016"] = "complete";
fs.writeFileSync(p, JSON.stringify(impl, null, 2), "utf8");
console.log("Fixed");
