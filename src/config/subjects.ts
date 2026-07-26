export const DOMAINS = {
  mathematics: {
    label: "数学",
    englishLabel: "Mathematics",
    slug: "math",
    description: "从定义、推导和题型出发，整理微积分、线性代数与概率论的知识结构喵~",
  },
  "computer-science": {
    label: "计算机科学",
    englishLabel: "Computer Science",
    slug: "cs",
    description: "沿着数据结构、组成原理、操作系统与网络建立可追踪的计算机知识体系喵~",
  },
} as const;

export const SUBJECTS = {
  calculus: {
    domain: "mathematics",
    label: "微积分",
    englishLabel: "Calculus",
    slug: "calculus",
    description: "围绕函数、极限、导数与积分理解连续变化及其分析方法喵~",
    topicOrder: [
      "functions",
      "limits",
      "continuity",
      "derivatives",
      "mean-value-theorem",
      "integrals",
    ],
  },
  "linear-algebra": {
    domain: "mathematics",
    label: "线性代数",
    englishLabel: "Linear Algebra",
    slug: "linear-algebra",
    description: "从向量与矩阵出发，理解线性空间、变换和特征结构喵~",
    topicOrder: ["vectors", "matrices", "linear-transformations", "eigenvalues"],
  },
  probability: {
    domain: "mathematics",
    label: "概率论",
    englishLabel: "Probability",
    slug: "probability",
    description: "整理随机事件、随机变量、分布与期望之间的联系喵~",
    topicOrder: ["events", "random-variables", "distributions", "expectation"],
  },
  "data-structures": {
    domain: "computer-science",
    label: "数据结构",
    englishLabel: "Data Structures",
    slug: "data-structures",
    description: "从复杂度到树与图，理解数据组织方式和算法代价喵~",
    topicOrder: ["complexity", "linear-structures", "trees", "graphs", "sorting"],
  },
  "computer-organization": {
    domain: "computer-science",
    label: "计算机组成",
    englishLabel: "Computer Organization",
    slug: "computer-organization",
    description: "理解数据表示、处理器、存储层次与输入输出如何协同工作喵~",
    topicOrder: ["data-representation", "processor", "memory-hierarchy", "io"],
  },
  "operating-systems": {
    domain: "computer-science",
    label: "操作系统",
    englishLabel: "Operating Systems",
    slug: "os",
    description: "整理进程、并发、内存与文件系统等操作系统核心机制喵~",
    topicOrder: ["processes", "concurrency", "memory", "file-systems", "io"],
  },
  "computer-networks": {
    domain: "computer-science",
    label: "计算机网络",
    englishLabel: "Computer Networks",
    slug: "network",
    description: "沿协议分层理解数据如何在端系统和网络设备之间传递喵~",
    topicOrder: ["fundamentals", "link", "network", "transport", "application"],
  },
} as const;

export const TOPIC_LABELS: Record<string, string> = {
  functions: "函数",
  limits: "极限",
  continuity: "连续",
  derivatives: "导数与微分",
  "mean-value-theorem": "中值定理",
  integrals: "积分",
  vectors: "向量",
  matrices: "矩阵",
  "linear-transformations": "线性变换",
  eigenvalues: "特征值",
  events: "随机事件",
  "random-variables": "随机变量",
  distributions: "概率分布",
  expectation: "数学期望",
  complexity: "复杂度",
  "linear-structures": "线性结构",
  trees: "树",
  graphs: "图",
  sorting: "排序",
  "data-representation": "数据表示",
  processor: "处理器",
  "memory-hierarchy": "存储层次",
  io: "输入输出",
  processes: "进程与线程",
  concurrency: "并发",
  memory: "内存管理",
  "file-systems": "文件系统",
  fundamentals: "网络基础",
  link: "数据链路层",
  network: "网络层",
  transport: "传输层",
  application: "应用层",
};

export type DomainId = keyof typeof DOMAINS;
export type SubjectId = keyof typeof SUBJECTS;

export const getDomainConfig = (domain: string) => DOMAINS[domain as DomainId];

export const getSubjectConfig = (subject: string) => SUBJECTS[subject as SubjectId];

export const getDomainFromSlug = (slug: string) =>
  Object.entries(DOMAINS).find(([, config]) => config.slug === slug)?.[0] as DomainId | undefined;

export const getSubjectFromSlug = (domain: string, slug: string) =>
  Object.entries(SUBJECTS).find(
    ([, config]) => config.domain === domain && config.slug === slug,
  )?.[0] as SubjectId | undefined;

export const getSubjectsForDomain = (domain: string) =>
  (Object.keys(SUBJECTS) as SubjectId[]).filter((subject) => SUBJECTS[subject].domain === domain);

export const getTopicLabel = (topic: string) =>
  TOPIC_LABELS[topic] ??
  topic
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

export const getSubjectOrder = (subject: string) => {
  const order = Object.keys(SUBJECTS).indexOf(subject);
  return order === -1 ? Number.MAX_SAFE_INTEGER : order;
};

export const getTopicOrder = (subject: string, topic: string) => {
  const config = getSubjectConfig(subject);

  if (!config) {
    return Number.MAX_SAFE_INTEGER;
  }

  const topicOrder: readonly string[] = config.topicOrder;
  const order = topicOrder.indexOf(topic);
  return order === -1 ? Number.MAX_SAFE_INTEGER : order;
};

export const getSubjectHref = (subject: string) => {
  const config = getSubjectConfig(subject);
  const domain = config ? getDomainConfig(config.domain) : undefined;

  if (!config || !domain) {
    return "/learn";
  }

  return `/learn/${domain.slug}/${config.slug}`;
};

export const getNoteHref = (id: string) => {
  const [domainId, subjectId, ...rest] = id.split("/");
  const domain = getDomainConfig(domainId);
  const subject = getSubjectConfig(subjectId);

  if (!domain || !subject || rest.length === 0) {
    return `/learn/${id}`;
  }

  return `/learn/${domain.slug}/${subject.slug}/${rest.join("/")}`;
};

export const getNoteRoutePath = (id: string) => getNoteHref(id).replace(/^\/learn\//, "");
