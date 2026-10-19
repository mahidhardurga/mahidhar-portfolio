/**
 * content.js — every piece of copy that differs between the two resume versions.
 *
 * Edit text here; no component changes needed.
 *
 * - Strings are HTML (use &amp; for "&", <br> for line breaks, <strong> for emphasis).
 * - Product copy may contain placeholders like [X rules] or [Y%]. On localhost they are
 *   underlined and listed in the console so you can fill them before deploying.
 * - A role's "summary" is optional: leave it "" to hide the lead paragraph.
 * - Selected-work titles, tags and company labels are shared (see `shared.work`);
 *   only the descriptions differ per version.
 */

export const DEFAULT_VERSION = 'product';

export const shared = {
  work: [
    {
      "title": "Java Rules Framework",
      "tag": "Deloitte · 2025 – now",
      "tags": [
        "IBM ODM replacement",
        "TRL → Java converter",
        "SLA &amp; performance parity"
      ]
    },
    {
      "title": "AI Workflows &amp; RAG",
      "tag": "Deloitte · 2025 – now",
      "tags": [
        "Self-healing compile loop",
        "RAG on client data",
        "Developer productivity"
      ]
    },
    {
      "title": "Blockchain gRPC APIs",
      "tag": "Accenture · 2024",
      "tags": [
        "gRPC",
        "Polygon · Arbitrum · Ethereum",
        "Cucumber",
        "Jenkins"
      ]
    },
    {
      "title": "Monolith → Microservices",
      "tag": "Accenture · 2022 – 24",
      "tags": [
        "Microservices",
        "Docker",
        "Cloud deployment",
        "Batch modernization"
      ]
    },
    {
      "title": "DB2 → Aurora Postgres Migration",
      "tag": "Accenture · 2022 – 24",
      "tags": [
        "IBM DB2",
        "AWS Aurora Postgres",
        "MyBatis",
        "SQL remediation"
      ]
    },
    {
      "title": "Deployment Automation",
      "tag": "Accenture · 2022 – 24",
      "tags": [
        "Shell scripting",
        "AWS CLI",
        "Deployment automation"
      ]
    },
    {
      "title": "Spring Boot REST Services",
      "tag": "Cognizant · 2020 – 22",
      "tags": [
        "Spring Boot",
        "REST",
        "Jenkins CI/CD",
        "Postman"
      ]
    }
  ]
};

export const content = {
  current: {
    "resume": "/Mahidhar_Durga_Resume.pdf",
    "heroLede": "I design <strong>Java platforms, microservices and cloud systems</strong> — and teach them to think with AI agents, RAG and self-healing workflows.",
    "aboutStatement": "Senior application development professional working across Java, microservices, cloud, DevOps and AI-driven automation. I turn legacy into scalable systems, build the tooling that proves they work, and lead teams to ship them with clean, maintainable code.",
    "workDescriptions": [
      "Designed and built a Java-based Rules Framework to replace the IBM ODM Rules Engine, enabling migration of existing business rules to a Java architecture. It is backed by an automated TRL → Java rule converter and a validation suite that compares SLA, performance, database and rule-execution timing, plus object- and rule-level results, between ODM and the new framework.",
      "An AI-powered workflow that analyzes Java compilation errors, modifies the code to fix them, recompiles and iterates until the build succeeds. Alongside it, RAG solutions over client data for context-aware retrieval and AI-assisted workflows, and automation that improves developer productivity.",
      "gRPC APIs that interact with blockchains such as Polygon, Arbitrum and Ethereum, taken from Basic and Detail Design through to deployment on Jenkins pipelines, with 80% unit-test coverage and Cucumber integration tests.",
      "Split a monolithic web application into multiple microservices for scalability and maintainability, developed new APIs, then containerized and deployed them in the cloud. Also transformed a batch application into several separate, containerized applications.",
      "Assisted the database migration from IBM DB2 to AWS Aurora Postgres by remediating the application’s SQL queries in the MyBatis framework.",
      "Developed scripts that automate application deployment, and helped refactor shell scripts that use AWS CLI commands to access AWS services.",
      "Developed features for and maintained Spring Boot RESTful services, and managed Jenkins CI/CD pipelines for feature branches and test environments."
    ],
    "roles": [
      {
        "date": "09/2025 — Present",
        "title": "Senior Consultant<br>/ Assistant Manager",
        "company": "Deloitte USI, Bangalore",
        "summary": "Built a Java Rules Framework to replace IBM ODM, automated rule conversion, shipped AI workflows and RAG solutions, and lead a team of 6.",
        "bullets": [
          "Participate in “3 in a box” calls to gather requirements, provide effort estimations and coordinate with on-shore teams for System Change Requests (SCRs).",
          "Prepare detailed Technical Design Documents (TDDs) and develop solutions aligned with business and technical needs.",
          "Designed a new Java-based Rules Framework to replace the IBM ODM Rules Engine, enabling migration of existing business rules to a Java architecture.",
          "Developed an automated utility to convert TRL rule files into Java rule files, reducing manual effort and accelerating migration.",
          "Built utilities to measure and compare SLA, performance, database timing, rule execution timing, and object- and rule-level results between IBM ODM and the Java Rules Framework.",
          "Developed AI-powered workflows that analyze Java compilation errors, modify code to fix them, recompile and iterate until the build succeeds.",
          "Developed RAG-based AI solutions using client data for context-aware retrieval and AI-assisted workflows.",
          "Led a team of 6: task allocation and delivery, technical guidance, code reviews, and support for their technical and professional growth.",
          "Review and approve pull requests, unit tests and assembly test scripts while ensuring development quality.",
          "Conduct unit and assembly testing, resolve defects, and lead automation initiatives that improve developer productivity and engineering efficiency."
        ]
      },
      {
        "date": "04/2024 — 08/2024",
        "title": "Custom Software Engineering Sr Analyst",
        "company": "Accenture, Bangalore",
        "summary": "Developed gRPC APIs linking systems with blockchain networks such as Polygon, Arbitrum and Ethereum.",
        "bullets": [
          "Create Basic Design and Detail Design before developing an API.",
          "Develop gRPC APIs that interact with blockchains like Polygon, Arbitrum and Ethereum.",
          "Write unit tests ensuring 80% code coverage.",
          "Create ITa and ITb test cases and execute them in local, test and development environments.",
          "Deploy applications using Jenkins pipelines and write Cucumber scripts for integration testing.",
          "Support and mentor junior team members."
        ]
      },
      {
        "date": "01/2022 — 04/2024",
        "title": "Application Development Analyst",
        "company": "Accenture, Bangalore",
        "summary": "Split a monolith into microservices, containerized and deployed them to the cloud, and helped migrate IBM DB2 to AWS Aurora Postgres.",
        "bullets": [
          "Split a monolithic web application into multiple microservices for better scalability and maintainability, and developed new APIs.",
          "Containerized microservices and deployed them in the cloud; transformed a batch application into multiple separate, containerized applications.",
          "Assisted in migrating the database from IBM DB2 to AWS Aurora Postgres by remediating SQL queries (MyBatis).",
          "Reviewed code and approved pull requests; mentored team members facing challenges.",
          "Developed scripts to automate deployment, and helped refactor shell scripts that use AWS CLI commands."
        ]
      },
      {
        "date": "08/2020 — 01/2022",
        "title": "Programmer Analyst",
        "company": "Cognizant, Bangalore",
        "summary": "Developed and maintained Spring Boot REST services and Jenkins CI/CD pipelines.",
        "bullets": [
          "Develop new features, debug and maintain Spring Boot RESTful applications and services.",
          "Participate in Jenkins CI/CD deployments and manage pipelines for feature branches and test environments.",
          "Use Spring Tool Suite for development and Postman for API testing and debugging.",
          "Fix bugs, keep services running smoothly and help teammates resolve impediments in Agile stories."
        ]
      },
      {
        "date": "01/2020 — 05/2020",
        "title": "Internship",
        "company": "Cognizant, Bangalore",
        "summary": "Learned Java, Spring Boot, MySQL and responsive front-end integration.",
        "bullets": [
          "Developed and maintained web applications using Java, Spring Boot and MySQL.",
          "Designed responsive interfaces with HTML, CSS and JavaScript and integrated RESTful APIs between front end and back end.",
          "Learned debugging, performance optimization and industry best practices in coding, testing and version control."
        ]
      }
    ],
    "toolkit": [
      {
        "label": "Backend",
        "chips": [
          "Java",
          "Spring",
          "Spring MVC",
          "Spring Boot",
          "Spring Batch",
          "Spring Data JPA",
          "Spring Cloud",
          "MyBatis",
          "REST",
          "gRPC",
          "OpenAPI",
          "Maven",
          "Gradle"
        ]
      },
      {
        "label": "Cloud &amp; DevOps",
        "chips": [
          "AWS",
          "Terraform",
          "Docker",
          "Jenkins",
          "Git",
          "Shell scripting",
          "DevOps"
        ]
      },
      {
        "label": "AI &amp; Agentic",
        "chips": [
          "Generative AI",
          "AI Agents",
          "RAG",
          "AI Workflows",
          "Prompt Engineering",
          "Context Engineering",
          "MCP",
          "LangChain",
          "Python",
          "FastAPI"
        ]
      },
      {
        "label": "Data",
        "chips": [
          "PostgreSQL",
          "MySQL",
          "IBM DB2",
          "AWS Aurora"
        ]
      },
      {
        "label": "Quality &amp; Docs",
        "chips": [
          "Spock",
          "JUnit",
          "Cucumber",
          "Postman",
          "AsciiDoc",
          "PlantUML"
        ]
      }
    ]
  },
  product: {
    "resume": "/Mahidhar_Durga_Resume_Product.pdf",
    "heroLede": "Senior backend engineer. I modernize legacy Java systems into scalable cloud services, and build AI agents and RAG workflows that make engineering teams faster.",
    "aboutStatement": "Backend engineer with 6.5 years in Java, Spring Boot, microservices and AWS. I’ve led migrations off legacy platforms (IBM ODM, DB2, monoliths), owned systems from design to production, and built AI tooling that automates real engineering work. Currently leading a team of 6 at Deloitte.",
    "workDescriptions": [
      "Designed and owned a Java rules engine replacing IBM ODM for a US Government program, so the client no longer needs the ODM licence. Built a TRL-to-Java converter that automated 100% of rule migration, and a parity suite that validates SLA, latency and rule-level output against ODM before cutover.",
      "Built a self-healing build agent that reads Java compile errors, patches the code and recompiles until green, saving 4 engineers 11 days of work. Shipped RAG retrieval over client data for context-aware engineering workflows.",
      "Designed and built gRPC services integrating with Polygon, Arbitrum and Ethereum, covering design through production on Jenkins, with 80% unit-test coverage and Cucumber integration tests.",
      "Decomposed a monolithic web app into 7 containerized microservices on AWS, and split a batch system into independently deployable jobs, so each part can be scaled, released and recovered on its own.",
      "Remediated around 220 MyBatis SQL queries to migrate a production application from IBM DB2 to AWS Aurora Postgres with zero data issues at cutover.",
      "Automated deployments with shell and AWS CLI scripts, cutting release effort from 5 hours to 1 hour.",
      "Built and maintained Spring Boot REST services and the Jenkins CI/CD pipelines for feature branches and test environments."
    ],
    "roles": [
      {
        "date": "09/2025 — Present",
        "title": "Senior Consultant",
        "company": "Deloitte USI, Bangalore",
        "summary": "",
        "bullets": [
          "Own the design and delivery of a Java rules engine replacing IBM ODM: architecture, migration tooling and production parity validation.",
          "Built an automated TRL-to-Java converter, replacing migration work that would have taken a team of 20 about 4–5 months by hand.",
          "Built performance and correctness tooling comparing SLA, DB timing and rule-level results between ODM and the new engine.",
          "Built an AI agent that fixes Java compilation errors autonomously, plus RAG solutions over client data.",
          "Lead 6 engineers: technical direction, design and code reviews, and mentoring."
        ]
      },
      {
        "date": "01/2022 — 08/2024",
        "title": "Sr Analyst / Analyst",
        "company": "Accenture, Bangalore",
        "summary": "",
        "bullets": [
          "Built gRPC APIs integrating with Polygon, Arbitrum and Ethereum, from design docs to Jenkins deployment.",
          "Decomposed a monolith into containerized microservices on AWS, and modernized a batch application into separate services.",
          "Migrated the data layer from IBM DB2 to Aurora Postgres by remediating MyBatis SQL.",
          "Automated deployments with shell and AWS CLI scripts. Reviewed PRs and mentored junior engineers."
        ]
      },
      {
        "date": "08/2020 — 01/2022",
        "title": "Programmer Analyst",
        "company": "Cognizant, Bangalore",
        "summary": "",
        "bullets": [
          "Built and maintained Spring Boot REST services, and ran the Jenkins CI/CD pipelines for feature and test environments."
        ]
      }
    ],
    "toolkit": [
      {
        "label": "Backend &amp; Architecture",
        "chips": [
          "Java",
          "Spring Boot",
          "Microservices",
          "System Design",
          "gRPC",
          "REST",
          "Spring",
          "Spring MVC",
          "Spring Batch",
          "Spring Data JPA",
          "Spring Cloud",
          "MyBatis",
          "OpenAPI",
          "Maven",
          "Gradle"
        ]
      },
      {
        "label": "Data &amp; Messaging",
        "chips": [
          "PostgreSQL",
          "AWS Aurora",
          "MySQL",
          "NoSQL",
          "Redis",
          "Caching",
          "Kafka",
          "Event-driven messaging",
          "IBM DB2"
        ]
      },
      {
        "label": "Cloud &amp; DevOps",
        "chips": [
          "AWS",
          "Terraform",
          "Docker",
          "CI/CD",
          "Jenkins",
          "Git",
          "Shell scripting",
          "DevOps"
        ]
      },
      {
        "label": "AI &amp; Agentic",
        "chips": [
          "AI Agents",
          "RAG",
          "MCP",
          "LangChain",
          "Python",
          "FastAPI",
          "Generative AI",
          "AI Workflows",
          "Prompt Engineering",
          "Context Engineering"
        ]
      },
      {
        "label": "Quality &amp; Docs",
        "chips": [
          "JUnit",
          "Spock",
          "Cucumber",
          "Postman",
          "AsciiDoc",
          "PlantUML"
        ]
      }
    ]
  }
};
