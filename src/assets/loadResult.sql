-- ==============================
-- DATOS DE PRUEBA PARA BOWLING POINTS (IDs auto-increment)
-- ==============================

-- 1. PERSONAS (jugadores, sin usuarios)
INSERT INTO person (document, full_name, full_surname, gender, email, phone, birth_date,status)
VALUES
('10001', 'Juan', 'Pérez', 'Masculino', 'juanperez@example.com', '3101111111', '2001-04-12',true),
('10002', 'Ana', 'García', 'Femenino', 'anagarcia@example.com', '3102222222', '2003-07-22',true),
('10003', 'Carlos', 'Lopez', 'Masculino', 'carloslopez@example.com', '3103333333', '1999-11-03',true),
('10004', 'Luisa', 'Martínez', 'Femenino', 'luisamartinez@example.com', '3104444444', '2001-02-18',true),
('10005', 'David', 'Ramírez', 'Masculino', 'davidramirez@example.com', '3105555555', '2002-10-29',true),
('10006', 'María', 'Hernández', 'Femenino', 'mariahernandez@example.com', '3106666666', '1997-06-09',true),
('10007', 'Sofía', 'Jiménez', 'Femenino', 'sofiajimenez@example.com', '3107777777', '2002-01-15',true),
('10008', 'Miguel', 'Castro', 'Masculino', 'miguelcastro@example.com', '3108888888', '1998-09-30',true),
('10009', 'Paula', 'Moreno', 'Femenino', 'paulamoreno@example.com', '3109999999', '2001-03-17',true),
('10010', 'Andrés', 'Ruiz', 'Masculino', 'andresruiz@example.com', '3101010101', '2000-12-03',true);


-- 2. EQUIPOS
INSERT INTO team (name_team, phone)
VALUES
('Strike Force', '3201111111'),
('Bowling Stars', '3202222222');

-- 3. ASIGNAR PERSONAS A EQUIPOS (team_person)
-- Recuerda: Debes asegurarte que los person_id y team_id coincidan con los autoincrement generados, o consultar los ids con SELECT después.
-- Ejemplo suponiendo que los IDs son consecutivos y empiezan en 1
INSERT INTO team_person (person_id, team_id)
VALUES
(1, 1), (2, 1), (3, 1), (9, 1),
(5, 2), (6, 2), (7, 2), (10, 2);


-- 4. CATEGORÍAS
INSERT INTO category (name, description)
VALUES
('Juvenil', 'Menores de 18'),
('Mayores', '18 y más'),
('Senior', 'Mayores de 50');

select *
    from category;

-- 5. MODALIDADES
INSERT INTO modality (name, description)
VALUES
('Individual', 'Competencia individual'),
('Equipos', 'Competencia por equipos'),
('Parejas', 'Competencia en parejas');

-- 6. RONDAS (por torneo: 2 rondas para t1 y t2, 1 para t3)
-- De nuevo, asegúrate de tener los IDs de los torneos.
INSERT INTO round (tournament_id, round_number)
VALUES
(1, 1), (1, 2),
(2, 1), (2, 2),
(3, 1);

-- 7. RESULTADOS

-- Torneo 1: Individual (modality_id=1, category_id=1)
INSERT INTO result (person_id, tournament_id, round_id, category_id, modality_id, lane_number, line_number, score,rama)
VALUES
-- Ronda 1
(1, 1, 1, 1, 1, 1, 1, 200,1),
(2, 1, 1, 1, 1, 2, 1, 180,1),
(3, 1, 1, 1, 1, 3, 1, 170,1),
(8, 1, 1, 1, 1, 4, 1, 160,1),
-- Ronda 2
(1, 1, 2, 1, 1, 1, 2, 210,1),
(2, 1, 2, 1, 1, 2, 2, 185,1),
(3, 1, 2, 1, 1, 3, 2, 175,1),
(8, 1, 2, 1, 1, 4, 2, 162,1);

-- Torneo 2: Equipos (modality_id=2, category_id=2)
INSERT INTO result (team_id, tournament_id, round_id, category_id, modality_id, lane_number, line_number, score,rama)
VALUES
-- Ronda 1
(1, 2, 3, 2, 2, 5, 1, 800,1),
(2, 2, 3, 2, 2, 6, 1, 750,1),
-- Ronda 2
(1, 2, 4, 2, 2, 5, 2, 810,1),
(2, 2, 4, 2, 2, 6, 2, 760,1);

-- Torneo 3: Parejas (modality_id=3, category_id=3)
INSERT INTO result (person_id, tournament_id, round_id, category_id, modality_id, lane_number, line_number, score,rama)
VALUES
(5, 3, 5, 3, 3, 7, 1, 190,1),
(6, 3, 5, 3, 3, 7, 1, 185,1),
(7, 3, 5, 3, 3, 8, 1, 178,1),
(8, 3, 5, 3, 3, 8, 1, 174,1);

-- ==============================

-- Si tienes dudas sobre los IDs que está generando tu base, puedes hacer:
-- SELECT person_id, first_name FROM person;
-- SELECT team_id, name_team FROM team;
-- SELECT tournament_id, tournament_name FROM tournament;
-- SELECT round_id, tournament_id, round_number FROM round;

-- ¡Listo para poblar tu sistema Bowling Points! 😃🎳
