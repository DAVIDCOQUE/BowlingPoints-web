-- ===========================================
-- MODELO DE DATOS ACTUALIZADO PARA BOWLING POINTS
-- ===========================================
-- Tabla: roles
CREATE TABLE roles (
  role_id SERIAL PRIMARY KEY,
  description TEXT NOT NULL UNIQUE,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: person
CREATE TABLE person (
  person_id SERIAL PRIMARY KEY,
  document TEXT UNIQUE NOT NULL,
  photo_url TEXT,
  full_name TEXT NOT NULL,
  full_surname TEXT NOT NULL,
  gender TEXT,
  birth_date DATE,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  status BOOLEAN DEFAULT TRUE,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: users
CREATE TABLE users (
  user_id SERIAL PRIMARY KEY,
  person_id INT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  last_login_at TIMESTAMP,
  status BOOLEAN DEFAULT TRUE,
  attempts_login INT DEFAULT 0,
  nickname TEXT UNIQUE,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (person_id) REFERENCES person(person_id)
);

-- Tabla: user_role
CREATE TABLE user_role (
  user_role_id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  role_id INT NOT NULL,
  status BOOLEAN DEFAULT TRUE,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id),
  FOREIGN KEY (role_id) REFERENCES roles(role_id),
  CONSTRAINT unique_user_role UNIQUE (user_id, role_id)
);

-- Tabla: clubs
CREATE TABLE clubs (
  club_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  foundation_date DATE,
  city TEXT,
  status BOOLEAN DEFAULT TRUE,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla pivote: club_person (muchos a muchos)
CREATE TABLE club_person (
  club_person_id SERIAL PRIMARY KEY,
  club_id INT NOT NULL,
  person_id INT NOT NULL,
  role_in_club TEXT,
  joined_at DATE DEFAULT CURRENT_DATE,
  status BOOLEAN DEFAULT TRUE,
  created_by INT,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMP,
  FOREIGN KEY (club_id) REFERENCES clubs(club_id),
  FOREIGN KEY (person_id) REFERENCES person(person_id),
  CONSTRAINT unique_club_person UNIQUE (club_id, person_id)
);

-- Tabla: category
CREATE TABLE category (
  category_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  status BOOLEAN DEFAULT TRUE,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: modality
CREATE TABLE modality (
  modality_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  status BOOLEAN DEFAULT TRUE,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: person_category
CREATE TABLE person_category (
  person_category_id SERIAL PRIMARY KEY,
  person_id INT NOT NULL,
  category_id INT NOT NULL,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  FOREIGN KEY (person_id) REFERENCES person(person_id),
  FOREIGN KEY (category_id) REFERENCES category(category_id),
  CONSTRAINT unique_person_category UNIQUE (person_id, category_id)
);

-- Tabla: team
CREATE TABLE team (
  team_id SERIAL PRIMARY KEY,
  name_team TEXT NOT NULL UNIQUE,
  phone TEXT,
  status BOOLEAN DEFAULT TRUE,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: team_person
CREATE TABLE team_person (
  team_person_id SERIAL PRIMARY KEY,
  person_id INT NOT NULL,
  team_id INT NOT NULL,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (person_id) REFERENCES person(person_id),
  FOREIGN KEY (team_id) REFERENCES team(team_id),
  CONSTRAINT unique_team_person UNIQUE (team_id, person_id)
);

-- Tabla: ambit
CREATE TABLE ambit (
  ambit_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  status BOOLEAN DEFAULT TRUE,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: tournament
CREATE TABLE tournament (
  tournament_id SERIAL PRIMARY KEY,
  tournament_name TEXT NOT NULL UNIQUE,
  ambit_id INT,
  image_url TEXT,
  start_date DATE,
  end_date DATE,
  location TEXT,
  cause_status TEXT,
  status BOOLEAN DEFAULT TRUE,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ambit_id) REFERENCES ambit(ambit_id)
);

-- Tabla pivote: tournament_category
CREATE TABLE tournament_category (
  tournament_category_id SERIAL PRIMARY KEY,
  tournament_id INT NOT NULL,
  category_id INT NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournament(tournament_id),
  FOREIGN KEY (category_id) REFERENCES category(category_id),
  CONSTRAINT unique_tournament_category UNIQUE (tournament_id, category_id)
);

-- Tabla pivote: tournament_modality
CREATE TABLE tournament_modality (
  tournament_modality_id SERIAL PRIMARY KEY,
  tournament_id INT NOT NULL,
  modality_id INT NOT NULL,
  created_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournament(tournament_id),
  FOREIGN KEY (modality_id) REFERENCES modality(modality_id),
  CONSTRAINT unique_tournament_modality UNIQUE (tournament_id, modality_id)
);

-- Tabla: round
CREATE TABLE round (
  round_id SERIAL PRIMARY KEY,
  tournament_id INT NOT NULL,
  round_number INT,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournament(tournament_id)
);

-- Tabla: ranking
CREATE TABLE ranking (
  ranking_id SERIAL PRIMARY KEY,
  tournament_id INT NOT NULL,
  category_id INT NOT NULL,
  person_id INT NOT NULL,
  position INT,
  total_points INT,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (tournament_id) REFERENCES tournament(tournament_id),
  FOREIGN KEY (category_id) REFERENCES category(category_id),
  FOREIGN KEY (person_id) REFERENCES person(person_id),
  CONSTRAINT unique_ranking UNIQUE (tournament_id, category_id, person_id)
);

-- Tabla: result
CREATE TABLE result (
  result_id SERIAL PRIMARY KEY,
  person_id INT,
  team_id INT,
  tournament_id INT NOT NULL,
  round_id INT NOT NULL,
  category_id INT NOT NULL,
  modality_id INT NOT NULL,
  lane_number INT,
  line_number INT,
  score INT NOT NULL,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (person_id) REFERENCES person(person_id),
  FOREIGN KEY (team_id) REFERENCES team(team_id),
  FOREIGN KEY (tournament_id) REFERENCES tournament(tournament_id),
  FOREIGN KEY (round_id) REFERENCES round(round_id),
  FOREIGN KEY (category_id) REFERENCES category(category_id),
  FOREIGN KEY (modality_id) REFERENCES modality(modality_id)
);

-- Tabla: permissions
CREATE TABLE permissions (
  permission_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla: role_permission
CREATE TABLE role_permission (
  role_permission_id SERIAL PRIMARY KEY,
  role_id INT NOT NULL,
  permission_id INT NOT NULL,
  granted BOOLEAN DEFAULT TRUE,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (role_id) REFERENCES roles(role_id),
  FOREIGN KEY (permission_id) REFERENCES permissions(permission_id),
  CONSTRAINT unique_role_permission UNIQUE (role_id, permission_id)
);

-- Tabla: bowling_center
CREATE TABLE bowling_center (
  bowling_center_id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  address TEXT NOT NULL UNIQUE,
  open_days TEXT NOT NULL,
  open_hours TEXT NOT NULL,
  social_links TEXT,
  status BOOLEAN DEFAULT TRUE,
  created_by INT,
  updated_by INT,
  deleted_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
