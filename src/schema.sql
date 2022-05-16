CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    github_id BIGINT UNIQUE NOT NULL,
    github_username VARCHAR(39) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS skills (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    description TEXT
);

CREATE TABLE IF NOT EXISTS skill_changes (
    id BIGSERIAL PRIMARY KEY,
    skill_id BIGINT NOT NULL REFERENCES skills(id),
    name VARCHAR(255),
    description TEXT,
    user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS facets (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    recommendation_prompt VARCHAR(255),
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS recommendations (
    id BIGSERIAL PRIMARY KEY,
    markdown TEXT,
    skill_id BIGINT NOT NULL REFERENCES skills(id),
    facet_id BIGINT NOT NULL REFERENCES facets(id)
);

CREATE TABLE IF NOT EXISTS recommendation_changes (
    id BIGSERIAL PRIMARY KEY,
    recommendation_id BIGINT NOT NULL REFERENCES recommendations(id),
    markdown TEXT,
    user_id BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS statements (
    id BIGSERIAL PRIMARY KEY,
    assertion VARCHAR(255),
    facet_id BIGINT NOT NULL REFERENCES facets(id),
    sort_order INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS reflections (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id),
    skill_id BIGINT NOT NULL REFERENCES skills(id),
    statement_id BIGINT NOT NULL REFERENCES statements(id),
    created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS tags (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS skills_tags (
    id BIGSERIAL PRIMARY KEY,
    skill_id BIGINT NOT NULL REFERENCES skills(id),
    tag_id BIGINT NOT NULL REFERENCES tags(id),
    UNIQUE (skill_id, tag_id)
);

-- This table is required by https://www.npmjs.com/package/connect-pg-simple
CREATE TABLE IF NOT EXISTS session (
  sid VARCHAR(255) PRIMARY KEY,
  sess JSON NOT NULL,
  expire TIMESTAMP(6) NOT NULL
);
